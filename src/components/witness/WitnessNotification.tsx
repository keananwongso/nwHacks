import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db, auth } from '../../services/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { Session } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function WitnessNotification() {
    const { user } = useAuth();
    const [request, setRequest] = useState<Session | null>(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressAnim = useRef(new Animated.Value(1)).current;

    // Listen for requests
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'sessions'),
            where('witnessId', '==', user.uid),
            where('status', '==', 'awaiting_witness'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                // We have a pending request
                const docSnap = snapshot.docs[0];
                const data = docSnap.data();
                // Ensure id is present
                setRequest({ ...data, id: docSnap.id } as Session);
            } else {
                setRequest(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Handle Timer
    useEffect(() => {
        if (request) {
            setTimeLeft(15);
            progressAnim.setValue(1);

            // Animate progress bar
            Animated.timing(progressAnim, {
                toValue: 0,
                duration: 15000,
                useNativeDriver: false,
            }).start();

            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [request]);

    const handleTimeout = async () => {
        if (!request) return;
        // Auto approve on timeout? Or just dismiss? 
        // Plan says: "Auto-approve"
        try {
            await updateDoc(doc(db, 'sessions', request.id), {
                status: 'completed',
                witnessResponse: 'timeout',
            });
            setRequest(null);
        } catch (e) {
            console.error(e);
        }
    };

    const handleResponse = async (approved: boolean) => {
        if (!request) return;
        try {
            await updateDoc(doc(db, 'sessions', request.id), {
                status: approved ? 'completed' : 'challenged',
                witnessResponse: approved ? 'approved' : 'rejected',
            });
            setRequest(null);
        } catch (e) {
            console.error(e);
        }
    };

    if (!request) return null;

    return (
        <Modal transparent animationType="slide" visible={!!request}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Did they actually lock in?</Text>
                        <View style={styles.timerBadge}>
                            <Ionicons name="timer-outline" size={14} color="#FBBF24" />
                            <Text style={styles.timerText}>{timeLeft}s</Text>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <View style={styles.userInfo}>
                            <Image
                                source={{ uri: request.avatarUrl || 'https://i.pravatar.cc/150' }}
                                style={styles.avatar}
                            />
                            <View>
                                <Text style={styles.userName}>{request.username}</Text>
                                <Text style={styles.actionText}>
                                    claims they finished a <Text style={styles.highlight}>{request.tag}</Text> session
                                    {request.durationMin ? ` (${request.durationMin} min)` : ''}.
                                </Text>
                            </View>
                        </View>

                        {/* Proof Photo */}
                        {request.afterProofUrl && (
                            <Image
                                source={{ uri: request.afterProofUrl }}
                                style={styles.proofImage}
                                resizeMode="cover"
                            />
                        )}

                        <Text style={styles.question}>Did they really do it?</Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]}
                        />
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={() => handleResponse(false)}
                        >
                            <Ionicons name="close" size={24} color="#EF4444" />
                            <Text style={styles.rejectText}>NO</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.approveButton]}
                            onPress={() => handleResponse(true)}
                        >
                            <Ionicons name="checkmark" size={24} color="#10B981" />
                            <Text style={styles.approveText}>YES</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#1F2937',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#374151',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    timerText: {
        color: '#FBBF24',
        fontWeight: 'bold',
        fontSize: 14,
    },
    content: {
        marginBottom: 24,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    userName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    actionText: {
        color: '#9CA3AF',
        fontSize: 14,
        flexWrap: 'wrap',
        maxWidth: 200,
    },
    highlight: {
        color: '#6366F1',
        fontWeight: '600',
    },
    proofImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: '#111827',
    },
    question: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600',
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#374151',
        borderRadius: 2,
        marginBottom: 24,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#6366F1',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    rejectButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    approveButton: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    rejectText: {
        color: '#EF4444',
        fontWeight: 'bold',
        fontSize: 16,
    },
    approveText: {
        color: '#10B981',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
