import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// First, kill any process on port 8001
try {
  const { stdout } = await execAsync(`netstat -ano | findstr :8001 | findstr LISTENING`);
  
  if (stdout.trim()) {
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    });

    for (const pid of pids) {
      try {
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`✅ Killed process ${pid} using port 8001`);
      } catch (error) {
        // Ignore errors if process already dead
      }
    }
  }
} catch (error) {
  // Port is free, continue
}

// Now start the server
import('./../server-contractor.js');















