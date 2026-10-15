# 📧 Which EmailJS Template to Use?

## ❌ Don't Use Pre-built Templates

The pre-built templates you see (Contact Us, Auto-Reply, Welcome, etc.) are **NOT suitable** for complaint verification emails. They're designed for different purposes.

## ✅ Create a Custom Template (Recommended)

**Best Option:** Create your own custom template with the HTML I provided.

### Steps:

1. **In EmailJS Dashboard:**
   - Click **"Create New Template"** (not "Select Template")
   - Or click **"New Template"** button

2. **Template Settings:**
   - **Template Name:** `Complaint Verification`
   - **Subject:** `{{subject}}`
   - **Content Type:** HTML

3. **Copy the HTML:**
   - Open `backend/EMAILJS_TEMPLATE.md`
   - Copy the HTML template from there
   - Paste it into the EmailJS template editor

4. **Save and Get Template ID**

---

## 🎯 Quick Setup (Simplest)

If you want the **easiest setup**, use this simple template:

### Template Name:
```
Complaint Verification
```

### Subject:
```
{{subject}}
```

### Content (HTML):
```html
{{message}}
```

**That's it!** The code will send the full formatted HTML email in the `{{message}}` variable.

---

## 📋 Template Variables You'll Need

The template should support these variables:

| Variable | What It Contains |
|----------|------------------|
| `{{subject}}` | Email subject line |
| `{{message}}` | Full HTML email content |
| `{{user_name}}` | User's name (optional) |
| `{{category}}` | Complaint category (optional) |
| `{{complaint_id}}` | Complaint ID (optional) |
| `{{municipal_office}}` | Office name (optional) |

---

## 🚀 Recommended Approach

**Use the Simple Template:**
1. Create new custom template
2. Set subject: `{{subject}}`
3. Set content: `{{message}}`
4. Save
5. Done!

This works because our code already creates the beautiful HTML email and sends it in the `{{message}}` variable.

---

## 📝 Step-by-Step in EmailJS

1. **Don't click "Select Template"** (that's for pre-built ones)
2. **Click "Create New Template"** or **"New Template"**
3. **Fill in:**
   - Name: `Complaint Verification`
   - Subject: `{{subject}}`
   - Content: `{{message}}`
4. **Save**
5. **Copy Template ID** (starts with `template_`)
6. **Add to .env file**

---

## ✅ That's It!

Once you create the custom template and add the Template ID to your `.env` file, emails will work perfectly!

