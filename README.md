# ProjectLocked 🔒

A social accountability app to help you lock in and stay focused. Start timed sessions, share proof, and build streaks with friends.

## What It Does

- **Start Focus Sessions**: Choose a duration (25/50/90 min), tag your activity (Study, Gym, Build, etc.)
- **Prove Your Work**: Capture before/after photos as proof
- **Social Feed**: See what your friends are working on
- **React & Engage**: Support friends with emoji reactions
- **Track Streaks**: Build consistency with daily streak tracking

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: Expo Router

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

```bash
# Install dependencies
npm install

# Start the app
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Firebase Setup

Create a `src/config/firebase.config.ts` file with your Firebase credentials:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Project Structure

```
app/                    # Expo Router screens
├── (auth)/            # Login & username setup
├── (tabs)/            # Main app tabs (Home, Feed, Friends, Camera)
└── session/           # Session flow screens

src/
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── services/         # Firebase service layer
├── stores/           # Zustand stores
├── types/            # TypeScript types
└── utils/            # Helper functions
```

## Key Features

### Home Screen
- Quick-start "Lock In" button
- Today's completion status
- Current streak & stats

### Session Flow
1. Set duration, tag, and optional note
2. Upload "before" proof photo (required within 2 min)
3. Timer counts down
4. Upload "after" proof photo when done
5. Session marked complete

### Friends & Feed
- Add friends by username
- View friends' completed sessions
- React with emojis
- See engagement on your sessions

Created for nwHacks 2026.
