## Backend — Inbotiq Login System (concise)

Minimal Express + TypeScript API for auth and notes.

Essential env (create `backend/.env`)
- `MONGO_URI` — MongoDB connection string (e.g. Atlas URI)
- `JWT_SECRET` — secret used to sign authentication tokens (server signs tokens and stores them in an HttpOnly cookie)
- `PORT` — server port (e.g. `4000`)
- `FRONTEND_URL` — frontend origin used for CORS (e.g. `http://localhost:3000`)
- `AUTH_COOKIE_NAME` — (optional) name of the auth cookie the server sets (default: `access_token`)

Run (development)

```fish
cd backend
yarn install
yarn dev
```

Build & start

```fish
yarn build
yarn start
```

Minimal API examples (cookie-based auth)

# Signup
```
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret"}'
```

# Login (server sets an HttpOnly auth cookie)
```
# Save cookies to a file (cookie-jar) so we can reuse them for subsequent requests
curl -i -c cookie-jar.txt -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}'
```

# Create note (send cookie from cookie-jar.txt)
```
curl -b cookie-jar.txt -X POST http://localhost:5000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"First","content":"My note text"}'
```

Notes
- Authentication is performed via an HttpOnly cookie set by the server on login. The cookie is not accessible to JavaScript.
- For browser requests, the frontend must send credentials (cookies) with requests. See the frontend README for fetch/axios examples (use `credentials: 'include'` or `withCredentials: true`).

Key locations
- `src/controllers` — handlers
- `src/models` — User, Note
- `src/middleware/auth.ts` — JWT auth

Keep secrets out of source control and ensure `JWT_SECRET` and DB credentials are set in production.

Env example

See the example env file for exact variable names and examples: [backend/.env.example](./backend/.env.example)
