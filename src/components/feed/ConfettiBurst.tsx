import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const CONFETTI_COUNT = 15;
const COLORS = ['#6366F1', '#818CF8', '#F87171', '#FBBF24', '#34D399', '#60A5FA'];

export interface ConfettiBurstHandle {
    start: () => void;
}

export const ConfettiBurst = forwardRef<ConfettiBurstHandle>((_, ref) => {
    const animations = useRef(
        Array.from({ length: CONFETTI_COUNT }).map(() => ({
            anim: new Animated.Value(0),
            angle: Math.random() * Math.PI * 2,
            distance: 40 + Math.random() * 60,
            size: 4 + Math.random() * 6,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }))
    ).current;

    useImperativeHandle(ref, () => ({
        start: () => {
            animations.forEach((a) => a.anim.setValue(0));

            const burstAnimations = animations.map((a) =>
                Animated.timing(a.anim, {
                    toValue: 1,
                    duration: 800 + Math.random() * 400,
                    useNativeDriver: true,
                })
            );

            Animated.parallel(burstAnimations).start();
        },
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            {animations.map((a, i) => {
                const translateX = a.anim.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, Math.cos(a.angle) * a.distance, Math.cos(a.angle) * (a.distance + 20)],
                });
                const translateY = a.anim.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, Math.sin(a.angle) * a.distance, Math.sin(a.angle) * (a.distance + 40)],
                });
                const opacity = a.anim.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [1, 1, 0],
                });
                const scale = a.anim.interpolate({
                    inputRange: [0, 0.1, 1],
                    outputRange: [0, 1, 0.5],
                });

                return (
                    <Animated.View
                        key={i}
                        style={[
                            styles.piece,
                            {
                                backgroundColor: a.color,
                                width: a.size,
                                height: a.size,
                                borderRadius: a.size / 2,
                                transform: [{ translateX }, { translateY }, { scale }],
                                opacity,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    piece: {
        position: 'absolute',
    },
});
