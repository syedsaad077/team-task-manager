# Team Task Manager

Live Demo: https://team-task-manager-07.up.railway.app
Backend API: https://team-task-manager-production-6ac91.up.railway.app

A full-stack collaborative task management platform built with the MERN stack (MongoDB, Express, React, Node.js). Designed for teams with strict role-based access control, real-time-like notifications, and a clean dark-mode UI.

---

FEATURES
========

Authentication & Security
- JWT-based login and signup
- Role-Based Access Control: Admin and Member roles
- Strict data isolation — members only see projects and tasks they are assigned to

Project Management
- Admins can create, edit, and delete projects
- Multi-select member assignment during project creation/editing
- Cascading deletion — removing a project also removes all its tasks

Task Management
- Admins can create, edit, and delete tasks
- Assign tasks to specific members with a due date
- Filter tasks by Status and Project

Advanced Approval Workflow
- Member: Start Working → Submit for Review
- Admin: Approve (Completed) or Request Rework
- Status lifecycle: Pending → In Progress → In Review → Completed / Rework

Real-Time Notifications (In-App Bell)
- Members receive notifications when:
  - They are added to a new project
  - A new task is assigned to them
  - Admin changes their task status (Rework / Completed)
- Admins receive notifications when:
  - A member submits a task for review
- Notifications can be marked as read individually
- Red pulsing dot badge for unread count

Task Comments
- All users can post threaded comments on any task
- Comments display the author's name and timestamp

Email Notifications
- Automatic email sent when a task is assigned
- Supports test mode (Ethereal Email) and production mode (Gmail SMTP)

Dark Mode
- Persistent dark mode toggle via localStorage
- Full dark theme across all pages and components

---

TECH STACK
==========

Frontend  : React (Vite), Tailwind CSS
Backend   : Node.js, Express.js
Database  : MongoDB (Mongoose) — NoSQL
Auth      : JSON Web Tokens (JWT)
Email     : Nodemailer (Ethereal / Gmail)
Deployed  : Railway (Backend + Frontend), MongoDB Atlas (Database)

---

GETTING STARTED (Local Setup)
==============================

Prerequisites:
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

1. Clone the Repository
   git clone https://github.com/syedsaad077/team-task-manager.git
   cd team-task-manager

2. Backend Setup
   cd backend
   npm install

   Create a .env file inside backend/ folder:
   ----------------------------------------
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key

   # Optional: For real email notifications
   # EMAIL_USER=your_gmail@gmail.com
   # EMAIL_PASS=your_gmail_app_password
   ----------------------------------------

   Start backend server:
   npm run dev
   → Runs at http://localhost:5000

3. Frontend Setup
   cd ../frontend
   npm install
   npm run dev
   → Runs at http://localhost:5173

---

ENVIRONMENT VARIABLES
=====================

Variable      | Required | Description
PORT          | No       | Backend port (default: 5000)
MONGO_URI     | YES      | MongoDB connection string
JWT_SECRET    | YES      | Secret key for signing JWTs
FRONTEND_URL  | No       | Frontend URL (for CORS)
EMAIL_USER    | No       | Gmail address for sending emails
EMAIL_PASS    | No       | Gmail App Password

---

ROLES & PERMISSIONS
===================

Feature                    | Admin          | Member
View all projects & tasks  | YES            | NO (own only)
Create projects            | YES            | NO
Edit / Delete projects     | YES            | NO
Create tasks               | YES            | NO
Delete tasks               | YES            | NO
Update task status         | YES (all)      | YES (limited)
Mark task as Completed     | YES            | NO
Submit task for Review     | NO             | YES
View notifications         | YES            | YES
Add comments               | YES            | YES

---

EMAIL SETUP (Production - Gmail)
=================================

1. Enable 2-Step Verification on your Google account
2. Go to Google Account → Security → App Passwords
3. Create an App Password for "Mail"
4. Add to backend/.env:
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
5. Restart the backend server

---

DEPLOYMENT (Railway)
====================

Backend:
- Root Directory: backend
- Variables: MONGO_URI, JWT_SECRET, NODE_ENV=production, FRONTEND_URL

Frontend:
- Root Directory: frontend
- Build Command: npm run build
- Start Command: npm run preview
- Variables: VITE_API_URL=https://your-backend-url.up.railway.app/api

---

AUTHOR
======

Built with love by Syed Saad Hasan
GitHub: https://github.com/syedsaad077/team-task-manager
Live: https://team-task-manager-07.up.railway.app
