# Data — Stack Overflow Annual Developer Survey

This folder is for the survey CSV. We do not commit the CSV to git (large file, license attribution is cleanest via download script).

## How to get it

```bash
bash download.sh         # most recent year (default: 2025)
bash download.sh 2024    # specific year
```

If the script fails:
1. Visit <https://survey.stackoverflow.co/> and click "Download data".
2. Or browse the official archive on GitHub: <https://github.com/StackExchange/Survey/tree/main/packages/archive>.
3. Save the file as `data/results.csv`.

## License and attribution

The Stack Overflow Developer Survey data is released under:

- **Open Database License (ODbL) 1.0** for the database structure
- **Database Contents License (DbCL) 1.0** for the cell contents

You are free to share, adapt, and use commercially, **provided you attribute** Stack Overflow as the source and apply the same license to any redistributed adaptations.

Cite as:

> Stack Overflow. *Annual Developer Survey, [YEAR]*. <https://survey.stackoverflow.co/>. Licensed under ODbL 1.0 / DbCL 1.0.

Update `[YEAR]` to match the year you actually downloaded.
