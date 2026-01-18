import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/stores/sessionStore';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ChallengeScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    const submitChallenge = useSessionStore(state => state.submitChallenge);
    const activeStatus = useSessionStore(state => state.status);

    useEffect(() => {
        // If we leave the "challenged" state (e.g. submitted), go back home
        if (activeStatus === 'completed') {
            router.replace('/(tabs)');
        }
    }, [activeStatus]);

    // Countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleTimeout = () => {
        Alert.alert("Time's Up!", "You failed the challenge.", [
            { text: "OK", onPress: () => router.replace('/(tabs)') }
        ]);
    };

    const takePicture = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                skipProcessing: true,
            });

            if (photo) {
                // Resize for faster upload
                const manipulated = await ImageManipulator.manipulateAsync(
                    photo.uri,
                    [{ resize: { width: 800 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                setPhoto(manipulated.uri);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleSubmit = async () => {
        if (!photo) return;
        setSubmitting(true);
        try {
            await submitChallenge(photo);
            Alert.alert("Verified!", "The AI has accepted your proof. Streak saved.");
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit proof');
            setSubmitting(false);
        }
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>
                    We need your camera to verify your lock-in!
                </Text>
                <TouchableOpacity onPress={requestPermission} style={styles.btn}>
                    <Text>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.subtitle}>Prove you're actually locked in.</Text>
                </View>
                <View style={styles.timerBadge}>
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                </View>
            </View>

            {/* Camera / Preview */}
            <View style={styles.cameraContainer}>
                {photo ? (
                    <Image source={{ uri: photo }} style={styles.preview} />
                ) : (
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing="back"
                    />
                )}
            </View>

            {/* Controls */}
            <View style={styles.footer}>
                {photo ? (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.retakeButton}
                            onPress={() => setPhoto(null)}
                            disabled={submitting}
                        >
                            <Text style={styles.retakeText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            <Text style={styles.submitText}>
                                {submitting ? 'Verifying...' : 'Submit Proof'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EF4444', // Red background for urgency
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 1,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },
    timerBadge: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    timerText: {
        color: '#EF4444',
        fontSize: 24,
        fontWeight: 'bold',
    },
    cameraContainer: {
        flex: 1,
        marginHorizontal: 16,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'black',
        elevation: 10,
    },
    camera: {
        flex: 1,
    },
    preview: {
        flex: 1,
    },
    footer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    retakeButton: {
        flex: 1,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        alignItems: 'center',
    },
    submitButton: {
        flex: 2,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        alignItems: 'center',
    },
    retakeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    submitText: {
        color: '#EF4444',
        fontWeight: 'bold',
        fontSize: 16,
    },
    btn: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
        alignSelf: 'center',
    },
});
