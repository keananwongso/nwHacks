import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface TodayBlobProps {
    minutes: number;
    sessions: number;
    hourlyBuckets: number[]; // 24 numbers
    style?: StyleProp<ViewStyle>;
}

export function TodayBlob({ minutes, sessions, hourlyBuckets, style }: TodayBlobProps) {
    const maxVal = Math.max(...hourlyBuckets, 1);

    return (
        <View style={[styles.container, style]}>
            <View style={styles.metricsRow}>
                <View style={styles.metric}>
                    <Text style={styles.value}>{minutes}</Text>
                    <Text style={styles.label}>minutes</Text>
                </View>
                <View style={styles.metric}>
                    <Text style={styles.value}>{sessions}</Text>
                    <Text style={styles.label}>sessions</Text>
                </View>
            </View>

            {/* 24-hour Activity Graph */}
            <View style={styles.graphContainer}>
                {hourlyBuckets.map((val, i) => (
                    <View key={i} style={styles.barWrapper}>
                        <View
                            style={[
                                styles.bar,
                                { height: `${(val / maxVal) * 100}%` },
                                val > 0 && styles.activeBar
                            ]}
                        />
                    </View>
                ))}
            </View>
            <View style={styles.graphLabels}>
                <Text style={styles.graphLabel}>12am</Text>
                <Text style={styles.graphLabel}>12pm</Text>
                <Text style={styles.graphLabel}>11pm</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1F2937',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#374151',
    },
    metricsRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    metric: {
        marginRight: 32,
    },
    value: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    label: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 2,
    },
    graphContainer: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    barWrapper: {
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 1,
    },
    bar: {
        width: '100%',
        backgroundColor: '#374151',
        borderRadius: 2,
        minHeight: 2,
    },
    activeBar: {
        backgroundColor: '#6366F1',
    },
    graphLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    graphLabel: {
        color: '#4B5563',
        fontSize: 10,
    },
});
