# Prompt 03 — Revise with git, one commit at a time

Paste into the **same CLI conversation** as Prompts 01 and 02.

This prompt teaches the version-control mindset for paper writing: small, well-labelled commits beat one giant "revisions" commit.

---

```
Read the current `paper/main.tex` as a critical reviewer. Identify exactly THREE improvements that would make the paper better. Pick from:

- Tighten a section that's currently vague or generic.
- Strengthen the Limitations section by adding a specific omitted-variable concern that fits these data.
- Improve a figure caption to be self-contained (readable from the caption alone).
- Add a robustness note (e.g., "results unchanged when we restrict to respondents with >5 years experience").
- Improve the abstract to lead with the descriptive nature of the result.

Do NOT pick more than three. Resist scope creep.

For each improvement:

1. Make the change in `paper/main.tex`.
2. Stage and commit with a clear, imperative-mood commit message. Examples:
   - `tighten limitations to call out selection on AI-use directly`
   - `make figure 1 caption self-contained`
   - `rewrite abstract to lead with descriptive framing`
3. Run `git log --oneline -10` and confirm your three new commits are at the top.

After all three commits, print a short report:
- Which three changes you made.
- The three commit messages.
- One sentence on what you would do next if you had more time.
```

---

If you have the Overleaf git bridge configured, you can now push and watch the paper improve one commit at a time:

```bash
git push
```

Then refresh your Overleaf tab.

That's the workflow. Same loop applies to your real research papers.
