# Municipal Officer Portal - Documentation

## 📋 Overview

The **Municipal Officer Portal** is the administrative interface for municipal officers. It provides geo-filtered complaint management, contractor assignment, analytics, and map visualization for each municipal body's jurisdiction.

## 🏗️ Architecture

### Backend Structure

```
backend/
├── controllers/municipal/
│   └── municipalController.js  # All municipal dashboard logic
├── routes/municipal/
│   └── municipalRoutes.js      # Municipal API routes
└── models/                     # Shared models
    ├── MunicipalOffice.js      # Municipal office data
    ├── User.js                 # Officer accounts
    ├── Complaint.js            # Complaints with GeoJSON
    └── Contractor.js           # Contractor management
```

### Frontend Structure

```
frontend/src/
├── pages/municipal/
│   ├── MunicipalLogin.jsx      # Officer login
│   └── MunicipalDashboard.jsx  # Main dashboard
├── components/municipal/
│   ├── MunicipalComplaintMap.jsx  # Map view with markers
│   └── MunicipalAnalytics.jsx     # Charts and analytics
├── services/municipal/
│   └── api.js                 # Municipal API calls
└── context/
    └── AuthContext.jsx        # Shared auth context
```

## 🔑 Features

### 1. Authentication
- **Officer Login**: Dedicated login page
- **Role-based Access**: MUNICIPAL_OFFICER role required
- **Office Linking**: Each officer linked to one municipal office

### 2. Geo-Filtering
- **Jurisdiction-based**: Only see complaints in your area
- **Radius-based**: Configurable jurisdiction radius (10-20km)
- **MongoDB GeoJSON**: Efficient geospatial queries

### 3. Dashboard Stats
- **Total Complaints**: All complaints in jurisdiction
- **Pending**: Awaiting verification
- **Verified**: Approved complaints
- **In Progress**: Assigned or in-progress
- **Completed**: Finished work
- **Closed**: Resolved and closed

### 4. Complaint Management
- **View Complaints**: Filtered by jurisdiction
- **Verify/Reject**: Approve or reject complaints
- **Assign Contractors**: Assign work to contractors
- **Update Status**: Change complaint status
- **Close Complaints**: Final verification and closure

### 5. Map View
- **Interactive Map**: Leaflet-based map
- **Color-coded Markers**: Status-based colors
- **Office Location**: Municipal office marked
- **Jurisdiction Circle**: Visual boundary

### 6. Analytics
- **Category Distribution**: Pie chart
- **Monthly Trends**: Bar chart
- **Resolution Time**: Average days to resolve
- **Contractor Performance**: Completion rates

## 📡 API Endpoints

All endpoints require `MUNICIPAL_OFFICER` role.

### Dashboard
```
GET /api/municipal/dashboard/stats  # Get dashboard statistics
```

### Complaints
```
GET  /api/municipal/complaints      # Get geo-filtered complaints
PUT  /api/municipal/complaints/:id/verify  # Verify/reject
PUT  /api/municipal/complaints/:id/assign  # Assign contractor
PUT  /api/municipal/complaints/:id/status  # Update status
PUT  /api/municipal/complaints/:id/close  # Close complaint
```

### Analytics
```
GET /api/municipal/analytics        # Get analytics data
```

### Contractors
```
GET /api/municipal/contractors      # Get available contractors
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB with geospatial indexes
- Municipal office data seeded

### Setup

1. **Seed Municipal Data**
```bash
cd backend
npm run seed:municipal
```

This creates:
- 3 Municipal Offices
- 3 Municipal Officers
- 2 Sample Contractors

2. **Login Credentials**
```
Belagavi BCC: officer.bcc@belagavi.gov.in / officer123
Athani TMC:   officer.athani@athani.gov.in / officer123
Nippani CMC:  officer.nippani@nippani.gov.in / officer123
```

3. **Access Portal**
- Navigate to: `http://localhost:5173/municipal/login`
- Login with officer credentials
- Access dashboard at `/municipal/dashboard`

## 📝 Usage

### Verify Complaint
1. View complaint in dashboard
2. Click "View" to see details
3. Click "Verify/Reject"
4. Choose action and add reason
5. Submit

### Assign Contractor
1. Verify complaint first
2. Click "Assign Contractor"
3. Select contractor from list
4. Set deadline (optional)
5. Submit

### View Map
1. Click "Map View" tab
2. See all complaints on map
3. Click markers for details
4. View jurisdiction boundary

### View Analytics
1. Click "Analytics" tab
2. See category distribution
3. View monthly trends
4. Check contractor performance

## 🗺️ Geo-Filtering Logic

### How It Works
1. Municipal office has latitude/longitude
2. Jurisdiction radius defined (e.g., 15km)
3. MongoDB `$near` query finds complaints within radius
4. Only complaints in jurisdiction are shown

### MongoDB Query
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

## 🎨 UI Components

### Municipal Dashboard
- **Stats Cards**: 6 key metrics
- **Tab Navigation**: Complaints, Map, Analytics
- **Complaint Table**: Filterable list
- **Modals**: Verify, Assign, Details

### Map Component
- **Leaflet Integration**: OpenStreetMap tiles
- **Status Markers**: Color-coded by status
- **Office Marker**: Blue marker for office
- **Jurisdiction Circle**: Visual boundary

### Analytics Component
- **Recharts**: Professional charts
- **Pie Chart**: Category distribution
- **Bar Chart**: Monthly trends
- **Performance Table**: Contractor stats

## 🔐 Security

- **Role-based Access**: MUNICIPAL_OFFICER only
- **Jurisdiction Check**: Can't access other areas
- **JWT Authentication**: Secure tokens
- **Protected Routes**: Frontend and backend

## 🐛 Troubleshooting

### Complaints Not Showing
- Check complaint has valid coordinates
- Verify municipal office jurisdiction radius
- Ensure complaint is not "Closed"
- Check MongoDB geospatial index

### Map Not Loading
- Check Leaflet CSS imported
- Verify OpenStreetMap tiles accessible
- Check browser console for errors

### Can't Login
- Verify user role is MUNICIPAL_OFFICER
- Check municipal office is linked
- Run seed script if needed

## 📚 Related Documentation

- [Main README](../README.md)
- [Project Structure](../PROJECT_STRUCTURE.md)
- [User Portal](../USER_PORTAL_README.md)
- [Quick Start Guide](../MUNICIPAL_QUICK_START.md)
