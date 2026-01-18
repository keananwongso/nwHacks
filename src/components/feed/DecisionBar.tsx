// Decision bar component (Tick/Cross)
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { addDecision, removeDecision, getUserDecision, DecisionType } from '../../services/decisions';

interface DecisionBarProps {
    sessionId: string;
    onDecision?: (type: DecisionType | null, isInitial: boolean) => void;
}

export function DecisionBar({ sessionId, onDecision }: DecisionBarProps) {
    const [userDecision, setUserDecision] = useState<DecisionType | null>(null);
    const scaleTick = useRef(new Animated.Value(1)).current;
    const scaleCross = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        getUserDecision(sessionId).then((decision) => {
            setUserDecision(decision);
            if (decision && onDecision) {
                onDecision(decision, true);
            }
        });
    }, [sessionId]);

    const animate = (anim: Animated.Value) => {
        return Animated.sequence([
            Animated.spring(anim, {
                toValue: 1.2,
                useNativeDriver: true,
                speed: 50,
            }),
            Animated.spring(anim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 40,
            }),
        ]);
    };

    const handleDecision = async (type: DecisionType) => {
        try {
            if (userDecision === type) {
                await removeDecision(sessionId);
                setUserDecision(null);
                if (onDecision) onDecision(null, false);
            } else {
                await addDecision(sessionId, type);
                setUserDecision(type);

                // Pop animation
                animate(type === 'tick' ? scaleTick : scaleCross).start(() => {
                    // Notify parent so it can start the full overlay fade-out
                    if (onDecision) onDecision(type, false);
                });
            }
        } catch (error) {
            console.error('Decision error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ scale: scaleTick }] }}>
                <TouchableOpacity
                    onPress={() => handleDecision('tick')}
                    style={[
                        styles.button,
                        styles.tickButton,
                        userDecision === 'tick' && styles.activeTick,
                    ]}
                >
                    <MaterialCommunityIcons
                        name="lock"
                        size={32}
                        color={userDecision === 'tick' ? '#10B981' : 'white'}
                    />
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: scaleCross }] }}>
                <TouchableOpacity
                    onPress={() => handleDecision('cross')}
                    style={[
                        styles.button,
                        styles.crossButton,
                        userDecision === 'cross' && styles.activeCross,
                    ]}
                >
                    <MaterialCommunityIcons
                        name="emoticon-neutral"
                        size={32}
                        color={userDecision === 'cross' ? '#EF4444' : 'white'}
                    />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30, // Increased gap for better ergonomics
        marginTop: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 18,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
    },
    button: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    tickButton: {
        backgroundColor: '#1F2937',
    },
    crossButton: {
        backgroundColor: '#1F2937',
    },
    activeTick: {
        borderColor: '#10B981',
        backgroundColor: '#064E3B',
        shadowColor: '#10B981',
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    activeCross: {
        borderColor: '#EF4444',
        backgroundColor: '#7F1D1D',
        shadowColor: '#EF4444',
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    icon: {
        fontSize: 32,
    },
});
