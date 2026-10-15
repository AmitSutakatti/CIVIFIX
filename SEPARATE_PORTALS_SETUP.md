# Separate Portals Setup Guide

## 🎯 Architecture Overview

The project now runs on **completely separate servers** for User Portal and Municipal Portal:

### User Portal
- **Frontend:** Port 3000 (`frontend/`)
- **Backend:** Port 5000 (`backend/server-user.js`)

### Municipal Portal
- **Frontend:** Port 5173 (`frontend-municipal/`)
- **Backend:** Port 8000 (`backend/server-municipal.js`)

---

## 📁 New Project Structure

```
CivicCareHub/
├── backend/
│   ├── server.js              # Legacy (can be removed)
│   ├── server-user.js        # User Portal Backend (Port 5000)
│   ├── server-municipal.js   # Municipal Portal Backend (Port 8000)
│   ├── controllers/
│   │   ├── user/             # User Portal Controllers
│   │   └── municipal/        # Municipal Portal Controllers
│   ├── routes/
│   │   ├── user/             # User Portal Routes
│   │   └── municipal/        # Municipal Portal Routes
│   └── models/               # Shared Models
│
├── frontend/                  # User Portal Frontend (Port 3000)
│   ├── src/
│   │   ├── pages/user/
│   │   ├── components/user/
│   │   └── services/user/
│   └── vite.config.js        # Port 3000, proxy to 5000
│
└── frontend-municipal/        # Municipal Portal Frontend (Port 5173)
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    └── vite.config.js         # Port 5173, proxy to 8000
```

---

## 🚀 How to Start Both Portals

### Option 1: Start All Servers (Recommended)

**Terminal 1 - User Portal Backend:**
```bash
cd backend
npm run dev:user
```
Runs on: `http://localhost:5000`

**Terminal 2 - Municipal Portal Backend:**
```bash
cd backend
npm run dev:municipal
```
Runs on: `http://localhost:8000`

**Terminal 3 - User Portal Frontend:**
```bash
cd frontend
npm run dev
```
Runs on: `http://localhost:3000`

**Terminal 4 - Municipal Portal Frontend:**
```bash
cd frontend-municipal
npm install  # First time only
npm run dev
```
Runs on: `http://localhost:5173`

### Option 2: Start Only What You Need

**For User Portal Only:**
```bash
# Terminal 1
cd backend && npm run dev:user

# Terminal 2
cd frontend && npm run dev
```

**For Municipal Portal Only:**
```bash
# Terminal 1
cd backend && npm run dev:municipal

# Terminal 2
cd frontend-municipal && npm run dev
```

---

## 📡 Port Configuration

### Backend Ports
- **User Portal API:** `http://localhost:5000/api`
- **Municipal Portal API:** `http://localhost:8000/api`

### Frontend Ports
- **User Portal:** `http://localhost:3000`
- **Municipal Portal:** `http://localhost:5173`

---

## 🔧 Environment Variables

### Backend `.env` (Shared)
```env
USER_PORT=5000               # User portal backend port
MUNICIPAL_PORT=8000          # Municipal portal backend port
CONTRACTOR_PORT=8001         # Contractor portal backend port
# Each portal server uses its role-specific variable above. Avoid a shared PORT setting.
MONGODB_URI=mongodb://localhost:27017/civicfix
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
USER_FRONTEND_URL=http://localhost:3000
MUNICIPAL_FRONTEND_URL=http://localhost:5173

# Nodemailer (complaint verification emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=CivicFix <your-gmail@gmail.com>

# ImageKit (complaint photos, certificates, chat files). If unset, files stay on local disk.
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

---

## 📝 Quick Start Commands

### First Time Setup

**1. Install Backend Dependencies:**
```bash
cd backend
npm install
```

**2. Install User Portal Frontend:**
```bash
cd frontend
npm install
```

**3. Install Municipal Portal Frontend:**
```bash
cd frontend-municipal
npm install
```

**4. Seed Municipal Data:**
```bash
cd backend
npm run seed:municipal
```

### Daily Development

**Start User Portal:**
```bash
# Terminal 1
cd backend && npm run dev:user

# Terminal 2
cd frontend && npm run dev
```

**Start Municipal Portal:**
```bash
# Terminal 1
cd backend && npm run dev:municipal

# Terminal 2
cd frontend-municipal && npm run dev
```

---

## 🌐 Access URLs

### User Portal
- **Frontend:** `http://localhost:3000`
- **Login:** `http://localhost:3000/login`
- **Dashboard:** `http://localhost:3000/dashboard`
- **Backend API:** `http://localhost:5000/api`

### Municipal Portal
- **Frontend:** `http://localhost:5173`
- **Login:** `http://localhost:5173/login`
- **Dashboard:** `http://localhost:5173/dashboard`
- **Backend API:** `http://localhost:8000/api`

---

## 🔐 Login Credentials

### Municipal Officers (After seeding)
- **Belagavi BCC:** `officer.bcc@belagavi.gov.in` / `officer123`
- **Athani TMC:** `officer.athani@athani.gov.in` / `officer123`
- **Nippani CMC:** `officer.nippani@nippani.gov.in` / `officer123`

---

## ✅ Benefits of Separate Servers

1. **Complete Isolation:** User and Municipal portals are completely independent
2. **Independent Deployment:** Deploy each portal separately
3. **Different Teams:** Different teams can work on different portals
4. **Scalability:** Scale each portal independently
5. **Security:** Separate authentication contexts
6. **Maintenance:** Easier to maintain and debug

---

## 🐛 Troubleshooting

### Port Already in Use
If you get port conflicts:
- **Port 3000:** Change in `frontend/vite.config.js`
- **Port 5000:** Change `USER_PORT` in `.env`
- **Port 5173:** Change in `frontend-municipal/vite.config.js`
- **Port 8000:** Change `MUNICIPAL_PORT` in `.env`

### Municipal Frontend Not Starting
```bash
cd frontend-municipal
npm install
npm run dev
```

### Backend Not Starting
- Check MongoDB is running
- Verify `.env` file exists
- Check port is not in use

---

## 📚 Next Steps

1. **Test User Portal:** `http://localhost:3000`
2. **Test Municipal Portal:** `http://localhost:5173`
3. **Verify Both Work Independently**
4. **Deploy Separately** when ready

---

**Both portals are now completely independent! 🎉**
