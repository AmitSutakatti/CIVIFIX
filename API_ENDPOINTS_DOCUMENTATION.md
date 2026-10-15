# CivicFix API Endpoints Documentation

## Table of Contents
1. [User Portal API Endpoints](#user-portal-api-endpoints)
2. [Municipal Portal API Endpoints](#municipal-portal-api-endpoints)
3. [Detailed Endpoint Descriptions](#detailed-endpoint-descriptions)
4. [Summary Comparison](#summary-comparison)

---

## USER PORTAL API ENDPOINTS

**Base URL:** `http://localhost:5000/api`

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup` | Register new user account | ❌ No |
| `POST` | `/api/auth/login` | Login user and get JWT token | ❌ No |
| `GET` | `/api/auth/me` | Get current logged-in user profile | ✅ Yes |

**Details:**
- **POST `/api/auth/signup`**: Creates a new user account. Requires email, password, name, and phone.
- **POST `/api/auth/login`**: Authenticates user and returns JWT token for subsequent requests.
- **GET `/api/auth/me`**: Returns the profile of the currently authenticated user.

---

### 2. Complaints Endpoints (`/api/complaints`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/complaints` | Submit new complaint (with images) | ✅ Yes |
| `GET` | `/api/complaints/my` | Get all complaints by logged-in user | ✅ Yes |
| `GET` | `/api/complaints/:id` | Get specific complaint details | ✅ Yes |

**Details:**
- **POST `/api/complaints`**: 
  - Accepts FormData with:
    - `category` (string): Complaint category (road, drainage, electricity, etc.)
    - `description` (string): Detailed description of the issue
    - `latitude` (number): Location latitude
    - `longitude` (number): Location longitude
    - `address` (string, optional): Human-readable address
    - `images` (files, max 5): Image files of the issue
  - Returns: Created complaint object with status "Submitted"
  
- **GET `/api/complaints/my`**: 
  - Returns all complaints submitted by the authenticated user
  - Includes status, category, location, and images
  
- **GET `/api/complaints/:id`**: 
  - Returns detailed information about a specific complaint
  - Includes full status history and assigned officer/contractor

---

### 3. Notifications Endpoints (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/notifications/user` | Get all notifications for logged-in user | ✅ Yes |
| `PUT` | `/api/notifications/:id/read` | Mark specific notification as read | ✅ Yes |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | ✅ Yes |

**Details:**
- **GET `/api/notifications/user`**: Returns all notifications for the authenticated user, including unread count.
- **PUT `/api/notifications/:id/read`**: Marks a specific notification as read.
- **PUT `/api/notifications/read-all`**: Marks all notifications for the user as read.

---

### 4. Letters Endpoints (`/api/letters`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/letters/generate` | Generate official complaint letter (PDF) | ✅ Yes |

**Details:**
- **POST `/api/letters/generate`**: 
  - Generates an official complaint letter in PDF format
  - Uses AI to create formal letter content
  - Returns PDF file or letter content for download

---

### 5. Static Files (`/uploads`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/uploads/:filename` | Serve uploaded complaint images | ❌ No |

**Details:**
- **GET `/uploads/:filename`**: Serves static image files uploaded with complaints. Publicly accessible.

---

### 6. Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/health` | Check if API is running | ❌ No |

---

## MUNICIPAL PORTAL API ENDPOINTS

**Base URL:** `http://localhost:8000/api`

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|--------------|
| `POST` | `/api/auth/login` | Login municipal officer and get JWT token | ❌ No | - |
| `GET` | `/api/auth/me` | Get current logged-in officer profile | ✅ Yes | MUNICIPAL_OFFICER |

**Details:**
- **POST `/api/auth/login`**: Authenticates municipal officer. Only users with `MUNICIPAL_OFFICER` role can login.
- **GET `/api/auth/me`**: Returns the profile of the currently authenticated municipal officer, including their assigned municipal office.

---

### 2. Dashboard Endpoints (`/api/municipal/dashboard`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|--------------|
| `GET` | `/api/municipal/dashboard/stats` | Get dashboard statistics | ✅ Yes | MUNICIPAL_OFFICER |

**Details:**
- **GET `/api/municipal/dashboard/stats`**: 
  - Returns comprehensive dashboard statistics
  - Only includes complaints within officer's jurisdiction (based on geospatial radius)
  - Response includes:
    ```json
    {
      "stats": {
        "total": 10,
        "pending": 3,
        "verified": 2,
        "inProgress": 4,
        "completed": 1,
        "closed": 0
      },
      "municipalOffice": {
        "name": "Belagavi City Corporation (BCC)",
        "type": "City Corporation",
        "jurisdictionRadius": 20
      }
    }
    ```

---

### 3. Complaints Management Endpoints (`/api/municipal/complaints`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|--------------|
| `GET` | `/api/municipal/complaints` | Get all complaints in jurisdiction | ✅ Yes | MUNICIPAL_OFFICER |
| `PUT` | `/api/municipal/complaints/:id/verify` | Verify or reject a complaint | ✅ Yes | MUNICIPAL_OFFICER |
| `PUT` | `/api/municipal/complaints/:id/assign` | Assign contractor to complaint | ✅ Yes | MUNICIPAL_OFFICER |
| `PUT` | `/api/municipal/complaints/:id/status` | Update complaint status | ✅ Yes | MUNICIPAL_OFFICER |
| `PUT` | `/api/municipal/complaints/:id/close` | Close a completed complaint | ✅ Yes | MUNICIPAL_OFFICER |

**Details:**

- **GET `/api/municipal/complaints`**: 
  - Returns all complaints within the officer's jurisdiction (geospatial query)
  - Query Parameters:
    - `status` (optional): Filter by status (all, Submitted, Verified, etc.)
    - `category` (optional): Filter by category (all, road, drainage, etc.)
    - `page` (optional): Page number for pagination (default: 1)
    - `limit` (optional): Items per page (default: 20)
  - Response includes distance from municipal office for each complaint
  - Only shows complaints within jurisdiction radius

- **PUT `/api/municipal/complaints/:id/verify`**: 
  - Verifies or rejects a complaint
  - Request Body:
    ```json
    {
      "action": "verify" | "reject",
      "reason": "string (optional)"
    }
    ```
  - If verified: Status changes to "Verified", officer is assigned
  - If rejected: Status changes to "Closed"
  - Creates notification for the user

- **PUT `/api/municipal/complaints/:id/assign`**: 
  - Assigns a contractor to handle the complaint
  - Request Body:
    ```json
    {
      "contractorId": "contractor_user_id",
      "deadline": "2024-12-31" (optional)
    }
    ```
  - Changes status to "Assigned"
  - Creates notification for user and contractor

- **PUT `/api/municipal/complaints/:id/status`**: 
  - Manually updates complaint status
  - Request Body:
    ```json
    {
      "status": "Submitted" | "Verified" | "Assigned" | "In-progress" | "Completed" | "Closed",
      "note": "string (optional)"
    }
    ```
  - Adds entry to status history
  - Creates notification for user

- **PUT `/api/municipal/complaints/:id/close`**: 
  - Closes a completed complaint
  - Request Body:
    ```json
    {
      "note": "string (optional)"
    }
    ```
  - Only works if complaint status is "Completed"
  - Creates final notification for user

---

### 4. Analytics Endpoints (`/api/municipal/analytics`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|--------------|
| `GET` | `/api/municipal/analytics` | Get analytics and statistics | ✅ Yes | MUNICIPAL_OFFICER |

**Details:**
- **GET `/api/municipal/analytics`**: 
  - Returns comprehensive analytics for complaints in jurisdiction
  - Response includes:
    ```json
    {
      "categoryStats": {
        "road": 5,
        "drainage": 3,
        "electricity": 2
      },
      "monthlyTrend": {
        "2024-01": 10,
        "2024-02": 15,
        "2024-03": 12
      },
      "avgResolutionTime": 5.2,
      "contractorStats": {
        "contractor_id": {
          "total": 10,
          "completed": 8
        }
      },
      "totalComplaints": 50
    }
    ```

---

### 5. Contractors Endpoints (`/api/municipal/contractors`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|--------------|
| `GET` | `/api/municipal/contractors` | Get list of available contractors | ✅ Yes | MUNICIPAL_OFFICER |

**Details:**
- **GET `/api/municipal/contractors`**: 
  - Returns list of all active contractors
  - Includes contractor information: name, email, phone, rating, job statistics
  - Sorted by rating (highest first)
  - Used for assigning contractors to complaints

---

### 6. Static Files (`/uploads`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/uploads/:filename` | Serve uploaded complaint images | ❌ No |

**Details:**
- **GET `/uploads/:filename`**: Serves static image files. Shared with user portal.

---

### 7. Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/health` | Check if API is running | ❌ No |

---

## DETAILED ENDPOINT DESCRIPTIONS

### User Portal - Complaint Submission Flow

1. **User submits complaint** → `POST /api/complaints`
   - Complaint is created with status "Submitted"
   - Images are saved to `/uploads` folder
   - Notification is created for user

2. **User views their complaints** → `GET /api/complaints/my`
   - Returns all complaints submitted by user
   - Shows current status and updates

3. **User views complaint details** → `GET /api/complaints/:id`
   - Shows full complaint information
   - Includes status history and assigned resources

### Municipal Portal - Complaint Management Flow

1. **Officer views dashboard** → `GET /api/municipal/dashboard/stats`
   - Gets overview of all complaints in jurisdiction
   - Sees counts by status

2. **Officer views complaints** → `GET /api/municipal/complaints`
   - Sees all complaints within jurisdiction radius
   - Can filter by status and category
   - Sees distance from municipal office

3. **Officer verifies complaint** → `PUT /api/municipal/complaints/:id/verify`
   - Changes status from "Submitted" to "Verified"
   - User receives notification

4. **Officer assigns contractor** → `PUT /api/municipal/complaints/:id/assign`
   - Changes status to "Assigned"
   - Contractor and user receive notifications

5. **Officer updates status** → `PUT /api/municipal/complaints/:id/status`
   - Manually updates status (e.g., to "In-progress" or "Completed")
   - User receives notification

6. **Officer closes complaint** → `PUT /api/municipal/complaints/:id/close`
   - Final step after completion
   - Status changes to "Closed"

---

## SUMMARY COMPARISON

### Endpoint Count Summary

| Portal | Total Endpoints | Auth Endpoints | Complaint Endpoints | Other Endpoints |
|--------|----------------|----------------|---------------------|-----------------|
| **User Portal** | 9 | 3 | 3 | 3 (Notifications, Letters, Health) |
| **Municipal Portal** | 8 | 2 | 5 | 1 (Analytics, Contractors, Health) |

### Feature Comparison

| Feature | User Portal | Municipal Portal |
|---------|-------------|-----------------|
| **Can submit complaints** | ✅ Yes | ❌ No |
| **Can verify complaints** | ❌ No | ✅ Yes |
| **Can assign contractors** | ❌ No | ✅ Yes |
| **Can see all complaints** | ❌ No (only own) | ✅ Yes (in jurisdiction) |
| **Can generate letters** | ✅ Yes | ❌ No |
| **Can view analytics** | ❌ No | ✅ Yes |
| **Can update complaint status** | ❌ No | ✅ Yes |
| **Can view notifications** | ✅ Yes | ❌ No (not implemented) |
| **Geospatial filtering** | ❌ No | ✅ Yes (by jurisdiction) |
| **Contractor management** | ❌ No | ✅ Yes |

### Authentication & Authorization

**User Portal:**
- Uses JWT tokens for authentication
- Users can only access their own data
- No role-based restrictions (all users have same permissions)

**Municipal Portal:**
- Uses JWT tokens for authentication
- Requires `MUNICIPAL_OFFICER` role
- Officers can only see complaints within their jurisdiction
- Geospatial filtering based on municipal office location and radius

### Data Access Patterns

**User Portal:**
- Users see only their own complaints
- No access to other users' data
- Can track status of their submissions

**Municipal Portal:**
- Officers see all complaints within their jurisdiction
- Jurisdiction determined by:
  - Municipal office location (latitude/longitude)
  - Jurisdiction radius (in kilometers)
  - Geospatial queries using MongoDB `$near` operator
- Can manage all complaints in their area

### Request/Response Examples

#### User Portal - Submit Complaint

**Request:**
```
POST /api/complaints
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData:
- category: "road"
- description: "Large pothole on Main Street"
- latitude: 15.85
- longitude: 74.5
- address: "Main Street, Belagavi"
- images: [file1.jpg, file2.jpg]
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint created successfully",
  "data": {
    "complaint": {
      "_id": "507f1f77bcf86cd799439011",
      "category": "road",
      "status": "Submitted",
      "location": {
        "latitude": 15.85,
        "longitude": 74.5
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Municipal Portal - Get Complaints

**Request:**
```
GET /api/municipal/complaints?status=all&category=all&page=1&limit=20
Authorization: Bearer <officer_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "category": "road",
        "status": "Submitted",
        "location": {
          "latitude": 15.85,
          "longitude": 74.5
        },
        "distance": "2.5",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

## NOTES

1. **CORS Configuration**: Both portals have CORS enabled for their respective frontends
   - User Portal: Allows `http://localhost:3000`
   - Municipal Portal: Allows `http://localhost:5173`

2. **Database**: Both portals share the same MongoDB database (`civicfix`)
   - User Portal writes complaints
   - Municipal Portal reads and updates complaints
   - No direct HTTP communication between backends

3. **File Uploads**: Images are stored in `/backend/uploads` directory
   - Served statically by both backends
   - Maximum 5 images per complaint
   - File size limit: 5MB per image

4. **Geospatial Queries**: Municipal Portal uses MongoDB geospatial indexes
   - Requires `geoLocation` field with GeoJSON Point format
   - Uses `$near` operator for radius-based queries
   - Automatically calculates distance from municipal office

5. **Status Flow**: Complaint status progression
   ```
   Submitted → Verified → Assigned → In-progress → Completed → Closed
   ```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Base URLs:**
- User Portal: `http://localhost:5000/api`
- Municipal Portal: `http://localhost:8000/api`



