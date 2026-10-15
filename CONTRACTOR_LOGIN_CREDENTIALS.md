# 🔐 Contractor Login Credentials

## 📋 Quick Answer

**Default Password for ALL Contractors:** `contractor123`

**Email Format:** `companyname@contractor.com` (lowercase, spaces replaced with dots)

---

## 🚀 Step 1: Seed Contractor Data

If you haven't seeded contractors yet, run:

```bash
cd backend
npm run seed:contractors
```

This creates **30 contractor accounts** with the following credentials:

---

## 📝 Complete List of Contractor Credentials

All contractors use the same password: **`contractor123`**

| # | Company Name | Email | Password |
|---|--------------|-------|----------|
| 1 | Shree Balaji Civil Works | `shree.balaji.civil.works@contractor.com` | `contractor123` |
| 2 | Ramaiah Road & Drainage Contractors | `ramaiah.road.drainage.contractors@contractor.com` | `contractor123` |
| 3 | Karnataka Clean City Services | `karnataka.clean.city.services@contractor.com` | `contractor123` |
| 4 | Laxmi Infra & Constructions | `laxmi.infra.constructions@contractor.com` | `contractor123` |
| 5 | Sai Ganesh Garbage Management | `sai.ganesh.garbage.management@contractor.com` | `contractor123` |
| 6 | Durga Engineering & Municipal Service | `durga.engineering.municipal.service@contractor.com` | `contractor123` |
| 7 | Om Shakti Waste Solutions | `om.shakti.waste.solutions@contractor.com` | `contractor123` |
| 8 | Belgaum Metro Developers | `belgaum.metro.developers@contractor.com` | `contractor123` |
| 9 | Nandini Civil & PWD Contractors | `nandini.civil.pwd.contractors@contractor.com` | `contractor123` |
| 10 | Sriram Urban Cleaners | `sriram.urban.cleaners@contractor.com` | `contractor123` |
| 11 | Gokak Smart City Works | `gokak.smart.city.works@contractor.com` | `contractor123` |
| 12 | Veerabhadra Municipal Services | `veerabhadra.municipal.services@contractor.com` | `contractor123` |
| 13 | Maruthi Road Repairs & Constructions | `maruthi.road.repairs.constructions@contractor.com` | `contractor123` |
| 14 | Kittur Waste Collection Agency | `kittur.waste.collection.agency@contractor.com` | `contractor123` |
| 15 | Sri Basaveshwar Infrastructure | `sri.basaveshwar.infrastructure@contractor.com` | `contractor123` |
| 16 | Vinayaka Public Works Company | `vinayaka.public.works.company@contractor.com` | `contractor123` |
| 17 | Udaygiri Clean Zone Services | `udaygiri.clean.zone.services@contractor.com` | `contractor123` |
| 18 | Shree Renuka Devi Contractors | `shree.renuka.devi.contractors@contractor.com` | `contractor123` |
| 19 | Vishwakarma Road & Bridge Works | `vishwakarma.road.bridge.works@contractor.com` | `contractor123` |
| 20 | Sri Mallikarjun Cleaning Agency | `sri.mallikarjun.cleaning.agency@contractor.com` | `contractor123` |
| 21 | Ashoka Municipal Services Pvt Ltd | `ashoka.municipal.services.pvt.ltd@contractor.com` | `contractor123` |
| 22 | Pooja Urban Development Works | `pooja.urban.development.works@contractor.com` | `contractor123` |
| 23 | Sharda Infrastructure & Repairs | `sharda.infrastructure.repairs@contractor.com` | `contractor123` |
| 24 | Bharath Municipal Waste Solutions | `bharath.municipal.waste.solutions@contractor.com` | `contractor123` |
| 25 | Shivshakti Engineering Constructions | `shivshakti.engineering.constructions@contractor.com` | `contractor123` |
| 26 | New Belagavi Clean Works | `new.belagavi.clean.works@contractor.com` | `contractor123` |
| 27 | Hanumantha Urban Developers | `hanumantha.urban.developers@contractor.com` | `contractor123` |
| 28 | Rajarajeshwari Road Contractors | `rajarajeshwari.road.contractors@contractor.com` | `contractor123` |
| 29 | Amba Bhavani Public Works | `amba.bhavani.public.works@contractor.com` | `contractor123` |
| 30 | Krishna Smart City Contractors | `krishna.smart.city.contractors@contractor.com` | `contractor123` |

---

## 🎯 Quick Test Credentials

**Easiest to remember:**
- **Email:** `belgaum.metro.developers@contractor.com`
- **Password:** `contractor123`

**Or:**
- **Email:** `shree.balaji.civil.works@contractor.com`
- **Password:** `contractor123`

---

## 📋 Alternative: Simple Test Contractors

If you ran `npm run seed:municipal`, you also have 2 simple test contractors:

| Company | Email | Password |
|---------|-------|----------|
| ABC Construction Co. | `contractor1@example.com` | `contractor123` |
| XYZ Infrastructure | `contractor2@example.com` | `contractor123` |

---

## 🔍 How to Find Contractor Emails

### Option 1: Check Database
```bash
# Connect to MongoDB
mongosh

# Switch to database
use civicfix

# Find all contractors
db.users.find({ role: "contractor" }, { email: 1, name: 1 })
```

### Option 2: Check Seed Script Output
When you run `npm run seed:contractors`, it prints all created contractors with their details.

---

## ✅ Login Steps

1. **Start Contractor Backend:**
   ```bash
   cd backend
   npm run dev:contractor
   ```

2. **Start Contractor Frontend:**
   ```bash
   cd frontend-contractor
   npm run dev
   ```

3. **Open Browser:**
   Go to: `http://localhost:5174`

4. **Login:**
   - Enter any contractor email from the list above
   - Password: `contractor123`
   - Click "Login"

---

## 🐛 Troubleshooting

### "Invalid credentials"
- **Check:** Did you run `npm run seed:contractors`?
- **Fix:** Run the seed script first to create contractor accounts

### "User not found"
- **Check:** Is the email correct? (lowercase, dots instead of spaces)
- **Fix:** Use exact email format: `companyname@contractor.com`

### "Access denied"
- **Check:** User role must be `contractor` (not `MUNICIPAL_OFFICER` or `user`)
- **Fix:** Make sure you're using a contractor account, not an officer account

### "Cannot connect to backend"
- **Check:** Is `npm run dev:contractor` running on port 8001?
- **Fix:** Start the contractor backend first

---

## 📝 Email Format Rules

The seed script converts company names to emails using these rules:
1. Convert to lowercase
2. Replace spaces with dots (`.`)
3. Remove special characters (keep only letters, numbers, dots)
4. Add `@contractor.com` suffix

**Examples:**
- `"Shree Balaji Civil Works"` → `shree.balaji.civil.works@contractor.com`
- `"ABC Construction Co."` → `abc.construction.co@contractor.com`
- `"Ramaiah Road & Drainage"` → `ramaiah.road.drainage@contractor.com`

---

## 🎯 Quick Reference

| Item | Value |
|------|-------|
| **Default Password** | `contractor123` |
| **Email Domain** | `@contractor.com` |
| **Total Contractors** | 30 (from seed:contractors) |
| **Login URL** | `http://localhost:5174` |
| **Backend Port** | `8001` |
| **Frontend Port** | `5174` |

---

**That's it! Use any contractor email with password `contractor123` to log in!** 🚀

