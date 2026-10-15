# MongoDB Setup Guide

## Quick Fix: Use MongoDB Atlas (Cloud - No Installation Required)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a free cluster (M0 - Free tier)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your database user password
5. Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/civicfix`

### Step 3: Update .env File
Open `backend/.env` and update:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/civicfix?retryWrites=true&w=majority
```

### Step 4: Whitelist Your IP
1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development) or add your specific IP

### Step 5: Create Database User
1. In MongoDB Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to "Atlas admin" or "Read and write to any database"

---

## Alternative: Install MongoDB Locally

### Windows
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (recommended)
5. MongoDB will start automatically

### Verify Installation
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (if not running as service)
mongod --dbpath C:\data\db
```

### Update .env
```env
MONGODB_URI=mongodb://localhost:27017/civicfix
```

---

## Alternative: Use Docker

### Run MongoDB in Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### Update .env
```env
MONGODB_URI=mongodb://localhost:27017/civicfix
```

---

## Test Connection

After setting up MongoDB, restart your backend server:
```bash
cd backend
npm run dev
```

You should see: `✅ Connected to MongoDB`

---

## Troubleshooting

### Connection Refused Error
- **MongoDB not running**: Start MongoDB service or process
- **Wrong port**: Check if MongoDB is on port 27017
- **Firewall**: Allow port 27017 through firewall

### Authentication Failed (Atlas)
- Check username and password in connection string
- Verify database user exists in Atlas
- Check IP whitelist in Network Access

### Timeout Error
- Check internet connection (for Atlas)
- Verify connection string is correct
- Check if MongoDB service is running (for local)

---

**Recommended: Use MongoDB Atlas for easiest setup! 🚀**

