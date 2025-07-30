📝 Note-Taking Application
A full-stack, secure, and responsive note-taking app with Email/OTP and Google OAuth login, note management, and JWT-based authentication. Built with React (TypeScript) on the frontend and Node.js + Express (TypeScript) on the backend, using MongoDB as the database.

🚀 Features
✅ Sign up & log in via Email + OTP or Google OAuth

🔒 JWT-secured authentication

🗒️ Create and delete notes

📱 Fully responsive UI (mobile-friendly)

⚠️ Input validation and error handling

🧱 Tech Stack
Layer	Technology
Frontend	React + TypeScript (Vite)
Backend	Node.js + Express + TypeScript
Database	MongoDB
Auth	JWT + Google OAuth (Passport.js)

📁 Project Structure
bash
Copy
Edit
note-taking-app/
├── backend/      # Express backend (TypeScript)
├── frontend/     # React frontend (TypeScript, Vite)
├── README.md
└── .gitignore
✅ Prerequisites
Node.js v16+

npm or yarn

MongoDB instance (local or Atlas)

Google OAuth credentials from Google Cloud Console

⚙️ Setup Guide
1. Clone the Repository
git clone https://github.com/akash12888/note-taking-app.git
cd note-taking-app

2. Backend Setup
cd backend
npm install        # Install dependencies
npm run build      # Compile TypeScript
Fill in .env with:
env
Copy
Edit
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173
PORT=5000

3. Frontend Setup
cd ../frontend
npm install        # Install dependencies
cp .env.example .env  # Create environment config
npm run build      # Build production assets
Set the VITE_API_URL in .env:
VITE_API_URL=http://localhost:5000/api
🧪 Run in Development Mode
Open two terminals:
Terminal 1 – Backend
cd backend
npm run dev        # Starts backend server on http://localhost:5000
Terminal 2 – Frontend
cd frontend
npm run dev        # Starts frontend on http://localhost:5173
🌐 Deployment Guide
Backend (e.g., Render, Railway, Heroku)
Set root directory: backend/

Add environment variables from .env

Use npm run build before deploying

Frontend (e.g., Vercel, Netlify)
Set root directory: frontend/

Set build command: npm run build

Set output directory: dist

Add VITE_API_URL pointing to the deployed backend

📦 Summary Build Commands
# Backend
cd backend
npm install
npm run build

# Frontend
cd frontend
npm install
npm run build
🔐 Environment Variable Reference
env
MONGODB_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
SESSION_SECRET=
FRONTEND_URL=
PORT=5000
📄 .env.example (Frontend)
env
VITE_API_URL=
💡 Tips
Use .env.example files to document your required environment variables.

Never commit real .env files to Git.

Ensure builds are done before deployment to avoid runtime errors.

Install any missing @types/... dependencies for TypeScript builds.

