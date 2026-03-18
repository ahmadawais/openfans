import { getOpenFans } from '../src/index.js';

async function runTests() {
  console.log('🧪 Running openfans tests...\n');

  try {
    console.log('Test 1: Basic fan detection');
    const result = await getOpenFans();
    
    console.log('✓ getOpenFans() executed successfully');
    console.log(`  Platform: ${result.platform}`);
    console.log(`  Success: ${result.success}`);
    console.log(`  Fan Count: ${result.fanCount}`);
    
    if (!result.success) {
      console.log(`  Error: ${result.error}`);
    }

    console.log('\nTest 2: Response structure validation');
    const requiredFields = ['success', 'platform', 'fanCount', 'fans'];
    const hasAllFields = requiredFields.every(field => field in result);
    
    if (hasAllFields) {
      console.log('✓ Response has all required fields');
    } else {
      console.log('✗ Response missing required fields');
      process.exit(1);
    }

    console.log('\nTest 3: Fan array validation');
    if (Array.isArray(result.fans)) {
      console.log('✓ Fans is an array');
      
      if (result.fans.length > 0) {
        console.log(`✓ Found ${result.fans.length} fan(s)`);
        
        result.fans.forEach((fan, index) => {
          console.log(`  Fan ${index + 1}:`);
          console.log(`    - name: ${fan.name}`);
          console.log(`    - speed: ${fan.speed} RPM`);
          console.log(`    - running: ${fan.running}`);
        });
      } else {
        console.log('ℹ No running fans detected (this is normal)');
      }
    } else {
      console.log('✗ Fans is not an array');
      process.exit(1);
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

runTests();
