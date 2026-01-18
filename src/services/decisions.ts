// Decisions service (Tick/Cross validation)
import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    getDocs,
    collection,
    serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export type DecisionType = 'tick' | 'cross';

export async function addDecision(
    sessionId: string,
    type: DecisionType
): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const decisionRef = doc(db, 'sessions', sessionId, 'decisions', user.uid);

    await setDoc(decisionRef, {
        type,
        createdAt: serverTimestamp(),
    });
}

export async function removeDecision(sessionId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const decisionRef = doc(db, 'sessions', sessionId, 'decisions', user.uid);
    await deleteDoc(decisionRef);
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
