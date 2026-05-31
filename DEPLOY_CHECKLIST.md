# SevaTrack Deployment Checklist

Prior to deploying the SevaTrack platform to production, ensure all conditions in this checklist are met. A complete verification pass has been performed locally, and the system is stable.

## 1. Backend Verification
- [x] **No MongoDB Schema Errors**: Verified that changes to `User.js` (added mobile), `Note.js` (added expiry, pin, temple), and `Slot.js` function without validation errors.
- [x] **Dependencies Check**: Backend starts cleanly (`node server.js`). No missing imports.
- [x] **Route Registration**: Verified that `/api/admin` and `/api/reports` are fully mounted without collisions or duplicates.
- [x] **Auth Middleware**: All new administrative routes (`/gatekeepers`, `/live-dashboard`) are correctly wrapped in the `protect` and `authorizeRoles("admin")` middleware.

## 2. Frontend Verification
- [x] **Compilation**: `npm run build` executed successfully without fatal errors using Vite + Rolldown.
- [x] **Linting**: `npm run lint` executed successfully with zero ESLint errors on new modules.
- [x] **Route Accessibility**: Validated `App.jsx` mappings (`/admin/gatekeepers`, `/admin/reports`, `/profile`). No broken links or blank pages.
- [x] **UI Rendering**: Verified the integration of Chart.js, jsPDF, and html2canvas for the Reports module.

## 3. Production Environment Configuration
Before you deploy to Render and Vercel, verify your environment variables.

### Backend (Render)
- [ ] `MONGO_URI`: Ensure the connection string points to the production Atlas cluster.
- [ ] `JWT_SECRET`: Ensure a secure cryptographic secret is defined.
- [ ] `CLIENT_URL`: Point this to your production Vercel deployment URL to handle CORS gracefully.

### Frontend (Vercel)
- [ ] `VITE_API_URL`: Ensure this points to the live Render backend URL (e.g., `https://sevatrack-api.onrender.com`).

## 4. Deployment Steps
1. Push all committed changes to the `main` branch.
2. Monitor the automated build process on **Render** (for the Express backend). Ensure the service restarts and connects to MongoDB.
3. Monitor the automated build process on **Vercel** (for the React frontend). Ensure the Vite build completes.
4. Access the live Vercel URL on mobile and desktop devices to verify API connectivity.

## 5. Post-Deployment Validation
After deployment, an administrator should manually test the following flows in the live environment:
- [ ] Navigate to the Admin Dashboard and verify real-time stats map correctly.
- [ ] Use the new "Notice Settings" UI to add an expiring, pinned notice.
- [ ] Check "Manage Gatekeepers" and ensure a gatekeeper can be created and assigned to a specific temple.
- [ ] Update your own account details using the new global `Profile` page.
- [ ] Generate a PDF and CSV export from the Reports module.
