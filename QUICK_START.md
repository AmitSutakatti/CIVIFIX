# Quick Start Guide - CivicFix User Portal

## 🚀 Quick Setup (5 minutes)

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the content from .env.example and update MONGODB_URI and JWT_SECRET

# Start MongoDB (if running locally)
# Make sure MongoDB is running on localhost:27017
# Or update MONGODB_URI in .env to your MongoDB Atlas connection string

# Start the server
npm run dev
```

Backend will run on: `http://localhost:5000`

### Step 2: Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

### Step 3: Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Click "Sign up" to create a new account
3. Fill in your details and register
4. You'll be automatically logged in and redirected to the dashboard

## 📋 Default Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicfix
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
```

### Frontend (.env - optional)
```env
VITE_API_URL=http://localhost:5000/api
```

## ✅ Testing the Application

1. **Register a new user**
   - Go to `/register`
   - Fill in all fields
   - Submit the form

2. **Report an Issue**
   - Click "Report New Issue"
   - Select a category
   - Enter description
   - Click "Auto-detect Location" (allow browser location access)
   - Upload images (optional)
   - Submit

3. **View Dashboard**
   - See all your complaints
   - Check status progress
   - View statistics

4. **View Complaint Details**
   - Click "View Details" on any complaint
   - See full information, timeline, and images

## 🔧 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your MONGODB_URI in backend/.env
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change PORT in backend/.env
- Update VITE_API_URL in frontend/.env accordingly

### Images Not Loading
- Check that backend/uploads directory exists
- Verify image URLs in the response
- Check CORS settings if using different ports

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET is set in backend/.env
- Verify token is being sent in request headers

## 📱 Features to Test

- ✅ User registration and login
- ✅ JWT token authentication
- ✅ Protected routes
- ✅ Report issue with location
- ✅ Image upload
- ✅ Dashboard with complaint list
- ✅ Status progress tracking
- ✅ Complaint details page
- ✅ Notifications (when status changes)

## 🎯 Next Steps

After testing the User Portal, you can:
1. Build the Officer Portal for managing complaints
2. Build the Contractor Portal for accepting work
3. Add real-time updates with WebSockets
4. Integrate Cloudinary for better image handling
5. Add email notifications

---

**Happy Coding! 🚀**

