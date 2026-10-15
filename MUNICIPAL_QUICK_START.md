# Municipal Dashboard - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Seed Sample Data
```bash
cd backend
npm run seed:municipal
```

This creates:
- ✅ 3 Municipal Offices (Belagavi BCC, Athani TMC, Nippani CMC)
- ✅ 3 Municipal Officers
- ✅ 2 Sample Contractors

### Step 2: Start Backend
```bash
cd backend
npm run dev
```

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 4: Login
1. Go to: `http://localhost:5173/municipal/login`
2. Use credentials:
   - **Email:** `officer.bcc@belagavi.gov.in`
   - **Password:** `officer123`

## 📋 Test Credentials

### Municipal Officers
| Office | Email | Password |
|--------|-------|----------|
| Belagavi BCC | `officer.bcc@belagavi.gov.in` | `officer123` |
| Athani TMC | `officer.athani@athani.gov.in` | `officer123` |
| Nippani CMC | `officer.nippani@nippani.gov.in` | `officer123` |

### Contractors
| Company | Email | Password |
|---------|-------|----------|
| ABC Construction | `contractor1@example.com` | `contractor123` |
| XYZ Infrastructure | `contractor2@example.com` | `contractor123` |

## 🎯 Testing the Dashboard

### 1. View Complaints
- Login as municipal officer
- See only complaints in your jurisdiction (geo-filtered)
- Filter by status and category

### 2. Verify Complaint
- Click on a complaint
- Click "Verify/Reject"
- Choose action and add reason

### 3. Assign Contractor
- Verify a complaint first
- Click "Assign Contractor"
- Select contractor and set deadline

### 4. View Map
- Click "Map View" tab
- See all complaints on map
- Color-coded by status
- Municipal office location shown

### 5. View Analytics
- Click "Analytics" tab
- See category distribution
- Monthly trends
- Contractor performance

## 🔍 Key Features

✅ **Geo-Filtering**: Only see complaints in your jurisdiction  
✅ **Map View**: Visual representation of all complaints  
✅ **Analytics**: Charts and performance metrics  
✅ **Contractor Management**: Assign and track contractors  
✅ **Status Workflow**: Verify → Assign → Track → Close  

## 📁 File Structure

```
Backend:
├── models/MunicipalOffice.js
├── controllers/municipalController.js
├── routes/municipalRoutes.js
└── scripts/seedMunicipalData.js

Frontend:
├── pages/MunicipalLogin.jsx
├── pages/MunicipalDashboard.jsx
├── components/MunicipalComplaintMap.jsx
└── components/MunicipalAnalytics.jsx
```

## 🐛 Troubleshooting

**Complaints not showing?**
- Check if complaint has valid coordinates
- Verify municipal office jurisdiction radius
- Ensure complaint is not "Closed"

**Map not loading?**
- Check browser console for errors
- Verify Leaflet CSS is loaded
- Check internet connection (for map tiles)

**Can't login?**
- Verify user role is `MUNICIPAL_OFFICER`
- Check if municipal office is linked
- Run seed script again if needed

## 📚 Full Documentation

See `MUNICIPAL_DASHBOARD_README.md` for complete documentation.
