import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY?.trim();

console.log('\n🔍 MSG91 SMS Delivery Diagnostics\n');

if (!MSG91_AUTH_KEY) {
  console.error('❌ MSG91_AUTH_KEY not found!');
  process.exit(1);
}

console.log('Common reasons why SMS might not be delivered:\n');

console.log('1. 📱 DND (Do Not Disturb) Status');
console.log('   - Your number might be on DND list');
console.log('   - Solution: Remove from DND or use promotional route\n');

console.log('2. 🆔 Sender ID Not Approved');
console.log('   - Sender ID "CIVICF" might not be approved');
console.log('   - Solution: Go to MSG91 Dashboard → Sender ID → Request approval');
console.log('   - Or use default: TXTLCL (usually pre-approved)\n');

console.log('3. 💰 Insufficient Balance');
console.log('   - Free tier: 100 SMS/day limit might be reached');
console.log('   - Solution: Check MSG91 dashboard for balance\n');

console.log('4. ⏱️  Delivery Delay');
console.log('   - SMS can take 1-5 minutes to deliver');
console.log('   - Solution: Wait a few minutes\n');

console.log('5. 📞 Phone Number Format');
console.log('   - Number should be 10 digits (Indian format)');
console.log('   - Example: 9353906607 (not +91 or 0 prefix)\n');

console.log('6. 🚫 Network/Carrier Issues');
console.log('   - Some carriers block transactional SMS');
console.log('   - Solution: Try from different network\n');

console.log('📊 How to Check Delivery Status:\n');
console.log('1. Go to: https://msg91.com/');
console.log('2. Login to your account');
console.log('3. Go to: Reports → SMS Reports');
console.log('4. Check delivery status for Message ID\n');

console.log('🧪 Test with Different Sender ID:\n');
console.log('Try using TXTLCL (default, usually works):');
console.log('  In .env file, change:');
console.log('  MSG91_SENDER_ID=TXTLCL\n');

console.log('📝 Check MSG91 Dashboard for:');
console.log('  - Account balance');
console.log('  - Sender ID approval status');
console.log('  - Delivery reports');
console.log('  - Any error messages\n');

