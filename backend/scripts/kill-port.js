import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const killPort = async (port) => {
  try {
    // Windows command to find process using port
    const { stdout } = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
    
    if (!stdout.trim()) {
      console.log(`✅ Port ${port} is free`);
      return;
    }

    // Extract PID from output
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

    // Kill all processes using the port
    for (const pid of pids) {
      try {
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`✅ Killed process ${pid} using port ${port}`);
      } catch (error) {
        console.error(`⚠️  Could not kill process ${pid}:`, error.message);
      }
    }
  } catch (error) {
    // Port is free if no processes found
    if (error.code === 1) {
      console.log(`✅ Port ${port} is free`);
    } else {
      console.error(`❌ Error checking port ${port}:`, error.message);
    }
  }
};

// Get port from command line argument or use default
const port = process.argv[2] || 8001;

// Wait for port to be killed before exiting
killPort(port).then(() => {
  // Small delay to ensure port is fully released
  setTimeout(() => {
    process.exit(0);
  }, 500);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

