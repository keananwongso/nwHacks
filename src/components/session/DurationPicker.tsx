// Duration preset picker
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DEMO_MODE } from '../../utils/constants';

interface DurationPickerProps {
  presets: number[];
  selected: number;
  onSelect: (duration: number) => void;
}

export function DurationPicker({ presets, selected, onSelect }: DurationPickerProps) {
  return (
    <View style={styles.container}>
      {presets.map((duration) => (
        <TouchableOpacity
          key={duration}
          onPress={() => onSelect(duration)}
          style={[
            styles.button,
            selected === duration && styles.buttonSelected,
          ]}
        >
          <Text
            style={[
              styles.number,
              selected === duration && styles.numberSelected,
            ]}
          >
            {duration}
          </Text>
          <Text
            style={[
              styles.unit,
              selected === duration && styles.unitSelected,
            ]}
          >
            {DEMO_MODE ? 'min' : 'min'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping if many options
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 99,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    minWidth: 60,
  },
  buttonSelected: {
    backgroundColor: '#374151', // Selected usually darker/lighter but design shows unselected is dark
    borderWidth: 1,
    borderColor: '#6366F1', // Or just highlight text. Design shows pills.
  },
  number: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  numberSelected: {
    color: 'white',
  },
  unit: {
    display: 'none', // Hide 'min' text inside the pill to match design "15", "30"...
  },
  unitSelected: {
    display: 'none',
  },
});
