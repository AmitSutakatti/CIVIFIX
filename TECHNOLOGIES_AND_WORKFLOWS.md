# 🛠️ Technologies Used & Workflows

## 📚 Technologies Stack

### Backend Technologies

#### Core Framework & Runtime
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for Node.js
- **MongoDB** - NoSQL database for storing all application data
- **Mongoose** - MongoDB object modeling for Node.js

#### Authentication & Security
- **JWT (jsonwebtoken)** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and encryption
- **CORS** - Cross-Origin Resource Sharing middleware

#### File Handling
- **Multer** - Middleware for handling multipart/form-data (file uploads)
- **fs (File System)** - Node.js built-in module for file operations

#### PDF Generation
- **PDFKit** - PDF document generation library
  - Generates professional PDF invoices
  - Supports text, tables, formatting
  - Creates downloadable PDF files

#### AI Integration
- **OpenAI API (openai package)** - AI-powered content generation
  - Used for generating professional invoice summaries
  - Used for generating complaint letters
  - Model: GPT-3.5-turbo

#### Email Services
- **EmailJS** - Email service for sending notifications
  - Sends email notifications to users
  - HTML email templates
  - Server-side API integration

#### Validation
- **express-validator** - Request validation middleware

### Frontend Technologies

#### Core Framework
- **React** - JavaScript library for building user interfaces
- **Vite** - Build tool and development server
- **React Router DOM** - Client-side routing

#### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **react-hot-toast** - Toast notification library

#### HTTP Client
- **Axios** - Promise-based HTTP client for API calls
  - Request/response interceptors
  - Automatic token management
  - Error handling

#### Maps & Visualization
- **React-Leaflet** - React components for Leaflet maps
- **Leaflet** - Open-source JavaScript library for mobile-friendly interactive maps

### Database Models

#### User Model
- Stores user information (name, email, password, role)
- Roles: `user`, `officer`, `MUNICIPAL_OFFICER`, `contractor`
- Links to MunicipalOffice for officers
- Contractor info (company name, license, rating, etc.)

#### Complaint Model
- Stores complaint details (category, description, location)
- Status tracking (Submitted, Verified, Assigned, In-progress, Completed, Closed)
- Geospatial data (GeoJSON Point) for location-based queries
- References to User (complainant, assignedOfficer, assignedContractor)
- Priority levels (low, medium, high, urgent)

#### Message Model
- Stores chat messages between officers and contractors
- Fields: sender, receiver, complaint, message, attachments, read status
- Supports file attachments (images, documents)

#### MunicipalOffice Model
- Stores municipal office information
- Geospatial location (GeoJSON Point)
- Jurisdiction radius
- Contact information

#### Contractor Model
- Stores contractor-specific information
- Company details, license, specialties
- Rating, experience, work done
- Availability status

#### Notification Model
- Stores notifications for users
- Types: assignment, status_update, rejection, etc.

---

## 💬 Chat Workflow (Officer ↔ Contractor)

### Architecture

```
Municipal Officer (Frontend)  ←→  Backend API  ←→  Contractor (Frontend)
     Port 5173                        Port 8000/8001         Port 5174
```

### Technology Stack for Chat

1. **Backend:**
   - Express.js routes (`/api/chat/:complaintId`)
   - MongoDB Message model
   - Multer for file uploads
   - Real-time polling (frontend polls every 3 seconds)

2. **Frontend:**
   - React components (ChatModal)
   - Axios for API calls
   - File input handling
   - Auto-scroll to latest messages

### Detailed Workflow

#### 1. **Initial Assignment**
```
Municipal Officer assigns Contractor to Complaint
    ↓
Backend creates initial message:
    - Sender: Officer
    - Receiver: Contractor
    - Message: "Hello! [Office] is interested in working with you..."
    ↓
Notification sent to Contractor
```

#### 2. **Starting a Chat**

**From Municipal Dashboard:**
1. Officer views complaint details
2. Clicks "Chat with Contractor" button
3. ChatModal opens with complaint context
4. Fetches all messages for that complaint
5. Displays conversation history

**From Contractor Dashboard:**
1. Contractor views assigned project
2. Clicks "Chat" button
3. ChatModal opens
4. Fetches all messages for that complaint
5. Displays conversation history

#### 3. **Sending Messages**

**Process:**
```
User types message + optionally attaches files
    ↓
Frontend creates FormData:
    - message: text content
    - attachments: files (images, PDFs, documents)
    ↓
POST /api/chat/:complaintId
    ↓
Backend (chatController.js):
    1. Validates user has access to complaint
    2. Determines receiver (opposite party)
    3. Saves files to /uploads/chat/
    4. Creates Message document in MongoDB
    5. Returns created message
    ↓
Frontend updates message list
    ↓
Auto-scrolls to new message
```

#### 4. **Receiving Messages**

**Real-time Updates:**
```
Frontend polls every 3 seconds:
    GET /api/chat/:complaintId
    ↓
Backend:
    1. Finds all messages for complaint
    2. Populates sender/receiver info
    3. Marks messages as read for current user
    4. Returns messages sorted by date
    ↓
Frontend updates UI
    ↓
New messages appear automatically
```

#### 5. **File Attachments**

**Supported Types:**
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX, TXT

**Process:**
```
User selects file(s) (max 5, 10MB each)
    ↓
Frontend validates file type and size
    ↓
FormData includes files
    ↓
Backend (Multer):
    1. Validates file type
    2. Saves to /uploads/chat/
    3. Creates attachment record in Message
    4. Stores: url, filename, fileType, size
    ↓
Message includes attachment metadata
    ↓
Frontend displays download link
```

#### 6. **Message Display**

**Features:**
- Messages aligned by sender (left/right)
- Color coding (blue for own, white for others)
- Timestamp display
- Date separators
- Attachment previews with download links
- Read status tracking

### API Endpoints

```
GET    /api/chat/:complaintId        - Get all messages for complaint
POST   /api/chat/:complaintId        - Send new message (with files)
PUT    /api/chat/:complaintId/read   - Mark messages as read
```

### Data Flow Diagram

```
┌─────────────────┐
│ Municipal       │
│ Officer         │
│ (Frontend)      │
└────────┬────────┘
         │
         │ POST /api/chat/:complaintId
         │ { message, attachments }
         ↓
┌─────────────────┐
│ Backend API     │
│ (Express)       │
│                 │
│ 1. Validate     │
│ 2. Save files   │
│ 3. Create       │
│    Message doc  │
└────────┬────────┘
         │
         │ Save to MongoDB
         ↓
┌─────────────────┐
│ MongoDB         │
│ Messages        │
│ Collection      │
└────────┬────────┘
         │
         │ Poll every 3s
         ↓
┌─────────────────┐
│ Contractor      │
│ (Frontend)      │
│                 │
│ Auto-updates    │
│ message list    │
└─────────────────┘
```

---

## 📄 Invoice Generation Workflow

### Architecture

```
Contractor Dashboard  →  Backend API  →  OpenAI (optional)  →  PDFKit  →  PDF Download
   (Frontend)            (Express)         (AI Summary)        (PDF Gen)    (Browser)
```

### Technology Stack for Invoice

1. **Backend:**
   - Express.js route (`/api/contractor/invoice/generate`)
   - PDFKit for PDF generation
   - OpenAI API for professional content (optional)
   - Buffer-based PDF creation (in-memory)

2. **Frontend:**
   - React form component (GenerateInvoice.jsx)
   - Dynamic table inputs (Labor, Materials, Other)
   - Auto-calculation of totals
   - PDF blob download

### Detailed Workflow

#### 1. **Accessing Invoice Generation**

```
Contractor Dashboard
    ↓
Views assigned project
    ↓
Clicks "Generate Invoice" button
    ↓
Navigates to /invoice/:complaintId
    ↓
Invoice form loads with complaint details
```

#### 2. **Filling Invoice Form**

**Form Sections:**

**A. Work Description**
- Pre-filled from complaint description
- Editable text area
- Required field

**B. LABOR Section**
- Dynamic table with rows:
  - EMPLOYEE (name)
  - TYPE (Journeyman/Apprentice)
  - HRS (hours worked)
  - RATE (hourly rate)
  - AMOUNT (auto-calculated: HRS × RATE)
- Add/Remove rows functionality
- Total calculated automatically

**C. MATERIAL Section**
- Dynamic table with rows:
  - DESCRIPTION (material name)
  - QTY (quantity)
  - UNIT PRICE (price per unit)
  - AMOUNT (auto-calculated: QTY × UNIT PRICE)
- Add/Remove rows functionality
- Total calculated automatically

**D. OTHER Section**
- Dynamic table for other charges:
  - DESCRIPTION (charge name)
  - QTY (quantity, default: 1)
  - UNIT PRICE (price)
  - AMOUNT (auto-calculated: QTY × UNIT PRICE)
- Examples: Vehicle charge, Locate fee, Permit
- Add/Remove rows functionality
- Total calculated automatically

**E. Tax Rate**
- Input field (default: 7%)
- Applied to subtotal

**F. Summary**
- Subtotal (Labor + Materials + Other)
- Tax (Subtotal × Tax Rate %)
- Total (Subtotal + Tax)
- Auto-calculated and displayed

#### 3. **Submitting Invoice**

```
User clicks "Generate & Download PDF"
    ↓
Frontend validates:
    - Work description required
    - At least one item in any section
    ↓
Prepares data:
    {
      complaintId: "...",
      workDescription: "...",
      labor: [{ employee, type, hours, rate, amount }],
      materials: [{ description, quantity, unitPrice, amount }],
      otherCharges: [{ description, quantity, unitPrice, amount }],
      taxRate: 7.0
    }
    ↓
POST /api/contractor/invoice/generate
    (responseType: 'blob')
```

#### 4. **Backend Processing**

```
Backend receives request
    ↓
Validates:
    1. User is contractor
    2. Complaint exists
    3. Contractor is assigned to complaint
    ↓
Fetches complaint with populated data:
    - User (complainant)
    - AssignedOfficer (with municipalOffice)
    - AssignedContractor
    ↓
Gets contractor info:
    - Company name
    - Address, phone, email
    ↓
Gets municipal office info (Bill To):
    - Office name
    - Address, phone, email
    ↓
Calculates totals:
    - Labor total
    - Materials total
    - Other total
    - Subtotal
    - Tax
    - Total
    ↓
Generates invoice number: INV-{timestamp}
    ↓
(Optional) Calls OpenAI:
    - Generates professional invoice summary
    - Uses GPT-3.5-turbo
    - Falls back gracefully if fails
    ↓
Creates PDF using PDFKit:
    1. Initialize PDFDocument
    2. Set up buffer chunks collector
    3. Add header (company info)
    4. Add invoice details (number, date)
    5. Add Bill To section
    6. Add Work Description
    7. Add LABOR table (if items exist)
    8. Add MATERIAL table (if items exist)
    9. Add OTHER table (if items exist)
    10. Add Summary (Subtotal, Tax, Total)
    11. Add Footer ("Thank you for your business")
    12. Finalize PDF
    ↓
Combines buffer chunks
    ↓
Sends PDF as response:
    - Content-Type: application/pdf
    - Content-Disposition: attachment
    - Content-Length: buffer size
```

#### 5. **PDF Generation Details**

**PDFKit Process:**
```javascript
// Create PDF document
const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

// Collect chunks in memory
const pdfChunks = [];
doc.on('data', (chunk) => pdfChunks.push(chunk));

// Add content
doc.fontSize(20).font('Helvetica-Bold').text(companyName, 50, 50);
// ... more content ...

// Finalize
doc.end();

// Wait for completion
await new Promise((resolve) => {
  doc.on('end', resolve);
});

// Combine chunks
const pdfBuffer = Buffer.concat(pdfChunks);

// Send response
res.setHeader('Content-Type', 'application/pdf');
res.send(pdfBuffer);
```

#### 6. **Frontend Download**

```
Receives PDF blob response
    ↓
Creates Blob object
    ↓
Creates temporary URL
    ↓
Creates download link
    ↓
Programmatically clicks link
    ↓
PDF downloads to user's computer
    ↓
Cleans up temporary URL
    ↓
Shows success toast
```

### Invoice Format (Matches Template)

```
┌─────────────────────────────────────────────────┐
│ [Company Name]              Work Order/Invoice │
│ [Address]                    Invoice #: INV-... │
│ Phone: ...                   Date: MM/DD/YYYY  │
│ Email: ...                                      │
├─────────────────────────────────────────────────┤
│ BILL TO                                        │
│ [Municipal Office Name]                        │
│ [Address]                                      │
│ Phone: ...                                     │
│ Email: ...                                     │
├─────────────────────────────────────────────────┤
│ Work Description                               │
│ [Description text]                            │
├─────────────────────────────────────────────────┤
│ LABOR                                          │
│ EMPLOYEE | TYPE | HRS | RATE | AMOUNT          │
│ [Rows...]                                      │
│ TOTAL: $XXX.XX                                 │
├─────────────────────────────────────────────────┤
│ MATERIAL                                       │
│ DESCRIPTION | QTY | UNIT PRICE | AMOUNT         │
│ [Rows...]                                      │
│ TOTAL: $XXX.XX                                 │
├─────────────────────────────────────────────────┤
│ OTHER                                          │
│ DESCRIPTION | QTY | UNIT PRICE | AMOUNT        │
│ [Rows...]                                      │
│ TOTAL: $XXX.XX                                 │
├─────────────────────────────────────────────────┤
│ SUBTOTAL: $XXX.XX                              │
│ TAX RATE %: X%                                 │
│ TAX: $XX.XX                                    │
│ TOTAL: $XXX.XX                                 │
├─────────────────────────────────────────────────┤
│ THANK YOU FOR YOUR BUSINESS!                   │
└─────────────────────────────────────────────────┘
```

### API Endpoint

```
POST /api/contractor/invoice/generate

Request Body:
{
  complaintId: "ObjectId",
  workDescription: "string",
  labor: [
    {
      employee: "string",
      type: "string",
      hours: number,
      rate: number,
      amount: number
    }
  ],
  materials: [
    {
      description: "string",
      quantity: number,
      unitPrice: number,
      amount: number
    }
  ],
  otherCharges: [
    {
      description: "string",
      quantity: number,
      unitPrice: number,
      amount: number
    }
  ],
  taxRate: number
}

Response:
- Content-Type: application/pdf
- Binary PDF data (blob)
```

### Data Flow Diagram

```
┌──────────────────┐
│ Contractor        │
│ Fills Form       │
│ (Labor, Mat,     │
│  Other, Tax)     │
└────────┬─────────┘
         │
         │ POST /api/contractor/invoice/generate
         │ { complaintId, workDescription, labor, materials, otherCharges, taxRate }
         ↓
┌──────────────────┐
│ Backend API      │
│                  │
│ 1. Validate      │
│ 2. Get complaint │
│ 3. Get contractor│
│    & office info │
│ 4. Calculate     │
│    totals        │
└────────┬─────────┘
         │
         │ (Optional)
         ↓
┌──────────────────┐
│ OpenAI API       │
│                  │
│ Generate         │
│ professional     │
│ summary          │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ PDFKit           │
│                  │
│ Generate PDF     │
│ in memory        │
│ (buffer chunks)  │
└────────┬─────────┘
         │
         │ PDF Buffer
         ↓
┌──────────────────┐
│ Response         │
│ (application/pdf)│
└────────┬─────────┘
         │
         │ Blob download
         ↓
┌──────────────────┐
│ Contractor       │
│ Downloads PDF    │
└──────────────────┘
```

---

## 🔄 Complete System Architecture

### Port Configuration

```
User Portal:
  - Frontend: http://localhost:5173
  - Backend: http://localhost:5000

Municipal Portal:
  - Frontend: http://localhost:5173 (same as user)
  - Backend: http://localhost:8000

Contractor Portal:
  - Frontend: http://localhost:5174
  - Backend: http://localhost:8001
```

### Database Structure

```
MongoDB (civicfix)
├── users (User model)
│   ├── Regular users
│   ├── Municipal officers (with municipalOffice ref)
│   └── Contractors (with contractorInfo)
├── complaints (Complaint model)
│   ├── References: user, assignedOfficer, assignedContractor
│   ├── Geospatial: geoLocation (2dsphere index)
│   └── Status history
├── messages (Message model)
│   ├── References: sender, receiver, complaint
│   └── Attachments array
├── municipaloffices (MunicipalOffice model)
│   ├── Geospatial: location (2dsphere index)
│   └── Contact info
├── contractors (Contractor model)
│   └── References: user
└── notifications (Notification model)
    └── References: user, complaint
```

### Authentication Flow

```
1. User logs in
   ↓
2. Backend validates credentials
   ↓
3. Generates JWT token
   ↓
4. Returns token + user data
   ↓
5. Frontend stores token in localStorage
   ↓
6. All API requests include token in Authorization header
   ↓
7. Backend middleware validates token
   ↓
8. Grants/denies access based on role
```

### Real-time Updates

**Chat:**
- Frontend polls every 3 seconds
- GET /api/chat/:complaintId
- Updates message list automatically

**Complaints List:**
- Municipal dashboard polls every 10 seconds
- GET /api/municipal/complaints
- Updates unread message counts

---

## 📝 Key Features

### Chat Features
- ✅ Real-time message exchange
- ✅ File attachments (images, documents)
- ✅ Read status tracking
- ✅ Auto-scroll to latest messages
- ✅ Date/time stamps
- ✅ Message history persistence

### Invoice Features
- ✅ Professional PDF generation
- ✅ Dynamic form with add/remove rows
- ✅ Auto-calculation of amounts and totals
- ✅ Tax calculation
- ✅ Matches professional invoice template
- ✅ Automatic download
- ✅ OpenAI-powered content (optional)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation
```bash
# Backend
cd backend
npm install

# Frontend (User/Municipal)
cd frontend
npm install

# Frontend (Contractor)
cd frontend-contractor
npm install
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/civicfix
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-... (optional)
EMAILJS_SERVICE_ID=... (optional)
EMAILJS_TEMPLATE_ID=... (optional)
EMAILJS_PUBLIC_KEY=... (optional)
EMAIL_JS_PRIVATE_KEY=... (optional)
```

### Running the Application
```bash
# Backend servers
npm run dev:user        # Port 5000
npm run dev:municipal   # Port 8000
npm run dev:contractor  # Port 8001

# Frontend
npm run dev             # User/Municipal (Port 5173)
cd frontend-contractor && npm run dev  # Contractor (Port 5174)
```

---

## 📚 Additional Resources

- **MongoDB Geospatial Queries**: Used for finding complaints within jurisdiction
- **JWT Authentication**: Secure token-based authentication
- **Multer File Uploads**: Handles chat file attachments
- **PDFKit Documentation**: https://pdfkit.org/
- **OpenAI API**: https://platform.openai.com/docs
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors

---

*Last Updated: [Current Date]*

