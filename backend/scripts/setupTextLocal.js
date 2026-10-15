console.log('\n📱 Setting Up TextLocal SMS (FREE & Easy for India)\n');

console.log('✅ Why TextLocal?');
console.log('   - FREE tier available (100 SMS/day)');
console.log('   - Perfect for Indian numbers');
console.log('   - No phone number verification needed');
console.log('   - Easy setup (just API key)\n');

console.log('📝 Steps to Get FREE TextLocal API Key:\n');
console.log('   1. Go to: https://www.textlocal.in/');
console.log('   2. Click "Sign Up" (top right)');
console.log('   3. Fill in your details:');
console.log('      - Name, Email, Mobile Number');
console.log('      - Company Name (can be "Test Business")');
console.log('   4. Verify your email');
console.log('   5. Login to your account');
console.log('   6. Go to: API → API Details');
console.log('   7. Copy your API Key\n');

console.log('📋 After You Get API Key:\n');
console.log('   1. Open backend/.env file');
console.log('   2. Add these lines:');
console.log('      SMS_PROVIDER=textlocal');
console.log('      TEXTLOCAL_API_KEY=your_api_key_here');
console.log('      TEXTLOCAL_SENDER=TXTLCL (or your custom sender name)\n');

console.log('   3. Or run this command:');
console.log('      node scripts/addTextLocalEnv.js your_api_key_here\n');

console.log('💡 TextLocal Free Tier:');
console.log('   - 100 SMS per day');
console.log('   - Perfect for testing');
console.log('   - Works with Indian numbers (+91)\n');

console.log('🚀 After setup, restart your server and SMS will work!\n');

