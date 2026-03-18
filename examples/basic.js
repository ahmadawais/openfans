import { getOpenFans } from '../src/index.js';

async function main() {
  console.log('🌀 Detecting open fans...\n');

  const result = await getOpenFans();

  if (!result.success) {
    console.error('❌ Failed to get fan information');
    console.error('Error:', result.error);
    console.error('Platform:', result.platform);
    process.exit(1);
  }

  console.log(`✅ Found ${result.fanCount} running fan(s) on ${result.platform}\n`);

  if (result.fanCount === 0) {
    console.log('No fans detected or all fans are idle.');
  } else {
    console.log('Fan Details:');
    console.log('─'.repeat(50));
    result.fans.forEach((fan, index) => {
      console.log(`${index + 1}. ${fan.name}`);
      console.log(`   Speed: ${fan.speed} RPM`);
      console.log(`   Status: ${fan.running ? '🟢 Running' : '🔴 Idle'}`);
    });
  }
}

main().catch(console.error);
