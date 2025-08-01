# 📝 Note-Taking Application
A full-stack, secure, and responsive note-taking app with Email/OTP and Google OAuth login, note management, and JWT-based authentication. Built with React (TypeScript) on the frontend and Node.js + Express (TypeScript) on the backend, using MongoDB as the database.
🚀 Live Demo: https://note-taking-app-1-5psf.onrender.com/

## 🚀 Features

- ✅ **Authentication**: Sign up & log in via Email + OTP or Google OAuth
- 🔒 **Security**: JWT-secured authentication with session management
- 🗒️ **Note Management**: Create, edit, and delete notes with ease
- 📱 **Responsive Design**: Fully responsive UI optimized for mobile devices
- ⚠️ **Validation**: Comprehensive input validation and error handling
- 🎨 **Modern UI**: Clean, intuitive interface built with modern design principles

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + TypeScript (Vite) |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | MongoDB |
| **Authentication** | JWT + Google OAuth (Passport.js) |
| **Build Tool** | Vite |
| **Styling** | CSS3 + Responsive Design |

## 📁 Project Structure

```
note-taking-app/
├── backend/          # Express backend (TypeScript)
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React frontend (TypeScript, Vite)
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **MongoDB** instance (local installation or MongoDB Atlas)
- **Google OAuth credentials** from Google Cloud Console

## ⚙️ Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/akash12888/note-taking-app.git
cd note-taking-app
```

### 2. Backend Setup

```bash
cd backend
npm install        # Install dependencies
npm run build      # Compile TypeScript
```

Create a `.env` file in the backend directory with the following variables:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install        # Install dependencies
cp .env.example .env  # Create environment config
npm run build      # Build production assets
```

Configure your frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Development Mode

To run the application in development mode, open two terminal windows:

### Terminal 1 – Backend Server
```bash
cd backend
npm run dev        # Starts backend server on http://localhost:5000
```

### Terminal 2 – Frontend Server
```bash
cd frontend
npm run dev        # Starts frontend on http://localhost:5173
```

The application will be available at `http://localhost:5173` with the backend API running on `http://localhost:5000`.

## 🌐 Deployment Guide

### Backend Deployment (Render, Railway, Heroku)

1. **Set root directory**: `backend/`
2. **Add environment variables** from your `.env` file
3. **Build command**: `npm run build`
4. **Start command**: `npm start`

### Frontend Deployment (Vercel, Netlify)

1. **Set root directory**: `frontend/`
2. **Build command**: `npm run build`
3. **Output directory**: `dist`
4. **Environment variable**: `VITE_API_URL` pointing to your deployed backend URL

## 📦 Build Commands Summary

### Backend Production Build
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend Production Build
```bash
cd frontend
npm install
npm run build
```

## 🔐 Environment Variables Reference

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/notes-app
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=your-session-secret-key
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 💡 Development Tips

- **Environment Files**: Use `.env.example` files to document required environment variables without exposing sensitive data
- **Security**: Never commit actual `.env` files to version control
- **Build Process**: Always run builds before deployment to catch TypeScript errors early
- **Dependencies**: Install missing `@types/*` packages for proper TypeScript support
- **Testing**: Test both authentication methods (Email/OTP and Google OAuth) thoroughly
- **Mobile Testing**: Use browser dev tools to test responsive design on various screen sizes
- 
## 🐛 Troubleshooting

### Common Issues

- **MongoDB Connection**: Ensure your MongoDB instance is running and the URI is correct
- **Google OAuth**: Verify your Google Cloud Console settings and callback URLs
- **CORS Errors**: Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
- **Build Errors**: Run `npm run build` to catch TypeScript compilation issues early
