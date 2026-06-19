# Exercise 2 — A toy paper, end-to-end, from data to Overleaf

In ~15 minutes (mostly demo + follow-along) we run the full loop:

1. Download a real, public dataset (the Stack Overflow Annual Developer Survey).
2. Ask the agent to explore it and produce summary statistics + two figures.
3. Ask the agent to draft Data and Results sections of a LaTeX paper.
4. Commit and push the paper to Overleaf; refresh the browser to see it rendered.
5. Ask the agent to suggest revisions, executed as separate git commits.

This is **illustrative only**. The "paper" we produce is not publishable — the workflow is the lesson, not the finding.

---

## Why this dataset

The Stack Overflow Developer Survey is:

- **Genuinely public.** Released under ODbL 1.0 (database) + DbCL 1.0 (contents). We can share, derive, and redistribute as long as we attribute. Source: <https://survey.stackoverflow.co/> and <https://github.com/StackExchange/Survey>.
- **Topical.** The dataset asks developers about their use of AI tools — a nice meta-resonance with this seminar.
- **Tabular and clean enough** that a frontier model can do EDA on it without breaking a sweat.

---

## The illustrative research question

> Among professional developers, is reported AI-tool adoption associated with reported job satisfaction, controlling for years of professional experience and primary developer role?

Why this question is fine *for a toy exercise*:
- Small enough to fit one table of results.
- Honestly descriptive — we make no causal claim.
- The data is observational and self-reported, so we'll explicitly flag the limits.

Why this question would **not** be publishable as-is:
- Self-reported satisfaction is a weak measure.
- Selection into the survey is not random.
- "AI-tool adoption" is endogenous to engineer ability, team culture, employer, and probably to satisfaction itself.
- The cross-section has no identification strategy.

We will say this out loud in the paper and in the wrap-up. That is the point — students see what an honest toy paper looks like.

---

## Folder layout

```
02-toy-paper/
├── data/
│   ├── download.sh          ← fetches the CSV from Stack Overflow
│   └── README.md            ← license and citation reminder
├── analysis/
│   ├── analysis.R           ← R starter (tidyverse + lm)
│   └── analysis.py          ← Python starter (pandas + statsmodels)
├── paper/
│   ├── main.tex             ← LaTeX skeleton, Overleaf-pushable
│   ├── refs.bib             ← bibliography (starts empty)
│   └── figures/             ← analysis script saves figures here
└── prompts/
    ├── 01_explore_data.md
    ├── 02_draft_paper.md
    └── 03_revise_with_git.md
```

---

## Step 1 — Download the data

```bash
cd exercises/02-toy-paper
bash data/download.sh
```

The script fetches the most recent year's `results.csv` from the official Stack Overflow archive. The CSV is ~50–80 MB depending on the year. We do **not** commit the CSV to git (see `.gitignore`).

If the script fails (corporate firewall, etc.), download manually from <https://survey.stackoverflow.co/> → "Download data" and place the CSV at `data/results.csv`.

---

## Step 2 — Explore the data

Open your CLI in `02-toy-paper/`:

```bash
claude       # or codex / gemini
```

Paste `prompts/01_explore_data.md`. The agent will:
- inspect `data/results.csv`,
- report row count, key variable names, missingness,
- produce summary statistics for the AI-use and satisfaction variables,
- save two figures to `paper/figures/`.

Pick whichever language the agent / your team prefers (R or Python). Both starter scripts are in `analysis/`.

---

## Step 3 — Draft the paper

Paste `prompts/02_draft_paper.md`. The agent will read `paper/main.tex` and the output of step 2 (figures, summary stats) and fill in the Data, Methods, and Results sections.

> ⚠ **Citation hygiene:** instruct the agent explicitly **not** to invent citations. Models confabulate plausible-sounding-but-fake references with disturbing fluency. The prompt template enforces this; police it anyway.

---

## Step 4 — Push to Overleaf

If you have the Overleaf git bridge configured (Setup Guide §5):

```bash
# in your separate Overleaf clone
cp ../ai_for_research/exercises/02-toy-paper/paper/main.tex .
cp ../ai_for_research/exercises/02-toy-paper/paper/refs.bib .
cp -R ../ai_for_research/exercises/02-toy-paper/paper/figures .
git add . && git commit -m "import toy-paper draft"
git push
```

Then reload your Overleaf browser tab — the PDF rebuilds with the new content.

(If you don't have the git bridge: just open `paper/main.tex` in any LaTeX editor. The point of the exercise is the workflow, and the Overleaf round-trip is what makes it visceral.)

---

## Step 5 — Revise via git

Paste `prompts/03_revise_with_git.md`. The agent reads the current draft, suggests three improvements, and makes each as a separate `git commit`. You can then push each commit to Overleaf one at a time and watch the paper improve commit by commit.

This is the **version-control mindset** for paper writing: small, well-labelled commits beat one giant "revisions" commit. Easier to review, easier to revert.

---

## Reference outcome (for the organiser)

A finished version of this exercise — the toy paper, fully written and compiled,
in **both** a Python and an R toolchain — lives in [`sample-output/`](sample-output/).
Open `sample-output/python/paper/main.pdf` and `sample-output/r/paper/main.pdf`
to see exactly what a participant ends up with. Both versions are also pushed to
the seminar Overleaf project as two folders in one project.

---

## What we want students to take away

- The full loop is real, fast, and works end-to-end.
- **The agent does the boring work** (EDA, draft, formatting); **you do the thinking** (question framing, validity, contribution).
- **Citations and identification are where AI tools fail hardest.** Don't outsource them.
- Git turns paper writing from a single ever-growing file into a sequence of reviewable, revertable changes.
