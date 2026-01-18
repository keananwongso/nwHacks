import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLORS = [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#065F46', '#1E40AF', '#92400E', '#991B1B', '#5B21B6', '#9D174D'
];

interface ParticleProps {
    color: string;
    index: number;
    type: 'tick' | 'cross';
    count: number;
}

const Particle = ({ color, index, type, count }: ParticleProps) => {
    const anim = useRef(new Animated.Value(0)).current;
    const rotateX = useRef(new Animated.Value(Math.random())).current;
    const rotateY = useRef(new Animated.Value(Math.random())).current;
    const rotateZ = useRef(new Animated.Value(Math.random())).current;

    // Trajectory settings
    const isCross = type === 'cross';
    const angle = useRef((index / count) * 360 + (Math.random() * 20 - 10)).current;
    const rad = (angle * Math.PI) / 180;

    // Cross mode: Mostly float upwards
    const power = useRef(isCross ? 100 + Math.random() * 150 : 150 + Math.random() * 200).current;
    const xExplosion = Math.cos(rad) * power * (isCross ? 0.5 : 1);
    const yExplosion = Math.sin(rad) * (power * (isCross ? 0.8 : 1)) - 300;

    // Final destination
    const xFinal = useRef(xExplosion + (Math.random() - 0.5) * (isCross ? 300 : 200)).current;
    const yFinal = useRef(isCross ? -SCREEN_HEIGHT * 0.4 : SCREEN_HEIGHT * 0.6).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: isCross ? 2000 + Math.random() * 1000 : 2500 + Math.random() * 1500,
            useNativeDriver: true,
        }).start();

        if (!isCross) {
            [rotateX, rotateY, rotateZ].forEach(r => {
                Animated.loop(
                    Animated.timing(r, {
                        toValue: 1,
                        duration: 500 + Math.random() * 1000,
                        useNativeDriver: true,
                    })
                ).start();
            });
        }
    }, []);

    const translateX = anim.interpolate({
        inputRange: [0, 0.15, 1],
        outputRange: [0, xExplosion, xFinal],
    });

    const translateY = anim.interpolate({
        inputRange: [0, 0.15, 1],
        outputRange: [0, yExplosion, yFinal],
    });

    const scale = anim.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [0, 1.2, 1, 0],
    });

    const opacity = anim.interpolate({
        inputRange: [0, 0.1, 0.7, 1],
        outputRange: [0, 1, 1, 0],
    });

    const rotation = rotateZ.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (isCross) {
        return (
            <Animated.View
                style={[
                    styles.particle,
                    {
                        opacity,
                        transform: [{ translateX }, { translateY }, { scale }, { rotate: rotation }],
                    },
                ]}
            >
                <Text style={{ fontSize: 24 + Math.random() * 16 }}>😐</Text>
            </Animated.View>
        );
    }

    // Tick Mode: Standard high-energy confetti
    const shape = useRef(Math.floor(Math.random() * 3)).current;
    const size = useRef(8 + Math.random() * 12).current;

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    backgroundColor: color,
                    width: shape === 2 ? size / 3 : size,
                    height: size,
                    borderRadius: shape === 1 ? size / 2 : 2,
                    opacity,
                    transform: [
                        { translateX },
                        { translateY },
                        { scale },
                        { rotateX: rotateX.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                        { rotateY: rotateY.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                        { rotateZ: rotateZ.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                    ],
                },
            ]}
        />
    );
};

interface ConfettiProps {
    isActive: boolean;
    type?: 'tick' | 'cross' | null;
}

export const Confetti = ({ isActive, type = 'tick' }: ConfettiProps) => {
    if (!isActive || !type) return null;

    const count = type === 'cross' ? 40 : 100;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.centerPoint}>
                {[...Array(count)].map((_, i) => (
                    <Particle key={i} index={i} type={type} color={COLORS[i % COLORS.length]} count={count} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    centerPoint: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    particle: {
        position: 'absolute',
    },
});
