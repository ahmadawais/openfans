# openfans

A lightweight, cross-platform Node.js module to detect and monitor open fans on your computer.

## Features

- 🖥️ **Cross-platform support**: Works on macOS, Windows, and Linux
- 🔍 **Fan detection**: Automatically detects running fans and their speeds
- ⚡ **Async API**: Promise-based interface for easy integration
- 📊 **RPM monitoring**: Get real-time fan speed data
- 🛠️ **Zero dependencies**: Uses only Node.js built-in modules

## Installation

```bash
npm install openfans
```

## Usage

### Basic Example

```javascript
import { getOpenFans } from 'openfans';

const fans = await getOpenFans();
console.log(`Found ${fans.fanCount} running fans`);
console.log(fans.fans);
```

### Response Format

```javascript
{
  success: true,
  platform: 'darwin',      // 'darwin' (macOS), 'win32' (Windows), 'linux'
  fanCount: 2,             // Number of running fans
  fans: [
    {
      name: 'Fan 1',
      speed: 2000,         // RPM
      running: true
    },
    {
      name: 'Fan 2',
      speed: 1500,
      running: true
    }
  ]
}
```

## Platform-Specific Details

### macOS
Uses `system_profiler SPPowerDataType` to read fan information from the system.

**Requirements**: No additional setup needed.

### Windows
Uses Windows Management Instrumentation (WMI) to query fan data.

**Requirements**: WMI must be available (standard on Windows).

### Linux
Attempts to use `lm-sensors` first, then falls back to `/sys/class/hwmon/`.

**Requirements**: 
- For best results, install `lm-sensors`: `sudo apt-get install lm-sensors` (Debian/Ubuntu)
- Or: `sudo yum install lm_sensors` (RHEL/CentOS)

## API

### `getOpenFans()`

Returns a promise that resolves to an object containing fan information.

**Returns**: `Promise<Object>`

```javascript
{
  success: boolean,        // Whether the operation succeeded
  platform: string,        // Current platform
  fanCount: number,        // Number of running fans
  fans: Array<Fan>,        // Array of fan objects
  error?: string          // Error message if success is false
}
```

**Fan Object**:
```javascript
{
  name: string,           // Fan identifier
  speed: number,          // Speed in RPM
  running: boolean        // Whether the fan is running
}
```

## Examples

### Get all running fans

```javascript
import { getOpenFans } from 'openfans';

const result = await getOpenFans();

if (result.success) {
  console.log(`System has ${result.fanCount} running fans`);
  result.fans.forEach(fan => {
    console.log(`${fan.name}: ${fan.speed} RPM`);
  });
} else {
  console.error('Failed to get fan info:', result.error);
}
```

### Monitor fan speeds

```javascript
import { getOpenFans } from 'openfans';

setInterval(async () => {
  const result = await getOpenFans();
  if (result.success) {
    result.fans.forEach(fan => {
      console.log(`${fan.name}: ${fan.speed} RPM`);
    });
  }
}, 5000); // Check every 5 seconds
```

## Error Handling

The module handles errors gracefully and returns a response object even on failure:

```javascript
const result = await getOpenFans();

if (!result.success) {
  console.error('Error:', result.error);
  console.error('Platform:', result.platform);
}
```

## Limitations

- **Requires elevated privileges**: Some systems may require admin/root access to read fan data
- **Hardware dependent**: Not all systems expose fan information
- **Linux variation**: Different Linux distributions may have different hwmon implementations

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
