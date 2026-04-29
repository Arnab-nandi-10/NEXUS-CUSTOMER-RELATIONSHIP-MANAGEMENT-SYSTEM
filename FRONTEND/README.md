# 🚀 Nexus CRM - Modern SaaS Customer Relationship Management

A beautiful, modern, and production-ready CRM platform built with React, TypeScript, and Tailwind CSS.

![Nexus CRM](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=400&q=80)

## ✨ Features

- 🎨 **Modern UI/UX** - Clean, minimal design with smooth animations
- 🌓 **Dark Mode** - Full dark mode support with theme persistence
- 📊 **Analytics Dashboard** - Beautiful charts and data visualizations
- 👥 **Customer Management** - Complete customer relationship tracking
- 📈 **Sales Pipeline** - Visual deal tracking and management
- ⚡ **Real-time Updates** - Live activity feed and notifications
- 🔐 **Authentication** - Secure login and registration
- 🎯 **Onboarding Flow** - Guided setup for new users
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎭 **Role-based Access** - Admin, Manager, and User roles

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** Zustand
- **Charts:** Recharts
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Backend:** Node.js + Express (in ../BACKEND)
- **Database:** MongoDB

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running (see ../BACKEND)

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Input, Card, etc.)
│   └── layout/         # Layout components (Sidebar, Header)
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── Dashboard.tsx
│   ├── Customers.tsx
│   ├── Analytics.tsx
│   ├── Activity.tsx
│   ├── Settings.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Onboarding.tsx
├── store/              # Zustand stores
│   ├── authStore.ts
│   └── themeStore.ts
├── lib/                # Utilities and helpers
│   └── utils.ts
├── App.tsx             # Main app component with routing
└── main.tsx           # Entry point
```

## 🎨 Design System

### Color Palette

- **Primary:** Sky Blue (#0ea5e9) - Main brand color
- **Accent:** Fuchsia (#d946ef) - Secondary highlights
- **Success:** Green (#22c55e)
- **Warning:** Amber (#f59e0b)
- **Danger:** Red (#ef4444)
- **Dark:** Slate grays for text and backgrounds

### Typography

- **Font Family:** Inter (sans-serif)
- **Headings:** Bold, 2xl-7xl
- **Body:** Regular/Medium, sm-lg

### Components

All components are built with:
- Accessibility in mind
- Dark mode support
- Smooth transitions
- Responsive design

## 🔐 Authentication

The app uses a mock authentication system for demo purposes. In production, connect to your backend API:

```typescript
// src/store/authStore.ts
const { login } = useAuthStore()
await login(email, password)
```

## 🌐 API Integration

Update the proxy configuration in `vite.config.ts` to connect to your backend:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## 📱 Pages Overview

1. **Landing Page** - Marketing homepage with features and testimonials
2. **Dashboard** - Overview with KPIs, charts, and recent activity
3. **Customers** - Customer list with search, filters, and management
4. **Analytics** - Detailed reports and data visualizations
5. **Activity** - Timeline of all customer interactions
6. **Settings** - User profile and preferences
7. **Login/Register** - Authentication pages
8. **Onboarding** - Multi-step guided setup

## 🎯 Key Features Explained

### Dashboard
- Real-time metrics and KPIs
- Revenue charts and sales pipeline
- Recent activity feed
- Quick actions

### Customer Management
- Advanced search and filtering
- Contact information management
- Deal tracking
- Activity history

### Analytics
- Sales performance metrics
- Revenue tracking
- Team performance
- Custom date ranges

## 🚢 Deployment

### Build for production:
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to:
- **Vercel:** `vercel deploy`
- **Netlify:** Connect your repo
- **AWS S3/CloudFront:** Upload dist folder

## 🤝 Contributing

This is a design implementation based on the provided UX brief. Feel free to customize and extend it for your needs.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Credits

- Design inspired by modern SaaS platforms
- Icons from [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- UI patterns from best-in-class CRM systems

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
