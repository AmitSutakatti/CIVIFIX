# CivicFix - Public Issue Reporting System

A comprehensive MERN stack application for reporting and tracking civic issues. This project includes a User Portal for citizens to report problems, track their status, and receive notifications.

## 🚀 Features

### User Portal
- **User Authentication**: Secure signup and login with JWT
- **Report Issues**: Submit complaints with images and location
- **Dashboard**: View all submitted complaints with status tracking
- **Complaint Details**: Detailed view with timeline and images
- **Notifications**: Real-time status update notifications

## 📁 Project Structure

```
CivicCareHub/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── notificationRoutes.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx
    │   │   └── UserNavbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── UserDashboard.jsx
    │   │   ├── ReportIssue.jsx
    │   │   └── ComplaintDetails.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React** with Vite
- **React Router** for routing
- **Axios** for API calls
- **TailwindCSS** for styling
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/civicfix
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Complaints
- `POST /api/complaints` - Create new complaint (Protected)
- `GET /api/complaints/my` - Get user's complaints (Protected)
- `GET /api/complaints/:id` - Get complaint details (Protected)

### Notifications
- `GET /api/notifications/user` - Get user notifications (Protected)
- `PUT /api/notifications/:id/read` - Mark notification as read (Protected)
- `PUT /api/notifications/read-all` - Mark all as read (Protected)

## 📝 Usage

### User Registration
1. Navigate to `/register`
2. Fill in name, email, phone (optional), and password
3. Click "Create account"

### Report an Issue
1. Login to your account
2. Click "Report New Issue" from the dashboard
3. Select category, enter description
4. Click "Auto-detect Location" or enter manually
5. Upload images (optional, max 5)
6. Submit the complaint

### View Complaints
1. Go to Dashboard to see all your complaints
2. Click "View Details" to see full complaint information
3. Track status progress with the progress bar

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes with middleware
- File upload validation
- Input validation and sanitization

## 🎨 UI/UX Features

- Modern, responsive design with TailwindCSS
- Professional color scheme
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states and error handling
- Image preview and modal view
- Status progress indicators

## 🚧 Future Enhancements

- Officer Portal (for managing complaints)
- Contractor Portal (for accepting and completing work)
- Real-time updates with WebSockets
- Email notifications
- Advanced filtering and search
- Map integration for location visualization
- Cloudinary integration for better image handling

## 📄 License

This project is part of the CivicFix system.

## 👥 Contributing

This is the User Portal component of CivicFix. The system is designed to be extended with Officer and Contractor portals.

---

**Built with ❤️ for better civic engagement**

