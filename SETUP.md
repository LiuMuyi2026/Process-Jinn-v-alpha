# Process Jinn - Authentication & Database Setup

This guide will help you set up Firebase authentication and database for both local development and Vercel deployment.

## Prerequisites

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database in test mode

## Firebase Configuration

### 1. Get Firebase Credentials

From your Firebase project settings:

1. Go to Project Settings → General → Your apps
2. Click on the web app (</>) icon to register a new app
3. Copy the `firebaseConfig` object values

### 2. Local Development Setup

Create a `.env.local` file in the project root:

```env
# Firebase Configuration - Local Development
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Vercel Deployment Setup

Add environment variables in your Vercel dashboard:

1. Go to your Vercel project → Settings → Environment Variables
2. Add the following variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## Firestore Security Rules

In Firebase Console → Firestore Database → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Users can read/write their own processes
      match /processes/{processId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Authentication Setup

1. In Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password** provider
3. Enable **Google** provider
4. Add your domain (localhost for local, your-domain.com for production)

## Features Enabled

With this setup, users can:

- ✅ Sign up with email/password or Google
- ✅ Log in and log out
- ✅ Save their processes with timestamps
- ✅ View their process history
- ✅ Load previous processes
- ✅ Delete saved processes
- ✅ Works in both local development and Vercel production

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure environment variables are set in production

## Troubleshooting

### Common Issues

1. **"Firebase project not initialized"**: Check your environment variables
2. **"Permission denied"**: Verify Firestore security rules
3. **"Auth provider not enabled"**: Enable the provider in Firebase Console

### Debug Mode

For debugging, you can temporarily enable debug mode in your browser console:
```javascript
localStorage.setItem('debug', 'firebase*');
```
