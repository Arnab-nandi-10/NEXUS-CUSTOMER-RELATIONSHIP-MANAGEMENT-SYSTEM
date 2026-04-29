# Nexus CRM 🚀

A modern, full-stack SaaS CRM platform built with React, TypeScript, Node.js, and MongoDB.

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Vite
- Zustand (State Management)
- React Router
- Recharts (Data Visualization)
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt (Password Hashing)
- Cloudinary (File Uploads)
- Nodemailer & Twilio (Notifications)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Arnab-nandi-10/CRM-SAAS.git
cd CRM-SAAS
```

### 2. Install dependencies
```bash
npm run install-all
```

### 3. Configure environment variables

Create `BACKEND/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/nexus-crm
PORT=8000
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:3000
```

Create `FRONTEND/.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 4. Start the application
```bash
npm run dev
```

The application will run on:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## 📁 Project Structure

```
CRM-SAAS/
├── BACKEND/              # Express API server
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middlewares/  # Auth & validation
│   │   ├── utils/        # Helper functions
│   │   └── db/           # Database config
│   └── package.json
│
├── FRONTEND/             # React TypeScript app
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── layout/   # Header, Sidebar
│   │   │   └── ui/       # Buttons, Cards, Inputs
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand stores
│   │   └── lib/          # API & utilities
│   └── package.json
│
└── package.json          # Root package
```

## ✨ Features

- 🔐 **Authentication** - Secure JWT-based auth with role management
- 👥 **Client Management** - Complete customer lifecycle management
- 📊 **Dashboard** - Real-time KPIs and analytics
- 📈 **Analytics** - Sales performance tracking and reports
- ✅ **Task Management** - Team task assignment and tracking
- 🔔 **Reminders** - Automated notifications and alerts
- 💬 **Communication** - Track all customer interactions
- 📱 **Responsive Design** - Mobile-friendly interface

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Environment variable configuration

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Arnab Nandi - [GitHub](https://github.com/Arnab-nandi-10)
