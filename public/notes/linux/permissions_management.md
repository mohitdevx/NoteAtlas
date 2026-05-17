# Linux Permission Management: Complete Beginner-to-Advanced Guide

Linux permissions control **who can access what** and **what actions they can perform**.

If you understand permissions well, you can:

- Keep your system secure
- Avoid “Permission denied” errors
- Configure files and services correctly
- Collaborate safely with other users

---

## 1. Core Permission Model

Linux permissions are based on three identity groups:

- **User (u)**: the file owner
- **Group (g)**: users in the file’s group
- **Others (o)**: everyone else

And three basic permission types:

- **Read (`r`)**
- **Write (`w`)**
- **Execute (`x`)**

---

## 2. How to Read Permission Strings

Run:

```bash
ls -l
```

Example output:

```bash
-rwxr-xr-- 1 mohit devs 1420 May 17 10:00 deploy.sh
```

Breakdown:

- `-` -> regular file (`d` would mean directory)
- `rwx` -> owner permissions
- `r-x` -> group permissions
- `r--` -> others permissions
- `mohit` -> owner
- `devs` -> group

---

## 3. Meaning of `r`, `w`, `x` for Files vs Directories

### On Files

- `r`: read file content
- `w`: modify file content
- `x`: run file as program/script

### On Directories

- `r`: list directory entries
- `w`: create/delete/rename entries (usually needs `x` too)
- `x`: enter/traverse directory (`cd`, access files inside)

Important:
- Directory permissions behave differently than file permissions.
- You can have read without execute and still not enter that directory.

---

## 4. Changing Permissions with `chmod`

You can use **symbolic mode** or **numeric (octal) mode**.

### Symbolic mode

```bash
chmod u+x script.sh        # add execute for owner
chmod g-w project.txt      # remove write for group
chmod o=r readme.md        # set others to read only
chmod a+r notes.txt        # add read for all
```

Symbols:

- `u`, `g`, `o`, `a` (all)
- `+` add, `-` remove, `=` set exactly

### Numeric (octal) mode

Values:

- `r = 4`
- `w = 2`
- `x = 1`

Examples:

```bash
chmod 644 file.txt   # rw-r--r--
chmod 600 secret.key # rw-------
chmod 755 app.sh     # rwxr-xr-x
chmod 700 private/   # rwx------
```

---

## 5. Ownership: `chown` and `chgrp`

Permissions are useful only if ownership is correct.

### Change owner and group

```bash
sudo chown mohit:devs report.md
```

### Change only owner

```bash
sudo chown mohit report.md
```

### Change only group

```bash
sudo chgrp devs report.md
```

### Recursive ownership change

```bash
sudo chown -R mohit:devs /var/www/myapp
```

Use recursive commands carefully.

---

## 6. Default Permission Behavior and `umask`

When you create files/directories, Linux uses defaults and applies `umask`.

Typical base defaults:

- Files: `666` (no execute by default)
- Directories: `777`

Actual permission = base - `umask`

Check current umask:

```bash
umask
umask -S
```

Set temporary umask for current shell:

```bash
umask 022
umask 027
```

Common values:

- `022` -> owner full; group/others read+execute
- `027` -> owner full; group read+execute; others none
- `077` -> owner only (strict private)

To make it persistent, configure shell profile files (such as `.bashrc`, `.profile`) or system policy files.

---

## 7. Special Permission Bits

Linux has three special bits: **SUID**, **SGID**, and **Sticky bit**.

### 7.1 SUID (`u+s`)

On executable files, program runs with **file owner’s privileges**.

```bash
chmod u+s /path/to/binary
```

Shown as `s` in owner execute field (like `rws`).

Use carefully:
- Misconfigured SUID binaries can create privilege escalation risks.

### 7.2 SGID (`g+s`)

On executables:
- runs with file group privileges

On directories:
- new files inherit directory group (very useful for team folders)

```bash
chmod g+s shared-team-dir
```

### 7.3 Sticky bit (`+t`)

Mostly used on shared writable directories like `/tmp`.

Behavior:
- users can delete only their own files (even if directory is world-writable)

```bash
chmod +t /shared/scratch
```

Shown as `t` (example: `drwxrwxrwt`).

---

## 8. Access Control Lists (ACL): Fine-Grained Permissions

Standard permissions (user/group/others) are sometimes not enough.
ACL lets you give custom permissions to specific users/groups.

### Check ACL

```bash
getfacl file.txt
```

### Add ACL for a user

```bash
setfacl -m u:alice:rw file.txt
```

### Add ACL for a group

```bash
setfacl -m g:qa:r project.log
```

### Remove specific ACL entry

```bash
setfacl -x u:alice file.txt
```

### Remove all ACL entries

```bash
setfacl -b file.txt
```

### Default ACL on a directory

Ensures new files inherit ACL rules:

```bash
setfacl -m d:g:devs:rwx shared-dir
```

---

## 9. Useful Inspection and Debugging Commands

When permissions fail, these commands help quickly:

```bash
id                     # show current user and groups
groups                 # show group membership
ls -l file             # basic perms/owner/group
ls -ld dir             # permissions of directory itself
stat file              # detailed metadata
namei -l /path/to/file # permission breakdown for each path segment
getfacl file           # ACL details
```

If command exists on your distro, also useful:

```bash
lsattr file
chattr +i file         # immutable flag (advanced, root)
```

---

## 10. Why “Permission Denied” Happens

Common causes:

1. Missing execute bit on a script
2. Missing directory execute bit on parent directory
3. Wrong owner/group
4. Your user not in required group
5. ACL denies access
6. Immutable file attribute enabled
7. Filesystem mounted read-only
8. SELinux/AppArmor policy (on hardened systems)

Quick flow:

1. Check `id`
2. Check file with `ls -l`
3. Check parent directories with `namei -l`
4. Check ACL with `getfacl`
5. Check mount mode with `mount` or `findmnt`

---

## 11. Practical Secure Permission Patterns

### Private SSH key

```bash
chmod 600 ~/.ssh/id_rsa
chmod 700 ~/.ssh
```

### Web project owned by deployment user/group

```bash
sudo chown -R deploy:www-data /var/www/app
find /var/www/app -type d -exec chmod 755 {} \;
find /var/www/app -type f -exec chmod 644 {} \;
```

### Shared team directory

```bash
sudo mkdir -p /srv/teamshare
sudo chown root:devs /srv/teamshare
sudo chmod 2775 /srv/teamshare
```

`2` in `2775` sets SGID so new files inherit `devs` group.

### Temporary shared upload directory

```bash
sudo mkdir -p /srv/uploads
sudo chmod 1777 /srv/uploads
```

`1` in `1777` sets sticky bit.

---

## 12. File Type Indicators in `ls -l`

First character meanings:

- `-` regular file
- `d` directory
- `l` symbolic link
- `c` character device
- `b` block device
- `p` named pipe
- `s` socket

Permissions still apply, but behavior depends on file type.

---

## 13. Symbolic Links and Permissions

For symlinks:

- Symlink permission bits are generally not used for access control
- Access is controlled by target file/directory permissions

Useful commands:

```bash
ls -l linkname
readlink -f linkname
```

---

## 14. Security Best Practices

1. Follow least privilege  
Give only the minimum needed access.

2. Avoid `777` unless absolutely necessary  
It creates avoidable risk.

3. Use groups for team access  
Do not manually grant many individual users unless needed.

4. Review SUID binaries periodically  
Only trusted binaries should keep SUID.

5. Keep sensitive files owner-only (`600`, `700`)  
Especially keys, secrets, and backup archives.

6. Audit permissions in automation  
Set correct perms during deployment scripts.

---

## 15. Quick Cheat Sheet

```bash
# View
ls -l
ls -ld dir
stat file
id

# Change permissions
chmod 644 file
chmod 755 script.sh
chmod -R 750 project/

# Change ownership
sudo chown user:group file
sudo chown -R user:group dir
sudo chgrp group file

# Special bits
chmod u+s binary
chmod g+s shared-dir
chmod +t shared-tmp

# ACL
getfacl file
setfacl -m u:alice:rw file
setfacl -m d:g:devs:rwx shared-dir
```

---

## Final Summary

Linux permission management has four major parts:

1. Standard permissions (`rwx` for user/group/others)
2. Ownership (user and group)
3. Defaults (`umask`)
4. Advanced control (special bits and ACL)

Master these, and you can manage Linux systems safely and confidently.
