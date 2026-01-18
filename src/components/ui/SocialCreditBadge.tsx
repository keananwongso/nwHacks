// Social Credit Score Badge Component
import { View, Text, StyleSheet } from 'react-native';

interface SocialCreditBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function SocialCreditBadge({ 
  score, 
  size = 'medium', 
  showLabel = false 
}: SocialCreditBadgeProps) {
  const getScoreColor = () => {
    if (score > 0) return '#10B981'; // Green
    if (score < 0) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getScoreIcon = () => {
    if (score > 0) return '🏆';
    if (score < 0) return '📉';
    return '📊';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          icon: styles.iconSmall,
          score: styles.scoreSmall,
          label: styles.labelSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          icon: styles.iconLarge,
          score: styles.scoreLarge,
          label: styles.labelLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          icon: styles.iconMedium,
          score: styles.scoreMedium,
          label: styles.labelMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const scoreColor = getScoreColor();
  const scoreIcon = getScoreIcon();
  const displayScore = score >= 0 ? `+${score}` : `${score}`;

  return (
    <View style={[styles.container, sizeStyles.container, { borderColor: scoreColor }]}>
      <Text style={sizeStyles.icon}>{scoreIcon}</Text>
      <Text style={[sizeStyles.score, { color: scoreColor }]}>
        {displayScore}
      </Text>
      {showLabel && (
        <Text style={sizeStyles.label}>Social Credit</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  containerSmall: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  containerMedium: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  containerLarge: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  iconSmall: {
    fontSize: 12,
    marginRight: 4,
  },
  iconMedium: {
    fontSize: 16,
    marginRight: 6,
  },
  iconLarge: {
    fontSize: 24,
    marginRight: 8,
  },
  scoreSmall: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreMedium: {
    fontSize: 16,
    fontWeight: '700',
  },
  scoreLarge: {
    fontSize: 24,
    fontWeight: '700',
  },
  labelSmall: {
    fontSize: 8,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  labelMedium: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  labelLarge: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});
