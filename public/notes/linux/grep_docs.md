# Linux `grep` Command Tutorial

`grep` is one of the most useful text-processing commands in Linux. It searches input line by line and prints the lines that match a pattern.

Use `grep` when you need to:

- Find a word, phrase, or pattern inside files.
- Filter command output in a pipeline.
- Search logs for errors or warnings.
- Locate references inside a source-code directory.
- Extract specific values such as IDs, emails, IP addresses, or paths.

## 1. Mental Model

Think of `grep` as a line-based filter.

You give it text and a search pattern. `grep` scans each line and only lets matching lines through.

```bash
grep "pattern" file.txt
```

The name `grep` comes from an old Unix editor command:

```text
g/re/p
```

That means "globally search for a regular expression and print matching lines."

## 2. Basic Syntax

```bash
grep [options] "pattern" [file...]
```

Examples:

```bash
grep "error" server.log
grep -i "warning" app.log
grep -R "themeConfig" ./src
```

If no file is provided, `grep` reads from standard input. This makes it especially useful in pipelines.

```bash
ps aux | grep "nginx"
```

## 3. Core Options

Most `grep` options fit into three categories:

- What to match
- What to display
- Where to search

### Match Control

These options change how `grep` interprets the pattern.

| Option | Name | Purpose |
| --- | --- | --- |
| `-i` | Ignore case | Match uppercase and lowercase text equally. |
| `-w` | Whole word | Match complete words only. |
| `-v` | Invert match | Print lines that do not match the pattern. |
| `-E` | Extended regex | Enable extended regular expressions. |
| `-F` | Fixed string | Treat the pattern as literal text instead of regex. |

Examples:

```bash
grep -i "error" server.log
grep -w "id" users.txt
grep -v "debug" app.log
grep -E "error|failed|timeout" server.log
grep -F "utils.*" source.txt
```

Use `-F` when the search text contains characters that could be interpreted as regex symbols, such as `.`, `*`, `[`, or `]`.

### Output Control

These options change what `grep` prints.

| Option | Name | Purpose |
| --- | --- | --- |
| `-n` | Line number | Show the line number for each match. |
| `-c` | Count | Print only the number of matching lines. |
| `-o` | Only matching | Print only the matched portion of each line. |
| `-l` | Files with matches | Print only filenames that contain a match. |
| `-L` | Files without matches | Print only filenames that do not contain a match. |

Examples:

```bash
grep -n "main" app.js
grep -c "ERROR" server.log
grep -o -E "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" access.log
grep -l "themeConfig" ./src/*.ts
```

### Search Scope

These options control where `grep` looks.

| Option | Name | Purpose |
| --- | --- | --- |
| `-r` | Recursive | Search files inside directories recursively. |
| `-R` | Recursive with symlinks | Search recursively and follow symbolic links. |
| `--include` | Include files | Search only files matching a glob pattern. |
| `--exclude` | Exclude files | Skip files matching a glob pattern. |
| `--exclude-dir` | Exclude directories | Skip directories matching a name or glob. |

Examples:

```bash
grep -r "useEffect" ./src
grep -R "server_name" /etc/nginx
grep -r --include="*.ts" "UserConfig" ./src
grep -r --exclude="*.min.js" "analytics" ./public
grep -r --exclude-dir="node_modules" "themeConfig" .
```

## 4. Context Around Matches

A single matching line is not always enough. Context options show nearby lines so you can understand what happened before or after the match.

| Option | Meaning | Example |
| --- | --- | --- |
| `-A N` | Show `N` lines after each match. | `grep -A 3 "TypeError" app.log` |
| `-B N` | Show `N` lines before each match. | `grep -B 2 "failed" app.log` |
| `-C N` | Show `N` lines before and after each match. | `grep -C 4 "timeout" app.log` |

Examples:

```bash
grep -A 4 "app.post('/api/auth" server.ts
grep -B 5 "OutOfMemoryError" service.log
grep -C 3 "connection refused" system.log
```

## 5. Practical Workflows

### Search a Codebase With Line Numbers

Find every reference to `themeConfig` inside `src` and show the exact line number.

```bash
grep -Rn "themeConfig" ./src
```

Use this when refactoring, tracing imports, or locating component usage.

### Search Logs Case-Insensitively

Find all error messages, regardless of capitalization.

```bash
grep -i "error" server.log
```

### Remove Noise From Output

Show errors but hide repeated deprecation messages.

```bash
grep -i "error" server.log | grep -vi "deprecation"
```

The first `grep` finds error lines. The second `grep` removes lines that contain `deprecation`.

### Count Matching Lines

Count how many lines mention `failed`.

```bash
grep -ci "failed" server.log
```

This combines:

- `-c` to count matching lines.
- `-i` to ignore case.

### Extract IP Addresses

Print only IP-like values from a log file.

```bash
grep -o -E "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" access.log
```

This combines:

- `-o` to print only the matching text.
- `-E` to use extended regular expressions.

### Find Files That Contain a Pattern

List only files that mention `DATABASE_URL`.

```bash
grep -Rl "DATABASE_URL" .
```

This is useful when you care about which files contain a setting, not every matching line.

## 6. Regular Expression Essentials

By default, `grep` supports basic regular expressions. Use `-E` for extended regular expressions, which are usually easier to read.

| Pattern | Meaning | Example |
| --- | --- | --- |
| `.` | Any single character | `gr.p` matches `grep` and `grip`. |
| `*` | Zero or more of the previous token | `lo*l` matches `ll`, `lol`, and `lool`. |
| `+` | One or more of the previous token with `-E` | `grep -E "go+d"` |
| `?` | Optional previous token with `-E` | `grep -E "colou?r"` |
| `|` | OR with `-E` | `grep -E "error|failed"` |
| `^` | Start of line | `grep "^ERROR" app.log` |
| `$` | End of line | `grep "done$" app.log` |
| `[abc]` | Any listed character | `grep "[Yy]es" file.txt` |
| `[0-9]` | Any digit | `grep "[0-9]" file.txt` |

Examples:

```bash
grep -E "error|failed|timeout" server.log
grep -E "^WARN|^ERROR" app.log
grep -E "[0-9]{4}-[0-9]{2}-[0-9]{2}" events.log
```

## 7. Best Practices

- Quote your search pattern to prevent the shell from interpreting special characters.
- Use `-F` for literal strings when you do not need regex.
- Use `-n` when searching source code so results are easy to open in an editor.
- Use `--exclude-dir` when searching projects with large generated folders.
- Prefer `-E` for readable regular expressions.
- Pipe into `grep -v` to remove noisy matches from command output.

Common project search:

```bash
grep -Rni --exclude-dir="node_modules" --exclude-dir=".git" "keyword" .
```

## 8. Quick Reference

| Goal | Command |
| --- | --- |
| Search one file | `grep "text" file.txt` |
| Ignore case | `grep -i "text" file.txt` |
| Show line numbers | `grep -n "text" file.txt` |
| Search recursively | `grep -R "text" ./directory` |
| Count matches | `grep -c "text" file.txt` |
| Show only matching text | `grep -o "text" file.txt` |
| Show files with matches | `grep -l "text" *.txt` |
| Exclude matching lines | `grep -v "text" file.txt` |
| Show context | `grep -C 3 "text" file.txt` |
| Use extended regex | `grep -E "one|two" file.txt` |
| Search literal text | `grep -F "a.b*" file.txt` |

## 9. Practice Exercise

Search through a directory named `components`, ignore case, and count how many lines mention `button`.

```bash
grep -Rci "button" ./components
```

Breakdown:

- `-R` searches recursively.
- `-c` counts matching lines.
- `-i` ignores case.

`grep` becomes easier to remember when you think in three questions:

- What should match?
- What should be displayed?
- Where should the search happen?
