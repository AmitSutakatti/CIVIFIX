# 🚀 How to Start the Website

## Quick Start Guide

Follow these steps to get your CivicCareHub application running.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- ✅ **MongoDB** (local or MongoDB Atlas) - [Download](https://www.mongodb.com/try/download/community)
- ✅ **npm** or **yarn** package manager

---

## 🔧 Step 1: Install Dependencies

### Backend Dependencies
```bash
cd backend
npm install
```

### Frontend Dependencies
```bash
cd frontend
npm install
```

---

## ⚙️ Step 2: Configure Environment Variables

### Backend Configuration

Create a `.env` file in the `backend` folder:

```bash
cd backend
```

Create `.env` file with:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/civicfix
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
OPENAI_API_KEY=your_openai_key_optional
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civicfix
```

---

## 🗄️ Step 3: Start MongoDB

### Option A: Local MongoDB
```bash
# Windows
# MongoDB should start automatically as a service
# Or run manually:
mongod --dbpath "C:\data\db"

# Mac/Linux
sudo systemctl start mongod
# Or:
mongod --dbpath /data/db
```

### Option B: MongoDB Atlas (Cloud)
- No local setup needed
- Use your Atlas connection string in `.env`

### Option C: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

---

## 🌱 Step 4: Seed Sample Data (Optional but Recommended)

This creates sample municipal offices and officers:

```bash
cd backend
npm run seed:municipal
```

**Sample Login Credentials Created:**
- **Belagavi BCC Officer:** `officer.bcc@belagavi.gov.in` / `officer123`
- **Athani TMC Officer:** `officer.athani@athani.gov.in` / `officer123`
- **Nippani CMC Officer:** `officer.nippani@nippani.gov.in` / `officer123`

---

## 🚀 Step 5: Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
```

**Backend will be available at:** `http://localhost:5000`

---

## 🎨 Step 6: Start Frontend Server

Open a **new terminal** (keep backend running) and run:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Frontend will be available at:** `http://localhost:5173`

---

## 🌐 Step 7: Access the Application

### User Portal (Citizen)
- **URL:** `http://localhost:5173`
- **Login:** `/login`
- **Register:** `/register`
- **Dashboard:** `/dashboard`

### Municipal Officer Portal
- **URL:** `http://localhost:5173/municipal/login`
- **Login:** Use officer credentials from seed data
- **Dashboard:** `/municipal/dashboard`

---

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend server started (port 5000)
- [ ] Frontend server started (port 5173)
- [ ] Can access `http://localhost:5173`
- [ ] Can access `http://localhost:5000/api/health`

---

## 🐛 Troubleshooting

### Backend Won't Start

**MongoDB Connection Error:**
```
❌ MongoDB connection error
```
**Solutions:**
1. Check if MongoDB is running: `mongosh` or check service status
2. Verify `MONGODB_URI` in `.env` file
3. For Atlas: Check network access and credentials
4. Try: `mongod --dbpath <your-data-path>`

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Change PORT in backend/.env to another port (e.g., 5001)
# Or kill the process using port 5000
```

### Frontend Won't Start

**Port Already in Use:**
```
Error: Port 5173 is in use
```
**Solution:**
```bash
# Vite will automatically use next available port
# Or specify: npm run dev -- --port 3000
```

**Module Not Found:**
```
Error: Cannot find module 'xxx'
```
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Can't Login

**Invalid Credentials:**
- Verify user exists in database
- Check password is correct
- Run seed script: `npm run seed:municipal`

**JWT Error:**
- Check `JWT_SECRET` is set in `.env`
- Restart backend server after changing `.env`

---

## 📝 Development Commands

### Backend
```bash
cd backend
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm run seed:municipal  # Seed sample data
```

### Frontend
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🎯 Quick Test

1. **Test Backend:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK","message":"CivicFix API is running"}`

2. **Test Frontend:**
   - Open browser: `http://localhost:5173`
   - Should see login/register page

3. **Test User Registration:**
   - Go to `/register`
   - Create a new account
   - Login and access dashboard

4. **Test Municipal Portal:**
   - Go to `/municipal/login`
   - Login with: `officer.bcc@belagavi.gov.in` / `officer123`
   - Access municipal dashboard

---

## 📚 Next Steps

- Read [USER_PORTAL_README.md](./USER_PORTAL_README.md) for user portal features
- Read [MUNICIPAL_PORTAL_README.md](./MUNICIPAL_PORTAL_README.md) for municipal portal features
- Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for project organization

---

## 💡 Tips

- **Keep both terminals open** - Backend and Frontend need to run simultaneously
- **Check console logs** - Both servers show helpful error messages
- **Use MongoDB Compass** - Visual database tool to verify data
- **Hot Reload** - Both servers auto-reload on file changes (development mode)

---

## 🆘 Still Having Issues?

1. Check all prerequisites are installed
2. Verify MongoDB is running
3. Check `.env` file is configured correctly
4. Ensure ports 5000 and 5173 are not blocked
5. Review error messages in terminal
6. Check [Troubleshooting](#-troubleshooting) section above

---

**Happy Coding! 🎉**
