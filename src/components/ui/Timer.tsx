// Timer display component
import { View, Text, StyleSheet } from 'react-native';

interface TimerProps {
  secondsElapsed: number;
  totalSeconds: number;
}

export function Timer({ secondsElapsed, totalSeconds }: TimerProps) {
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // Simple progress bar-like color or just white
  const getColor = () => {
    // If we want urgency, maybe when close to total?
    // For counting up, usually just white/primary.
    return '#FFFFFF';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color: getColor() }]}>{formattedTime}</Text>
      <Text style={styles.label}>locked in</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  time: {
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  label: {
    color: '#6B7280',
    marginTop: 8,
    fontSize: 16,
  },
});
