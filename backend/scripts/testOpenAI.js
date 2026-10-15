import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🧪 Testing OpenAI API Configuration...\n');

// Check if API key is set
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: OPENAI_API_KEY is not set in .env file');
  console.log('\n📝 To fix this:');
  console.log('1. Open backend/.env file');
  console.log('2. Add: OPENAI_API_KEY=sk-your-api-key-here');
  console.log('3. Restart the backend server');
  process.exit(1);
}

// Check if API key looks valid (starts with sk-)
if (!apiKey.startsWith('sk-')) {
  console.warn('⚠️  WARNING: API key does not start with "sk-"');
  console.warn('   This might be an invalid key format');
}

// Mask the API key for display (show first 7 and last 4 characters)
const maskedKey = apiKey.length > 11 
  ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`
  : '***';

console.log(`✅ API Key found: ${maskedKey}`);
console.log(`   Length: ${apiKey.length} characters\n`);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
});

// Test data (similar to what the app would send)
const testData = {
  category: 'electricity',
  description: 'There is a power outage in my area for the past 3 days. The electricity supply is completely cut off, affecting daily activities and work.',
  user: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+91-9876543210',
  },
  location: {
    latitude: 15.837663,
    longitude: 74.527432,
  },
  address: 'Vadgaon, Belagavi, Karnataka, 590001, India',
};

const categoryLabels = {
  road: 'Road Issues',
  drainage: 'Drainage Problems',
  electricity: 'Electricity Issues',
  garbage: 'Garbage Collection',
  water: 'Water Supply',
  streetlight: 'Street Light',
  parks: 'Parks & Recreation',
  other: 'Other Civic Issues',
};

const categoryLabel = categoryLabels[testData.category] || testData.category;
const currentDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

console.log('📤 Testing OpenAI API call...\n');
console.log('Test Data:');
console.log(`  Category: ${categoryLabel}`);
console.log(`  Description: ${testData.description.substring(0, 50)}...`);
console.log(`  User: ${testData.user.name}`);
console.log(`  Location: ${testData.address}\n`);

// Create the prompt (same as in letterController.js)
const prompt = `Write a formal, professional complaint letter to the Municipal Commissioner about a ${categoryLabel.toLowerCase()} issue. 

User Details:
- Name: ${testData.user.name}
- Email: ${testData.user.email}
- Phone: ${testData.user.phone}
- Address: ${testData.address}
- Location Coordinates: Latitude ${testData.location.latitude}, Longitude ${testData.location.longitude}

Issue Details:
- Category: ${categoryLabel}
- Description: ${testData.description}
- Date: ${currentDate}

Requirements:
1. Use formal, respectful language appropriate for official correspondence
2. Include proper letter format with To, Subject, Date, and closing
3. Clearly describe the issue and its impact
4. Request specific actions (inspection, resolution, updates)
5. Include location details
6. Keep it concise but comprehensive (around 200-300 words)
7. End with "Yours faithfully" and include user's name and contact details
8. Add a note that it was submitted via CivicFix Platform

Generate the complete letter:`;

// Retry function with exponential backoff
// For rate limits, we need to wait at least 60 seconds (free tier: 3 requests/minute)
async function retryWithBackoff(fn, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // If it's a rate limit error and we have retries left
      if (error.status === 429 && attempt < maxRetries) {
        const waitSeconds = 65; // Wait 65 seconds to ensure we're past the 1-minute window
        console.log(`\n⏱️  Rate limit hit (429).`);
        console.log(`   Free tier allows 3 requests per minute.`);
        console.log(`   Waiting ${waitSeconds} seconds before retry ${attempt + 1}/${maxRetries}...\n`);
        
        // Show countdown
        for (let i = waitSeconds; i > 0; i--) {
          process.stdout.write(`\r   ⏳ Waiting... ${i} seconds remaining`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        process.stdout.write('\r   ✅ Ready to retry!                    \n\n');
        continue;
      }
      throw error; // Re-throw if not rate limit or out of retries
    }
  }
}

try {
  console.log('⏳ Calling OpenAI API (this may take 5-10 seconds)...\n');
  
  const startTime = Date.now();
  
  const completion = await retryWithBackoff(async () => {
    return await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional assistant that writes formal complaint letters to municipal authorities. Write clear, respectful, and professional letters.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
  }, 2); // 2 retries with 65-second wait between them

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  const letter = completion.choices[0]?.message?.content || '';

  if (!letter) {
    console.error('❌ ERROR: OpenAI returned empty response');
    process.exit(1);
  }

  console.log('✅ SUCCESS! OpenAI API is working correctly!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 Generated Letter:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(letter);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📊 API Response Details:');
  console.log(`   Model: ${completion.model}`);
  console.log(`   Response Time: ${duration} seconds`);
  console.log(`   Tokens Used: ${completion.usage?.total_tokens || 'N/A'}`);
  console.log(`   Prompt Tokens: ${completion.usage?.prompt_tokens || 'N/A'}`);
  console.log(`   Completion Tokens: ${completion.usage?.completion_tokens || 'N/A'}`);
  console.log(`   Letter Length: ${letter.length} characters\n`);

  // Estimate cost (GPT-3.5-turbo pricing as of 2024)
  const estimatedCost = completion.usage?.total_tokens 
    ? (completion.usage.total_tokens * 0.0000015).toFixed(6) // ~$0.0015 per 1K tokens
    : 'N/A';
  
  console.log(`💰 Estimated Cost: $${estimatedCost}\n`);

  console.log('🎉 All tests passed! OpenAI integration is working correctly.');
  console.log('   Your website will use AI-generated letters when users report issues.\n');

} catch (error) {
  console.error('❌ ERROR: OpenAI API call failed!\n');
  
  if (error.status === 401) {
    console.error('🔐 Authentication Error (401):');
    console.error('   Your API key is invalid or expired.');
    console.error('   Please check your API key in backend/.env file');
    console.error('   Get a new key from: https://platform.openai.com/api-keys\n');
  } else if (error.status === 429) {
    console.error('⏱️  Rate Limit Error (429):');
    console.error('   You have exceeded the rate limit.');
    console.error('   Free tier: 3 requests per minute');
    console.error('   Paid tier: Higher limits available\n');
    console.error('💡 Solutions:');
    console.error('   1. Wait 60+ seconds from your LAST request, then run: npm run test:openai');
    console.error('   2. The script will automatically wait 65 seconds and retry (if you run it again)');
    console.error('   3. Upgrade to paid tier for higher limits');
    console.error('   4. The website will use template-based letters if rate limited\n');
    console.error('📊 Check your usage: https://platform.openai.com/usage\n');
    console.error('⏰ IMPORTANT: Rate limits reset every 60 seconds from your FIRST request in that minute.');
    console.error('   If you made 3 requests, wait 60 seconds from the FIRST one.\n');
  } else if (error.status === 500) {
    console.error('🔧 Server Error (500):');
    console.error('   OpenAI servers are experiencing issues.');
    console.error('   Please try again later.\n');
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    console.error('🌐 Connection Error:');
    console.error('   Cannot connect to OpenAI servers.');
    console.error('   Check your internet connection.\n');
  } else {
    console.error('❌ Error Details:');
    console.error(`   Status: ${error.status || 'N/A'}`);
    console.error(`   Message: ${error.message}`);
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response, null, 2)}`);
    }
    console.error('');
  }

  console.log('💡 Note: The website will automatically use template-based letter generation');
  console.log('   if OpenAI API is unavailable (no errors for users).\n');
  
  process.exit(1);
}

