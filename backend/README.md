# 🏛️ Skillsfy - Institute of Technology | Backend API Engine

> Complete, self-contained, production-ready Node.js + Express + SQLite backend with JWT Authentication, Role-Based Access Control (RBAC), and Automated PDF Certificate & QR Code Generation.

---

## 🛠️ Tech Stack & Highlights

- **Server Runtime:** Node.js + Express.js
- **Database:** SQLite (`sqlite3` lightweight file-based database, zero cloud dependency, auto-migrating tables)
- **Authentication:** JWT (`jsonwebtoken`) with 7-day tokens
- **Security:** `bcryptjs` password hashing (salt rounds: 10), `express-rate-limit` for DDoS protection, `express-validator` for input sanitization, `cors`
- **Certificate Engine:** `pdfkit` (Landscape high-resolution A4 vector PDF certificate) + `qrcode` (direct URL QR generation) + `crypto` (SHA-256 validation hash)
- **Verification Portal:** Public `/verify` endpoint & interactive standalone HTML UI.

---

## 📂 Folder Structure

```
backend/
├── server.js                   # Main Express application entrypoint
├── package.json                # Project manifest & dependencies
├── .env.example                # Environment variables template
├── .env                        # Local active configuration
├── database/
│   ├── db.js                   # SQLite connection, Promise wrappers, table migrations & initial seeders
│   └── skillsfy.db             # Auto-created SQLite database file
├── models/
│   ├── Student.js              # Student queries (create, findByEmail, findById, getAll)
│   ├── Admin.js                # Admin & Verifier management
│   ├── Course.js               # Course catalog CRUD
│   ├── Enrollment.js           # Student enrollment & progress tracker
│   └── Certificate.js          # Cryptographic certificate registry & revocation
├── services/
│   └── certificateService.js   # Automated unique code, QR PNG, and vector PDF generator
├── middleware/
│   ├── auth.js                 # JWT Bearer token authentication guard
│   ├── role.js                 # Role-based access control (Admin, Verifier, Student)
│   ├── validator.js            # Input validation handler
│   └── rateLimiter.js          # Rate limiter for auth, verify, and general API
├── controllers/
│   ├── authController.js       # Student Signup, Login, Admin Login, Profile
│   ├── courseController.js     # Public listing and Admin course management
│   ├── enrollmentController.js # Course enrollment, progress update & auto-cert trigger
│   ├── certificateController.js# PDF download and metadata endpoints
│   ├── verifyController.js     # Public certificate verification
│   └── adminController.js      # Students list, certificates list, revocation, stats
├── routes/
│   ├── authRoutes.js           # /api/auth routes
│   ├── courseRoutes.js         # /api/courses routes
│   ├── enrollmentRoutes.js     # /api/enroll, /api/progress, /api/my-courses
│   ├── certificateRoutes.js    # /api/certificate routes
│   ├── verifyRoutes.js         # /api/verify routes
│   └── adminRoutes.js          # /api/admin routes
├── certificates/               # Directory where generated PDFs and QR codes are stored
└── public/
    └── verify.html             # Standalone public certificate verification UI
```

---

## 🚀 Quick Setup & Run Instructions

### 1. Install Dependencies
Open your terminal in the `backend/` directory:

```bash
cd backend
npm install
```

### 2. Environment Configuration
Ensure `.env` exists (created automatically with defaults):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=skillsfy_super_secure_jwt_secret_key_2026_x9821
JWT_EXPIRES_IN=7d
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Backend Server
```bash
npm start
```
*Or for live development reload:*
```bash
npm run dev
```

> **Note:** When the server starts for the first time, SQLite will automatically create `database/skillsfy.db`, set up all 5 schema tables, and seed the default Super Admin, Academic Verifier, and Flagship Courses!

---

## 🔑 Default Administrative Credentials (Seeded)

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@skillsfy.edu` | `Admin@2026` | Full Access (`admin`) |
| **Academic Verifier** | `verifier@skillsfy.edu` | `Verifier@2026` | Read/Verify Access (`verifier`) |

---

## 📋 API Endpoints Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Student Registration | No (Rate Limited) |
| `POST` | `/api/auth/login` | Student Login (returns JWT) | No (Rate Limited) |
| `POST` | `/api/auth/admin/login` | Admin/Verifier Login | No (Rate Limited) |
| `GET` | `/api/auth/me` | Current Authenticated Profile | Yes (Bearer Token) |

### 2. Course Management (`/api/courses`)
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | List All Active Courses | Public |
| `GET` | `/api/courses/:id` | Single Course Detail | Public |
| `POST` | `/api/courses` | Create New Course | Admin Only |
| `PUT` | `/api/courses/:id` | Update Course | Admin Only |
| `DELETE` | `/api/courses/:id` | Delete Course | Admin Only |

### 3. Enrollment & Progress (`/api`)
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/enroll/:courseId` | Enroll Student in Course | Student Only |
| `PUT` | `/api/progress/:enrollmentId` | Update Progress (Auto-triggers certificate at 100%) | Student / Admin |
| `GET` | `/api/my-courses` | Get Enrolled Courses with Certificates | Student Only |

### 4. Certificates & Verification
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/certificate/:enrollmentId` | Download PDF Certificate | Student Owner / Admin |
| `GET` | `/api/verify/:certificateCode` | Public Certificate Verification | Public (Rate Limited) |
| `GET` | `/verify?code=SKF-2026-XXXXX` | Standalone Verification Web Page | Public |

### 5. Admin & Verifier Dashboard (`/api/admin`)
| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/students` | List All Registered Students | Admin / Verifier |
| `GET` | `/api/admin/certificates` | List & Search All Issued Certificates | Admin / Verifier |
| `PUT` | `/api/admin/certificates/:id/revoke` | Revoke / Invalidate Certificate | Admin Only |
| `GET` | `/api/admin/stats` | Platform Summary Counts | Admin / Verifier |

---

## 💻 Sample `curl` Requests

### Student Registration:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Aman Verma","email":"aman@example.com","password":"Password@123","phone":"+919876543210"}'
```

### Student Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aman@example.com","password":"Password@123"}'
```

### Update Progress & Trigger Auto-Certificate:
```bash
curl -X PUT http://localhost:5000/api/progress/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"progress_percent": 100}'
```

### Public Verify Certificate:
```bash
curl http://localhost:5000/api/verify/SKF-2026-AB12C
```
