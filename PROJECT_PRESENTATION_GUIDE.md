# CivicFix Project Presentation Guide

Use this as a speaking guide rather than reading every section word for word. Replace any personal/team details as needed.

## 1. Short opening (about 30 seconds)

> Good morning. Our project is CivicFix, a civic issue reporting and resolution platform. It connects citizens who report local problems with municipal officers who review and manage those reports, and contractors who can carry out assigned work.
>
> The goal is to make the process more organized and transparent: citizens can submit a report with its location and photos, officers can review and assign it, contractors can coordinate with officers, and the complaint status can be followed through the system.

## 2. Project workflow (about 1 minute)

> First, a citizen registers or signs in and submits a complaint by choosing a category, describing the problem, adding its location, and optionally attaching photos. The backend validates the request and saves the complaint in MongoDB with an initial status and a status-history entry.
>
> Municipal officers use a separate portal to review complaints in their jurisdiction. They can inspect complaint details and location, update the complaint, and assign work to an eligible contractor. The system can flag possible duplicates or unusually high reporting volume for human review; those signals are not an automatic decision that a report is fake.
>
> Contractors use their own portal to see work assigned to them, communicate with the officer, and submit a quotation. The officer can review the quotation and manage the work status. Citizens can return to their dashboard to follow the complaint and receive notifications when there are updates.

## 3. Architecture explanation

> Architecturally, CivicFix is a three-portal web application. There is a React frontend for citizens, a separate React frontend for municipal officers, and another for contractors. Each portal talks to Express API routes for its role. The backend processes use a shared MongoDB database, so the complaint and assignment information remains connected across the portals.
>
> Within the backend, routes receive requests, middleware handles concerns such as authentication and uploaded files, controllers implement the application workflow, and Mongoose models define and query the stored data. The frontend calls the APIs using Axios and uses protected routes to restrict portal pages to authenticated users.
>
> The portals have separate frontend and backend entry points, but they are not three independent databases or a claim of a microservices architecture. They share core data in MongoDB.

### Architecture at a glance

```text
Citizen React app         Municipal React app        Contractor React app
       |                           |                           |
       +---------- HTTP / JSON API requests ------------------+
                                   |
                Express API processes by portal/role
          (authentication, routes, middleware, controllers)
                                   |
                              Mongoose
                                   |
                         Shared MongoDB database
```

### Main data handled by the system

- **Users and roles:** citizens, municipal officers, and contractors.
- **Complaints:** category, description, images, coordinates, priority, status, assignments, and status history.
- **Municipal offices:** officer/office relationship and jurisdiction information.
- **Notifications:** complaint-related updates for users.
- **Quotations and chat:** contractor proposals and communication connected to assigned complaints.

## 4. Technology stack and why we chose it

| Area | Technology | Why it fits CivicFix |
|---|---|---|
| Frontend language | JavaScript with JSX | The team can use the same language across the frontend and backend, reducing context switching. |
| User interfaces | React | Component-based UI works well for separate dashboards, forms, maps, and reusable interface elements. |
| Frontend development/build | Vite | Provides a quick development server and builds the frontend assets for deployment. |
| Browser navigation | React Router | Supports portal pages, dashboards, and protected routes without full-page navigation for every view. |
| API calls | Axios | Gives the portals a consistent way to send requests to the backend and handle responses. |
| Backend runtime/framework | Node.js and Express | JavaScript on the server and a lightweight route/middleware model suit the API-based application. |
| Database | MongoDB | Complaint records contain related but variable data such as status history, photos, review flags, and location details. |
| Database integration | Mongoose | Defines schemas, validation, references, and common database operations for MongoDB. |
| Authentication | JSON Web Tokens (JWT) and bcryptjs | JWTs support authenticated API requests; bcryptjs hashes passwords before storage. |
| Upload handling | Multer | Handles multipart form uploads, such as complaint photos and chat attachments. |
| Styling and UI utilities | Tailwind CSS, Lucide React, react-hot-toast | Tailwind supports responsive styling; Lucide provides icons; toast messages give quick user feedback. |
| Maps | Leaflet and React-Leaflet; browser geolocation is used for location capture | Helps users provide a location and officers inspect/map complaints. |

### How to answer “Why this stack and not another one?”

> There are many valid ways to build this system; this is the stack we selected because it fits the project rather than because it is the only possible stack. React supports the three role-specific interfaces, while Node.js and Express let us build the APIs in JavaScript as well. MongoDB fits the evolving complaint records, and Mongoose gives us structure and validation on top of it. The stack is familiar, has a strong ecosystem, and is practical for a student project that needs to be developed and demonstrated quickly.

## 5. Advantages of the chosen stack

- **One main programming language:** JavaScript is used on both sides of the application.
- **Clear separation of responsibilities:** React handles the user interface; Express handles API requests and workflow; MongoDB stores application data.
- **Good fit for changing workflows:** complaint statuses, histories, review indicators, and attachments are straightforward to represent as document data.
- **Reusable interface pieces:** React components and shared UI patterns reduce duplication across screens.
- **Location-aware features:** coordinates and geospatial data support map views and jurisdiction-based complaint handling.
- **Room to grow:** each portal can be built and deployed separately while sharing the same core records.
- **Fast feedback during development:** Vite and the Node.js ecosystem make local development and iteration convenient.
- **Accessible ecosystem:** the libraries are widely used and have documentation and community support.

## 6. Likely questions and concise answers

### “What problem does CivicFix solve?”

> It gives citizens, municipal officers, and contractors one connected workflow for reporting, reviewing, assigning, and tracking local civic issues.

### “Why have three portals?”

> Each role has different tasks and information needs. Separate portals make those workflows and interfaces clearer, while the APIs and shared database keep the work connected.

### “What happens after a citizen submits a complaint?”

> The API validates the submission, stores it with its location and initial status, and creates a notification. An officer can then review it, update it, and assign the work when appropriate.

### “How is complaint status tracked?”

> The complaint record stores its current status and a status history. The user dashboard reads the complaint through the API and presents its progress.

### “How do you handle fake or duplicate reports?”

> The system can flag possible duplicates or high reporting volume for officer attention. An officer makes the decision. A review flag alone does not mean that the report is fake or automatically penalize the citizen.

### “Is the messaging real-time?”

> The officer-contractor chat refreshes by polling the API periodically. It is near-live for the user, but it is not implemented with WebSockets.

### “Why MongoDB instead of a relational database?”

> MongoDB was selected because the complaint and workflow records include flexible nested information such as location, attachments, and status history. A relational database could also support this system; MongoDB is the choice made for this implementation.

### “What would you improve next?”

> I would focus on deployment and operational readiness: stronger automated tests, centralized error monitoring, managed storage for uploaded files, and a more scalable notification approach. I would also review role permissions and accessibility as the product grows.

## 7. Suggested live demo sequence

1. Show the citizen portal and sign in.
2. Submit a sample issue with a category, description, location, and optional photo.
3. Show the submitted issue and its status in the citizen dashboard.
4. Sign in to the municipal portal and show how an officer reviews and assigns the complaint.
5. Show the contractor portal with the assigned work, then demonstrate a quotation or the officer-contractor chat.
6. Return to the citizen view and explain how status updates and notifications close the loop.

Use test accounts and sample data for the demo. Do not display real credentials or private user information.

## 8. Important accuracy notes

- Say **three role-based portals backed by role-specific API processes and a shared MongoDB database**. Do not describe the system as microservices unless it is redesigned as independently deployable services with service boundaries.
- Say **polling-based chat**, not WebSocket or instant push messaging.
- Treat duplicate/high-volume flags as **review signals**, not automated fraud judgments.
- If asked about reporting integrity, explain that an officer-confirmed fake complaint adds 3 demerit points and deducts up to 3 reward points; an officer's first verification of a genuine complaint awards 5 reward points. A user's third confirmed fake complaint freezes their account for 7 days. See [DEMERIT_POINTS_AND_ACCOUNT_BLOCKING.md](./DEMERIT_POINTS_AND_ACCOUNT_BLOCKING.md).
- The older top-level [README.md](./README.md) describes an earlier, smaller user-portal scope. For the current three-portal architecture, use the implementation and this guide rather than repeating claims that the other portals are future enhancements.
