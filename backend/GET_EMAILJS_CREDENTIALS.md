# 🔑 Get EmailJS Credentials - Quick Guide

## ❌ Missing Credentials

You need these 4 values:
- ✅ EMAILJS_TEMPLATE_ID: `template_4fjtvwa` (Already added!)
- ❌ EMAILJS_SERVICE_ID: **NEEDED**
- ❌ EMAILJS_PUBLIC_KEY: **NEEDED**
- ❌ EMAILJS_PRIVATE_KEY: **NEEDED**

---

## 📍 Where to Find Them

### Step 1: Get Service ID

1. **Go to EmailJS Dashboard**: https://www.emailjs.com/
2. **Click "Email Services"** (left sidebar)
3. **Find your service** (Gmail/Outlook/etc.)
4. **Copy the Service ID** (looks like: `service_xxxxxxx`)

### Step 2: Get Public & Private Keys

1. **In EmailJS Dashboard**
2. **Click "Account"** (top right or left sidebar)
3. **Click "General"** or **"API Keys"**
4. **Find "API Keys" section:**
   - **Public Key** (starts with letters/numbers)
   - **Private Key** (starts with letters/numbers)
5. **Copy both keys**

---

## ✅ Add to .env File

Once you have all 3 values, run:

```bash
node scripts/addEmailJSEnv.js SERVICE_ID template_4fjtvwa PUBLIC_KEY PRIVATE_KEY
```

**Example:**
```bash
node scripts/addEmailJSEnv.js service_abc123 template_4fjtvwa xyz789public abc123private
```

---

## 🎯 Quick Checklist

- [ ] Got Service ID from Email Services page
- [ ] Got Public Key from Account → General → API Keys
- [ ] Got Private Key from Account → General → API Keys
- [ ] Run the addEmailJSEnv.js script with all 4 values
- [ ] Restart server: `npm run dev:municipal`

---

**Once you have the 3 missing values, share them and I'll add them for you!**

