# Event Booking System — Backend

Built with Node.js · Express · Prisma · PostgreSQL · JWT

---

## STEP 1 — PostgreSQL Setup

Open your terminal and run:

```bash
psql -U postgres
```

Then inside psql:

```sql
CREATE USER eventapp_user WITH PASSWORD 'yourpassword';
CREATE DATABASE eventapp_db OWNER eventapp_user;
GRANT ALL PRIVILEGES ON DATABASE eventapp_db TO eventapp_user;
\q
```

---

## STEP 2 — Install Dependencies

```bash
cd backend
npm install
```

---

## STEP 3 — Create Your .env File

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
DATABASE_URL="postgresql://eventapp_user:yourpassword@localhost:5432/eventapp_db"
JWT_SECRET="any-long-random-string"
JWT_REFRESH_SECRET="another-long-random-string"
```

Everything else is optional for local development.

---

## STEP 4 — Run Database Migrations

This creates all tables in your PostgreSQL database:

```bash
npx prisma migrate dev --name init
```

You should see: "All migrations have been applied successfully"

---

## STEP 5 — (Optional) Seed a Category

You need at least one category to create events. Open Prisma Studio:

```bash
npx prisma studio
```

Go to the Category table → Add record → set name to "Music" → Save.

---

## STEP 6 — Start the Server

```bash
npm run dev
```

You should see:
```
✅  Connected to PostgreSQL via Prisma
🚀  Server running on http://localhost:5000
```

---

## STEP 7 — Test It

```bash
# Health check
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456"}'
```

---

## API Endpoints Quick Reference

| Method | Endpoint                   | Auth    | What it does             |
|--------|----------------------------|---------|--------------------------|
| POST   | /api/auth/register         | Public  | Create account           |
| POST   | /api/auth/login            | Public  | Login, get tokens        |
| POST   | /api/auth/refresh          | Public  | Refresh access token     |
| POST   | /api/auth/logout           | User    | Invalidate refresh token |
| GET    | /api/events                | Public  | List events              |
| GET    | /api/events/:id            | Public  | Event details            |
| POST   | /api/events                | Admin   | Create event             |
| PUT    | /api/events/:id            | Admin   | Update event             |
| DELETE | /api/events/:id            | Admin   | Delete event             |
| GET    | /api/events/categories     | Public  | List categories          |
| POST   | /api/bookings              | User    | Book an event            |
| GET    | /api/bookings/me           | User    | My bookings              |
| PATCH  | /api/bookings/:id/cancel   | User    | Cancel booking           |
| GET    | /api/users/profile         | User    | Get my profile           |
| PUT    | /api/users/profile         | User    | Update my profile        |
| GET    | /api/admin/dashboard       | Admin   | Stats overview           |
| GET    | /api/admin/users           | Admin   | All users                |
| PATCH  | /api/admin/users/:id/role  | Admin   | Change user role         |
| GET    | /api/admin/bookings        | Admin   | All bookings             |

---

## Make Yourself an Admin

After registering, open Prisma Studio (`npx prisma studio`),
find your user in the User table, change role from USER to ADMIN, and save.

---

## Common Errors

**"relation does not exist"** → Run `npx prisma migrate dev --name init`

**"connect ECONNREFUSED 127.0.0.1:5432"** → PostgreSQL isn't running. Start it:
- Windows: Open Services → find PostgreSQL → Start
- Mac: `brew services start postgresql`

**"Invalid credentials"** on login → Double-check your DATABASE_URL password matches what you set in psql.
