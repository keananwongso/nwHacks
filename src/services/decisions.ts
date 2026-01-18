// Decisions service (Tick/Cross validation)
import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    getDocs,
    collection,
    serverTimestamp,
    updateDoc,
    increment,
    runTransaction,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { getDecisionCounts, calculateSessionDelta } from './socialCredit';
import { eventEmitter, EVENTS } from '../utils/eventEmitter';

export type DecisionType = 'tick' | 'cross';

export async function addDecision(
    sessionId: string,
    type: DecisionType
): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const sessionRef = doc(db, 'sessions', sessionId);
    const decisionRef = doc(db, 'sessions', sessionId, 'decisions', user.uid);

    // Get the previous decision if it exists
    const previousDecisionDoc = await getDoc(decisionRef);
    const previousDecision = previousDecisionDoc.exists() 
        ? previousDecisionDoc.data().type as DecisionType 
        : null;

    // Get session to find the owner
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) throw new Error('Session not found');
    
    const sessionData = sessionDoc.data();
    const sessionOwnerId = sessionData.userId;

    // Use transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
        // Add/update the decision
        transaction.set(decisionRef, {
            type,
            createdAt: serverTimestamp(),
        });

        // Update session counts
        const updates: any = {};
        
        if (previousDecision === type) {
            // No change needed
            return;
        }
        
        if (previousDecision === 'tick') {
            updates.tickCount = increment(-1);
        } else if (previousDecision === 'cross') {
            updates.crossCount = increment(-1);
        }
        
        if (type === 'tick') {
            updates.tickCount = increment(1);
        } else if (type === 'cross') {
            updates.crossCount = increment(1);
        }

        // Calculate delta change for user's social credit
        let deltaChange = 0;
        if (previousDecision === 'tick' && type === 'cross') {
            deltaChange = -2; // Was +1, now -1
        } else if (previousDecision === 'cross' && type === 'tick') {
            deltaChange = 2; // Was -1, now +1
        } else if (!previousDecision && type === 'tick') {
            deltaChange = 1;
        } else if (!previousDecision && type === 'cross') {
            deltaChange = -1;
        }

        // Update session counts and delta
        if (Object.keys(updates).length > 0) {
            updates.socialCreditDelta = increment(deltaChange);
            transaction.update(sessionRef, updates);
        }

        // Update user's social credit score
        if (deltaChange !== 0) {
            const profileRef = doc(db, 'profiles', sessionOwnerId);
            transaction.update(profileRef, {
                socialCreditScore: increment(deltaChange),
            });
        }
    });
    
    // Emit event to update leaderboard
    eventEmitter.emit(EVENTS.VOTE_CAST, { sessionId, sessionOwnerId });
}

export async function removeDecision(sessionId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const sessionRef = doc(db, 'sessions', sessionId);
    const decisionRef = doc(db, 'sessions', sessionId, 'decisions', user.uid);

    // Get the current decision before removing
    const decisionDoc = await getDoc(decisionRef);
    if (!decisionDoc.exists()) return;

    const decisionType = decisionDoc.data().type as DecisionType;

    // Get session to find the owner
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) throw new Error('Session not found');
    
    const sessionData = sessionDoc.data();
    const sessionOwnerId = sessionData.userId;

    // Use transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
        // Remove the decision
        transaction.delete(decisionRef);

        // Update session counts
        const updates: any = {};
        let deltaChange = 0;

        if (decisionType === 'tick') {
            updates.tickCount = increment(-1);
            updates.socialCreditDelta = increment(-1);
            deltaChange = -1;
        } else if (decisionType === 'cross') {
            updates.crossCount = increment(-1);
            updates.socialCreditDelta = increment(1);
            deltaChange = 1;
        }

        if (Object.keys(updates).length > 0) {
            transaction.update(sessionRef, updates);
        }

        // Update user's social credit score
        if (deltaChange !== 0) {
            const profileRef = doc(db, 'profiles', sessionOwnerId);
            transaction.update(profileRef, {
                socialCreditScore: increment(deltaChange),
            });
        }
    });
    
    // Emit event to update leaderboard
    eventEmitter.emit(EVENTS.VOTE_CAST, { sessionId, sessionOwnerId });
}

export async function getUserDecision(
    sessionId: string
): Promise<DecisionType | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const decisionRef = doc(db, 'sessions', sessionId, 'decisions', user.uid);
    const decisionDoc = await getDoc(decisionRef);

    if (decisionDoc.exists()) {
        return decisionDoc.data().type as DecisionType;
    }
    return null;
}

export async function getSessionDecisions(sessionId: string) {
    const snapshot = await getDocs(
        collection(db, 'sessions', sessionId, 'decisions')
    );
    return snapshot.docs.map(
        (doc) => ({ uid: doc.id, ...doc.data() })
    );
}
