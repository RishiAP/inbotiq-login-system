# Frontend — Inbotiq Login System (concise)

Minimal Next.js + TypeScript frontend for the Inbotiq login system.

Key points
- Pages: `src/app/` — login, signup, dashboard (protected).
- Components: `src/components/ui` (UI primitives) and shadcn components (skeletons, dialogs, etc.) — run `yarn shadcn` to update/add UI parts.
- API client: `src/lib/api.ts` — single place for the backend base URL and token handling.

Essential env
- `NEXT_PUBLIC_API_URL` — e.g. `http://localhost:5000` (only required env variable for local dev).

Run (development)

From the `frontend` folder (fish or bash):

```fish
yarn install
yarn dev
```

Build & start

```fish
yarn build
yarn start
```

Quick example (login)

1. Start backend and frontend.
2. POST credentials to `${NEXT_PUBLIC_API_URL}/auth/login` (handled by the app). The server sets an HttpOnly auth cookie on successful login. The frontend should include credentials on subsequent requests.

Fetch example (send credentials/cookies):

```js
// example using fetch from the browser
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
	method: 'POST',
	credentials: 'include', // important: send cookies
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ title: 'First', content: 'My note text' }),
});
```

If you use axios, enable `withCredentials: true` on requests or the axios instance.

Where to look
- `src/app/*` — pages and layouts
- `src/components/ui` — shadcn-based UI components
- `src/lib/api.ts` — API helper

That's it — this README keeps only essential setup, the UI uses shadcn primitives and local dev needs only `NEXT_PUBLIC_API_URL` set.
 
Env reference

See the example env file: [frontend/.env.example](./frontend/.env.example)

- `NEXT_PUBLIC_API_URL` — backend base URL (e.g. `http://localhost:5000`).
- `NEXT_PUBLIC_AUTH_COOKIE_NAME` — cookie name used by the backend for auth (informational; cookie is HttpOnly).
- `NEXT_PUBLIC_FRONTEND_URL` — frontend URL used by the backend for CORS (e.g. `http://localhost:3000`).
