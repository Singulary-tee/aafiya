
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { HEALTH_CIRCLE_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../../constants/typography';

interface StorageCircleProps {
  daysRemaining: number;
  size: 'small' | 'medium';
  onPress?: () => void;
}

const StorageCircle: React.FC<StorageCircleProps> = ({ daysRemaining, size, onPress }) => {
  const diameter = size === 'small' ? 40 : 60;
  const strokeWidth = 4;
  const radius = (diameter - strokeWidth) / 2;

  const getColor = () => {
    if (daysRemaining >= 14) {
      return HEALTH_CIRCLE_COLORS.HEALTHY;
    }
    if (daysRemaining >= 7) {
      return HEALTH_CIRCLE_COLORS.ATTENTION;
    }
    if (daysRemaining > 0) {
      return HEALTH_CIRCLE_COLORS.CRITICAL;
    }
    return NEUTRAL_COLORS.DIVIDER;
  };

  const color = getColor();

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={[styles.container, { width: diameter, height: diameter }]}>
      <Svg width={diameter} height={diameter}>
        <Circle
          stroke={color}
          fill="none"
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.daysText, { fontSize: diameter * 0.4, color }]}>
          {daysRemaining}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysText: {
    fontWeight: FONT_WEIGHTS.bold as any,
  },
});

export default StorageCircle;
