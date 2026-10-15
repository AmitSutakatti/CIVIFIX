console.log('\n📱 Setting Up MSG91 SMS (FREE & Easy for India)\n');

console.log('✅ Why MSG91?');
console.log('   - FREE tier available (100 SMS/day)');
console.log('   - Perfect for Indian numbers');
console.log('   - No phone number verification needed');
console.log('   - Easy setup (just Auth Key)');
console.log('   - Reliable and widely used in India\n');

console.log('📝 Steps to Get FREE MSG91 Auth Key:\n');
console.log('   1. Go to: https://msg91.com/');
console.log('   2. Click "Sign Up" or "Get Started"');
console.log('   3. Fill in your details:');
console.log('      - Name, Email, Mobile Number');
console.log('      - Company Name (can be "CivicFix" or "Test Business")');
console.log('   4. Verify your email and mobile number');
console.log('   5. Login to your account');
console.log('   6. Go to: Dashboard → API → Auth Key');
console.log('   7. Copy your Auth Key\n');

console.log('📋 After You Get Auth Key:\n');
console.log('   1. Open backend/.env file');
console.log('   2. Add these lines:');
console.log('      SMS_PROVIDER=msg91');
console.log('      MSG91_AUTH_KEY=your_auth_key_here');
console.log('      MSG91_SENDER_ID=CIVICF (6 characters max)\n');

console.log('   3. Or run this command:');
console.log('      node scripts/addMSG91Env.js your_auth_key_here\n');

console.log('💡 MSG91 Free Tier:');
console.log('   - 100 SMS per day');
console.log('   - Perfect for testing');
console.log('   - Works with Indian numbers (+91)');
console.log('   - No credit card required\n');

console.log('🚀 After setup, restart your server and SMS will work!\n');

