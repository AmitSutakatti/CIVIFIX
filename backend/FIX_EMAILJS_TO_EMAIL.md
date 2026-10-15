# 🔧 Fix: Email Going to Wrong Address

## ❌ Problem

Emails are being sent to a hardcoded email (`23u0009@students.git.edu`) instead of the user's email address.

## ✅ Solution: Update "To Email" Field in EmailJS Template

### Step 1: Go to EmailJS Template

1. **Login to EmailJS**: https://www.emailjs.com/
2. **Go to "Email Templates"**
3. **Click on your template** (template_4fjtvwa)

### Step 2: Update "To Email" Field

**In the right sidebar, find "To Email" field:**

**Current (Wrong):**
```
23u0009@students.git.edu
```

**Change to:**
```
{{to_email}}
```

### Step 3: Save Template

1. **Click the blue "Save" button** (top right)
2. **Wait 1-2 minutes**
3. **Test again**

---

## 🎯 Quick Fix

**In EmailJS template settings (right sidebar):**

1. **To Email field:** Change from `23u0009@students.git.edu` to `{{to_email}}`
2. **Click "Save"**
3. **Done!**

---

## ✅ After Fixing

The email will now be sent to:
- The user's email address (from `complaint.user.email`)
- Not the hardcoded address

---

## 📝 Other Fields (Optional)

You can also update these fields to use dynamic values:

- **From Name:** `CIVICFIX` or `{{from_name}}`
- **Reply To:** `{{to_email}}` (so replies go to the user)
- **Bcc/Cc:** Leave empty (unless needed)

---

**Update the "To Email" field to `{{to_email}}` and save!**

