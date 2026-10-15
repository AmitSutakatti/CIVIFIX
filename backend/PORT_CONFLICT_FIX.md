# Port Conflict Fix - Permanent Solution

## Problem
The server regularly fails to start with `EADDRINUSE` error because port 8001 (or other ports) is already in use by a previous instance.

## Solutions Implemented

### 1. Automatic Port Cleanup Script
Created `scripts/kill-port.js` that automatically finds and kills processes using a specific port.

**Usage:**
```bash
npm run kill:8001  # Kill process on port 8001
npm run kill:8000  # Kill process on port 8000
npm run kill:5000  # Kill process on port 5000
```

### 2. Enhanced Error Handling
All server files now have better error handling that:
- Detects port conflicts
- Shows helpful error messages
- Provides instructions to fix the issue

### 3. Updated Dev Scripts
The `dev:contractor` script now automatically kills port 8001 before starting:
```bash
npm run dev:contractor
```

## Manual Fix (If Needed)

If you still encounter port conflicts:

### Windows:
```bash
# Find process using port
netstat -ano | findstr :8001

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Or use the script
npm run kill:8001
```

### Quick Fix Commands:
```bash
# Kill all Node processes (use with caution)
taskkill /F /IM node.exe

# Or kill specific port
npm run kill:8001
```

## Prevention Tips

1. **Always stop servers properly** - Use Ctrl+C in the terminal
2. **Check for running processes** before starting:
   ```bash
   netstat -ano | findstr :8001
   ```
3. **Use the kill scripts** if you see port conflicts:
   ```bash
   npm run kill:8001
   ```

## Server Ports

- **User Portal Backend:** Port 5000
- **Municipal Portal Backend:** Port 8000
- **Contractor Portal Backend:** Port 8001

If you need to change ports, update the `.env` file:
```env
USER_PORT=5000
MUNICIPAL_PORT=8000
CONTRACTOR_PORT=8001
```















