import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, StatusBar, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CAM_HEIGHT = width * (4 / 3);

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);

    if (!permission) {
        // Camera permissions are still loading
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current && !isTakingPhoto) {
            setIsTakingPhoto(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    skipProcessing: true, // Faster capture
                });

                if (photo) {
                    router.push({
                        pathname: '/session/setup',
                        params: { initialProofUri: photo.uri }
                    });
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to take photo');
            } finally {
                setIsTakingPhoto(false);
            }
        }
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Header (Outside Camera) */}
            <SafeAreaView style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={32} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lock In.</Text>
                    <View style={{ width: 32 }} />
                </View>
            </SafeAreaView>

            {/* 3:4 Camera Container */}
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    ref={cameraRef}
                    ratio="4:3"
                />
            </View>

            {/* Footer Controls (Outside Camera) */}
            <View style={styles.controlsContainer}>
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={toggleCameraFacing}>
                        <Ionicons name="camera-reverse" size={28} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={takePicture} style={styles.shutterContainer}>
                        <View style={styles.shutterOuter}>
                            <View style={styles.shutterInner} />
                        </View>
                    </TouchableOpacity>

                    <View style={{ width: 50 }} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'space-between',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    permissionButton: {
        backgroundColor: '#6366F1',
        padding: 10,
        borderRadius: 8,
        alignSelf: 'center',
    },
    permissionText: {
        color: 'white',
        fontWeight: 'bold',
    },
    cameraContainer: {
        width: width,
        height: CAM_HEIGHT,
        marginTop: 140, // Push down below header to avoid overlap
        borderRadius: 20,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    camera: {
        flex: 1,
    },
    controlsContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 20,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    secondaryButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterContainer: {
        // 
    },
    shutterOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    shutterInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'white',
    },
});
