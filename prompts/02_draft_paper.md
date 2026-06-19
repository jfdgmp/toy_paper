# Prompt 02 — Draft the toy paper

Paste into the **same CLI conversation** as Prompt 01.

---

```
Now write the paper.

Open `paper/main.tex`. Each section currently contains a `% TODO (LLM)` comment block telling you what that section should cover. Replace those TODO blocks with prose, leaving the rest of the file intact.

Rules — read these twice:

1. **Use the actual numbers** from the regression you ran in Prompt 01 (point estimate, SE, p-value, sample size). Do NOT invent numbers. If you don't remember an exact value, re-run the script.

2. **Do NOT invent citations.** `refs.bib` is intentionally small. If you want to cite something:
   - First check whether it's in `refs.bib`.
   - If not, do NOT add it.
   - Phrase the sentence so it stands without a citation, e.g. "Prior work on developer survey methodology raises questions about self-selection" rather than fabricating a `\cite{...}`.

3. **Frame the paper as descriptive.** No "we identify" or "we find that AI tools cause...". Use language like "we document a positive cross-sectional association between..." and "controlling for X does not change the sign or significance of...".

4. **The Limitations section is the most important one.** Cover at minimum:
   - Selection into the SO survey is not random.
   - AI-tool adoption is self-reported.
   - Job satisfaction is self-reported.
   - There is no instrument for AI-tool adoption.
   - The design is cross-sectional.
   - Omitted variables (team culture, employer, ability) are plausibly correlated with both adoption and satisfaction.
   Spell each one out in plain English.

5. **The paper says it's a teaching artefact.** The abstract and conclusion already start to do this; carry it through.

6. **Length target.** Each filled-in section: one to three short paragraphs. The whole paper should be roughly 5–7 pages including figures.

After editing `main.tex`, summarize:
- which sections you filled in,
- which numbers came from `results_table.csv` (cite the row),
- any places where you wanted to cite something but didn't, because the reference wasn't in `refs.bib`.
```

---

After the agent finishes, compile `main.tex` (locally with `pdflatex main && bibtex main && pdflatex main && pdflatex main`, or by pushing to Overleaf). Read the PDF as a reviewer. Note where the prose is generic and where it actually engages the data.

Then move on to Prompt 03.
