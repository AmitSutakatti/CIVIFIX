console.log('\n📞 Getting FREE Twilio Number for Trial Account\n');
console.log('⚠️  India (+91) numbers are NOT available for trial accounts.\n');
console.log('✅ SOLUTION: Get a FREE United States number instead!\n');
console.log('💡 Good news: You can send SMS to Indian numbers using a US Twilio number!\n');

console.log('📝 Steps to get FREE US number:\n');
console.log('   1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/search');
console.log('   2. In "Country" field, change from "India" to "United States"');
console.log('   3. Check the "SMS" checkbox (under Capabilities)');
console.log('   4. Click "Search" button');
console.log('   5. You\'ll see available US numbers');
console.log('   6. Click "Buy" on any number (it\'s FREE for trial accounts!)\n');

console.log('🌍 Why US number works for Indian recipients:');
console.log('   - Twilio can send SMS to ANY country from a US number');
console.log('   - Your Indian recipients (+919353906607) will receive SMS normally');
console.log('   - The SMS will just come from a US number (which is fine)\n');

console.log('📋 After you get your FREE US number:');
console.log('   1. Copy the number (format: +1XXXXXXXXXX)');
console.log('   2. Run: node scripts/updateTwilioPhoneNumber.js +1XXXXXXXXXX');
console.log('   3. Restart your server');
console.log('   4. Verify recipient number: +919353906607 in Verified Caller IDs\n');

console.log('💡 Alternative: Check if you already have a number');
console.log('   Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming');
console.log('   Look for any number in "Active numbers" section\n');

