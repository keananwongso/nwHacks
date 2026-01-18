// Migration script to backfill social credit scores
// This script initializes social credit fields for existing sessions and profiles

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  query,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { getDecisionCounts, calculateSessionDelta } from '../services/socialCredit';

/**
 * Initialize social credit fields for all existing profiles
 * Sets socialCreditScore to 0 for profiles that don't have it
 */
export async function initializeProfileScores(): Promise<void> {
  console.log('Initializing profile social credit scores...');
  
  const profilesSnapshot = await getDocs(collection(db, 'profiles'));
  const batch = writeBatch(db);
  let updateCount = 0;

  profilesSnapshot.docs.forEach((profileDoc) => {
    const data = profileDoc.data();
    
    // Only update if socialCreditScore doesn't exist or is undefined
    if (data.socialCreditScore === undefined) {
      batch.update(profileDoc.ref, {
        socialCreditScore: 0,
      });
      updateCount++;
    }
  });

  if (updateCount > 0) {
    await batch.commit();
    console.log(`✅ Initialized ${updateCount} profiles with social credit scores`);
  } else {
    console.log('✅ All profiles already have social credit scores');
  }
}

/**
 * Backfill decision counts and social credit deltas for all existing sessions
 */
export async function backfillSessionDecisionCounts(): Promise<void> {
  console.log('Backfilling session decision counts...');
  
  const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
  let processedCount = 0;
  let updatedCount = 0;

  for (const sessionDoc of sessionsSnapshot.docs) {
    const sessionData = sessionDoc.data();
    
    // Skip if already has counts
    if (
      sessionData.tickCount !== undefined &&
      sessionData.crossCount !== undefined &&
      sessionData.socialCreditDelta !== undefined
    ) {
      processedCount++;
      continue;
    }

    try {
      // Get decision counts for this session
      const { tickCount, crossCount } = await getDecisionCounts(sessionDoc.id);
      const socialCreditDelta = calculateSessionDelta(tickCount, crossCount);

      // Update session with counts
      await updateDoc(doc(db, 'sessions', sessionDoc.id), {
        tickCount,
        crossCount,
        socialCreditDelta,
      });

      updatedCount++;
      processedCount++;

      if (processedCount % 10 === 0) {
        console.log(`Progress: ${processedCount}/${sessionsSnapshot.docs.length} sessions`);
      }
    } catch (error) {
      console.error(`Error processing session ${sessionDoc.id}:`, error);
    }
  }

  console.log(`✅ Backfilled ${updatedCount} sessions with decision counts`);
  console.log(`✅ Total sessions processed: ${processedCount}`);
}

/**
 * Recalculate all user social credit scores from their sessions
 */
export async function recalculateUserScores(): Promise<void> {
  console.log('Recalculating user social credit scores...');
  
  // Get all sessions with decision data
  const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
  
  // Aggregate scores by user
  const userScores: { [userId: string]: number } = {};
  
  sessionsSnapshot.docs.forEach((sessionDoc) => {
    const data = sessionDoc.data();
    const userId = data.userId;
    const delta = data.socialCreditDelta || 0;
    
    if (userId) {
      userScores[userId] = (userScores[userId] || 0) + delta;
    }
  });

  // Update all user profiles
  const batch = writeBatch(db);
  let batchCount = 0;
  let updateCount = 0;

  for (const [userId, score] of Object.entries(userScores)) {
    const profileRef = doc(db, 'profiles', userId);
    batch.update(profileRef, {
      socialCreditScore: score,
    });
    
    batchCount++;
    updateCount++;

    // Firestore batch limit is 500 operations
    if (batchCount >= 500) {
      await batch.commit();
      batchCount = 0;
      console.log(`Progress: Updated ${updateCount} user scores...`);
    }
  }

  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Updated ${updateCount} user social credit scores`);
}

/**
 * Run complete migration
 */
export async function runMigration(): Promise<void> {
  console.log('🚀 Starting social credit migration...\n');
  
  try {
    // Step 1: Initialize all profiles with socialCreditScore field
    await initializeProfileScores();
    console.log('');

    // Step 2: Backfill session decision counts
    await backfillSessionDecisionCounts();
    console.log('');

    // Step 3: Recalculate all user scores from sessions
    await recalculateUserScores();
    console.log('');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Export individual functions for selective migration
export const migration = {
  initializeProfileScores,
  backfillSessionDecisionCounts,
  recalculateUserScores,
  runMigration,
};
