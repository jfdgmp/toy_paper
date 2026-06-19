# Prompt 01 — Explore the Stack Overflow Developer Survey

Paste into your CLI in `exercises/02-toy-paper/`.

---

```
We're going to write a small descriptive paper. The data is the Stack Overflow Annual Developer Survey, stored at `data/results.csv`. The survey is observational and self-reported; we will not make causal claims.

Your task right now is to inspect the data and produce the inputs the LaTeX paper at `paper/main.tex` will need.

Procedure:

1. Inspect `data/results.csv`. Print:
   - row count and column count,
   - the names of columns related to:
     * AI-tool use (likely `AISelect` or similar),
     * job satisfaction (likely `JobSat`),
     * years of professional coding experience (likely `YearsCodePro`),
     * primary developer role (likely `DevType`).


2. Create an analysis script from scratch:
   - the size of the analysis frame after dropping missing values,
   - mean and median satisfaction by AI-use category,
   - the OLS coefficient on AI-use from the regression (point estimate, SE, p-value).
   - A set of any other compelling descriptive statistics of the data that you
     think i should know about before writing a paper with this data.

3. Confirm that the two figures exist at `paper/figures/fig1_satisfaction_by_ai_use.pdf` and `paper/figures/fig2_years_experience.pdf`.

Rules:
- Do not fabricate numbers. If the CSV is missing or doesn't have the expected columns, stop and say so.
- Do not commit large CSVs to git. The CSV stays uncommitted.
- Print a one-paragraph "what I did" summary at the end.
```

---

When the agent finishes, eyeball `paper/figures/*.pdf` to make sure the plots are reasonable. Then move on to Prompt 02.
