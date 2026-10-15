# OpenAI API Setup Guide for Letter Generation

## 🎯 Overview

This guide will help you set up OpenAI API for automatic letter generation in CivicFix. OpenAI provides **$5 free credits** when you sign up, which is enough for testing and light usage.

## 📝 Step-by-Step Setup

### Step 1: Create OpenAI Account

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Click **"Sign Up"** or **"Log In"** if you already have an account
3. Complete the registration process
4. Verify your email address

### Step 2: Get Free Credits

1. After signing up, OpenAI automatically adds **$5 free credits** to your account
2. These credits are valid for **3 months** from signup
3. Check your credits: Go to [Usage Dashboard](https://platform.openai.com/usage)

### Step 3: Create API Key

1. Go to [API Keys Page](https://platform.openai.com/api-keys)
2. Click **"Create new secret key"**
3. Give it a name (e.g., "CivicFix Letter Generation")
4. **Copy the API key immediately** - you won't be able to see it again!
5. Save it securely

### Step 4: Configure Backend

1. Open `backend/.env` file
2. Add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

3. Save the file
4. Restart your backend server:
```bash
cd backend
npm run dev
```

## 💰 Cost Information

### GPT-3.5-turbo (Recommended - Cheaper)
- **Cost**: ~$0.0015 per letter (very cheap!)
- **Free Credits**: $5 = ~3,333 letters
- **Model**: Fast and efficient for letter generation

### GPT-4 (More Expensive)
- **Cost**: ~$0.03 per letter
- **Free Credits**: $5 = ~166 letters
- **Model**: Better quality but more expensive

**Current Setup**: Uses GPT-3.5-turbo (cost-effective and sufficient for letters)

## 🔧 How It Works

1. **User fills form** → Category + Description
2. **Backend calls OpenAI** → Generates professional letter
3. **Letter shown to user** → Can edit before submission
4. **User approves** → Complaint submitted with letter

## ⚠️ Important Notes

### Free Credits Expiry
- Free credits expire after **3 months**
- After that, you'll need to add payment method
- You can set **usage limits** to avoid unexpected charges

### Rate Limits
- Free tier: **3 requests per minute**
- Paid tier: Higher limits
- For production, consider upgrading

### Fallback System
- If OpenAI API fails or key is missing
- System automatically uses **template-based generation**
- No errors, seamless fallback

## 🛡️ Security Best Practices

1. **Never commit API key to Git**
   - Already in `.gitignore`
   - Use `.env` file only

2. **Set Usage Limits**
   - Go to [Usage Limits](https://platform.openai.com/account/billing/limits)
   - Set monthly spending limit
   - Get alerts when approaching limit

3. **Monitor Usage**
   - Check [Usage Dashboard](https://platform.openai.com/usage) regularly
   - Track costs per request

## 🧪 Testing

1. Fill out a complaint form
2. Select category and write description
3. Wait for "Generating formal letter..." message
4. Letter should appear automatically
5. Check console for any errors

## 🐛 Troubleshooting

### "API key not found"
- Check `backend/.env` file exists
- Verify `OPENAI_API_KEY=sk-...` is set
- Restart backend server

### "Insufficient credits"
- Check [Usage Dashboard](https://platform.openai.com/usage)
- Add payment method if needed
- Or use template fallback (works without API key)

### "Rate limit exceeded"
- Free tier: 3 requests/minute
- Wait a minute and try again
- Or upgrade to paid tier

### Letter not generating
- Check backend console for errors
- Verify API key is correct
- System will fallback to template if API fails

## 📊 Cost Estimation

For a typical application:
- **100 letters/month**: ~$0.15/month
- **1,000 letters/month**: ~$1.50/month
- **10,000 letters/month**: ~$15/month

Very affordable for most use cases!

## 🚀 Alternative: Free AI Options

If you want completely free options:

1. **Hugging Face Inference API** (Free tier available)
2. **Google Gemini API** (Free tier: 60 requests/minute)
3. **Template-based** (Current fallback - always free)

---

**Ready to use!** Just add your API key to `backend/.env` and restart the server.

