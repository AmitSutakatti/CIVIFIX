console.log('\n📞 Twilio Trial Account - FREE Phone Number\n');
console.log('Good news! Twilio trial accounts get a FREE phone number - no purchase needed!\n');

console.log('🔍 Step 1: Check if you already have a number:');
console.log('   1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming');
console.log('   2. Look in the "Active numbers" section');
console.log('   3. If you see a number there, that\'s your FREE trial number!\n');

console.log('📝 Step 2: If you DON\'T have a number yet, get a FREE one:');
console.log('   1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/search');
console.log('   2. Click "Buy a number" (it\'s FREE for trial accounts!)');
console.log('   3. Select "United States" or your country');
console.log('   4. Check "SMS" capability');
console.log('   5. Click "Search"');
console.log('   6. Click "Buy" on any number (it\'s FREE - no credit card needed for trial)\n');

console.log('💡 Important:');
console.log('   - Trial accounts get FREE numbers (no payment required)');
console.log('   - You can only send SMS to VERIFIED numbers');
console.log('   - Verify recipient numbers at: Phone Numbers → Verified Caller IDs\n');

console.log('📋 After you get your FREE number:');
console.log('   1. Copy the number (format: +1XXXXXXXXXX)');
console.log('   2. Run: node scripts/updateTwilioPhoneNumber.js +1XXXXXXXXXX');
console.log('   3. Restart your server\n');

