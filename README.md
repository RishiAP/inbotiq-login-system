# Inbotiq Login System

This repository contains two parts:

- `backend/` — Express + TypeScript API (auth, notes).
- `frontend/` — Next.js + TypeScript frontend (login, signup, dashboard).

Useful links

- Backend README: [./backend/README.md](./backend/README.md)
- Frontend README: [./frontend/README.md](./frontend/README.md)

Environment examples

- Frontend env example: [./frontend/.env.example](./frontend/.env.example) (contains NEXT_PUBLIC_API_URL, NEXT_PUBLIC_AUTH_COOKIE_NAME, NEXT_PUBLIC_FRONTEND_URL)
- Backend env example: [./backend/.env.example](./backend/.env.example) (contains MONGO_URI, JWT_SECRET, PORT, FRONTEND_URL, AUTH_COOKIE_NAME)

Quick start (developer)

1. Start backend in one terminal:

```fish
cd backend
yarn install
yarn dev
```

2. Start frontend in another terminal:

```fish
cd frontend
yarn install
yarn dev
```

Notes

- Fill `backend/.env` and `frontend/.env.local` from the example files before running locally.
- Authentication is cookie-based: the backend sets an HttpOnly auth cookie on login. The frontend must include credentials (cookies) on requests (e.g. `fetch(..., { credentials: 'include' })`).
- READMEs above contain further details and minimal curl examples for the API.
