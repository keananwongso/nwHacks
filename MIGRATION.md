# Social Credit Migration

This document explains how to run the migration to initialize the social credit system for existing data.

## What the Migration Does

1. **Initializes Profile Scores**: Sets `socialCreditScore: 0` for all existing profiles that don't have this field
2. **Backfills Session Counts**: Calculates and adds `tickCount`, `crossCount`, and `socialCreditDelta` to all existing sessions
3. **Recalculates User Scores**: Sums up all session deltas to compute the correct social credit score for each user

## How to Run the Migration

### Option 1: Run Complete Migration (Recommended)

Add this code to a temporary screen or button in your app:

```typescript
import { runMigration } from '../src/utils/migration';

// In your component or handler
const handleMigration = async () => {
  try {
    await runMigration();
    alert('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    alert('Migration failed. Check console for details.');
  }
};
```

### Option 2: Run Individual Steps

If you need to run specific parts of the migration:

```typescript
import { migration } from '../src/utils/migration';

// Initialize profile scores only
await migration.initializeProfileScores();

// Backfill session decision counts only
await migration.backfillSessionDecisionCounts();

// Recalculate user scores only
await migration.recalculateUserScores();
```

## Important Notes

- **Run Once**: This migration should only be run once when deploying the social credit feature
- **Production Safety**: Test the migration in a development environment first
- **Firestore Limits**: The migration processes data in batches to respect Firestore's 500 operations per batch limit
- **Progress Logging**: The migration logs progress to the console, so you can monitor it in real-time

## When to Run

Run this migration immediately after deploying the social credit feature code to production, before users start voting on sessions with the new system.

## New Data

After the migration, all new:
- **Profiles** will automatically include `socialCreditScore: 0` (handled in `auth.ts`)
- **Sessions** will automatically include `tickCount: 0`, `crossCount: 0`, `socialCreditDelta: 0` (handled in `sessionStore.ts`)
- **Decisions** will automatically update scores in real-time (handled in `decisions.ts`)

No further manual intervention is needed after the initial migration.
