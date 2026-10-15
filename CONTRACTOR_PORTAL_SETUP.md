# 🏗️ Contractor Portal Setup Guide

## 📁 Project Structure

The contractor portal is now **completely separated** into its own folders:

### Frontend
- **Location**: `frontend-contractor/`
- **Port**: `5174` (different from municipal portal)
- **URL**: `http://localhost:5174`

### Backend
- **Location**: `backend/controllers/contractor/` and `backend/routes/contractor/`
- **Server File**: `backend/server-contractor.js`
- **Port**: `8001` (different from municipal portal)
- **URL**: `http://localhost:8001/api`

## 🚀 Quick Start

### 1. Install Frontend Dependencies
```bash
cd frontend-contractor
npm install
```

### 2. Install Backend Dependencies (if not already done)
```bash
cd backend
npm install
```

### 3. Start Contractor Backend
```bash
cd backend
npm run dev:contractor
```
This starts the contractor backend on port **8001**

### 4. Start Contractor Frontend
```bash
cd frontend-contractor
npm run dev
```
This starts the contractor frontend on port **5174**

## 📂 File Organization

### Frontend Files (`frontend-contractor/`)
```
frontend-contractor/
├── src/
│   ├── pages/
│   │   ├── ContractorLogin.jsx
│   │   └── ContractorDashboard.jsx
│   ├── components/
│   │   ├── ChatModal.jsx
│   │   └── ProtectedRoute.jsx
│   ├── services/
│   │   └── api.js (contractor-specific API)
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### Backend Files (`backend/`)
```
backend/
├── controllers/
│   └── contractor/
│       └── contractorController.js
├── routes/
│   └── contractor/
│       └── contractorRoutes.js
└── server-contractor.js
```

## 🔌 API Endpoints

### Contractor Backend (Port 8001)
- `GET /api/contractor/complaints` - Get assigned complaints
- `GET /api/contractor/notifications` - Get notifications
- `GET /api/chat/:complaintId` - Get chat messages
- `POST /api/chat/:complaintId` - Send message (with file uploads)
- `PUT /api/chat/:complaintId/read` - Mark messages as read
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

## 🎯 Features

1. **Contractor Dashboard**
   - View assigned projects
   - Stats: Total, Pending, In Progress, Completed
   - Project cards with details

2. **Chat System**
   - Real-time messaging with municipal officers
   - File/image uploads (up to 5 files, 10MB each)
   - Auto-refresh every 3 seconds

3. **Notifications**
   - Receive notifications when assigned to projects
   - View notification history

## 🔐 Authentication

- Contractors log in with role `contractor`
- JWT token stored in localStorage
- Protected routes require contractor role

## 📝 Environment Variables

Add to `backend/.env`:
```env
CONTRACTOR_PORT=8001
CONTRACTOR_FRONTEND_URL=http://localhost:5174
MONGODB_URI=your_mongodb_uri
```

## 🎨 Ports Summary

| Portal | Frontend Port | Backend Port |
|--------|--------------|--------------|
| User | 5172 | 5000 |
| Municipal | 5173 | 8000 |
| **Contractor** | **5174** | **8001** |

## ✅ Benefits of Separation

1. **Easy to Find Files** - All contractor code in one place
2. **Independent Development** - Can work on contractor features separately
3. **Different Ports** - Can run all portals simultaneously
4. **Clear Organization** - No mixing of municipal and contractor code

## 🐛 Troubleshooting

### Port Already in Use
- Change port in `vite.config.js` (frontend) or `server-contractor.js` (backend)
- Or stop the service using that port

### Cannot Connect to Backend
- Check if backend is running: `npm run dev:contractor`
- Verify port in `frontend-contractor/src/services/api.js`
- Check CORS settings in `server-contractor.js`

### Authentication Issues
- Ensure contractor role is set in database
- Check JWT token in localStorage
- Verify auth routes are working

---

**All contractor files are now in `frontend-contractor/` and `backend/controllers/contractor/`!**

