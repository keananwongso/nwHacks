// Tag selector component
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SessionTag, TAG_ICONS } from '../../utils/constants';

interface TagSelectorProps {
  tags: readonly SessionTag[];
  selected: SessionTag;
  onSelect: (tag: SessionTag) => void;
}

export function TagSelector({ tags, selected, onSelect }: TagSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => onSelect(tag)}
            style={[styles.tag, selected === tag && styles.tagSelected]}
          >
            <Text style={styles.icon}>{TAG_ICONS[tag]}</Text>
            <Text style={[styles.label, selected === tag && styles.labelSelected]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: '#1F2937',
    marginRight: 12,
  },
  tagSelected: {
    backgroundColor: '#6366F1',
  },
  icon: {
    marginRight: 8,
    fontSize: 16,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  labelSelected: {
    color: 'white',
  },
});
