# 🛡️ AuthShield - Secure Email Verification & Authentication System

A production-ready **Node.js, Express, and MySQL** authentication system featuring **OTP-based Email Verification**, bcrypt password encryption, express-validator sanitization, rate-limiting, and a modern dark glassmorphic Frontend Portal.

---

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [🏗️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [📁 Project Structure](#-project-structure)
- [🗄️ Database Schema](#️-database-schema)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Quick Start & Installation](#-quick-start--installation)
- [📡 API Reference](#-api-reference)
- [🎨 Frontend Web Portal](#-frontend-web-portal)
- [🔒 Security & Best Practices](#-security--best-practices)

---

## ✨ Key Features

- **OTP-Based Email Verification**: Automatically generates secure 6-digit numeric OTPs with bcrypt hashing and delivers them via Nodemailer/SMTP.
- **Secure Registration Workflow**: Enforces strict input validation (`firstName`, `lastName`, valid `email`, min 8-char `password`) and creates unverified accounts until OTP confirmation.
- **Resend OTP with Cooldown Protection**: Prevents email flooding with cooldown timers (e.g., 60-second cooldown) and hourly request quotas.
- **Attempt Throttling**: Limits failed OTP attempts to prevent brute-force attacks and invalidates expired codes.
- **Transactional Database Queries**: Utilizes MySQL transactions for atomic account creation and OTP generation.
- **Modern Glassmorphic Frontend**: Dark-themed UI with auto-focus 6-box OTP input, paste support, real-time password strength meter, dynamic health monitor, and toast notifications.
- **Cross-Origin & Static Serving**: Express serves static assets from `public/` while supporting full CORS for standalone frontends.

---

## 🏗️ Tech Stack & Architecture

### Backend
- **Runtime**: [Node.js (ES Modules)](https://nodejs.org/)
- **Framework**: [Express.js 5](https://expressjs.com/)
- **Database**: [MySQL2](https://github.com/sidorares/node-mysql2) (Connection Pool & Transactions)
- **Security & Validation**:
  - [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (Password & OTP hashing)
  - [express-validator](https://express-validator.github.io/) (Input validation & normalization)
  - [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) (Endpoint rate-limiting)
  - [cors](https://github.com/expressjs/cors) & [helmet](https://helmetjs.github.io/) (CORS & HTTP headers)
- **Email Delivery**: [Nodemailer](https://nodemailer.com/) (HTML templates for OTP & Welcome emails)

### Frontend
- **HTML5 & Vanilla CSS3**: Custom design tokens, CSS Glassmorphism, CSS Grid & Flexbox, Google Font (*Plus Jakarta Sans*).
- **Vanilla JavaScript**: Event-driven architecture, 6-digit box OTP handler, clipboard paste detection, API health monitor, and countdown timers.

---

## 📁 Project Structure

```text
Authentication-project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js                 # Centralized environment configurations
│   │   ├── db/
│   │   │   └── db.js                  # MySQL2 connection pool
│   │   ├── middleware/
│   │   │   ├── error.middleware.js     # Centralized API error handler
│   │   │   ├── rate-limit.middleware.js# Resend OTP rate limiter
│   │   │   └── validate.middleware.js  # express-validator result handler
│   │   ├── module/
│   │   │   ├── auth/
│   │   │   │   ├── controller.js      # Auth request handlers
│   │   │   │   ├── query.js           # SQL queries & DB operations
│   │   │   │   ├── route.js           # Auth route definitions
│   │   │   │   └── service.js         # Business logic & email dispatches
│   │   │   └── email/
│   │   │       ├── service.js         # Nodemailer transport & sender
│   │   │       └── templates.js       # OTP & Welcome HTML email templates
│   │   ├── utils/
│   │   │   ├── api-error.js           # Custom ApiError class
│   │   │   ├── otp.js                 # OTP generator & verification helper
│   │   │   ├── password.js            # bcrypt hashing & comparison
│   │   │   ├── token.js               # Token generation & verification
│   │   │   └── transaction.js         # Atomic MySQL transaction runner
│   │   ├── validation/
│   │   │   └── auth.validation.js     # Request body validation rules
│   │   └── app.js                     # Express app, middleware & routes
│   ├── .env.example                   # Environment variables template
│   ├── package.json                   # Dependencies & start scripts
│   └── server.js                      # Server startup & DB connection test
├── public/
│   ├── app.js                         # Frontend logic, OTP boxes, timer & API calls
│   ├── index.html                     # Responsive glassmorphic UI portal
│   └── style.css                      # Modern dark theme styles
└── README.md                          # Project documentation
```

---

## 🗄️ Database Schema

Run the following SQL commands in your MySQL database to set up the required tables:

```sql
CREATE DATABASE IF NOT EXISTS authentication_db;
USE authentication_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. OTP Codes Table
CREATE TABLE IF NOT EXISTS otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) DEFAULT 'email_verification',
    attempts INT DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Email Verifications Table (Optional / Token-based)
CREATE TABLE IF NOT EXISTS email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory using the provided `backend/.env.example` template:

```env
PORT=1111

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=authentication_db

# Security & Hashing
BCRYPT_SALT=10
JWT_SECRET=your_jwt_secret_key_here

# SMTP / Email Configuration (e.g. Gmail, Mailgun, SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM="AuthShield <noreply@authshield.local>"

# OTP Policy Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_REQUESTS_PER_HOUR=5
```

> **Tip for Gmail SMTP**: Use a Google [App Password](https://myaccount.google.com/apppasswords) rather than your personal account password.

---

## 🚀 Quick Start & Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd Authentication-project
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Configure `.env`
Copy `.env.example` to `.env` and fill in your database and SMTP settings:
```bash
cp .env.example .env
```

### 4. Start the server
```bash
npm start
```
The server will connect to MySQL and start listening on:
```text
http://localhost:1111
```

### 5. Access the Frontend UI
Open your browser and navigate to:
```text
http://localhost:1111
```
*(The backend automatically serves the frontend files located in `public/`)*

---

## 📡 API Reference

Base URL: `http://localhost:1111`

### 1. Health Check
Checks whether the backend server is online and running.

- **Endpoint**: `GET /health`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "API is healthy"
}
```

---

### 2. User Registration
Registers a new user and dispatches a 6-digit OTP to the specified email.

- **Endpoint**: `POST /api/v1/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```
- **Validation Rules**:
  - `firstName`: Required, string, 3 to 100 characters
  - `lastName`: Required, string, 3 to 100 characters
  - `email`: Required, valid email format
  - `password`: Required, minimum 8 characters
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "john.doe@example.com",
    "message": "Registration successful. Please verify your email."
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (e.g., password too short)
  - `409 Conflict`: `{ "success": false, "code": "USER_ALREADY_EXISTS", "message": "An account with this email already exists" }`

---

### 3. Verify Email with OTP
Verifies the user's email using the 6-digit OTP code received in their inbox.

- **Endpoint**: `POST /api/v1/auth/verify-email`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "john.doe@example.com",
  "otp": "492015"
}
```
- **Validation Rules**:
  - `email`: Required, valid email
  - `otp`: Required, exactly 6 numeric digits
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: `INVALID_OTP`, `OTP_EXPIRED`, or `OTP_NOT_FOUND`
  - `404 Not Found`: `USER_NOT_FOUND`
  - `409 Conflict`: `EMAIL_ALREADY_VERIFIED`
  - `429 Too Many Requests`: `OTP_ATTEMPTS_EXCEEDED` (exceeded maximum failed attempts)

---

### 4. Resend OTP
Requests a new 6-digit OTP code for an unverified account.

- **Endpoint**: `POST /api/v1/auth/resend-otp`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "message": "A new verification OTP has been sent"
  }
}
```
- **Error Responses**:
  - `404 Not Found`: `USER_NOT_FOUND`
  - `409 Conflict`: `EMAIL_ALREADY_VERIFIED`
  - `429 Too Many Requests`: `OTP_COOLDOWN` (must wait before requesting again) or `OTP_LIMIT_EXCEEDED` / `TOO_MANY_REQUESTS`

---

## 🎨 Frontend Web Portal

The included web portal (`public/`) provides a clean visual interface for the authentication flow:

1. **Register Screen**:
   - First and Last name inputs with length hints.
   - Real-time password strength meter and visibility toggle.
   - Automatic redirect to the OTP verification screen upon successful registration.
2. **OTP Verification Screen**:
   - 6 individual digit input boxes with auto-advance, backspace navigation, and copy-paste support.
   - In-screen **Resend OTP** button with live countdown timer.
3. **Resend Code Tab**:
   - Standalone tab for users returning later to request a fresh OTP.
4. **Celebration Screen**:
   - Visual confirmation once the email is verified.
5. **Dynamic API Health Monitor**:
   - Status badge checking `/health` in real-time with configurable endpoint settings.

---

## 🔒 Security & Best Practices

- **Salted Password Hashing**: Passwords are never stored in plaintext and are hashed using `bcrypt` with configurable salt rounds.
- **OTP Security**: OTPs are generated cryptographically, hashed in the database, subject to 10-minute expiry, and capped by attempt limits (`OTP_MAX_ATTEMPTS`).
- **Rate-Limiting & Cooldowns**: Express rate limiting protects sensitive endpoints against abuse and email flooding.
- **Database Transactions**: User registration and OTP insertions are wrapped in database transactions to prevent partial records.
- **Input Sanitization**: All incoming inputs are trimmed and validated using `express-validator`.

---

## 📄 License
This project is licensed under the ISC License.