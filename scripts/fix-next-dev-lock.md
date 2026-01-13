# Fix: `Unable to acquire lock ... .next/dev/lock`

This happens when:
- another `next dev` is already running, or
- a stale lock file remains after an unclean shutdown.

## Windows (PowerShell / CMD)

### 1) Find and stop the process on port 3000

```bat
netstat -ano | findstr :3000
```

Kill the PID you see (example PID `22196`):

```bat
taskkill /PID 22196 /F
```

### 2) Also stop any other `next dev` / node processes (if needed)

```bat
tasklist | findstr /I node
```

Kill the suspicious PIDs.

### 3) Remove the stale lock file

```bat
del /F /Q .next\dev\lock
```

If that fails, remove the whole dev folder:

```bat
rmdir /S /Q .next\dev
```

### 4) Start dev again

```bat
npm run dev
```
