# CivicCareHub - Project Structure

## 📁 New Organized Structure

The project has been reorganized to clearly separate **User Portal** and **Municipal Officer Portal** for better maintainability.

---

## 🔙 Backend Structure

```
backend/
├── controllers/
│   ├── user/                    # User Portal Controllers
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   ├── notificationController.js
│   │   └── letterController.js
│   └── municipal/              # Municipal Portal Controllers
│       └── municipalController.js
├── routes/
│   ├── user/                   # User Portal Routes
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── letterRoutes.js
│   └── municipal/              # Municipal Portal Routes
│       └── municipalRoutes.js
├── models/                     # Shared Models
│   ├── User.js
│   ├── Complaint.js
│   ├── Notification.js
│   ├── MunicipalOffice.js
│   └── Contractor.js
├── middleware/                 # Shared Middleware
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
├── scripts/                    # Utility Scripts
│   └── seedMunicipalData.js
└── server.js                   # Main server file
```

### Backend API Endpoints

**User Portal APIs:**
- `/api/auth/*` - Authentication (signup, login, getMe)
- `/api/complaints/*` - Complaint management
- `/api/notifications/*` - User notifications
- `/api/letters/*` - Letter generation

**Municipal Portal APIs:**
- `/api/municipal/*` - All municipal officer endpoints

---

## 🎨 Frontend Structure

```
frontend/src/
├── pages/
│   ├── user/                   # User Portal Pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── ReportIssue.jsx
│   │   └── ComplaintDetails.jsx
│   └── municipal/              # Municipal Portal Pages
│       ├── MunicipalLogin.jsx
│       └── MunicipalDashboard.jsx
├── components/
│   ├── user/                   # User Portal Components
│   │   ├── UserNavbar.jsx
│   │   ├── GoogleMapPicker.jsx
│   │   └── LetterPreview.jsx
│   ├── municipal/              # Municipal Portal Components
│   │   ├── MunicipalComplaintMap.jsx
│   │   └── MunicipalAnalytics.jsx
│   └── shared/                 # Shared Components
│       └── ProtectedRoute.jsx
├── services/
│   ├── user/                   # User Portal API Services
│   │   └── api.js
│   └── municipal/              # Municipal Portal API Services
│       └── api.js
├── context/                    # Shared Context
│   └── AuthContext.jsx
├── App.jsx                      # Main app with routes
└── main.jsx                     # Entry point
```

---

## 📚 Documentation Files

```
CivicCareHub/
├── README.md                    # Main project README
├── PROJECT_STRUCTURE.md         # This file - Structure overview
├── USER_PORTAL_README.md        # User Portal documentation
├── MUNICIPAL_DASHBOARD_README.md # Municipal Portal documentation
├── MUNICIPAL_QUICK_START.md     # Quick start guide
└── QUICK_START.md               # General quick start
```

---

## 🔄 Migration Notes

### Import Path Changes

**Backend Controllers:**
- Old: `import User from '../models/User.js'`
- New: `import User from '../../models/User.js'` (in user/ or municipal/ folders)

**Backend Routes:**
- Old: `import { signup } from '../controllers/authController.js'`
- New: `import { signup } from '../../controllers/user/authController.js'`

**Frontend Pages:**
- Old: `import Login from './pages/Login'`
- New: `import Login from './pages/user/Login'`

**Frontend Components:**
- Old: `import UserNavbar from './components/UserNavbar'`
- New: `import UserNavbar from './components/user/UserNavbar'`

**Frontend Services:**
- Old: `import { authAPI } from './services/api'`
- New: `import { authAPI } from './services/user/api'` or `import { municipalAPI } from './services/municipal/api'`

---

## ✅ Benefits of New Structure

1. **Clear Separation**: User and Municipal portals are completely separated
2. **Easy Navigation**: Find portal-specific files quickly
3. **Better Maintainability**: Changes to one portal don't affect the other
4. **Scalability**: Easy to add new portals (e.g., Contractor Portal)
5. **Team Collaboration**: Different teams can work on different portals
6. **Documentation**: Portal-specific README files

---

## 🚀 Next Steps

1. Delete old files from root controllers/routes/pages/components folders
2. Update any remaining import paths
3. Test both portals to ensure everything works
4. Update CI/CD pipelines if needed
