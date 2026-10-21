# CourseRate

CourseRate is a course feedback and rating application. Students can explore courses and share reviews; administrators can manage courses, users, and feedback.

## Try the deployed app

- **App:** [course-rating-and-feedback.vercel.app](https://course-rating-and-feedback.vercel.app/)
- **Sign in:** [course-rating-and-feedback.vercel.app/login](https://course-rating-and-feedback.vercel.app/login)
- **Create an account:** [course-rating-and-feedback.vercel.app/register](https://course-rating-and-feedback.vercel.app/register)
- **Source code:** [GitHub repository](https://github.com/MeghanaGanesuni10/Course_rating-and-feedback)

The health endpoint reports whether the API and its MongoDB connection are available. Render's free service may take a short time to wake after being idle.

## Features

### Student accounts

- Register or sign in with an email and password, or use Google.
- Browse and search courses, view reviews, and submit ratings and written feedback.
- Edit or delete your own feedback, view feedback history, and update your profile.

### Administrator accounts

- View platform statistics and recent activity.
- Create, edit, and delete courses.
- Search and manage user accounts and feedback.

> **Administrator access:** The current registration screen lets anyone select the Admin role. Restrict or remove public admin registration before using the app where administrator access must be controlled.

### Authentication and storage

- JWT-based sessions and bcrypt password hashing.
- Server-side Google ID token verification.
- Student and admin roles are checked during login and for protected API routes.
- MongoDB Atlas stores users, courses, and feedback. The application database is named `courserate`; registered accounts are in the `users` collection.

## Run locally

### Requirements

- Node.js `>=22.12.0 <25` and npm.
- A MongoDB database (Atlas is recommended).
- A Google OAuth Web Client ID if you want to test Google sign-in.

### 1. Configure and start the backend

From the repository root:

```bash
cd backend
npm ci
```

Copy `backend/.env.example` to `backend/.env`, then set the values for your local environment:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
GOOGLE_CLIENT_ID=<your-google-web-client-id>
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`; its health endpoint is `http://localhost:5000/api/health`.

### 2. Configure and start the frontend

In a second terminal from the repository root:

```bash
cd frontend
npm ci
```

Copy `frontend/.env.example` to `frontend/.env` and set:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=<your-google-web-client-id>
```

Start Vite and open the local URL it prints (normally `http://localhost:5173`):

```bash
npm run dev
```

Use the same Google Web Client ID in both environment files. Add `http://localhost:5173` to the OAuth client's **Authorized JavaScript origins**. Never put a Google Client Secret, MongoDB URI, or JWT secret in a `VITE_` variable; Vite exposes those variables in browser code.

### Google authentication behavior

- On the registration page, Google creates an account only if that email is not already registered.
- On the login page, Google signs in an existing account. If no account exists yet, register first.
- Use the account's existing role when signing in. An email already registered as a student cannot be used to create a second admin account, or vice versa.

## MongoDB Atlas

The backend connects to the `courserate` database. To inspect accounts, open Atlas **Database → Clusters → Browse Collections**, then select `courserate` → `users`. The `role` field shows `student` or `admin`. Passwords are stored as hashes and should not be shared.

## API overview

All API paths are prefixed with `/api`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | API and database connection status |
| `POST` | `/auth/register` | Public | Create an email/password account |
| `POST` | `/auth/login` | Public | Sign in with email/password and selected role |
| `POST` | `/auth/google` | Public | Google sign-in or registration flow |
| `GET` | `/auth/me` | Signed in | Get the current account |
| `GET` | `/courses` | Public | List and search courses |
| `GET` | `/courses/:id` | Public | Course details and feedback |
| `POST` | `/feedback` | Signed in | Submit feedback |
| `GET` | `/feedback/mine` | Signed in | Get your feedback |
| `/courses...` | Admin | Create, update, and delete courses |
| `/admin...` | Admin | Manage users, feedback, and analytics |

## Deployment configuration

The production frontend is hosted on Vercel and the API on Render. Deployments are connected to the `main` branch of the GitHub repository.

### Vercel frontend

- **Root directory:** `frontend`
- **Production URL:** `https://course-rating-and-feedback.vercel.app`
- Set `VITE_API_URL` to `https://course-rating-and-feedback.onrender.com/api`.
- Set `VITE_GOOGLE_CLIENT_ID` to the Google OAuth Web Client ID.
- `frontend/vercel.json` rewrites client-side routes to the React app.

### Render API

The repository's `render.yaml` configures the backend service. Its root directory is `backend`, and its health check path is `/api/health`.

Set these variables in the Render service settings:

| Variable | Value |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection URI (keep private) |
| `JWT_SECRET` | Long random signing secret (keep private) |
| `GOOGLE_CLIENT_ID` | Same Google OAuth Web Client ID as the frontend |
| `CLIENT_URL` | `https://course-rating-and-feedback.vercel.app` |
| `NODE_ENV` | `production` |

In Google Cloud OAuth settings, add `https://course-rating-and-feedback.vercel.app` as an authorized JavaScript origin. Keep the localhost origin for development if needed.

## Checks

Run the frontend checks from `frontend/`:

```bash
npm run lint
npm run build
```

Run a backend syntax check from `backend/`:

```bash
node --check src/server.js
```

## Repository layout

```text
backend/    Express API, authentication, database models, and routes
frontend/   React and Vite web application
render.yaml Render backend service configuration
```


