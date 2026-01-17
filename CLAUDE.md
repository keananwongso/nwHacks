# ProjectLocked (nwHacks MVP)

Last updated: 2026-01-17
Owner: Keanan + team
Goal: Build a demoable Expo mobile app in 24h with a strong social accountability loop.

## One-liner

ProjectLocked is a social lock-in app where you start a timed session, post proof, and friends react. Streaks reward consistency.

## What we are building (MVP)

Core loop:
1. User signs in
2. User starts a lock-in session (duration preset, tag, optional note)
3. User submits proof twice (before and after) as photos
4. Friends see the session in a feed and react with one emoji
5. Streak updates if you complete at least 1 completed session that day

## What we are NOT building

- No real OS-level app blocking
- No real notification blocking
- No DMs
- No comments
- No complex algorithms or ranking
- No groups (optional stretch only if everything else is done)

We will "fake" app blocking in the demo by showing a UI screen that implies focus mode, but it is not enforced.

## Stack (required)

- Expo (React Native) + TypeScript
- Firebase:
  - Auth (Google Sign-In)
  - Firestore (database)
  - Storage (proof photos)

## App screens (minimum)

### 1) Home
- Big "Lock In" button
- Today status (did you complete a session today)
- Stats (current streak, total completed sessions, minutes locked this week)

### 2) Lock Setup
- Duration presets: 25 / 50 / 90
- Tag: Study, Gym, Build, Read, Other
- Optional note
- Start button creates a session and navigates to Session screen

### 3) Session (timer running)
- Countdown timer
- Require "Before proof" within first 2 minutes (blocking modal)
- End session button
- On end: require "After proof" photo
- Mark session as completed only if after proof exists

### 4) Proof capture (modal or screen)
- Photo only
- Use Expo ImagePicker or Camera
- Upload to Firebase Storage
- Save URL to session doc

### 5) Friends
- Add friend by username (simple)
- List friends

### 6) Feed
- List of friend sessions, newest first
- Each session card shows tag, duration, note, status, proof thumbnails
- Reactions row: tap one emoji reaction per user

## Social mechanics (must-have)

### Friends
- Add by username (simplify, no pending requests)
- When A adds B, create friendships both directions

### Feed
- Show sessions from friends only (plus optionally self)
- Show completed and broken (if we implement broken). If not, show active and completed.

### Reactions
- One reaction per user per session
- Allow change reaction
- Show counts per emoji on the session card

## Streak definition

- A day counts if user has >= 1 session with status "completed"
- Current streak is consecutive days ending today
- Compute streak client-side from the user's completed sessions (by date)

Stats:
- totalCompletedSessions
- minutesLockedThisWeek (sum durationMin of completed sessions in current week)

## Data model (Firestore)

```
profiles/{uid}
  - username (unique)
  - fullName
  - avatarUrl
  - label (optional)
  - createdAt

usernames/{usernameLower}
  - uid

friends/{uid}/list/{friendUid}
  - createdAt

sessions/{sessionId}
  - userId
  - startedAt (timestamp)
  - endedAt (timestamp nullable)
  - durationMin (number)
  - tag (string)
  - note (string nullable)
  - status ("active" | "completed")
  - beforeProofUrl (string nullable)
  - afterProofUrl (string nullable)

sessions/{sessionId}/reactions/{uid}
  - emoji (string)
  - createdAt
```

## Storage paths (Firebase Storage)

```
proof-photos/{userId}/{sessionId}/before.jpg
proof-photos/{userId}/{sessionId}/after.jpg
```

## Security rules (minimum viable)

- profiles readable by authenticated users
- profiles writable only by owner uid
- friends list readable/writable only by owner uid
- sessions:
  - read allowed for owner OR friends of owner
  - write allowed only for owner
- reactions:
  - read allowed same as session read
  - write allowed for authenticated users who can read the session (friend or owner)

If "session read for friends" is too hard for rules, allow authenticated reads for hackathon and note the tradeoff.

## Demo script (2 minutes)

1. User A logs in, sets username
2. User B logs in, sets username
3. A adds B as friend
4. A starts a 25-min session (demo mode can shorten timer)
5. A uploads before proof
6. A ends session and uploads after proof, status becomes completed
7. B opens feed, sees A's session, reacts with an emoji
8. Home shows streak incremented for A

## Build order (strict)

1. Expo scaffold + navigation
2. Firebase init + Auth Google sign-in
3. Username setup with uniqueness (usernames collection)
4. Create session + timer UI
5. Photo upload to Storage + write URLs to session doc
6. Feed query (friends sessions)
7. Reactions subcollection + counts display
8. Streak and stats computation on Home
9. Polish and demo mode

## Coding conventions

- Keep components small and readable
- Avoid over-engineering
- Prefer simple Firestore queries and denormalization when needed
- Add a DEMO_MODE flag that shortens timers and allows easy testing
