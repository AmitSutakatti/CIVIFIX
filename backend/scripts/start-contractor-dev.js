import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const killPort = async (port) => {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
    
    if (!stdout.trim()) {
      console.log(`✅ Port ${port} is free`);
      return;
    }

    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    });

    if (pids.size === 0) {
      console.log(`✅ Port ${port} is free`);
      return;
    }

    for (const pid of pids) {
      try {
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`✅ Killed process ${pid} using port ${port}`);
      } catch (error) {
        // Ignore errors if process already dead
      }
    }
    
    // Wait a bit for port to be released
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    if (error.code === 1) {
      console.log(`✅ Port ${port} is free`);
    } else {
      console.error(`❌ Error checking port ${port}:`, error.message);
    }
  }
};

// Kill port 8001 first
await killPort(8001);

// Now start nodemon
console.log('🚀 Starting contractor backend server...');
const { spawn } = await import('child_process');
const nodemon = spawn('npx', ['nodemon', 'server-contractor.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

nodemon.on('error', (error) => {
  console.error('❌ Failed to start nodemon:', error);
  process.exit(1);
});

nodemon.on('exit', (code) => {
  process.exit(code || 0);
});


