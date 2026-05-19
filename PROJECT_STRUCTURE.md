# Event Booking System - Backend Project Structure

**Tech Stack:** Node.js · Express · Prisma · PostgreSQL · JWT · ImageKit

---

## 📁 COMPLETE FILE STRUCTURE

```
backend/
├── server.js                          # Entry point - starts HTTP server
├── package.json                       # Dependencies
├── .env.example                       # Environment template
├── .gitignore
├── prisma/
│   ├── schema.prisma                 # Database schema (ALL MODELS)
│   ├── migrations/
│   │   ├── migration_lock.toml
│   │   └── 20260509195805_init/
│   │       └── migration.sql
│   └── .env                          # Prisma DATABASE_URL
└── src/
    ├── app.js                         # Express setup (routes + middleware)
    ├── config/
    │   ├── env.js                    # Environment variable validation
    │   └── db.js                     # Prisma client singleton
    ├── controllers/                  # Business logic
    │   ├── auth.controller.js        # register, login, refresh, logout, me
    │   ├── user.controller.js        # getProfile, updateProfile
    │   ├── event.controller.js       # CRUD events, categories
    │   ├── booking.controller.js     # CRUD bookings
    │   └── admin.controller.js       # Dashboard stats, user management
    ├── services/                     # Database queries + logic
    │   ├── auth.service.js           # Authentication logic
    │   ├── user.service.js           # User queries
    │   ├── event.service.js          # Event queries
    │   ├── booking.service.js        # Booking queries
    │   └── email.service.js          # Email sending (nodemailer)
    ├── routes/                       # API endpoints
    │   ├── auth.routes.js            # POST /register, /login, /refresh, /logout, GET /me
    │   ├── user.routes.js            # GET/PUT /profile
    │   ├── event.routes.js           # GET/POST/PUT/DELETE /events, /categories
    │   ├── booking.routes.js         # GET/POST/PATCH /bookings, /bookings/me
    │   └── admin.routes.js           # GET /dashboard, /users, PATCH /users/:id/role
    ├── middleware/
    │   ├── auth.middleware.js        # JWT protect middleware
    │   ├── admin.middleware.js       # isAdmin role check
    │   ├── upload.js                 # Multer memory storage (5MB max)
    │   └── validate.js               # Zod schema validation
    └── validators/                   # Zod schemas
        ├── auth.validator.js         # register, login, refresh schemas
        ├── user.validator.js
        ├── event.validator.js        # createEvent, updateEvent schemas
        └── booking.validator.js      # createBooking schema
```

---

## 🗄️ DATABASE SCHEMA (Prisma)

```prisma
enum Role { USER, ADMIN }
enum EventStatus { UPCOMING, ONGOING, COMPLETED, CANCELLED }
enum BookingStatus { PENDING, CONFIRMED, CANCELLED }

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password      String    (bcrypted)
  role          Role      @default(USER)
  refreshToken  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  bookings      Booking[]
  reviews       Review[]
}

model Category {
  id     String  @id @default(uuid())
  name   String  @unique
  events Event[]
}

model Event {
  id          String        @id @default(uuid())
  title       String
  description String
  date        DateTime
  location    String
  imageUrl    String?       (from ImageKit)
  price       Float
  totalSeats  Int
  bookedSeats Int           @default(0)
  status      EventStatus   @default(UPCOMING)
  categoryId  String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  category    Category      @relation(fields: [categoryId], references: [id])
  bookings    Booking[]
  reviews     Review[]
}

model Booking {
  id         String        @id @default(uuid())
  userId     String
  eventId    String
  seats      Int
  totalPrice Float
  status     BookingStatus @default(CONFIRMED)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  
  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  event      Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model Review {
  id        String    @id @default(uuid())
  userId    String
  eventId   String
  rating    Int       (1-5)
  comment   String?
  createdAt DateTime  @default(now())
  
  user      User      @relation(fields: [userId], references: [id])
  event     Event     @relation(fields: [eventId], references: [id])
}
```

---

## 📡 API ENDPOINTS

### **AUTH (No Auth Required)**
```
POST   /api/auth/register        { email, password, name }
POST   /api/auth/login           { email, password } → returns { token, refreshToken }
POST   /api/auth/refresh         { refreshToken } → returns { token }
POST   /api/auth/logout          (Protected)
GET    /api/auth/me              (Protected) → returns current user
```

### **USERS (Protected - Requires Bearer Token)**
```
GET    /api/users/profile        → user data
PUT    /api/users/profile        { name, email } → update profile
```

### **EVENTS (Public Read, Admin Write)**
```
GET    /api/events               (public) → all events with pagination/filters
GET    /api/events/:id           (public) → single event details
GET    /api/events/categories    (public) → all categories
POST   /api/events               (admin only) + file upload
PUT    /api/events/:id           (admin only) + file upload
DELETE /api/events/:id           (admin only)
POST   /api/events/categories    (admin only) { name }
```

### **BOOKINGS (Protected)**
```
GET    /api/bookings             (admin only) → all bookings
GET    /api/bookings/me          (protected) → user's bookings
GET    /api/bookings/:id         (protected) → booking details
POST   /api/bookings             { eventId, seats } → create booking
PATCH  /api/bookings/:id/cancel  → cancel booking
```

### **ADMIN (Admin Only)**
```
GET    /api/admin/dashboard      → stats (total users, events, revenue)
GET    /api/admin/users          → all users
PATCH  /api/admin/users/:id/role { role: 'ADMIN' | 'USER' } → change role
GET    /api/admin/bookings       → all bookings
```

---

## ⚙️ ENVIRONMENT VARIABLES (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eventapp_db

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Image Upload (ImageKit)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

# Email (Optional for local dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@eventapp.com
```

---

## 🚀 SETUP & RUN

```bash
# 1. Install dependencies
npm install

# 2. Setup PostgreSQL
psql -U postgres
CREATE USER eventapp_user WITH PASSWORD 'password';
CREATE DATABASE eventapp_db OWNER eventapp_user;

# 3. Create .env file
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

# 4. Run migrations
npx prisma migrate dev

# 5. Start server
npm run dev
# Server runs on http://localhost:5000
```

---

## 🔐 SECURITY

- ✅ **Passwords:** Bcrypted with salt rounds 10
- ✅ **JWT:** 15m access token, 7d refresh token
- ✅ **Rate Limiting:** 20 auth requests/15min, 200 general requests/15min
- ✅ **CORS:** Configured for frontend origin
- ✅ **Helmet:** Security headers
- ✅ **File Upload:** Multer memory storage, 5MB max, image-only

---

## 📝 KEY FEATURES

- User authentication (register, login, JWT refresh)
- Event CRUD (admin only)
- Event categories
- Booking system (seats available, price calculation)
- Admin dashboard (stats, user management)
- Email notifications (nodemailer ready)
- Image upload (multer + ImageKit)
- Zod validation on all inputs
- Global error handling

---

## 🔗 IMAGE UPLOAD FLOW

**Current:** Images stored via ImageKit (URL-only in DB)
**Location:** `/api/events/:id` (multipart/form-data)
**Max Size:** 5MB
**Formats:** JPEG, PNG, WebP

---

## 📦 DEPENDENCIES

```json
{
  "@prisma/client": "^5.10.0",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.1",
  "express": "^4.18.2",
  "express-rate-limit": "^7.1.5",
  "helmet": "^7.1.0",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "nodemailer": "^8.0.7",
  "zod": "^3.22.4"
}
```

---

## 📋 NEXT STEPS

- [ ] Setup Cloudinary for image storage (replace ImageKit)
- [ ] Add email notifications on booking
- [ ] Add review/rating system
- [ ] Add payment integration (Stripe)
- [ ] Add analytics dashboard
- [ ] Deploy to production (Render/Railway)
