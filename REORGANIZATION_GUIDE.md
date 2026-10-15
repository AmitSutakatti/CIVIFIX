# Project Reorganization Guide

## ✅ Completed Backend Reorganization

### Controllers
- ✅ `controllers/user/authController.js` - User authentication
- ✅ `controllers/user/complaintController.js` - User complaints
- ✅ `controllers/user/notificationController.js` - User notifications
- ✅ `controllers/user/letterController.js` - Letter generation
- ✅ `controllers/municipal/municipalController.js` - Municipal dashboard

### Routes
- ✅ `routes/user/authRoutes.js`
- ✅ `routes/user/complaintRoutes.js`
- ✅ `routes/user/notificationRoutes.js`
- ✅ `routes/user/letterRoutes.js`
- ✅ `routes/municipal/municipalRoutes.js`

### Server
- ✅ `server.js` - Updated imports

---

## ✅ Completed Frontend Services

- ✅ `services/user/api.js` - User portal API
- ✅ `services/municipal/api.js` - Municipal portal API

---

## 🔄 Remaining Frontend Tasks

### Pages to Move

**User Portal Pages:**
1. Move `pages/Login.jsx` → `pages/user/Login.jsx`
2. Move `pages/Register.jsx` → `pages/user/Register.jsx`
3. Move `pages/UserDashboard.jsx` → `pages/user/UserDashboard.jsx`
4. Move `pages/ReportIssue.jsx` → `pages/user/ReportIssue.jsx`
5. Move `pages/ComplaintDetails.jsx` → `pages/user/ComplaintDetails.jsx`

**Municipal Portal Pages:**
1. Move `pages/MunicipalLogin.jsx` → `pages/municipal/MunicipalLogin.jsx`
2. Move `pages/MunicipalDashboard.jsx` → `pages/municipal/MunicipalDashboard.jsx`

### Components to Move

**User Portal Components:**
1. Move `components/UserNavbar.jsx` → `components/user/UserNavbar.jsx`
2. Move `components/GoogleMapPicker.jsx` → `components/user/GoogleMapPicker.jsx`
3. Move `components/LetterPreview.jsx` → `components/user/LetterPreview.jsx`

**Municipal Portal Components:**
1. Move `components/MunicipalComplaintMap.jsx` → `components/municipal/MunicipalComplaintMap.jsx`
2. Move `components/MunicipalAnalytics.jsx` → `components/municipal/MunicipalAnalytics.jsx`

**Shared Components:**
1. Move `components/ProtectedRoute.jsx` → `components/shared/ProtectedRoute.jsx`

### Files to Update

1. **App.jsx** - Update all import paths
2. **All page files** - Update component imports
3. **All component files** - Update service imports

---

## 📝 Import Path Updates Required

### In App.jsx:
```javascript
// Old
import Login from './pages/Login';
import MunicipalLogin from './pages/MunicipalLogin';

// New
import Login from './pages/user/Login';
import MunicipalLogin from './pages/municipal/MunicipalLogin';
```

### In User Pages:
```javascript
// Old
import { complaintAPI } from '../services/api';
import UserNavbar from '../components/UserNavbar';

// New
import { complaintAPI } from '../services/user/api';
import UserNavbar from '../components/user/UserNavbar';
```

### In Municipal Pages:
```javascript
// Old
import { municipalAPI } from '../services/api';
import MunicipalComplaintMap from '../components/MunicipalComplaintMap';

// New
import { municipalAPI } from '../services/municipal/api';
import MunicipalComplaintMap from '../components/municipal/MunicipalComplaintMap';
```

---

## 🗑️ Files to Delete (After Moving)

### Backend:
- `controllers/authController.js` (moved to `controllers/user/`)
- `controllers/complaintController.js` (moved to `controllers/user/`)
- `controllers/notificationController.js` (moved to `controllers/user/`)
- `controllers/letterController.js` (moved to `controllers/user/`)
- `controllers/municipalController.js` (moved to `controllers/municipal/`)
- `routes/authRoutes.js` (moved to `routes/user/`)
- `routes/complaintRoutes.js` (moved to `routes/user/`)
- `routes/notificationRoutes.js` (moved to `routes/user/`)
- `routes/letterRoutes.js` (moved to `routes/user/`)
- `routes/municipalRoutes.js` (moved to `routes/municipal/`)

### Frontend:
- `services/api.js` (split into `services/user/api.js` and `services/municipal/api.js`)
- All old page files (after moving to new locations)
- All old component files (after moving to new locations)

---

## ⚠️ Important Notes

1. **Test thoroughly** after moving files
2. **Update all imports** before deleting old files
3. **Keep backups** until everything is verified
4. **Update CI/CD** if you have automated deployments
5. **Update documentation** references to file paths

---

## 🚀 Quick Migration Script

You can use this PowerShell script to move files (run from project root):

```powershell
# Backend - Already done manually
# Frontend - Run these commands:

# Move pages
Move-Item frontend/src/pages/Login.jsx frontend/src/pages/user/
Move-Item frontend/src/pages/Register.jsx frontend/src/pages/user/
Move-Item frontend/src/pages/UserDashboard.jsx frontend/src/pages/user/
Move-Item frontend/src/pages/ReportIssue.jsx frontend/src/pages/user/
Move-Item frontend/src/pages/ComplaintDetails.jsx frontend/src/pages/user/
Move-Item frontend/src/pages/MunicipalLogin.jsx frontend/src/pages/municipal/
Move-Item frontend/src/pages/MunicipalDashboard.jsx frontend/src/pages/municipal/

# Move components
Move-Item frontend/src/components/UserNavbar.jsx frontend/src/components/user/
Move-Item frontend/src/components/GoogleMapPicker.jsx frontend/src/components/user/
Move-Item frontend/src/components/LetterPreview.jsx frontend/src/components/user/
Move-Item frontend/src/components/MunicipalComplaintMap.jsx frontend/src/components/municipal/
Move-Item frontend/src/components/MunicipalAnalytics.jsx frontend/src/components/municipal/
Move-Item frontend/src/components/ProtectedRoute.jsx frontend/src/components/shared/
```

**Then update all import paths in the moved files!**
