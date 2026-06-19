#!/usr/bin/env node
"use strict";

// Reproducible analysis of the Stack Overflow 2025 Developer Survey.
// Uses only Node's standard library: run with `node analysis/analysis.js`.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "data", "results.csv");
const PAPER = path.join(ROOT, "paper");
const FIGURES = path.join(PAPER, "figures");

if (!fs.existsSync(INPUT)) throw new Error(`Missing input file: ${INPUT}`);
fs.mkdirSync(FIGURES, { recursive: true });

function parseCsv(file, onRow, onDone) {
  const stream = fs.createReadStream(file, { encoding: "utf8" });
  let row = [], field = "", quoted = false, pendingQuote = false;
  function emitField() { row.push(field); field = ""; }
  function emitRow() { emitField(); onRow(row); row = []; }
  stream.on("data", chunk => {
    for (let i = 0; i < chunk.length; i++) {
      const c = chunk[i];
      if (pendingQuote) {
        if (c === '"') { field += '"'; pendingQuote = false; continue; }
        quoted = false; pendingQuote = false;
      }
      if (quoted) {
        if (c === '"') pendingQuote = true;
        else field += c;
      } else if (c === '"' && field.length === 0) quoted = true;
      else if (c === ',') emitField();
      else if (c === '\n') emitRow();
      else if (c !== '\r') field += c;
    }
  });
  stream.on("end", () => {
    if (pendingQuote) quoted = false;
    if (field.length || row.length) emitRow();
    onDone();
  });
  stream.on("error", err => { throw err; });
}

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function invert(a) {
  const n = a.length;
  const aug = a.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => +(i === j))]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(aug[r][col]) > Math.abs(aug[pivot][col])) pivot = r;
    if (Math.abs(aug[pivot][col]) < 1e-10) throw new Error("Singular regression matrix");
    [aug[col], aug[pivot]] = [aug[pivot], aug[col]];
    const d = aug[col][col];
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= d;
    for (let r = 0; r < n; r++) if (r !== col) {
      const f = aug[r][col];
      for (let j = 0; j < 2 * n; j++) aug[r][j] -= f * aug[col][j];
    }
  }
  return aug.map(r => r.slice(n));
}

function logGamma(z) {
  const c = [676.5203681218851,-1259.1392167224028,771.32342877765313,-176.6150291621406,12.507343278686905,-0.13857109526572012,9.984369578019571e-6,1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI*z)) - logGamma(1-z);
  z -= 1; let x = 0.9999999999998099;
  for (let i=0;i<c.length;i++) x += c[i]/(z+i+1);
  const t=z+c.length-0.5;
  return 0.5*Math.log(2*Math.PI)+(z+0.5)*Math.log(t)-t+Math.log(x);
}
function betaContinuedFraction(a,b,x) {
  const MAX=200, EPS=3e-14, FPMIN=1e-300;
  let qab=a+b, qap=a+1, qam=a-1, c=1, d=1-qab*x/qap;
  if(Math.abs(d)<FPMIN)d=FPMIN; d=1/d; let h=d;
  for(let m=1;m<=MAX;m++){
    const m2=2*m;
    let aa=m*(b-m)*x/((qam+m2)*(a+m2)); d=1+aa*d; if(Math.abs(d)<FPMIN)d=FPMIN; c=1+aa/c; if(Math.abs(c)<FPMIN)c=FPMIN; d=1/d; h*=d*c;
    aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2)); d=1+aa*d; if(Math.abs(d)<FPMIN)d=FPMIN; c=1+aa/c; if(Math.abs(c)<FPMIN)c=FPMIN; d=1/d; const del=d*c; h*=del;
    if(Math.abs(del-1)<EPS)break;
  }
  return h;
}
function regIncompleteBeta(x,a,b){
  if(x<=0)return 0;if(x>=1)return 1;
  const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log(1-x));
  return x<(a+1)/(a+b+2) ? bt*betaContinuedFraction(a,b,x)/a : 1-bt*betaContinuedFraction(b,a,1-x)/b;
}
function twoSidedTP(t,df){ return regIncompleteBeta(df/(df+t*t),df/2,0.5); }

function pdfEscape(s) { return String(s).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)").replace(/[^\x20-\x7e]/g, "-"); }
function writePdf(file, commands) {
  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 432] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
  ];
  let out = "%PDF-1.4\n", offsets=[0];
  objects.forEach((o,i)=>{ offsets.push(Buffer.byteLength(out)); out += `${i+1} 0 obj\n${o}\nendobj\n`; });
  const xref=Buffer.byteLength(out); out += `xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for(let i=1;i<offsets.length;i++) out += `${String(offsets[i]).padStart(10,"0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  fs.writeFileSync(file,out,"binary");
}
function textCmd(x,y,size,s){ return `BT /F1 ${size} Tf ${x} ${y} Td (${pdfEscape(s)}) Tj ET`; }

let header, idx, totalRows=0, professional=0;
const rows=[], aiRawCounts=new Map(), roleCounts=new Map();
const required=["MainBranch","AISelect","JobSat","WorkExp","DevType"];

parseCsv(INPUT, fields => {
  if (!header) {
    header=fields; idx=Object.fromEntries(header.map((x,i)=>[x,i]));
    const missing=required.filter(x=>idx[x]===undefined);
    if(missing.length) throw new Error(`Missing required columns: ${missing.join(", ")}`);
    return;
  }
  totalRows++;
  const get=k=>(fields[idx[k]]||"").trim();
  if(get("MainBranch")!=="I am a developer by profession") return;
  professional++;
  const ai=get("AISelect"), sat=Number(get("JobSat")), exp=Number(get("WorkExp"));
  const role=get("DevType").split(";")[0].trim();
  aiRawCounts.set(ai,(aiRawCounts.get(ai)||0)+1);
  if(!ai || !Number.isFinite(sat) || !Number.isFinite(exp) || !role) return;
  let adopt;
  if(ai.startsWith("Yes, I use AI tools")) adopt=1;
  else if(ai.startsWith("No,")) adopt=0;
  else return;
  rows.push({adopt,sat,exp,role}); roleCounts.set(role,(roleCounts.get(role)||0)+1);
}, finish);

function finish(){
  const roles=[...roleCounts.keys()].sort();
  const baseline=roles.reduce((a,b)=>roleCounts.get(a)>roleCounts.get(b)?a:b);
  const dummies=roles.filter(r=>r!==baseline), k=3+dummies.length, n=rows.length;
  const xtx=Array.from({length:k},()=>Array(k).fill(0)), xty=Array(k).fill(0);
  for(const r of rows){
    const x=[1,r.adopt,r.exp,...dummies.map(d=>+(r.role===d))];
    for(let i=0;i<k;i++){ xty[i]+=x[i]*r.sat; for(let j=0;j<k;j++)xtx[i][j]+=x[i]*x[j]; }
  }
  const inv=invert(xtx), beta=inv.map(row=>row.reduce((s,v,j)=>s+v*xty[j],0));
  let sse=0, tss=0, ybar=rows.reduce((s,r)=>s+r.sat,0)/n;
  for(const r of rows){ const x=[1,r.adopt,r.exp,...dummies.map(d=>+(r.role===d))]; const fit=x.reduce((s,v,j)=>s+v*beta[j],0); sse+=(r.sat-fit)**2; tss+=(r.sat-ybar)**2; }
  const df=n-k, sigma2=sse/df, se=Math.sqrt(sigma2*inv[1][1]), t=beta[1]/se, p=twoSidedTP(t,df), r2=1-sse/tss;
  const groups=[0,1].map(a=>{const v=rows.filter(r=>r.adopt===a).map(r=>r.sat);return {adopt:a,n:v.length,mean:v.reduce((s,x)=>s+x,0)/v.length,median:median(v)};});
  const expMean=rows.reduce((s,r)=>s+r.exp,0)/n;
  const expMedian=median(rows.map(r=>r.exp));
  const rawAi=[...aiRawCounts.entries()].sort((a,b)=>b[1]-a[1]);

  const csv=["term,estimate,std_error,t_statistic,p_value,n,r_squared,df,role_fixed_effects,baseline_role",
    `AI_tool_adoption,${beta[1].toFixed(6)},${se.toFixed(6)},${t.toFixed(6)},${p.toPrecision(8)},${n},${r2.toFixed(6)},${df},${dummies.length},"${baseline.replace(/"/g,'""')}"`].join("\n")+"\n";
  fs.writeFileSync(path.join(ROOT,"results_table.csv"),csv);
  const desc=["group,n,mean_job_satisfaction,median_job_satisfaction",...groups.map(g=>`${g.adopt?"AI tools used":"AI tools not used"},${g.n},${g.mean.toFixed(4)},${g.median.toFixed(2)}`)].join("\n")+"\n";
  fs.writeFileSync(path.join(ROOT,"descriptive_statistics.csv"),desc);

  const summary=[
    `Survey dimensions: ${totalRows} rows x ${header.length} columns.`,
    `Professional-developer respondents: ${professional}.`,
    `Complete analysis sample: ${n}.`,
    `Experience: mean ${expMean.toFixed(2)} years; median ${expMedian.toFixed(1)} years.`,
    `OLS adoption coefficient: ${beta[1].toFixed(3)} (SE ${se.toFixed(3)}, t=${t.toFixed(2)}, p=${p.toPrecision(4)}; R-squared=${r2.toFixed(3)}).`,
    `Role fixed effects: ${dummies.length}; omitted category: ${baseline}.`,
    "AISelect responses among professional developers:",
    ...rawAi.map(([label,count])=>`  ${label||"[missing]"}: ${count}`)
  ].join("\n")+"\n";
  fs.writeFileSync(path.join(ROOT,"analysis_summary.txt"),summary);

  const c1=["0.95 0.95 0.95 rg 0 0 612 432 re f","0 0 0 rg",textCmd(80,390,16,"Mean job satisfaction by reported AI-tool adoption")];
  const max=10, baseY=75, scale=27;
  c1.push("0 0 0 RG 1 w 75 75 m 75 350 l S");
  for(let y=0;y<=10;y+=2){const py=baseY+y*scale;c1.push(`0.75 0.75 0.75 RG 75 ${py} m 555 ${py} l S`,textCmd(52,py-3,9,String(y)));}
  groups.forEach((g,i)=>{const x=155+i*230,w=115,h=g.mean*scale;c1.push(`${i?"0.20 0.55 0.35":"0.35 0.45 0.75"} rg ${x} ${baseY} ${w} ${h} re f`,"0 0 0 rg",textCmd(x+40,baseY+h+10,12,g.mean.toFixed(2)),textCmd(x-4,45,10,g.adopt?"AI tools used":"AI tools not used"),textCmd(x+28,29,9,`n = ${g.n}`));});
  writePdf(path.join(FIGURES,"fig1_satisfaction_by_ai_use.pdf"),c1);

  const bins=Array(11).fill(0); rows.forEach(r=>bins[Math.min(10,Math.floor(r.exp/5))]++); const mx=Math.max(...bins);
  const c2=["0.95 0.95 0.95 rg 0 0 612 432 re f","0 0 0 rg",textCmd(100,390,16,"Professional coding experience in analysis sample"),"0 0 0 RG 1 w 65 70 m 570 70 l S"];
  bins.forEach((count,i)=>{const x=70+i*45,h=260*count/mx,label=i===10?"50+":`${i*5}-${i*5+4}`;c2.push(`0.30 0.50 0.72 rg ${x} 70 34 ${h} re f`,`0 0 0 rg`,textCmd(x+4,52,8,label),textCmd(x+4,77+h,8,String(count)));});
  c2.push(textCmd(230,25,10,"Years of professional experience"));
  writePdf(path.join(FIGURES,"fig2_years_experience.pdf"),c2);

  console.log(summary);
  console.log("What I did: filtered professional developers to complete observations, coded reported AI-tool use as a binary adoption indicator, estimated OLS job satisfaction on adoption, years of work experience, and primary-role fixed effects, and wrote reproducible tables and two PDF figures.");
}
