# 🚀 Complete Setup Guide - Nexus CRM

This guide will walk you through setting up and running the complete Nexus CRM application.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** (local or MongoDB Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

## 🗂️ Project Structure

Your CRM project has two main folders:

```
CRM/
├── BACKEND/          # Express.js API server
│   ├── src/
│   ├── package.json
│   └── ...
└── FRONTEND/         # React + TypeScript application
    ├── src/
    ├── package.json
    └── ...
```

## 📦 Installation Steps

### Step 1: Install Backend Dependencies

```bash
cd BACKEND
npm install
```

### Step 2: Configure Backend Environment

Create a `.env` file in the BACKEND folder:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/nexus-crm
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexus-crm

# Server
PORT=8000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Nodemailer - optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Twilio (SMS - optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Install Frontend Dependencies

Open a new terminal and run:

```bash
cd FRONTEND
npm install
```

### Step 4: Configure Frontend Environment (Optional)

Create a `.env` file in the FRONTEND folder (optional):

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Nexus CRM
```

## 🚀 Running the Application

### Option 1: Run Both Servers Simultaneously

**Terminal 1 - Backend:**
```bash
cd BACKEND
npm run dev
```
✅ Backend will run on `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd FRONTEND
npm run dev
```
✅ Frontend will run on `http://localhost:3000`

### Option 2: Use a Process Manager (Recommended)

You can use **concurrently** to run both at once. From the root CRM folder:

1. Install concurrently globally:
```bash
npm install -g concurrently
```

2. Add this script to a root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"cd BACKEND && npm run dev\" \"cd FRONTEND && npm run dev\"",
    "install-all": "cd BACKEND && npm install && cd ../FRONTEND && npm install"
  }
}
```

3. Run both:
```bash
npm run dev
```

## 🎯 Accessing the Application

Once both servers are running:

1. **Frontend:** Open `http://localhost:3000` in your browser
2. **Backend API:** Available at `http://localhost:8000`

## 🔐 Default Credentials (Development)

Since authentication is currently mocked, you can login with any credentials:

- **Email:** any-email@example.com
- **Password:** any-password

## ✅ Verify Installation

### Check Backend:
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"ok"}
```

### Check Frontend:
- Navigate to `http://localhost:3000`
- You should see the beautiful landing page

## 🎨 First Steps

1. **Landing Page** - Check out the homepage at `http://localhost:3000`
2. **Register** - Click "Get Started" or navigate to `/register`
3. **Onboarding** - Complete the 4-step onboarding flow
4. **Dashboard** - Explore the dashboard with sample data
5. **Customers** - View and manage customers
6. **Analytics** - See beautiful charts and reports

## 🛠️ Development Tips

### Hot Reload

Both servers support hot reload:
- **Frontend:** Vite provides instant hot-module-replacement
- **Backend:** Nodemon automatically restarts on file changes

### VS Code Extensions

Recommended extensions (see `.vscode/extensions.json`):
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux Snippets

### Ports in Use

- **Frontend:** 3000
- **Backend:** 8000
- **MongoDB:** 27017 (default)

If ports are in use, you can change them:
- Frontend: Edit `vite.config.ts` → `server.port`
- Backend: Edit `.env` → `PORT`

## 📚 Project Features to Explore

### UI Components
- Modern button variants (primary, secondary, outline, ghost)
- Beautiful input fields with icons
- Stat cards with trend indicators
- Data tables with sorting and filtering
- Interactive charts (Line, Bar, Pie, Area)

### Pages
1. **Landing Page** - Marketing homepage
2. **Dashboard** - KPIs, charts, recent activity
3. **Customers** - Full customer management
4. **Analytics** - Advanced reporting
5. **Activity** - Timeline of interactions
6. **Settings** - User preferences

### Features
- 🌓 Dark/Light mode toggle
- 🔍 Global search
- 🔔 Notifications
- 👤 User profile dropdown
- 🎯 Role-based access
- 📊 Real-time data visualization

## 🐛 Troubleshooting

### Port Already in Use

**Windows:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000
# Kill process (use PID from above)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
kill $(lsof -t -i:3000)
```

### Database Connection Issues

1. **MongoDB not running:**
```bash
# Windows (if installed as service):
net start MongoDB

# Mac (with Homebrew):
brew services start mongodb-community

# Or use MongoDB Atlas (cloud)
```

2. **Connection string wrong:**
- Check your `MONGODB_URI` in `.env`
- Make sure the database name exists

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Conflicts

Change ports in config files and restart servers.

## 🚀 Building for Production

### Frontend Build:
```bash
cd FRONTEND
npm run build
# Output in dist/ folder
```

### Backend:
The backend runs in production mode with:
```bash
NODE_ENV=production npm start
```

## 📖 Next Steps

1. **Integrate real authentication** - Connect to your backend API
2. **Add real data** - Replace mock data with actual API calls
3. **Customize** - Modify colors, branding, and features
4. **Deploy** - Deploy frontend and backend to hosting services

## 💡 Tips for Customization

### Change Brand Colors

Edit [FRONTEND/tailwind.config.js](FRONTEND/tailwind.config.js):

```javascript
colors: {
  primary: {
    // Your primary color shades
    600: '#YOUR_COLOR',
  },
  accent: {
    // Your accent color shades
    600: '#YOUR_COLOR',
  }
}
```

### Add New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/layout/Sidebar.tsx`

### Modify Dashboard Widgets

Edit [FRONTEND/src/pages/Dashboard.tsx](FRONTEND/src/pages/Dashboard.tsx) to change:
- Stat cards
- Charts
- Recent activity

## 📞 Support

- Check the README files in BACKEND and FRONTEND
- Review component documentation in source files
- Inspect browser console for frontend errors
- Check terminal for backend errors

---

🎉 **Congratulations!** You now have a fully functional, modern CRM system running locally.

**Happy coding!** 🚀
