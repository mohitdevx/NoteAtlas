# Linux File System for Beginners

If you are new to Linux, the file system can feel unfamiliar at first.  
This guide explains it in simple language, with practical examples you can use right away.

---

## 1. The Big Idea: One Tree, One Starting Point

In Linux, everything starts from a single top-level directory called **root**, written as:

```bash
/
```

Think of `/` as the trunk of a tree.

- Folders are branches
- Files are leaves
- Every path starts from this tree

Unlike Windows, Linux does **not** use drive letters like `C:` or `D:`.

---

## 2. "Everything Is a File" (Very Important)

Linux follows a simple rule: almost everything is treated like a file.

That includes:

- Regular files (notes, images, scripts)
- Directories (folders)
- Devices (keyboard, disk, printer)
- System info and process data

Why this is useful:
- Tools can work in a consistent way
- The system stays simple and powerful

---

## 3. Core Linux Directories You Should Know

When you open `/`, you will see standard folders. Here are the most important ones:

| Directory | Purpose (Simple Explanation) |
|---|---|
| `/` | Root of the whole file system |
| `/home` | Personal folders for normal users |
| `/root` | Home folder of the admin user (`root`) |
| `/bin` | Essential command programs (like `ls`, `cp`) |
| `/sbin` | System/admin commands |
| `/etc` | System configuration files |
| `/var` | Changing data: logs, cache, queues |
| `/tmp` | Temporary files (often cleared after reboot) |
| `/usr` | Installed applications and shared resources |
| `/dev` | Device files (disks, terminals, hardware interfaces) |
| `/media` | Auto-mounted external drives (USB, SD cards) |
| `/mnt` | Manual mount point for temporary mounts |

Tip:
- Your personal workspace is usually `/home/<your-username>`.

---

## 4. Paths: How Linux Finds Files

A **path** is the location of a file/folder.

### Absolute Path
Starts from `/` and always means the exact same location.

Example:

```bash
/home/mohit/Documents/notes.txt
```

### Relative Path
Starts from your current location.

If you are already in `/home/mohit`, this is valid:

```bash
Documents/notes.txt
```

### Special Shortcuts

- `.` means current directory
- `..` means parent directory (one level up)
- `~` means your home directory

---

## 5. 3 Commands to Start Navigating Today

### `pwd` (Print Working Directory)
Shows where you are now.

```bash
pwd
```

### `ls` (List)
Shows files/folders in current directory.

```bash
ls
ls -la
```

- `-l` gives detailed view
- `-a` shows hidden files (like `.bashrc`)

### `cd` (Change Directory)
Moves you to a different folder.

```bash
cd /etc
cd ..
cd ~
cd /home/mohit/Documents
```

---

## 6. Basic File and Folder Operations

### Create

```bash
touch notes.txt
mkdir project
mkdir -p learning/linux/basics
```

### Copy

```bash
cp notes.txt notes-backup.txt
cp -r project project-copy
```

### Move / Rename

```bash
mv notes.txt notes-old.txt
mv notes-old.txt /tmp/
```

### Delete (Careful)

```bash
rm notes-old.txt
rm -r project-copy
```

Warning:
- `rm` permanently deletes files (no recycle bin by default).

---

## 7. Permissions (Simple Version)

Every file/folder has permissions for:

- **Owner**
- **Group**
- **Others**

You can inspect permissions with:

```bash
ls -l
```

Example output:

```bash
-rw-r--r-- 1 mohit mohit 1200 May 17 09:00 notes.txt
```

Quick meaning:
- `r` = read
- `w` = write
- `x` = execute

Common permission commands:

```bash
chmod u+x script.sh      # give execute permission to owner
chmod 644 notes.txt      # owner read/write, others read
chmod 755 run.sh         # owner full, others read/execute
```

---

## 8. Mounting: Where External Drives Appear

In Linux, external disks are attached to the same file tree using **mount points**.

Typical locations:

- `/media/<username>/...` (auto-mounted)
- `/mnt/...` (manual mounts)

So instead of `E:\`, you access your USB drive through a directory path.

---

## 9. Beginner Mistakes to Avoid

1. Running commands in the wrong folder  
Always check with `pwd` first.

2. Deleting too quickly with `rm -r`  
Use `ls` before destructive commands.

3. Editing system files without understanding  
Be careful in `/etc` and with `sudo`.

4. Mixing up `/` and `/root`  
`/` is system root, `/root` is the root user's home.

---

## 10. Quick Practice (5 Minutes)

Try this in terminal:

```bash
cd ~
mkdir linux-practice
cd linux-practice
touch one.txt two.txt
mkdir docs
mv one.txt docs/
cp two.txt docs/two-copy.txt
ls -la
pwd
```

Then clean up:

```bash
cd ~
rm -r linux-practice
```

---

## 11. Fast Cheat Sheet

```bash
pwd            # where am I
ls -la         # list all files (detailed)
cd <path>      # move to folder
cd ..          # go up one level
cd ~           # go to home
mkdir <name>   # create folder
touch <file>   # create file
cp <a> <b>     # copy
mv <a> <b>     # move/rename
rm <file>      # delete file
rm -r <dir>    # delete folder recursively
```

---

## Final Note

You do not need to memorize everything in one day.  
Start with `pwd`, `ls`, and `cd`, and practice a little every day.  
Once navigation feels natural, Linux becomes much easier and more enjoyable.
