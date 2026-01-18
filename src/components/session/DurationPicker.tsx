// Duration preset buttons
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface DurationPickerProps {
  selected: number;
  onSelect: (duration: number) => void;
}

const DURATION_OPTIONS = [
  { value: 0, label: 'Untimed' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '120 min' },
];

export function DurationPicker({ selected, onSelect }: DurationPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {DURATION_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.button,
            selected === option.value && styles.buttonSelected,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.buttonText,
              selected === option.value && styles.buttonTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 99,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  buttonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextSelected: {
    color: 'white',
  },
});
