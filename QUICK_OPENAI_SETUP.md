# Quick OpenAI Setup (5 minutes)

## 🚀 Get Free OpenAI API Key

1. **Sign Up**: Go to https://platform.openai.com/signup
2. **Get $5 Free Credits**: Automatically added to your account
3. **Create API Key**: 
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

## ⚙️ Configure Backend

1. Open `backend/.env` file
2. Add this line:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

3. Replace `sk-your-actual-api-key-here` with your actual key

4. Save and restart backend:
```bash
cd backend
npm run dev
```

## ✅ Done!

Now when users fill the complaint form, letters will be auto-generated using AI!

**Note**: If API key is missing, the system automatically uses template-based generation (no errors).

## 💡 Cost

- **GPT-3.5-turbo**: ~$0.0015 per letter
- **$5 free credits** = ~3,333 letters
- Very affordable!







