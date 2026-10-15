# 📧 EmailJS Setup Guide (Email Notifications)

## ✅ Why EmailJS?

- **FREE tier**: 200 emails/month
- **Easy setup**: Just need Service ID, Template ID, and API keys
- **No IP whitelisting**: Works from anywhere
- **Professional HTML emails**: Beautiful email templates
- **Reliable**: Widely used email service

---

## 📝 Quick Setup Steps

### Step 1: Create EmailJS Account

1. Go to **https://www.emailjs.com/**
2. Click **"Sign Up"** (top right)
3. Fill in your details:
   - Email, Password
   - Verify your email
4. **Login** to your account

### Step 2: Add Email Service

1. Go to **Email Services** → **Add New Service**
2. Choose your email provider:
   - **Gmail** (recommended for testing)
   - **Outlook**
   - **Yahoo**
   - Or any SMTP service
3. Connect your email account
4. **Copy the Service ID** (e.g., `service_xxxxxxx`)

### Step 3: Create Email Template

1. Go to **Email Templates** → **Create New Template**
2. Set up your template:
   - **Template Name**: "Complaint Verification"
   - **Subject**: `{{subject}}`
   - **Content**: 
     ```
     {{message}}
     ```
   - Or use HTML:
     ```html
     <!DOCTYPE html>
     <html>
     <body>
       {{message}}
     </body>
     </html>
     ```
3. **Save** the template
4. **Copy the Template ID** (e.g., `template_xxxxxxx`)

### Step 4: Get API Keys

1. Go to **Account** → **General**
2. Find **API Keys** section:
   - **Public Key** (starts with `xxxxx`)
   - **Private Key** (starts with `xxxxx`)
3. **Copy both keys**

### Step 5: Add to .env File

**Option A: Using Script (Recommended)**
```bash
cd backend
node scripts/addEmailJSEnv.js SERVICE_ID TEMPLATE_ID PUBLIC_KEY PRIVATE_KEY
```

**Option B: Manual**
1. Open `backend/.env` file
2. Add these lines:
   ```env
   EMAILJS_SERVICE_ID=service_xxxxxxx
   EMAILJS_TEMPLATE_ID=template_xxxxxxx
   EMAILJS_PUBLIC_KEY=your_public_key_here
   EMAILJS_PRIVATE_KEY=your_private_key_here
   ```

### Step 6: Restart Server

```bash
npm run dev:municipal
```

---

## 🎯 That's It!

Emails will now be sent automatically when officers verify complaints!

---

## 📊 EmailJS Free Tier Limits

- **200 emails per month**
- **Perfect for testing and small projects**
- **No credit card required**

---

## 🧪 Test Email

Run the test script:
```bash
node scripts/testEmailJS.js your-email@example.com
```

---

## ❓ Troubleshooting

**Email not sending?**
1. Check all 4 credentials are correct in `.env`
2. Verify Service ID and Template ID in EmailJS dashboard
3. Check email service is connected (Gmail/Outlook)
4. Restart server after changing `.env`

**Common Errors:**
- **"Invalid Service ID"**: Check Service ID in EmailJS dashboard
- **"Invalid Template ID"**: Check Template ID in EmailJS dashboard
- **"Authentication failed"**: Check Public/Private keys

**Need help?**
- EmailJS Docs: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com

---

## 📚 EmailJS Documentation

- Official Docs: https://www.emailjs.com/docs/
- Node.js Guide: https://www.emailjs.com/docs/nodejs/

