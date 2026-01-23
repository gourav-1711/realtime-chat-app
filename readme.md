# 💬 BlinkChat - Real-time Chat Application

A modern, real-time chat application built with **Next.js**, **Express**, **Socket.IO**, and **MongoDB**. BlinkChat provides instant messaging, Google OAuth authentication, image sharing, typing indicators, and online/offline status tracking.

![BlinkChat](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-ISC-blue)

## ✨ Features

### 🔐 Authentication

- **Local Authentication**: Email/password based registration and login
- **Google OAuth 2.0**: Sign in with Google account
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **Password Reset**: Email-based OTP verification for password recovery

### 💬 Real-time Messaging

- **Instant Messaging**: Socket.IO powered real-time message delivery
- **Image Sharing**: Send and receive images with Cloudinary integration
- **Delete Conversations**: Remove entire conversation history with confirmation dialog
- **Typing Indicators**: See when someone is typing
- **Read Receipts**: Double check marks for read messages
- **Optimistic Updates**: Messages appear instantly before server confirmation

### 👥 User Features

- **User Search**: Find and connect with other users
- **Profile Management**: Update avatar, name, and description
- **Online/Offline Status**: Real-time presence indicators
- **User Avatars**: Profile pictures with fallback initials

### 🎨 UI/UX

- **Dark Mode**: Seamless dark/light theme switching
- **Responsive Design**: Mobile-first, works on all devices
- **PWA Support**: Install as a native app on mobile/desktop
- **Smooth Animations**: Framer Motion powered transitions
- **Modern UI**: Built with Radix UI and Tailwind CSS
- **Fallback Images**: Placeholder images for broken avatars and attachments

### 🚀 Performance

- **Compression**: Gzip compression for API responses
- **Optimized Images**: Cloudinary CDN for fast image delivery
- **Socket Connection**: Persistent WebSocket connection
- **State Management**: Redux Toolkit for efficient state updates

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: JavaScript (React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Real-time**: [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- **Form Handling**: [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup)
- **PWA**: [@ducanh2912/next-pwa](https://www.npmjs.com/package/@ducanh2912/next-pwa)

### Backend

- **Framework**: [Express.js 5](https://expressjs.com/)
- **Language**: JavaScript (Node.js)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Real-time**: [Socket.IO](https://socket.io/)
- **Authentication**: [Passport.js](http://www.passportjs.org/) (Google OAuth)
- **Token Management**: [JSON Web Tokens](https://www.npmjs.com/package/jsonwebtoken)
- **File Upload**: [Multer](https://www.npmjs.com/package/multer)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Email Service**: [Nodemailer](https://nodemailer.com/)
- **Security**: [Helmet](https://helmetjs.github.io/), [bcrypt](https://www.npmjs.com/package/bcrypt)
- **Performance**: [Compression](https://www.npmjs.com/package/compression)

## 📁 Project Structure

```
chat-app/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── (auth)/      # Authentication pages
│   │   │   ├── api/         # API route handlers
│   │   │   └── dashboard/   # Main app pages
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── socket-context.jsx
│   │   ├── lib/             # Utility functions
│   │   └── middleware.js    # Next.js middleware
│   ├── public/              # Static assets
│   └── package.json
│
├── server/                  # Express backend application
│   ├── src/
│   │   ├── controller/      # Route controllers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── lib/             # Utilities (JWT, Passport, Socket.IO)
│   ├── uploads/             # File upload directory
│   ├── index.js             # Server entry point
│   └── package.json
│
├── readme.md                # This file
└── setup.md                 # Setup instructions
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Installation Guide](https://www.mongodb.com/docs/manual/installation/)
- **Google Cloud Account** - For OAuth setup
- **Cloudinary Account** - For image storage
- **Gmail Account** - For email service (or any SMTP)

### Installation

See the detailed [**SETUP.md**](./setup.md) file for:

- Environment configuration
- Google OAuth setup with key creation
- MongoDB setup
- API endpoints documentation
- Running the application
- Production deployment

## 📚 Documentation

- **[Setup Guide](./setup.md)** - Complete setup instructions with environment variables and OAuth configuration
- **[API Documentation](./setup.md#api-endpoints)** - All available API endpoints

## 🔑 Key Features Explained

### Real-time Communication

The app uses **Socket.IO** for bidirectional, event-based communication between the client and server. Messages are delivered instantly without polling.

### Authentication Flow

1. User registers or logs in (local or Google OAuth)
2. Server issues a JWT token
3. Token stored in HTTP-only cookies
4. Middleware validates token on protected routes
5. Socket.IO authenticates using the same token

### Online Status Management

- Users marked "online" when socket connects
- Server resets all users to "offline" on startup (prevents stale states)
- Status updates broadcast to all connected clients in real-time

### Delete Conversation

- Delete entire conversation history between two users
- Confirmation dialog with warning about cross-user deletion
- Permanently removes all messages from both sides
- Real-time updates ensure conversation list stays synchronized

## 👨‍💻 Author

**Gourav**  



**Built with ❤️ using Next.js and Socket.IO and Node js**
