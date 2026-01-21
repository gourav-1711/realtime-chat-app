# 🛠️ BlinkChat Setup Guide

Complete setup instructions for running BlinkChat locally or in production.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** (v5 or higher) - [Installation Guide](https://www.mongodb.com/docs/manual/installation/)
- **Git** - [Download](https://git-scm.com/)

You'll also need accounts for:

- **Google Cloud Console** - [Console](https://console.cloud.google.com/)
- **Cloudinary** - [Sign Up](https://cloudinary.com/)
- **Gmail** (or any SMTP email service)

---

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/gourav-1711/realtime-chat-app.git
cd chat-app
```

### 2. Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
touch .env  # On Windows: type nul > .env
```

Add the following variables to `server/.env`:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URL="mongodb://localhost:27017/blinkchat"

# JWT Secret (Use a strong random string in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email Configuration (Gmail SMTP)
MY_GMAIL="your-email@gmail.com"
MY_GMAIL_PASSWORD="your-app-specific-password"
```

**Important Notes:**

- **JWT_SECRET**: Generate a strong random string. You can use: `openssl rand -base64 32`
- **MY_GMAIL_PASSWORD**: Use an [App Password](https://support.google.com/accounts/answer/185833), not your regular Gmail password
- For production, use environment variables from your hosting provider

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
cd ../frontend
touch .env.local  # On Windows: type nul > .env.local
```

Add the following to `frontend/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_API="http://localhost:5000"
```

**Production Note**: Update these URLs to your production backend URL when deploying.

---

## 🔐 Google OAuth 2.0 Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "BlinkChat") and click **Create**
4. Select your newly created project

### Step 2: Enable Google+ API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on it and press **Enable**

**Documentation**: [Google+ API Setup](https://developers.google.com/identity/protocols/oauth2)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type and click **Create**
3. Fill in the required fields:
   - **App name**: BlinkChat
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Save and Continue** (no changes needed)
6. On **Test users**, add your email for testing, then **Save and Continue**

**Documentation**: [OAuth Consent Screen](https://support.google.com/cloud/answer/10311615)

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Application type**: Web application
4. Enter **Name**: BlinkChat Web Client
5. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   ```
6. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Click **Create**
8. Copy your **Client ID** and **Client Secret**

**Documentation**: [Creating OAuth Credentials](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred)

### Step 5: Update Environment Variables

Add the credentials to your `server/.env`:

```env
GOOGLE_CLIENT_ID="103725171737-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxx"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"
```

**For Production**: Update authorized origins and redirect URIs with your production URLs.

---

## ☁️ Cloudinary Setup

Cloudinary is used for image storage and CDN delivery.

### Step 1: Create Account

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Verify your email

### Step 2: Get API Credentials

1. Go to your [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Find your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Update Environment Variables

Add to `server/.env`:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="254846445419572"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Documentation**: [Cloudinary Node.js Integration](https://cloudinary.com/documentation/node_integration)

---

## 📧 Email (Gmail SMTP) Setup

For password reset functionality, configure Gmail SMTP.

### Step 1: Generate App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords** (search for it in settings)
4. Select app: **Mail**, device: **Other (Custom name)**
5. Enter name: "BlinkChat" and click **Generate**
6. Copy the 16-character password

### Step 2: Update Environment Variables

Add to `server/.env`:

```env
MY_GMAIL="your-email@gmail.com"
MY_GMAIL_PASSWORD="xxxx xxxx xxxx xxxx"  # 16-character app password
```

**Documentation**: [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

**Alternative SMTP**: You can use any SMTP service (SendGrid, Mailgun, etc.). Update `server/src/lib/nodemailer.js` accordingly.

---

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB

#### Install MongoDB

**Windows/Mac/Linux**: Follow the [official installation guide](https://www.mongodb.com/docs/manual/installation/)

#### Start MongoDB

```bash
# Windows (as a service)
net start MongoDB

# Mac (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod
```

#### Verify Connection

```bash
mongosh  # MongoDB Shell
# Should connect to mongodb://127.0.0.1:27017
```

Your `MONGO_URL` in `.env`:

```env
MONGO_URL="mongodb://localhost:27017/blinkchat"
```

**Documentation**: [MongoDB Installation](https://www.mongodb.com/docs/manual/installation/)

### Option 2: MongoDB Atlas (Cloud)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **free cluster**
3. Create a **database user** (username + password)
4. Whitelist your IP address (or use `0.0.0.0/0` for all IPs during development)
5. Click **Connect** → **Connect your application**
6. Copy the connection string

Update `server/.env`:

```env
MONGO_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/blinkchat?retryWrites=true&w=majority"
```

**Documentation**: [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)

---

## 🏃‍♂️ Running the Application

### Development Mode

#### 1. Start MongoDB (if local)

```bash
# Make sure MongoDB is running (see MongoDB setup above)
```

#### 2. Start Backend Server

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

You should see:

```
Server is running on port 5000
Connected to MongoDB
All users status reset to offline
```

#### 3. Start Frontend (in a new terminal)

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

#### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Mode

#### Backend

```bash
cd server
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm start
```

**Deployment**: For production deployment, consider:

- **Backend**: Heroku, Railway, Render, DigitalOcean
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: MongoDB Atlas

---

## 📡 API Endpoints

All API endpoints are prefixed with `/api` on the backend server.

### Authentication Routes (`/api/auth`)

| Method | Endpoint                    | Description                | Auth Required |
| ------ | --------------------------- | -------------------------- | ------------- |
| `GET`  | `/api/auth/google`          | Initiate Google OAuth flow | No            |
| `GET`  | `/api/auth/google/callback` | Google OAuth callback      | No            |

**Documentation**: [Passport.js Google OAuth](http://www.passportjs.org/packages/passport-google-oauth20/)

---

### User Routes (`/api/user`)

| Method | Endpoint                    | Description               | Body Parameters                        | Auth Required |
| ------ | --------------------------- | ------------------------- | -------------------------------------- | ------------- |
| `POST` | `/api/user/register`        | Register new user         | `name`, `email`, `password`            | No            |
| `POST` | `/api/user/login`           | Login with credentials    | `email`, `password`                    | No            |
| `POST` | `/api/user/refresh-token`   | Refresh JWT token         | `refreshToken`                         | No            |
| `POST` | `/api/user/profile`         | Get current user profile  | -                                      | Yes           |
| `POST` | `/api/user/update-profile`  | Update user profile       | `name`, `description`, `avatar` (file) | Yes           |
| `POST` | `/api/user/find-users`      | Search for users          | `search`                               | Yes           |
| `POST` | `/api/user/selected-user`   | Get specific user details | `selectedUserId`                       | Yes           |
| `POST` | `/api/user/forgot-password` | Initiate password reset   | `email`                                | No            |
| `POST` | `/api/user/verify-otp`      | Verify OTP code           | `email`, `otp`                         | Yes           |
| `POST` | `/api/user/reset-password`  | Reset password            | `newPassword`                          | Yes           |

**Example Request** (Register):

```javascript
POST /api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Example Response**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65f8a9c8d1234567890abcde",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "status": "offline"
    }
  }
}
```

---

### Message Routes (`/api/message`)

| Method | Endpoint                                    | Description                  | Body Parameters                          | Auth Required |
| ------ | ------------------------------------------- | ---------------------------- | ---------------------------------------- | ------------- |
| `POST` | `/api/message/send-message`                 | Send text message            | `receiver_id`, `message`                 | Yes           |
| `POST` | `/api/message/send-image`                   | Send image message           | `receiver_id`, `message`, `image` (file) | Yes           |
| `POST` | `/api/message/mark-as-read/:messageId`      | Mark message as read         | -                                        | Yes           |
| `POST` | `/api/message/mark-all-as-read/:withUserId` | Mark all messages as read    | -                                        | Yes           |
| `POST` | `/api/message/get-all-msg`                  | Get all messages with a user | `withUserId`                             | Yes           |
| `POST` | `/api/message/get-conversation-with-other`  | Get conversation preview     | `withUserId`                             | Yes           |

**Example Request** (Send Message):

```javascript
POST /api/message/send-message
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver_id": "65f8a9c8d1234567890abcde",
  "message": "Hello, how are you?"
}
```

**Note**: For real-time messaging, Socket.IO is used. See Socket Events section below.

---

## 🔌 Socket.IO Events

The application uses Socket.IO for real-time features on `http://localhost:5000`.

**Documentation**: [Socket.IO Documentation](https://socket.io/docs/v4/)

### Client → Server Events

| Event          | Payload                           | Description             |
| -------------- | --------------------------------- | ----------------------- |
| `add-user`     | `token` (JWT)                     | Register user as online |
| `send-message` | `{ receiverId, message, tempId }` | Send a text message     |
| `mark-as-read` | `{ messageId, senderId }`         | Mark message as read    |
| `typing`       | `{ receiverId, typing: boolean }` | Send typing indicator   |

### Server → Client Events

| Event             | Payload                      | Description                |
| ----------------- | ---------------------------- | -------------------------- |
| `online-users`    | `Array<userId>`              | List of online user IDs    |
| `user-status`     | `{ userId, status }`         | User went online/offline   |
| `user-offline`    | `userId`                     | User disconnected          |
| `receive-message` | `messageData`                | New message received       |
| `message-sent`    | `{ ...messageData, tempId }` | Message sent confirmation  |
| `message-error`   | `{ error, tempId }`          | Message send failed        |
| `update-message`  | `{ messageId, isRead }`      | Message read status update |
| `user-typing`     | `{ userId, typing }`         | User typing status         |

**Example Usage** (Frontend):

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// Connect and authenticate
socket.on("connect", () => {
  socket.emit("add-user", token);
});

// Listen for new messages
socket.on("receive-message", (message) => {
  console.log("New message:", message);
});

// Send a message
socket.emit("send-message", {
  receiverId: "65f8a9c8d1234567890abcde",
  message: "Hello!",
  tempId: "temp-123",
});
```

---

## 📦 Dependencies Documentation

### Backend Dependencies

| Package                 | Version | Documentation                                                       | Purpose                   |
| ----------------------- | ------- | ------------------------------------------------------------------- | ------------------------- |
| express                 | ^5.1.0  | [Docs](https://expressjs.com/)                                      | Web framework             |
| mongoose                | ^8.18.1 | [Docs](https://mongoosejs.com/)                                     | MongoDB ODM               |
| socket.io               | ^4.8.1  | [Docs](https://socket.io/docs/v4/)                                  | Real-time communication   |
| passport                | ^0.7.0  | [Docs](http://www.passportjs.org/)                                  | Authentication middleware |
| passport-google-oauth20 | ^2.0.0  | [Docs](http://www.passportjs.org/packages/passport-google-oauth20/) | Google OAuth strategy     |
| jsonwebtoken            | ^9.0.2  | [Docs](https://github.com/auth0/node-jsonwebtoken#readme)           | JWT token generation      |
| bcrypt                  | ^6.0.0  | [Docs](https://github.com/kelektiv/node.bcrypt.js#readme)           | Password hashing          |
| multer                  | ^2.0.2  | [Docs](https://github.com/expressjs/multer#readme)                  | File upload handling      |
| cloudinary              | ^2.7.0  | [Docs](https://cloudinary.com/documentation/node_integration)       | Image storage/CDN         |
| nodemailer              | ^7.0.6  | [Docs](https://nodemailer.com/)                                     | Email sending             |
| helmet                  | ^8.1.0  | [Docs](https://helmetjs.github.io/)                                 | Security headers          |
| compression             | ^1.8.1  | [Docs](https://github.com/expressjs/compression#readme)             | Response compression      |
| cors                    | ^2.8.5  | [Docs](https://github.com/expressjs/cors#readme)                    | CORS middleware           |

### Frontend Dependencies

| Package          | Version  | Documentation                                             | Purpose          |
| ---------------- | -------- | --------------------------------------------------------- | ---------------- |
| next             | ^16.1.4  | [Docs](https://nextjs.org/docs)                           | React framework  |
| react            | ^19.2.3  | [Docs](https://react.dev/)                                | UI library       |
| socket.io-client | ^4.8.1   | [Docs](https://socket.io/docs/v4/client-api/)             | Socket.IO client |
| @reduxjs/toolkit | ^2.9.0   | [Docs](https://redux-toolkit.js.org/)                     | State management |
| axios            | ^1.12.1  | [Docs](https://axios-http.com/docs/intro)                 | HTTP client      |
| framer-motion    | ^12.27.4 | [Docs](https://www.framer.com/motion/)                    | Animations       |
| formik           | ^2.4.9   | [Docs](https://formik.org/docs/overview)                  | Form handling    |
| yup              | ^1.7.1   | [Docs](https://github.com/jquense/yup#readme)             | Form validation  |
| tailwindcss      | ^4       | [Docs](https://tailwindcss.com/docs)                      | CSS framework    |
| @radix-ui/\*     | Various  | [Docs](https://www.radix-ui.com/)                         | UI primitives    |
| next-themes      | ^0.4.6   | [Docs](https://github.com/pacocoursey/next-themes#readme) | Theme management |

---

## 🧪 Testing the Setup

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/

# Expected response: "Chat App Server is running!"
```

### 2. Test MongoDB Connection

Check the server console for:

```
Connected to MongoDB
All users status reset to offline
```

### 3. Test Registration

```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Test Google OAuth

Navigate to:

```
http://localhost:5000/api/auth/google
```

You should be redirected to Google sign-in.

### 5. Test Frontend

Open `http://localhost:3000` and verify:

- Registration/login forms load
- Theme switcher works
- Google sign-in button appears

---

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Ensure MongoDB is running:

```bash
# Check if MongoDB is running
mongosh
```

### Google OAuth Redirect URI Mismatch

```
Error: redirect_uri_mismatch
```

**Solution**:

1. Check `GOOGLE_CALLBACK_URL` in `.env` matches the one in Google Cloud Console
2. Ensure both backend (5000) and frontend (3000) URLs are authorized

### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Verify backend CORS configuration in `server/index.js` allows `http://localhost:3000`

### Cloudinary Upload Error

```
Error: Must supply api_key
```

**Solution**: Double-check Cloudinary credentials in `.env`

### Email Not Sending

```
Error: Invalid login
```

**Solution**:

1. Use Gmail App Password (not regular password)
2. Enable 2-Step Verification
3. Generate new App Password

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review backend console logs
3. Check browser console for frontend errors
4. contact me : 8387840848 : whatsapp
5. gouravdadhich34@gmail.com : email

---

## 🎉 Next Steps

Once setup is complete:

1. Create a user account
2. Test Google OAuth login
3. Search for other users
4. Start a chat conversation
5. Try sending images
6. Test dark/light theme switching

**Enjoy using BlinkChat! 💬**
