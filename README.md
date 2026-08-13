# NoQ — Multi-Institution Queue Management Platform

<p align="center">
  <strong>Discover. Book. Track.</strong>
</p>

<p align="center">
  A platform that connects users with multiple institutions and their service queues, enabling remote token booking and real-time queue tracking.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/WebSocket-000000?style=for-the-badge" alt="WebSocket">
</p>

---

## Overview

**NoQ** is a **multi-institution queue management platform** that allows multiple independent institutions to register on a single platform and manage multiple service queues.

Instead of requiring users to visit an institution just to obtain a queue token, NoQ allows them to:

1. Discover institutions on the platform
2. View the services and queues offered by an institution
3. Check queue information
4. Book a token remotely
5. Track their position in real time
6. Receive queue-related notifications

Each institution operates its own queues independently while users access all participating institutions through a unified platform.

### Platform Model

```text
                         ┌──────────────────────────┐
                         │       NoQ Platform       │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
       ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
       │ Institution │         │ Institution │         │ Institution │
       │      A      │         │      B      │         │      C      │
       └──────┬──────┘         └──────┬──────┘         └──────┬──────┘
              │                       │                       │
       ┌──────┼──────┐         ┌──────┼──────┐         ┌──────┼──────┐
       ▼      ▼      ▼         ▼      ▼      ▼         ▼      ▼      ▼
     Queue  Queue  Queue     Queue  Queue  Queue     Queue  Queue  Queue
       │      │      │         │      │      │         │      │      │
       └──────┴──────┴─────────┴──────┴──────┴─────────┴──────┴──────┘
                                      ▲
                                      │
                               Search / Discover
                                      │
                                      ▼
                               ┌─────────────┐
                               │    Users    │
                               └─────────────┘
```

The core relationship is:

**NoQ Platform → Multiple Institutions → Multiple Queues → Token Bookings → Users**

---

# Problem

Traditional queue systems are often built around a single institution and require customers to physically visit the service location to obtain a token.

This creates problems such as:

- Unnecessary physical waiting
- Uncertainty about queue length
- Lack of real-time queue information
- Difficulty managing multiple service queues
- No centralized way for users to discover different service providers

NoQ addresses these problems by providing a **centralized platform where institutions can offer their queues and users can discover and book them remotely.**

---

# How NoQ Works

## User Flow

```text
                    User
                     │
                     ▼
              Search Institution
                     │
                     ▼
             Select Institution
                     │
                     ▼
              View Its Queues
                     │
                     ▼
             Select a Queue
                     │
                     ▼
              View Queue Info
                     │
                     ▼
               Book Token
                     │
                     ▼
             Receive Token
                     │
                     ▼
            Track Position
                     │
                     ▼
         Receive Notifications
                     │
                     ▼
                  Served
```

## Institution Flow

```text
              Institution
                   │
                   ▼
           Register on NoQ
                   │
                   ▼
          Create Institution
                   │
                   ▼
          Create Multiple Queues
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
       Queue A  Queue B  Queue C
          │        │        │
          └────────┼────────┘
                   ▼
          Configure Queues
                   │
                   ▼
          Manage Queue Status
                   │
                   ▼
          Serve Customers
                   │
                   ▼
          Queue Updates Live
```

---

# Core Features

## User

- User registration and authentication
- Email verification
- Secure login and logout
- Password reset
- Institution search
- Institution details
- Queue discovery
- Queue details
- Remote token booking
- Token history
- Active token tracking
- Waiting-position tracking
- Token cancellation
- Token reapplication
- Real-time queue updates
- Queue notifications

## Institution

- Institution registration
- Institution profile management
- Multiple queue creation
- Queue configuration
- Daily queue limits
- Average service-time configuration
- Queue activation and deactivation
- Queue pause and resume
- Token management
- Customer servicing
- Queue monitoring

## Admin

- Platform administration
- User management
- Institution management
- Role-based access control
- System monitoring

---

# Architecture

```text
                          ┌─────────────────────────┐
                          │      React Frontend     │
                          │                         │
                          │   User / Institution    │
                          │        / Admin          │
                          └────────────┬────────────┘
                                       │
                              HTTP / WebSocket
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │     FastAPI Backend     │
                          │                         │
                          │  Authentication         │
                          │  Authorization          │
                          │  Institution Management │
                          │  Queue Management       │
                          │  Token Management       │
                          │  Tracking               │
                          │  Notifications          │
                          └──────────┬───────┬──────┘
                                     │       │
                         ┌───────────┘       └───────────┐
                         ▼                               ▼
                  ┌──────────────┐                ┌──────────────┐
                  │    MySQL     │                │    Redis     │
                  │              │                │              │
                  │ Users        │                │ Rate Limiting│
                  │ Institutions │                │ Temporary    │
                  │ Queues       │                │ Data         │
                  │ Tokens       │                │              │
                  └──────────────┘                └──────────────┘
```

---

# Backend Architecture

The backend is organized into domain-specific modules to separate authentication, users, institutions, queues, tokens, tracking, and notifications.

```text
backend/
│
├── app/
│   │
│   ├── auth/
│   │   ├── routes.py
│   │   ├── controller.py
│   │   └── dependencies.py
│   │
│   ├── users/
│   ├── institutions/
│   ├── queues/
│   ├── tokens/
│   ├── tracking/
│   ├── notifications/
│   ├── admin/
│   │
│   ├── database/
│   ├── middleware/
│   ├── utils/
│   │
│   └── main.py
│
├── migrations/
│
├── requirements.txt
├── alembic.ini
└── .env
```

---

# Authentication & Authorization

NoQ uses **JWT-based authentication** with separate access and refresh tokens.

```text
                         Login
                           │
                           ▼
                  Validate Credentials
                           │
                           ▼
                 Generate JWT Tokens
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              Access Token   Refresh Token
                    │             │
                    ▼             ▼
             API Authentication  Renewal
                    │
                    ▼
             Access Token Expires
                    │
                    ▼
             Refresh Token Flow
                    │
                    ▼
              New Access Token
```

Authentication tokens are handled using **HttpOnly cookies**.

## Role-Based Access Control

| Role | Responsibilities |
|------|------------------|
| **USER** | Discover queues, book tokens, track and manage own tokens |
| **INSTITUTION** | Manage its institution, queues, and customers |
| **ADMIN** | Manage and monitor the overall platform |

Authorization checks also ensure that institutions can only manage their own resources.

---

# Multi-Institution Data Model

The platform is centered around the relationship between institutions, queues, users, and tokens.

```text
                    ┌──────────────┐
                    │ Institution  │
                    └──────┬───────┘
                           │
                       1 : N
                           │
                           ▼
                    ┌──────────────┐
                    │    Queue     │
                    └──────┬───────┘
                           │
                       1 : N
                           │
                           ▼
                    ┌──────────────┐
                    │    Token     │
                    └──────┬───────┘
                           │
                       N : 1
                           │
                           ▼
                    ┌──────────────┐
                    │     User     │
                    └──────────────┘
```

This allows one institution to operate multiple independent queues:

```text
Institution
│
├── Service Queue A
├── Service Queue B
├── Service Queue C
└── Service Queue D
```

Users can discover these queues through the platform and book a token for the required service.

---

# Concurrent Token Booking

Concurrent token booking is one of the critical backend problems in NoQ.

If multiple users attempt to book a token at the same time, the backend must prevent duplicate token numbers.

NoQ uses database row-level locking through SQLAlchemy:

```python
queue = (
    db.query(Queue)
    .with_for_update()
    .filter(Queue.id == queue_id)
    .first()
)
```

The queue row is locked during the booking transaction.

```text
Request A ───────► Acquire Queue Lock
                          │
                          ▼
                    Generate Token
                          │
                          ▼
                        Commit
                          │
                          ▼
                    Release Lock
                          │
                          ▼
Request B ───────────────► Acquire Queue Lock
                                │
                                ▼
                          Generate Next Token
```

This prevents race conditions when multiple booking requests target the same queue concurrently.

---

# Real-Time Queue Tracking

NoQ uses **WebSockets** for real-time queue tracking.

Once a user has booked a token, the frontend can maintain a live connection with the backend and receive queue updates without continuously polling the API.

```text
Institution Serves Customer
            │
            ▼
       Queue State Changes
            │
            ▼
      Backend Processes Update
            │
            ▼
      WebSocket Manager
            │
            ▼
      Connected Clients
            │
            ▼
    Updated Queue Position
```

---

# Notification System

Users can receive notifications as their position in the queue changes.

Example notification thresholds:

```text
10 people ahead
       │
       ▼
5 people ahead
       │
       ▼
2 people ahead
       │
       ▼
1 person ahead
       │
       ▼
Your turn
```

---

# Technology Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| React | User interface |
| JavaScript | Application logic |
| Axios | HTTP communication |
| Context API | Client-side state management |
| WebSocket | Real-time communication |
| HTML / CSS | Interface structure and styling |

## Backend

| Technology | Purpose |
|------------|---------|
| Python | Backend language |
| FastAPI | REST API framework |
| SQLAlchemy | Database ORM |
| Pydantic | Request/response validation |
| Alembic | Database migrations |
| JWT | Authentication |
| Password Hashing | Credential security |
| WebSocket | Real-time communication |

## Data & Infrastructure

| Technology | Purpose |
|------------|---------|
| MySQL | Relational database |
| Redis | Rate limiting and temporary data like OTP|
| Git | Version control |
| GitHub | Source control |

> Dependency versions are maintained in `requirements.txt` and `package.json`.

---

# API

NoQ provides a RESTful API documented using **OpenAPI/Swagger**.

## Authentication

```text
POST   /auth/register
POST   /auth/verify-register
POST   /auth/resend-otp
POST   /auth/login
POST   /auth/request_reset_password
POST   /auth/verify_reset_password
POST   /auth/reset_password
POST   /auth/refresh
POST   /auth/logout
```
## Admin

```text
GET    /admin/dashboard
GET    /admin/users
GET    /admin/users/{user_id}
PATCH  /admin/users/{user_id}/status
GET    /admin/institutions
GET    /admin/institutions/{institution_id}
GET    /admin/queues
GET    /admin/queues/{queue_id}
PATCH  /admin/queues/{queue_id}/status
GET    /admin/tokens
GET    /admin/tokens/{token_id}
PATCH  /admin/tokens/{token_id}/cancel
GET    /admin/logs
GET    /admin/logs/{log_id}
```
## Institutions

```text
GET    /institutions
POST   /institutions
GET    /institutions/search
GET    /institutions/dashboard
GET    /institutions/{institution_id}
PUT    /institutions/{institution_id}
DELETE /institutions/{institution_id}
```
## User

```text
GET    /user/dashboard
```
## Queues

```text
POST   /queues
PUT    /queues/{queue_id}
DELETE /queues/{queue_id}
GET    /queues/{institution_id}
GET    /queues/details/{queue_id}
GET    /queues/dashboard/{queue_id}
GET    /queues/statistics/{queue_id}
PATCH  /queues/{queue_id}/toggle-status
GET    /queues/qr/{queue_id}
```

## Tokens

```text
POST   /tokens/book
GET    /tokens/my-tokens
GET    /tokens/{token_id}
PATCH  /tokens/{token_id}/cancel
GET    /tokens/{token_id}/waiting-position
GET    /tokens/current-token/{queue_id}
GET    /tokens/waiting-tokens/{queue_id}
```

## Tracking

```text
GET    /tracking/{token_id}
WS     /tracking/{token_id}
```

## Notifications

```text
GET    /notifications
PATCH  /notifications/{id}/read
PATCH  /notifications/read-all
```

### Swagger UI

When running the backend locally:

```text
http://localhost:8000/docs
```

---

# Database

Core entities include:

| Entity | Purpose |
|--------|---------|
| `UserModel` | Authentication and account information |
| `UserProfile` | User-specific profile data |
| `Institution` | Registered service provider |
| `Queue` | Service queue belonging to an institution |
| `Token` | User's booking within a queue |
| `RefreshToken` | Refresh-token management |
| `Notification` | Queue-related notifications |

---

# Installation

## Prerequisites

- Python
- Node.js
- MySQL
- Redis
- Git

## Clone

```bash
git clone https://github.com/<your-username>/<your-repository>.git

cd NoQ
```

---

## Backend Setup

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```env

DB_CONNECTION"
SECRET_KEY
ALGORITHM
ACCESS_TOKEN_EXP_TIME
REFRESH_TOKEN_EXP_TIME
REDIS_HOST
REDIS_PORT
REDIS_DB=MAIL_USERNAME
MAIL_PASSWORD
MAIL_FROM
MAIL_PORT
MAIL_SERVER
MAIL_FROM_NAME
MAIL_STARTTLS
MAIL_SSL_TLS
USE_CREDENTIALS
VALIDATE_CERTS
FRONTEND_URL

```

> Never commit `.env` files, passwords, API keys, or production credentials to the repository.

---

## Database Migration

Run:

```bash
alembic upgrade head
```

---

## Start Backend

```bash
uvicorn backend.app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

Open a separate terminal:

```bash
cd frontend

npm install

npm run dev
```

The development server will normally run at:

```text
http://localhost:5173
```

---

# Project Structure

```text
NoQ/
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── institutions/
│   │   ├── queues/
│   │   ├── tokens/
│   │   ├── tracking/
│   │   ├── notifications/
│   │   └── admin/
│   │
│   ├── migrations/
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
│
├── .gitignore
└── README.md
```

---

# Security

NoQ incorporates several security mechanisms:

- JWT-based authentication
- HttpOnly authentication cookies
- Access and refresh token separation
- Refresh-token validation and revocation
- Password hashing
- Role-based authorization
- Resource ownership checks
- Rate limiting
- Email verification
- Password reset
- Database-level concurrency control

---

# Key Engineering Challenges

### Multi-Institution Architecture

Designing the system to support multiple independent institutions, each with multiple queues, while maintaining appropriate ownership and authorization boundaries.

### Concurrent Token Booking

Preventing duplicate token allocation when multiple users attempt to book the same queue simultaneously.

### Authentication Lifecycle

Managing access-token expiration, refresh tokens, revocation, and secure cookie-based authentication.

### Real-Time Queue Tracking

Using WebSockets to distribute queue-state changes to connected users.

### Role-Based Authorization

Separating permissions between users, institutions, and administrators.

### Queue State Management

Handling queue activation, pausing, daily limits, waiting tokens, serving customers, cancellation, and reapplication.

---

# Future Improvements

- Mobile application
- Push notifications
- Institution analytics
- Queue performance analytics
- Dynamic service-time prediction
- Queue optimization
- Expanded automated testing
- CI/CD pipeline
- Production deployment
- Horizontal backend scaling

---

# Project Status

**Completed**

NoQ is a full-stack **multi-institution queue management platform** that enables institutions to provide multiple service queues through a shared platform while allowing users to discover queues, remotely book tokens, and track their queue position in real time.

---
# Team

NoQ was developed as a collaborative team project.

| Team Member | Role |
|-------------|------|
| **Pratik Kamali** | Backend Developer |
| **Bhoj Raj Joshi** | Backend Developer |
| **Niraj Khanal** | Frontend Developer |
| **Shuvraj Jaishi** | Frontend Developer |

### Team Profiles

- **Pratik Kamali** — [GitHub](https://github.com/pratikkamali) · [LinkedIn](https://www.linkedin.com/in/pratik-kamali-026512385)
- **Bhoj Raj Joshi** — [GitHub](https://github.com/Bhojraj-Joshi) · [LinkedIn](https://www.linkedin.com/in/bhupi-joshi-a757b1367/)
- **Niraj Khanal** — [GitHub](https://github.com/Niraj-Khanal-creator) · [LinkedIn](https://www.linkedin.com/in/niraj-khanal-38782b392/)
- **Shuvraj Regmi** — [GitHub](https://github.com/shuvarajRegmi) · [LinkedIn](https://www.linkedin.com/in/shuvaraj-regmi-349818342/)
---

# License

This project was developed for educational and portfolio purposes.
