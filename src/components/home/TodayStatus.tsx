// Today's session status
import { View, Text, StyleSheet } from 'react-native';
import { Session } from '../../types';

interface TodayStatusProps {
  sessions: Session[];
}

export function TodayStatus({ sessions }: TodayStatusProps) {
  const completed = sessions.filter((s) => s.status === 'completed').length;
  const totalMinutes = sessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + (s.actualDurationMin ?? s.durationMin), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      {completed === 0 ? (
        <Text style={styles.emptyText}>No lock-ins yet. Start one!</Text>
      ) : (
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.number}>{completed}</Text>
            <Text style={styles.label}>sessions</Text>
          </View>
          <View style={styles.rightStat}>
            <Text style={styles.number}>{totalMinutes}</Text>
            <Text style={styles.label}>minutes</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightStat: {
    alignItems: 'flex-end',
  },
  number: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
