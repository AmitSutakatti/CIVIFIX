# Municipal Office Dashboard - Implementation Guide

## 📋 Overview

The Municipal Office Dashboard is a comprehensive system that allows municipal officers to manage complaints within their geographical jurisdiction. Each municipal body (City Corporation, Municipal Council, Town Panchayat) has its own dedicated dashboard that only shows complaints relevant to their region.

## 🏗️ Architecture

### Backend Structure

```
backend/
├── models/
│   ├── MunicipalOffice.js      # Municipal office with geo-location
│   ├── User.js                   # Updated with MUNICIPAL_OFFICER role
│   ├── Contractor.js             # Contractor model
│   └── Complaint.js              # Updated with GeoJSON support
├── controllers/
│   └── municipalController.js   # All municipal dashboard logic
├── routes/
│   └── municipalRoutes.js       # Municipal API routes
└── scripts/
    └── seedMunicipalData.js     # Sample data seeder
```

### Frontend Structure

```
frontend/src/
├── pages/
│   ├── MunicipalLogin.jsx       # Municipal officer login
│   └── MunicipalDashboard.jsx   # Main dashboard
└── components/
    ├── MunicipalComplaintMap.jsx  # Map view with markers
    └── MunicipalAnalytics.jsx      # Charts and analytics
```

## 🔑 Key Features

### 1. Authentication
- Municipal officer login at `/municipal/login`
- JWT-based authentication
- Role-based access control (MUNICIPAL_OFFICER)
- Each officer linked to one municipal office

### 2. Geo-Filtering
- Complaints filtered by latitude/longitude
- Uses MongoDB GeoJSON queries with `$near` operator
- Jurisdiction radius (default: 10-20km)
- Only shows complaints within municipal boundary

### 3. Dashboard Stats
- Total complaints received
- Pending complaints
- Verified complaints
- In-progress complaints
- Completed complaints
- Closed complaints

### 4. Complaint Management
- View all complaints in jurisdiction
- Filter by status and category
- Verify/Reject complaints
- Assign contractors
- Update complaint status
- Close complaints after verification
- View complaint details with images

### 5. Map View
- Interactive map showing all complaints
- Color-coded markers:
  - 🔴 Red → Pending (Submitted)
  - 🟣 Purple → Verified
  - 🟡 Yellow → Assigned
  - 🟠 Orange → In-progress
  - 🟢 Green → Completed
  - ⚫ Gray → Closed
- Municipal office location marked
- Jurisdiction circle displayed

### 6. Analytics
- Category-wise distribution (Pie Chart)
- Monthly trend (Bar Chart)
- Average resolution time
- Contractor performance ranking

## 🚀 Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Variables
Ensure your `.env` file has:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicfix
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

#### Seed Sample Data
```bash
npm run seed:municipal
```

This will create:
- 3 Municipal Offices (Belagavi BCC, Athani TMC, Nippani CMC)
- 3 Municipal Officers (one for each office)
- 2 Sample Contractors

**Login Credentials:**
- **Belagavi BCC Officer:** `officer.bcc@belagavi.gov.in` / `officer123`
- **Athani TMC Officer:** `officer.athani@athani.gov.in` / `officer123`
- **Nippani CMC Officer:** `officer.nippani@nippani.gov.in` / `officer123`
- **Contractors:** `contractor1@example.com` / `contractor123`

#### Start Backend Server
```bash
npm run dev
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Frontend
```bash
npm run dev
```

### 3. Access Dashboard

1. Navigate to `http://localhost:5173/municipal/login`
2. Login with one of the municipal officer credentials
3. You'll be redirected to `/municipal/dashboard`

## 📡 API Endpoints

### Municipal Dashboard APIs

All endpoints require authentication and `MUNICIPAL_OFFICER` role.

#### Get Dashboard Stats
```
GET /api/municipal/dashboard/stats
Response: { stats, municipalOffice }
```

#### Get Complaints (Geo-filtered)
```
GET /api/municipal/complaints?status=all&category=all&page=1
Response: { complaints, pagination }
```

#### Verify/Reject Complaint
```
PUT /api/municipal/complaints/:id/verify
Body: { action: 'verify' | 'reject', reason: string }
```

#### Assign Contractor
```
PUT /api/municipal/complaints/:id/assign
Body: { contractorId: string, deadline: string (optional) }
```

#### Update Complaint Status
```
PUT /api/municipal/complaints/:id/status
Body: { status: string, note: string }
```

#### Close Complaint
```
PUT /api/municipal/complaints/:id/close
Body: { note: string }
```

#### Get Analytics
```
GET /api/municipal/analytics
Response: { categoryStats, monthlyTrend, avgResolutionTime, contractorStats }
```

#### Get Contractors
```
GET /api/municipal/contractors
Response: { contractors }
```

## 🗄️ Database Models

### MunicipalOffice
```javascript
{
  name: String,
  type: 'City Corporation' | 'Municipal Council' | 'Town Panchayat',
  address: String,
  contact: { phone, email },
  location: { type: 'Point', coordinates: [lng, lat] },
  latitude: Number,
  longitude: Number,
  jurisdictionRadius: Number (km),
  isActive: Boolean
}
```

### User (MUNICIPAL_OFFICER)
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: 'MUNICIPAL_OFFICER',
  municipalOffice: ObjectId (ref: MunicipalOffice),
  isActive: Boolean
}
```

### Complaint (with GeoJSON)
```javascript
{
  user: ObjectId,
  category: String,
  description: String,
  images: Array,
  location: { latitude, longitude, address },
  geoLocation: { type: 'Point', coordinates: [lng, lat] },
  status: String,
  assignedOfficer: ObjectId,
  assignedContractor: ObjectId,
  deadline: Date
}
```

## 🔍 Geo-Filtering Logic

The system uses MongoDB's geospatial queries to filter complaints:

1. **Municipal Office Location**: Stored as GeoJSON Point
2. **Jurisdiction Radius**: Configurable per office (default: 15km)
3. **Query**: Uses `$near` operator with `$maxDistance`
4. **Distance Calculation**: Haversine formula for accurate distance

```javascript
Complaint.find({
  geoLocation: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: radiusInMeters
    }
  }
})
```

## 🎨 Frontend Components

### MunicipalDashboard
Main dashboard component with:
- Stats cards
- Tab navigation (Complaints, Map, Analytics)
- Complaint management table
- Modals for verification and assignment

### MunicipalComplaintMap
Interactive map component using React-Leaflet:
- Displays all complaints as markers
- Color-coded by status
- Shows municipal office location
- Displays jurisdiction circle

### MunicipalAnalytics
Analytics component with:
- Recharts for visualization
- Pie chart for category distribution
- Bar chart for monthly trends
- Contractor performance table

## 🔐 Security

- JWT authentication required
- Role-based middleware (`authorize('MUNICIPAL_OFFICER')`)
- Geo-filtering ensures officers only see their jurisdiction
- Password hashing with bcryptjs (12 rounds)

## 📝 Workflow

1. **User submits complaint** → Status: `Submitted`
2. **Officer verifies** → Status: `Verified` or `Closed` (if rejected)
3. **Officer assigns contractor** → Status: `Assigned`
4. **Contractor starts work** → Status: `In-progress`
5. **Contractor completes** → Status: `Completed`
6. **Officer verifies completion** → Status: `Closed`

## 🧪 Testing

### Test Geo-Filtering
1. Create complaints at different locations
2. Login as different municipal officers
3. Verify each officer only sees complaints in their jurisdiction

### Test Workflow
1. Submit a complaint as a user
2. Login as municipal officer
3. Verify the complaint
4. Assign a contractor
5. Update status through workflow
6. Close the complaint

## 🐛 Troubleshooting

### Complaints not showing
- Check if complaint has valid `geoLocation` (GeoJSON Point)
- Verify municipal office has correct coordinates
- Check jurisdiction radius is appropriate
- Ensure complaint is not already `Closed`

### Map not loading
- Check Leaflet CSS is imported
- Verify OpenStreetMap tiles are accessible
- Check browser console for errors

### Authentication issues
- Verify JWT token is valid
- Check user role is `MUNICIPAL_OFFICER`
- Ensure `municipalOffice` is populated

## 📚 Additional Resources

- [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [Recharts Documentation](https://recharts.org/)

## 🎯 Next Steps

Potential enhancements:
- Real-time updates with WebSockets
- Email notifications for status changes
- Mobile app for officers
- Advanced filtering and search
- Export reports (PDF/Excel)
- Contractor rating system
- Performance metrics dashboard
