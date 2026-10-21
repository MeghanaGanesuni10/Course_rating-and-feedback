# CourseRate frontend

The frontend is a React single-page application built with Vite. For the complete project guide, including backend setup, MongoDB Atlas, authentication, and deployment, see the [main README](../README.md).

## Live app

- [Open CourseRate](https://course-rating-and-feedback.vercel.app/)
- [Sign in](https://course-rating-and-feedback.vercel.app/login)
- [Register](https://course-rating-and-feedback.vercel.app/register)

## Run locally

From this folder, install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Create `frontend/.env` from `.env.example` and set:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=<your-google-web-client-id>
```

Start the backend separately; see the [main README](../README.md#run-locally). Keep server credentials out of frontend environment variables. Values prefixed with `VITE_` are included in the browser build.

## Build and lint

```bash
npm run lint
npm run build
```
