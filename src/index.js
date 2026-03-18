import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

const platform = os.platform();

/**
 * Get the number of open fans on the system
 * @returns {Promise<Object>} Object with fan count and details
 */
async function getOpenFans() {
  try {
    if (platform === 'darwin') {
      return await getOpenFansMacOS();
    } else if (platform === 'win32') {
      return await getOpenFansWindows();
    } else if (platform === 'linux') {
      return await getOpenFansLinux();
    } else {
      return {
        success: false,
        platform,
        message: `Unsupported platform: ${platform}`,
        fanCount: 0,
        fans: []
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fanCount: 0,
      fans: []
    };
  }
}

/**
 * macOS: Use system_profiler to get fan information
 */
async function getOpenFansMacOS() {
  try {
    const { stdout } = await execAsync('system_profiler SPPowerDataType');
    const fanMatches = stdout.match(/Fan \d+:/g) || [];
    const fans = [];
    
    // Parse fan information
    const lines = stdout.split('\n');
    let currentFan = null;
    
    for (const line of lines) {
      if (line.includes('Fan')) {
        currentFan = { name: line.trim() };
        fans.push(currentFan);
      } else if (currentFan && line.includes('Current Speed')) {
        const speed = line.match(/(\d+)\s*rpm/i);
        if (speed) {
          currentFan.speed = parseInt(speed[1]);
          currentFan.running = parseInt(speed[1]) > 0;
        }
      }
    }

    return {
      success: true,
      platform: 'darwin',
      fanCount: fans.length,
      fans: fans.filter(f => f.running !== false)
    };
  } catch (error) {
    return {
      success: false,
      platform: 'darwin',
      error: error.message,
      fanCount: 0,
      fans: []
    };
  }
}

/**
 * Windows: Use WMI to get fan information
 */
async function getOpenFansWindows() {
  try {
    const { stdout } = await execAsync(
      'wmic logicaldisk get name',
      { shell: 'cmd.exe' }
    );
    
    // Try to get fan info via WMI
    const { stdout: fanData } = await execAsync(
      'wmic path win32_fan get name,speed',
      { shell: 'cmd.exe' }
    );

    const lines = fanData.split('\n').filter(line => line.trim());
    const fans = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 2) {
        const speed = parseInt(parts[parts.length - 1]);
        if (!isNaN(speed)) {
          fans.push({
            name: parts.slice(0, -1).join(' '),
            speed: speed,
            running: speed > 0
          });
        }
      }
    }

    return {
      success: true,
      platform: 'win32',
      fanCount: fans.length,
      fans: fans.filter(f => f.running)
    };
  } catch (error) {
    return {
      success: false,
      platform: 'win32',
      error: error.message,
      fanCount: 0,
      fans: []
    };
  }
}

/**
 * Linux: Read from /sys/class/hwmon or use lm-sensors
 */
async function getOpenFansLinux() {
  try {
    const fans = [];

    // Try lm-sensors first
    try {
      const { stdout } = await execAsync('sensors');
      const fanMatches = stdout.match(/fan\d+:\s+(\d+)\s*rpm/gi) || [];
      
      fanMatches.forEach((match, index) => {
        const speed = parseInt(match.match(/\d+/)[0]);
        fans.push({
          name: `Fan ${index + 1}`,
          speed: speed,
          running: speed > 0
        });
      });

      if (fans.length > 0) {
        return {
          success: true,
          platform: 'linux',
          fanCount: fans.length,
          fans: fans.filter(f => f.running)
        };
      }
    } catch (e) {
      // lm-sensors not available, try hwmon
    }

    // Fallback to hwmon
    const { stdout } = await execAsync('ls /sys/class/hwmon/');
    const hwmons = stdout.trim().split('\n');

    for (const hwmon of hwmons) {
      try {
        const { stdout: fanData } = await execAsync(
          `cat /sys/class/hwmon/${hwmon}/fan*_input 2>/dev/null || true`
        );
        const speeds = fanData.trim().split('\n').filter(s => s);
        
        speeds.forEach((speed, index) => {
          const rpm = parseInt(speed);
          if (!isNaN(rpm)) {
            fans.push({
              name: `${hwmon} Fan ${index + 1}`,
              speed: rpm,
              running: rpm > 0
            });
          }
        });
      } catch (e) {
        // Continue to next hwmon
      }
    }

    return {
      success: true,
      platform: 'linux',
      fanCount: fans.length,
      fans: fans.filter(f => f.running)
    };
  } catch (error) {
    return {
      success: false,
      platform: 'linux',
      error: error.message,
      fanCount: 0,
      fans: []
    };
  }
}

export { getOpenFans };
