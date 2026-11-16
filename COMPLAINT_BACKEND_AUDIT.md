# CIVIFIX Complaint Backend Audit

> **Implementation update:** This report captures the pre-integration audit. Since then, mobile complaint creation, mobile list/detail retrieval, the additive complaint category values, and optional `title`/`additionalInfo` fields have been implemented. The API contract is documented in [API_ENDPOINTS_DOCUMENTATION.md](./API_ENDPOINTS_DOCUMENTATION.md). The detailed findings below remain a historical snapshot and should not be read as the current implementation state; hosted deployment and physical-device behavior still require verification.

**Scope:** Read-only inspection of the current complaint schema, Citizen API, authentication, ImageKit upload path, web/mobile clients, and Officer/Contractor workflow. No application code, configuration, dependencies, or database records were changed for this audit.

**Status labels:** **IMPLEMENTED** means confirmed in the inspected source; **PARTIALLY IMPLEMENTED** means source exists but has gaps or is not wired end-to-end; **NOT IMPLEMENTED** means no supporting implementation was found in the inspected routes/models; **NEEDS VERIFICATION** means behavior depends on deployment/runtime configuration or could not be established from source alone.

## 1. Project architecture overview

- **IMPLEMENTED — Citizen API:** `backend/server-user.js` mounts the user authentication and complaint routers under `/api/auth` and `/api/complaints`. It uses `PORT`/`USER_PORT` with a default of `5000`, and binds to `0.0.0.0`. `backend/server.js` also mounts the same `routes/user/*` routers; its package script is the general `start` entry point.
- **IMPLEMENTED — Citizen web portal:** `frontend/src/pages/ReportIssue.jsx` posts complaints through `frontend/src/services/user/api.js`. Its default API base is `http://localhost:5000/api`.
- **PARTIALLY IMPLEMENTED — Mobile app:** Authentication and complaint-list retrieval are connected to the API. A `complaintService.create` method and multipart helper exist, but the four-step report flow currently ends on the photo screen with a message that submission will be added later. No screen calls the create method.
- **IMPLEMENTED — Municipal API:** `backend/server-municipal.js` mounts `/api/municipal` and related routes on the municipal service (default port `8000`).
- **IMPLEMENTED — Contractor API:** `backend/server-contractor.js` mounts `/api/contractor`, chat, and quotation routes on the contractor service (default port `8001`).
- **NEEDS VERIFICATION — Deployment topology:** The three server entry points use the same configured MongoDB URI by default, but which process(es) are deployed and which URI each uses must be verified in the target environment.

The mobile API's configurable base URL is in `mobile-app/constants/config.js`; it reads `EXPO_PUBLIC_API_URL` and otherwise falls back to the hosted Citizen API. Do not copy secrets into Expo public environment variables.

## 2. Complaint MongoDB schema

**IMPLEMENTED** in [`backend/models/Complaint.js`](./backend/models/Complaint.js), model name `Complaint`, with Mongoose timestamps enabled (`createdAt`, `updatedAt`) and a `2dsphere` index on `geoLocation`.

| Schema field | Type / constraints | Required/default behavior |
|---|---|---|
| `user` | ObjectId, ref `User` | Required; identifies the citizen who submitted it |
| `category` | String enum: `road`, `drainage`, `electricity`, `garbage`, `water`, `streetlight`, `parks`, `other` | Required |
| `description` | String, trimmed | Required |
| `images` | Array of subdocuments with `url: String`, `publicId: String` | Optional; no subfield is marked required |
| `location.latitude` | Number | Required |
| `location.longitude` | Number | Required |
| `location.address` | String, trimmed | Optional |
| `geoLocation.type` | String enum `Point` | Defaults to `Point` |
| `geoLocation.coordinates` | Number array | Optional in the schema; pre-save hook derives `[longitude, latitude]` when both location values are truthy |
| `status` | String enum: `Submitted`, `Verified`, `Assigned`, `In-progress`, `Completed`, `Closed`, `Field-verification` | Defaults to `Submitted` |
| `requiresReview` | Boolean, indexed | Defaults to `false` |
| `reviewFlags` | Array: `type` enum `possible_duplicate`/`high_volume`, optional `message`, `relatedComplaint` ObjectId ref `Complaint`, and `distanceMeters` Number | Optional |
| `isFake` | Boolean | Defaults to `false` |
| `verificationRewardAwarded` | Boolean | Defaults to `false` |
| `closedReason` | String enum: `fake`, `duplicate`, `other` | Optional |
| `fakeReason` | String enum: `fabricated_issue`, `misleading_information`, `unrelated_photo`, `incorrect_location`, `other` | Optional |
| `fakeRemarks` | String, trimmed | Optional |
| `markedFakeBy` | ObjectId, ref `User` | Optional |
| `markedFakeAt` | Date | Optional |
| `duplicateOf` | ObjectId, ref `Complaint` | Optional |
| `fieldVerification` | Embedded object: `status` enum `none`/`pending`/`completed` (default `none`), `instructions`, `assignedAt`, `assignedBy` ObjectId ref `User`, `result` enum `issue_exists`/`issue_not_found`/`unable_to_access`, `remarks`, `photoUrl`, `latitude`, `longitude`, `distanceFromReportMeters`, `submittedAt`, `submittedBy` ObjectId ref `User` | Optional fields; only nested `status` has a default |
| `statusHistory` | Array of `{ status: String, updatedAt: Date, updatedBy: String, note: String }` | `updatedAt` defaults to `Date.now`; a pre-save hook adds the initial status on creation |
| `assignedOfficer` | ObjectId, ref `User` | Optional |
| `assignedContractor` | ObjectId, ref `User` | Optional |
| `priority` | String enum `low`/`medium`/`high`/`urgent` | Defaults to `medium` |
| `deadline` | Date | Optional |

### Fields required by the existing create flow

The actual user controller requires `category`, `description`, `latitude`, and `longitude` in the multipart request; `user` is derived from the verified JWT. The schema requires `user`, `category`, `description`, `location.latitude`, and `location.longitude`. Address and images are optional. The controller explicitly sets `status: 'Submitted'`.

**NOT IMPLEMENTED in the backend schema:** `title` and `additionalInfo` do not exist on `Complaint`. The Citizen web form does not collect a separate title. An extra `letter` field is posted by the web UI, but the create controller does not read or persist it.

**Validation caveat:** The controller checks `!latitude || !longitude`, so a valid coordinate equal to zero is treated as missing. It parses coordinates with `parseFloat`; invalid numeric text reaches Mongoose and is caught as a 500 rather than returned as a structured validation 400.

## 3. Existing complaint API endpoints

### Citizen complaint endpoints

The active user router is [`backend/routes/user/complaintRoutes.js`](./backend/routes/user/complaintRoutes.js), mounted by `backend/server-user.js` at `/api/complaints`. Creation uses `backend/controllers/user/complaintController.js`.

| Method and route | Middleware / controller | Request | Success response | Errors observed in source |
|---|---|---|---|---|
| `POST /api/complaints` | `protect`, `requireActiveCitizen`, `upload.array('images', 5)`, `createComplaint` | `multipart/form-data`; required text fields `category`, `description`, `latitude`, `longitude`; optional `address`; repeat `images` file field up to 5 times | HTTP 201: `{ success, message, data: { complaint, requiresReview, reviewFlags, reviewNotice } }` | 400 for missing required request fields; 401 missing/invalid JWT; 403 for blocked citizen; 500 on controller/storage/database errors. Multer rejects invalid files, oversized files, or excess count, but the user server has no route-specific Multer error response formatter. |
| `GET /api/complaints/my` | `protect`, `getMyComplaints` | No body | HTTP 200: `{ success, count, data: { complaints } }` | 401; 500 on query failure |
| `GET /api/complaints/:id` | `protect`, `getComplaint` | Complaint ID path parameter | HTTP 200: `{ success, data: { complaint } }` | 401; 403 if a citizen requests another citizen's complaint; 404 if missing; 500 on query failure |

`GET /:id` allows the owner, or a request whose role is `officer`/`contractor`, to read a complaint. The route itself uses `protect`, not a role-specific `authorize` middleware.

### Municipal complaint workflow endpoints

The current municipal router is [`backend/routes/municipal/municipalRoutes.js`](./backend/routes/municipal/municipalRoutes.js), mounted at `/api/municipal`. Router-wide middleware requires a JWT and `MUNICIPAL_OFFICER`.

| Method and route | Controller / purpose | Request fields | Success / notable errors |
|---|---|---|---|
| `GET /api/municipal/complaints` | `getComplaints`; jurisdiction-filtered list | Query: `status`, `category`, `page` (default 1), `limit` (default 20), `review` | 200 with `{ success, data: { complaints, pagination } }`; 403 if officer/office is unavailable; 500 on query failure |
| `GET /api/municipal/complaints/:id` | `getMunicipalComplaint`; complaint plus review payload | ID | 200 `{ success, data: payload }`; shared auth/jurisdiction errors and 404/500 through the helper/controller |
| `PUT /api/municipal/complaints/:id/verify` | `verifyComplaint`; verify or reject | JSON `{ action: 'verify'|'reject', reason? }` | 200 with complaint (and reward when relevant); 400 invalid action; 403 outside jurisdiction; 404 missing; 500 |
| `PUT /api/municipal/complaints/:id/duplicate` | `markComplaintDuplicate` | JSON `{ duplicateOf?, reason? }` | 200 with closed complaint; 500 on failure |
| `PUT /api/municipal/complaints/:id/field-verification` | `startFieldVerification` | JSON `{ instructions? }` | 200; 400 unless status is `Submitted` or already `Field-verification`; 500 |
| `PUT /api/municipal/complaints/:id/field-verification/submit` | `submitFieldVerification` | `multipart/form-data`; required `result` (`issue_exists`, `issue_not_found`, or `unable_to_access`), optional `remarks`, `latitude`, `longitude`, and one `photo` | 200; 400 invalid result; 500 on failure. Photo uses the shared upload middleware and image-storage helper. |
| `PUT /api/municipal/complaints/:id/fake` | `markComplaintFake` | JSON `{ fakeReason, remarks }` | 200 with complaint and penalty; 400 if already fake, reason is invalid, or remarks are blank; 404 reporter missing; 500 |
| `PUT /api/municipal/complaints/:id/assign` | `assignContractor` | JSON `{ contractorId, deadline? }` | 200 with complaint; 400 missing contractor ID; 403 outside jurisdiction; 404 complaint/contractor missing; 500 |
| `PUT /api/municipal/complaints/:id/status` | `updateComplaintStatus` | JSON `{ status, note? }` | 200 with complaint; 400 invalid status; 403 outside jurisdiction; 404 missing; 500 |
| `PUT /api/municipal/complaints/:id/close` | `closeComplaint` | JSON `{ note? }` | 200 with closed complaint; 400 unless current status is `Completed`; 403 outside jurisdiction; 404 missing; 500 |

All municipal routes also return 401 for missing/invalid tokens and 403 for a non-municipal-officer role. Successful mutation handlers generally return `{ success, message, data: { complaint } }`, with additional data for review, field checks, or penalties where noted.

### Contractor and citizen status retrieval

- **IMPLEMENTED:** `GET /api/contractor/complaints` is mounted by `backend/server-contractor.js` and returns complaints assigned to the authenticated eligible contractor. It has no request body and returns `{ success, data: { complaints } }`; route middleware requires a contractor role and eligible verification status.
- **IMPLEMENTED:** `GET /api/complaints/my` and `GET /api/complaints/:id` return citizen status and `statusHistory`.
- **NOT IMPLEMENTED:** No contractor complaint status-update route was found in `backend/routes/contractor/contractorRoutes.js`; contractor chat and quotation routes do not update complaint status. Municipal officers have the status-update endpoint.

There is a duplicate top-level `backend/routes/complaintRoutes.js` and `backend/controllers/complaintController.js`. The inspected `server.js` and `server-user.js` import `routes/user/complaintRoutes.js`, not this top-level duplicate. Treat the user-controller route as the operative Citizen endpoint unless a different deployment entry point is verified.

### Related notification, chat, and quotation endpoints

These are adjacent to complaint follow-up, but they do not create complaints or provide a Contractor status-update API.

| Method and route | Access / request | Success | Main errors |
|---|---|---|---|
| `GET /api/notifications/user` | `protect`; no body | 200 `{ success, data: { notifications, unreadCount } }` | 401, 500 |
| `PUT /api/notifications/:id/read` | `protect`; notification ID | 200 with updated notification | 401, 403 if not owned, 404, 500 |
| `PUT /api/notifications/read-all` | `protect`; no body | 200 success message | 401, 500 |
| `GET /api/contractor/notifications` | Contractor router auth/eligibility; no body | 200 `{ success, data: { notifications } }` | 401, 403, 500 |
| `GET /api/chat/:complaintId` | Contractor/Municipal Officer JWT; complaint ID | 200 `{ success, data: { messages } }` | 401, 403 if wrong role/assignment, 404, 500 |
| `POST /api/chat/:complaintId` | Contractor/Municipal Officer JWT; multipart `message` and up to five `files` | 201 `{ success, data: { message } }` | 401, 403, 404, 500; upload middleware rejects unsupported/oversized files |
| `PUT /api/chat/:complaintId/read` | Contractor/Municipal Officer JWT; complaint ID; no body | 200 success message | 401, 403 for wrong role, 500 |
| `GET /api/quotation` (contractor server) | Eligible contractor JWT; no body | 200 `{ success, data: { quotations } }` | 401, 403, 500 |
| `POST /api/quotation` (contractor server) | Eligible contractor JWT; multipart text fields `complaintId`, `workDescription`, optional `labor`, `material`, `other`, `taxRate`, `pdfUrl`, `quotationNumber`, and optional `contractorSignature` file | 201 `{ success, data: { quotation } }` | 400 missing required fields/assigned officer; 403 wrong contractor/assignment; 404 complaint missing; 409 duplicate quotation; 500 |
| `GET /api/quotation/:quotationId` (contractor server) | Eligible contractor JWT; quotation ID | 200 `{ success, data: { quotation } }` | 401, 403 not owner, 404, 500 |
| `GET /api/quotation` and `GET /api/quotation/:quotationId` (municipal server) | `MUNICIPAL_OFFICER` JWT; no body / quotation ID | Returns quotation data for the officer's municipal office | 401, 403 outside office, 404, 500 |
| `POST /api/quotation/:quotationId/approve` or `/reject` (municipal server) | `MUNICIPAL_OFFICER` JWT; reject accepts optional JSON `{ reason }` | Returns updated quotation and message | 401, 403 outside office, 404, 400 unless quotation is `submitted`, 500 |

Contractor and Municipal quotation routes use the same path under separate server processes, so the base URL/port determines which router handles them. Chat attachments use `uploadChat` (memory storage, up to five files, 10 MiB each; image/PDF/document formats). These endpoints support communications and procurement, not complaint progress-state mutation.

## 4. Authentication and JWT implementation

- **Login:** `POST /api/auth/login` (`backend/routes/user/authRoutes.js` → `backend/controllers/user/authController.js`); JSON `{ email, password }`.
- **Registration:** `POST /api/auth/signup`; JSON `{ name, email, phone, password }`.
- **Current user:** `GET /api/auth/me`; requires `protect`.
- **JWT creation:** `generateToken` signs `{ id }` with `JWT_SECRET`, expiring after `JWT_EXPIRE` or `30d`.
- **JWT verification:** `backend/middleware/authMiddleware.js` reads `Authorization: Bearer <token>`, verifies it, loads `User` by decoded ID, and places the user on `req.user` without the password. Missing/invalid token returns 401; account-block checks can return 403.
- **Citizen web token storage:** `frontend/src/context/AuthContext.jsx` stores the token as `localStorage['token']`. `frontend/src/services/user/api.js` attaches it as a Bearer token and removes it on 401.
- **Mobile token storage:** `mobile-app/context/AuthContext.jsx` stores it through Expo SecureStore using helpers in `mobile-app/services/api.js`; the Axios request interceptor attaches the Bearer token.
- **Response shape:** Login/signup return the token inside `data.token` with user data in `data.user`.

**PARTIALLY IMPLEMENTED — Citizen-only enforcement:** The complaint POST uses `requireActiveCitizen`, but that middleware only applies the block check when `req.user.role === 'user'`; other roles pass through. The Citizen server is intended for this flow, but this middleware is not itself a strict `user`-role authorization check.

**Mobile security recommendation:** Reuse the existing login/token flow; keep the token in SecureStore and send only `Authorization: Bearer <token>` over HTTPS in production. Never put JWT signing secrets, database credentials, or ImageKit private credentials in `EXPO_PUBLIC_*` variables or the app bundle.

## 5. Existing ImageKit configuration

**PARTIALLY IMPLEMENTED — Backend ImageKit client:** [`backend/utils/imageStorage.js`](./backend/utils/imageStorage.js) imports the `imagekit` package and lazily initializes `new ImageKit({ publicKey, privateKey, urlEndpoint })`.

- Package in `backend/package.json`: `imagekit` `^6.0.0` (lockfile resolves `6.0.0`).
- Configuration names: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`.
- The helper loads `backend/.env`; actual values are intentionally not included in this report.
- `IMAGEKIT_PRIVATE_KEY` is consumed only by this server helper in the inspected source.
- The backend package also lists `cloudinary`, but no Cloudinary SDK integration was found in the complaint image flow. The `Complaint.images[].publicId` schema comment says “For Cloudinary” and is stale relative to the ImageKit helper.

If ImageKit credentials are absent or placeholder-like, `isImageKitConfigured()` returns false and the storage helper uses local disk. Confirm actual production configuration and storage persistence separately.

## 6. Existing ImageKit upload flow

**IMPLEMENTED — Backend receives and stores complaint images** through `backend/middleware/uploadMiddleware.js`, `backend/routes/user/complaintRoutes.js`, `backend/controllers/user/complaintController.js`, and `backend/utils/imageStorage.js`.

1. Multer uses `memoryStorage()`.
2. Complaint route accepts `upload.array('images', 5)`.
3. Each image must have an allowed image extension and MIME matching the JPEG/JPG, PNG, GIF, or WEBP expressions. Per-file limit is 5 MiB. No total request size is set in this middleware.
4. The controller calls `saveUploads(req.files || [], 'complaints')`.
5. If ImageKit is configured, the helper base64-encodes the in-memory buffer server-side and calls ImageKit with a unique filename and folder `/civicfix/complaints`. It uses the returned `url` and `fileId`.
6. If ImageKit is not configured, an upload errors, or no usable URL is returned, the helper falls back to a local `backend/uploads` path and returns a `/uploads/...` URL. The user/municipal/contractor servers serve that directory statically.
7. The complaint controller stores only `{ url, publicId }` in each image subdocument. It does not persist original filename, MIME type, dimensions, or file size. The helper's `originalName` return property is discarded by the controller.
8. The Citizen web portal sends image files to the backend as multipart data; it does not upload directly to ImageKit. No direct ImageKit upload-signature API is present in the inspected complaint flow.

**Not found:** backend image transformation/compression settings, a separate ImageKit upload API for mobile, image delete/retention handling, or metadata persistence. The mobile app currently compresses locally in `mobile-app/services/complaintImages.js` (1600-pixel maximum side, JPEG quality `0.82`), but does not check the resulting output size against the backend's 5 MiB limit. Compression does not guarantee a file will be below that limit.

Image display in the web client uses full URLs as-is and prefixes relative `/uploads/...` paths with a local backend URL. Mobile has `resolveImageUrl()` in `mobile-app/constants/config.js`, which supports a full CDN URL or configured uploads base for relative paths.

## 7. Citizen web complaint submission flow

**IMPLEMENTED** in [`frontend/src/pages/ReportIssue.jsx`](./frontend/src/pages/ReportIssue.jsx), `submitComplaint()`:

- The user selects one of the backend's eight enum categories and enters a description, address, coordinates, and up to five images. The web form does not have a separate title or `additionalInfo`.
- It creates `FormData` with `category`, `description`, `latitude`, `longitude`, `address`, optional `letter`, then appends each image under the repeated `images` field.
- It calls `complaintAPI.create(submitData)` from `frontend/src/services/user/api.js`, which POSTs `/complaints` as multipart data.
- The API base is `VITE_API_URL` or `http://localhost:5000/api`; the request interceptor attaches the JWT from localStorage.
- The UI displays the backend message/review notice on success and navigates to `/dashboard`. On failure it displays the API error message or a generic failure toast. It disables the submit control while submitting.
- The backend controller ignores the submitted `letter` field; it is not part of the persisted complaint.

Example request structure based on the actual web form:

```text
POST /api/complaints
Authorization: Bearer <citizen JWT>
Content-Type: multipart/form-data

category=road
description=Large pothole near the bus stop
latitude=12.34
longitude=56.78
address=Readable address
images=<file 1>
images=<file 2>
```

`letter` may also be sent by the web UI but is ignored by the current create controller. On success, the useful complaint ID is `response.data.data.complaint._id`.

## 8. Municipal Officer workflow

**IMPLEMENTED:** New complaints are created as `Submitted`. The municipal router restricts access to `MUNICIPAL_OFFICER`; complaint list/detail endpoints filter/check the officer's municipal jurisdiction.

- `verifyComplaint` accepts `action: 'verify'` or `'reject'`. Verification changes status to `Verified` and records `assignedOfficer`; rejection closes the complaint. The newer controller also handles review signals, notifications, and verification rewards.
- `assignContractor` requires a `contractorId`, optionally accepts `deadline`, and sets `Assigned`, `assignedOfficer`, and `assignedContractor`. Assignment is a municipal officer action; there is no automatic contractor assignment based on the mobile category.
- Category is stored as the eight-value complaint enum and feeds the priority helper. Mobile `group`/`routingType` are not read by the backend.
- `updateComplaintStatus` accepts status and optional note. The current municipal controller allows any schema status value, so the API does not enforce a complete transition state machine.
- `closeComplaint` requires the complaint to be `Completed` first.
- The complaint schema has `assignedOfficer` and `assignedContractor`, but no municipal staff assignment field or distinct municipal-maintenance assignment workflow was found.

**Conclusion:** Officer review and manual contractor assignment are implemented. The source does not establish that every complaint must be verified before an officer can assign it or change its status; `assignContractor` does not enforce a prior `Verified` state. Category is descriptive/priority input, not an automatic routing rule.

## 9. Contractor workflow

**IMPLEMENTED:** `backend/routes/contractor/contractorRoutes.js` exposes `GET /api/contractor/complaints`; `backend/controllers/contractor/contractorController.js` returns complaints whose `assignedContractor` matches the authenticated contractor. Router middleware requires a contractor role and eligible contractor verification.

The backend also exposes contractor chat and quotation flows (`/api/chat/:complaintId`, `/api/quotation` in the contractor server). These support communication and quotations, not complaint status updates.

**NOT IMPLEMENTED in the inspected contractor API:** contractor-authorized complaint progress/completion mutation. The municipal officer's status route can set `In-progress` or `Completed`. Therefore the source currently places status advancement under municipal officer control, not a contractor status-update endpoint.

The Citizen side can later refresh `GET /api/complaints/my` and request `GET /api/complaints/:id`; responses include `status`, `statusHistory`, assignment references, and timestamps. Mobile already fetches the user's complaint list on its home screen through `complaintService.getMyComplaints` and refreshes on screen focus/pull-to-refresh. `complaintService.getComplaint(id)` is available, but `mobile-app/app/complaint/[id].jsx` and `mobile-app/app/(tabs)/complaints.jsx` are currently placeholders and do not render API complaint details/status history. No real-time complaint-status push channel was confirmed; refetch/polling or notification refresh would be needed for timely updates.

## 10. Mobile-to-backend field mapping

Current mobile draft: `mobile-app/state/complaintDraft.js`. Current field collection: `mobile-app/app/report/details.jsx`, `location.jsx`, and `photos.jsx`. Multipart helper/service: `mobile-app/services/api.js` and `mobile-app/services/complaintService.js`.

| Mobile draft field | Backend request / stored field | Required? | Conversion or gap |
|---|---|---:|---|
| `categoryId` | Request `category`; DB `category` | Yes | **Mismatch.** Mobile offers 30 hyphenated IDs (for example `choked-roadside-drains`); backend accepts only eight values (`road`, `drainage`, `electricity`, `garbage`, `water`, `streetlight`, `parks`, `other`). No mapping is implemented in the mobile service. Do not send `categoryName` or `routingType` as a substitute without an explicit mapping decision. |
| `categoryName` | No stored field | No | Display label only; backend has no name field |
| `group`, `routingType` | No backend fields | No | Not submitted by the current helper or persisted |
| `title` | No backend field | Mobile requires it | **Missing.** Current create helper/service does not accept or append it; model/controller do not support it |
| `description` | Request `description`; DB `description` | Yes | Matching name; mobile trims and limits to 20–500 chars; backend trims but does not specify length bounds |
| `additionalInfo` | No backend field | No | **Missing.** Not appended by helper/service or stored by the model |
| `latitude` | Request `latitude`; DB `location.latitude` and `geoLocation.coordinates[1]` | Yes | Send as text in multipart; backend parses to number. Zero value is rejected by controller truthiness validation |
| `longitude` | Request `longitude`; DB `location.longitude` and `geoLocation.coordinates[0]` | Yes | Send as text in multipart; backend parses to number. Zero value is rejected by controller truthiness validation |
| `address` | Request `address`; DB `location.address` | No | Matching value; backend defaults missing address to empty string |
| `images[]` | Repeated multipart `images`; DB `images[].url`, `images[].publicId` | No | Mobile asset is converted to `{ uri, type, name }` by the helper. Backend does not persist mobile metadata. Compressed output size is not checked against server's 5 MiB/file cap |
| Authenticated user | Derived from JWT to DB `user` | Yes | Do not send user ID from the app; backend derives it from `req.user.id` |

**Current implementation status:** `complaintService.create()` supports only `{ category, description, latitude, longitude, address, images }`; it is not called by the report screen. The photo screen's Continue action only reports that submission will come later. The home screen's list retrieval is wired.

## 11. Current backend capabilities

- **IMPLEMENTED:** Existing authenticated Citizen complaint creation at `POST /api/complaints`, including up to five multipart images.
- **IMPLEMENTED:** MongoDB creation, initial `Submitted` status/history, category priority, optional address, review flags, notification, and response complaint ID.
- **IMPLEMENTED:** ImageKit server-side uploads with local-disk fallback and image URLs returned in complaint responses.
- **IMPLEMENTED:** Citizen list/detail retrieval with status history.
- **IMPLEMENTED:** Municipal review, status updates, contractor assignment, notifications, and relevant workflow metadata.
- **PARTIALLY IMPLEMENTED:** Contractor work visibility and quotation/chat; no contractor status mutation route was found.
- **PARTIALLY IMPLEMENTED:** Mobile API config, authentication, complaint list retrieval, and multipart construction helper exist, but the report flow does not submit and mobile categories do not match the backend enum.
- **NOT IMPLEMENTED:** Persisted mobile title and additional information fields.

## 12. Missing or incomplete functionality

1. **PARTIALLY IMPLEMENTED — Mobile create call:** `complaintService.create()` is not invoked from the photo screen. Continue currently only displays a saved-draft message.
2. **NOT IMPLEMENTED — Category conversion:** The mobile's 30 category IDs cannot be directly accepted by the eight-value backend enum. The mapping or schema change must be decided before enabling submission.
3. **NOT IMPLEMENTED — Title/additional-info persistence:** Neither field exists in the complaint model/controller, and the mobile create helper does not include them.
4. **PARTIALLY IMPLEMENTED — Image-size compatibility:** Mobile compression is configured, but a compressed file can still exceed Multer's 5 MiB limit. No post-compression size check is present.
5. **PARTIALLY IMPLEMENTED — Coordinate validation:** Valid zero coordinates are rejected; malformed numeric input can become a server-side 500.
6. **PARTIALLY IMPLEMENTED — Upload error response:** Multer runs before the controller; no custom Citizen-server error mapper was found for upload limits/type/count.
7. **NOT IMPLEMENTED — Duplicate-request idempotency:** No idempotency key or request-level duplicate prevention was found. Review logic may flag nearby/repeated reports but is not an idempotent submission guarantee.
8. **NEEDS VERIFICATION — ImageKit in production:** Source supports ImageKit and local fallback; actual deployed variables and whether local fallback storage is persistent must be checked in the hosting environment.
9. **NOT IMPLEMENTED — Contractor status updates:** Contractor routes inspected expose complaint reads, chat, and quotations, but not complaint status mutations.

## 13. Exact files that may need modification during implementation

These are candidates for a later implementation, not changes made by this audit:

- `mobile-app/app/report/photos.jsx` — submit/confirmation action and submission/loading/error UX.
- `mobile-app/services/complaintService.js` — accept the actual draft shape, validate/map category, and call the existing endpoint.
- `mobile-app/services/api.js` — update multipart construction for the chosen category/title/additional-info contract and ensure file metadata and boundary handling work on Android/iOS.
- `mobile-app/constants/complaintCategories.js` — define an explicit backend category mapping, or preserve separate category data if backend schema changes are approved.
- `mobile-app/constants/config.js` and environment files — set configurable development/production API and uploads URLs; never put secrets in public Expo variables.
- `backend/models/Complaint.js` and `backend/controllers/user/complaintController.js` — only if the product requires persisted title/additional-info or new category values. Keep the existing web payload backwards-compatible.
- `backend/middleware/uploadMiddleware.js` — only if the mobile image constraints need a different server cap or upload error handling.
- `mobile-app/app/(tabs)/index.jsx`, `mobile-app/app/(tabs)/complaints.jsx`, and `mobile-app/app/complaint/[id].jsx` — display the returned ID/status and implement actual list/detail rendering and refresh after successful submission.

No new upload endpoint or ImageKit configuration appears necessary for the existing backend path.

## 14. Recommended mobile integration architecture

1. **Use one configurable API URL.** Keep `EXPO_PUBLIC_API_URL` as the single source in `mobile-app/constants/config.js`. For a stock Android emulator, a local development computer is commonly reachable at `http://10.0.2.2:<port>/api`; a physical Android device must use the development computer's LAN IPv4 address and be on a reachable network. Ensure Windows firewall allows the backend port. The Citizen server binds `0.0.0.0`. Use an HTTPS production URL. Do not scatter a temporary IP through source files.
2. **Reuse existing authentication.** Login via `/api/auth/login`; keep the token in Expo SecureStore; attach it as `Authorization: Bearer <token>`. Never send credentials or secrets with complaint fields.
3. **Resolve category incompatibility before POST.** Either map each mobile category to an approved backend enum (with user/product approval of the semantic grouping) or extend the backend schema/controller deliberately. Do not pass an unrecognized category ID.
4. **Build the request from the shared draft.** Current endpoint is multipart. Send category, description, flat latitude/longitude, optional address, and each prepared image using the repeated `images` field. Add title/additional info only after the backend contract supports them or a deliberate backward-compatible encoding is selected.
5. **Use the existing backend upload path.** The app uploads to the authenticated Citizen API; the backend validates with Multer and uses ImageKit privately, falling back to local disk. Do not put an ImageKit private key in the app or upload directly with it.
6. **Validate file size before posting.** Confirm every compressed output file is at most 5 MiB or coordinate a reviewed server limit change. Keep the maximum count at five across camera and gallery.
7. **Handle result/errors explicitly.** On 201, use `data.complaint._id`, show the backend message/review notice, and refresh the Citizen complaint list. Handle 400 validation, 401 authentication expiry, 403 account block, upload parsing/limit errors, and network timeouts distinctly.
8. **Avoid blind retries.** A timeout can occur after the server saved the complaint; since no idempotency key exists, offer a deliberate retry after checking the complaint list or add a server-supported idempotency design later. Do not treat duplicate-review flags as a request idempotency mechanism.
9. **Preserve existing workflow.** Mobile submission should only create a `Submitted` complaint; it must not assign an officer/contractor, set later statuses, or bypass municipal review.

## 15. Security considerations

- Keep `JWT_SECRET`, MongoDB credentials, and `IMAGEKIT_PRIVATE_KEY` on the backend only; this report intentionally omits actual secret values.
- Use HTTPS for deployed API calls and SecureStore for the mobile JWT. Avoid logging tokens, passwords, private environment values, or full multipart image data.
- The server should remain the authority for owner identity, category validation, file type/size/count, status, and assignment.
- Ensure deployment has ImageKit configured if cloud storage is required. The current local-disk fallback may not survive ephemeral hosting restarts and should be treated as an operational concern.
- Review the `requireActiveCitizen` behavior if the Citizen API can receive JWTs for other roles; it does not itself enforce the `user` role.
- Do not allow the app to choose `user`, `assignedOfficer`, `assignedContractor`, `status`, `priority`, or review flags in the create request; the current controller derives/sets these values server-side.

## 16. Testing plan for a later implementation

1. Confirm the selected backend entry point and verify its health endpoint/base URL from Android emulator and physical Android device.
2. Test Citizen login, SecureStore token persistence, Bearer header, expired token, blocked account, and logout.
3. Test each supported mobile category against the explicit mapping; verify unsupported values are rejected client-side before upload.
4. Submit no-photo and one-photo complaints, then mixed camera/gallery photos up to five; test a sixth, invalid MIME/extension, and output over 5 MiB.
5. Verify the created MongoDB document has the authenticated `user`, expected category/description/location, initial `Submitted`, status history, and image URLs/file IDs; confirm title/additional info behavior after an approved contract change.
6. Test ImageKit configured success, missing configuration/local fallback, ImageKit failure fallback, and mobile display of both CDN and relative `/uploads/...` URLs.
7. Test validation errors, bad JWT, account block, network loss, timeout-after-server-save, and safe retry behavior.
8. Verify the new complaint appears in the Officer jurisdiction dashboard, can be verified/rejected/assigned, and remains trackable from the Citizen list/detail endpoints.
9. Verify Officer and Contractor portals continue to function against their existing API servers and status workflow.

## 17. Implementation plan

1. Agree on the 30 mobile-to-eight backend category mapping and whether title/additional information must be stored as distinct fields.
2. Freeze the request/response contract while retaining compatibility with the Citizen web form.
3. Update mobile draft-to-request mapping and screen submission behavior; add output-file-size checks and explicit duplicate-submit protection.
4. Make only the necessary backend schema/controller/validation changes; reuse the current authenticated complaint route and ImageKit helper.
5. Exercise the test plan above on the backend, web portal, Android emulator, and physical device; then verify Officer and Contractor workflows remain unchanged.

## Audit conclusion

**The existing backend can be reused for a mobile multipart complaint with a supported category, description, coordinates, optional address, and up to five images.** The Citizen web portal already uses that endpoint, and the backend already routes image uploads through ImageKit when configured. **The mobile app is not yet submitting its draft**, and its current category IDs, title/additional-info fields, and possible compressed-file size do not match the existing API/model contract. Resolve those differences before wiring the screen to `POST /api/complaints`.
