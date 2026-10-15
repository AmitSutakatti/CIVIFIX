# User Portal - Documentation

## 📋 Overview

The **User Portal** is the citizen-facing interface of CivicCareHub. It allows citizens to report civic issues, track their complaints, and receive notifications about status updates.

## 🏗️ Architecture

### Backend Structure

```
backend/
├── controllers/user/
│   ├── authController.js       # User authentication (signup, login)
│   ├── complaintController.js  # Complaint CRUD operations
│   ├── notificationController.js # User notifications
│   └── letterController.js      # AI letter generation
├── routes/user/
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   ├── notificationRoutes.js
│   └── letterRoutes.js
└── models/                     # Shared models
    ├── User.js
    ├── Complaint.js
    └── Notification.js
```

### Frontend Structure

```
frontend/src/
├── pages/user/
│   ├── Login.jsx               # User login page
│   ├── Register.jsx             # User registration
│   ├── UserDashboard.jsx        # User's complaint dashboard
│   ├── ReportIssue.jsx          # Report new complaint
│   └── ComplaintDetails.jsx    # View complaint details
├── components/user/
│   ├── UserNavbar.jsx          # Navigation bar
│   ├── GoogleMapPicker.jsx     # Map for location selection
│   └── LetterPreview.jsx        # Preview generated letter
├── services/user/
│   └── api.js                  # User portal API calls
└── context/
    └── AuthContext.jsx         # Authentication context
```

## 🔑 Features

### 1. User Authentication
- **Signup**: Create new user account
- **Login**: Authenticate existing user
- **JWT-based**: Secure token-based authentication

### 2. Report Issues
- **Category Selection**: 8 categories (Road, Drainage, Electricity, etc.)
- **Location Picker**: Auto-detect or manual selection
- **Image Upload**: Up to 5 images
- **AI Letter Generation**: Automatic formal letter generation

### 3. Dashboard
- **View All Complaints**: See all submitted complaints
- **Status Tracking**: Real-time status updates
- **Filter & Search**: Find specific complaints
- **Progress Indicators**: Visual status progression

### 4. Complaint Details
- **Full Information**: Complete complaint details
- **Status History**: Timeline of status changes
- **Images**: View uploaded images
- **Location Map**: See complaint location on map

### 5. Notifications
- **Real-time Updates**: Get notified of status changes
- **Unread Count**: Track unread notifications
- **Mark as Read**: Manage notification status

## 📡 API Endpoints

### Authentication
```
POST /api/auth/signup          # Register new user
POST /api/auth/login           # Login user
GET  /api/auth/me             # Get current user
```

### Complaints
```
POST /api/complaints           # Create new complaint
GET  /api/complaints/my        # Get user's complaints
GET  /api/complaints/:id       # Get complaint details
```

### Notifications
```
GET  /api/notifications/user   # Get user notifications
PUT  /api/notifications/:id/read # Mark as read
PUT  /api/notifications/read-all # Mark all as read
```

### Letters
```
POST /api/letters/generate     # Generate formal letter
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Configure Environment**
```bash
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicfix
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

4. **Start Backend**
```bash
cd backend
npm run dev
```

5. **Start Frontend**
```bash
cd frontend
npm run dev
```

6. **Access Application**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## 📝 Usage

### Register New User
1. Navigate to `/register`
2. Fill in name, email, phone, password
3. Submit form
4. Auto-login after registration

### Report an Issue
1. Login to your account
2. Click "Report Issue" or navigate to `/report`
3. Select category
4. Enter description
5. Select location (auto-detect or manual)
6. Upload images (optional)
7. Submit complaint

### View Dashboard
1. Login to your account
2. View all complaints on dashboard
3. Click on complaint to see details
4. Track status updates

## 🎨 UI Components

### Login Page
- Email/password authentication
- Link to registration
- Error handling

### Registration Page
- Form validation
- Password confirmation
- Auto-redirect after signup

### User Dashboard
- Stats cards (Total, Pending, In Progress, Completed)
- Complaint list with filters
- Status badges
- Quick actions

### Report Issue Page
- Category dropdown
- Rich text description
- Location picker with map
- Image upload with preview
- AI letter generation

## 🔐 Security

- **Password Hashing**: bcryptjs (12 rounds)
- **JWT Tokens**: Secure token-based auth
- **Protected Routes**: Route-level authentication
- **Input Validation**: Server-side validation
- **File Upload**: Type and size validation

## 🐛 Troubleshooting

### Login Issues
- Check email/password
- Verify JWT_SECRET is set
- Check MongoDB connection

### Complaint Submission
- Verify location is selected
- Check image file sizes (max 5MB)
- Ensure category is selected

### API Errors
- Check backend server is running
- Verify API URL in frontend
- Check CORS settings

## 📚 Related Documentation

- [Main README](../README.md)
- [Project Structure](../PROJECT_STRUCTURE.md)
- [Municipal Portal](../MUNICIPAL_DASHBOARD_README.md)

genertaed app pass - ouyw dpip jymr tkez