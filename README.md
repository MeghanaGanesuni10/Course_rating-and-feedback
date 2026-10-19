# CourseRate

CourseRate is a MERN course feedback and rating app. Students browse courses and submit reviews; administrators manage courses, users, feedback, and platform analytics. MongoDB stores accounts, courses, and feedback.

## Features

### Student

- Create an account as a student with email/password or Google sign-in.
- Sign in, update profile details, and change password.
- Browse and search courses, filter/sort the directory, and view course reviews.
- Submit a course rating and written review, then edit or delete your own feedback.
- View a personal dashboard and feedback history.

### Administrator

- Create an account as an administrator with email/password or Google sign-in.
- View platform statistics, rating distributions, top-rated courses, and recent feedback.
- Create, update, and delete courses.
- Search and manage users, change roles, and delete accounts.
- Review and delete feedback.

**Admin signup is public by design in this version. Anyone who can access registration can select Admin and receive administrator access.** Do not use this setup for a public production service unless that policy is intentional.

### Authentication and data

- JWT sessions, bcrypt password hashing, and role-protected admin routes.
- Google Identity Services sign-in; the backend verifies Google ID tokens with `google-auth-library` before signing in or creating an account.
- MongoDB Atlas via Mongoose.
- Rate limits, Helmet security headers, CORS allowlisting, and duplicate-review prevention.

## Requirements

- Node.js `>=22.12.0 <25` (the current Vite and Google auth dependencies require a recent Node release).
- npm.
- A MongoDB database (MongoDB Atlas recommended).
- A Google OAuth Web Client ID to enable Google sign-in.

## Run locally

Install dependencies in both folders:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Set these values in `backend/.env`:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=use-a-long-random-secret
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Then install and configure the frontend:

```powershell
cd ../frontend
npm ci
Copy-Item .env.example .env
```

Set these values in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Use the same Google Web Client ID in both files. The Client ID is public; do not put a Google Client Secret in the frontend. See [Google sign-in setup](#google-sign-in-setup).

Run the API and web app in separate terminals:

```powershell
# Terminal 1, from backend/
npm run dev
```

```powershell
# Terminal 2, from frontend/
npm run dev
```

Open <http://localhost:5173>. The API health endpoint is <http://localhost:5000/api/health>.

### Google sign-in setup

1. In Google Cloud Console, create an OAuth Client ID with application type **Web application**.
2. Under **Authorized JavaScript origins**, add `http://localhost` and `http://localhost:5173`.
3. Configure the OAuth consent screen. Add test accounts if the app is in testing mode.
4. Copy the Client ID to `GOOGLE_CLIENT_ID` in `backend/.env` and `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`.
5. Restart both development servers after changing environment files.

Google sign-in creates a new account with the role selected on the login or registration page. If that Google email already belongs to a different role, sign in using that role. Existing Gmail or Google Workspace accounts can be associated with their Google identity; other existing email accounts must first use password sign-in.

### Optional sample data

Seed the sample course records:

```powershell
cd backend
npm run seed
```

The first admin can also be created or an existing account promoted with `backend/src/scripts/createAdmin.js`. Public Admin signup is available as described above.

## Main API routes

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API and database status |
| POST | `/api/auth/register` | Public | Create student/admin account |
| POST | `/api/auth/login` | Public | Email/password login |
| POST | `/api/auth/google` | Public | Verify Google sign-in and create/login |
| GET | `/api/auth/me` | Signed in | Current account |
| GET | `/api/courses` | Public | Search and list courses |
| GET | `/api/courses/:id` | Public | Course details and reviews |
| POST/PATCH/DELETE | `/api/courses...` | Admin | Manage courses |
| POST | `/api/feedback` | Signed in | Submit course feedback |
| GET | `/api/feedback/mine` | Signed in | Current user's feedback |
| PATCH/DELETE | `/api/feedback/:id` | Owner/Admin | Edit or delete feedback |
| GET | `/api/admin/analytics` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | Search/manage users |
| GET | `/api/admin/all-feedback` | Admin | Browse all feedback |

## Deploy

The repository includes `render.yaml` for the Node API and `frontend/vercel.json` for React Router deep links. Both providers deploy from a GitHub repository; this folder must first be pushed to a repository you can connect to Render and Vercel.

If this project has not been pushed to GitHub yet, create an empty GitHub repository and run these commands from the project folder (replace the remote URL):

```powershell
git add .
git commit -m "Prepare CourseRate for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

The root `.gitignore` excludes `.env` files. Check that no credentials are staged before pushing.

### 1. Deploy the API on Render

1. In Render, create a Blueprint from the repository and use the root `render.yaml`, or create a Web Service manually with:
   - **Root Directory:** `backend`
   - **Build Command:** `npm ci`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
2. Set the service environment variables:
   - `MONGO_URI` — MongoDB Atlas connection string.
   - `JWT_SECRET` — a long random secret (the Blueprint generates one).
   - `CLIENT_URL` — temporarily `http://localhost:5173`; replace it after you have the Vercel URL.
   - `GOOGLE_CLIENT_ID` — the same Google Web Client ID.
   - `NODE_ENV` — `production`.
3. In MongoDB Atlas Network Access, allow the Render service to connect. Prefer a restricted allowlist where possible.
4. Deploy and copy the Render service URL, for example `https://courserate-api.onrender.com`.

### 2. Deploy the frontend on Vercel

1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `frontend` and use the Vite framework preset.
3. Add these environment variables for Production:
   - `VITE_API_URL` — your Render URL plus `/api`, e.g. `https://courserate-api.onrender.com/api`.
   - `VITE_GOOGLE_CLIENT_ID` — your Google Web Client ID.
4. Deploy and copy the Vercel production URL, for example `https://your-app.vercel.app`.

The `frontend/vercel.json` rewrite sends React Router paths such as `/admin` back to the SPA entry page.

### 3. Connect and redeploy

1. Change Render's `CLIENT_URL` to the Vercel production origin (no path or trailing slash) and redeploy the API.
2. Add the Vercel production origin to the Google OAuth client's **Authorized JavaScript origins**. Keep the localhost origins for local development.
3. Confirm `https://YOUR-RENDER-SERVICE.onrender.com/api/health` returns an `ok` status and `database: connected`.
4. Try student and admin registration/login on the Vercel URL.

Do not commit `.env` files or place server secrets in Vercel's `VITE_` variables. Vite exposes variables prefixed with `VITE_` in browser code.

## Verification

- `npm run lint` — frontend lint; existing warnings are listed in the command output.
- `npm run build` — frontend production build.
- `GET /api/health` — API and MongoDB health check.

## Known limitations

- Password registration does not verify email addresses; Google sign-in requires a verified Google email.
- Public Admin signup is enabled, so this app is not appropriate for public production use where administrator access must be restricted.
- The app uses browser local storage for JWT tokens.
- Profile photos and image uploads are not implemented.

## License

MIT — for academic use.
