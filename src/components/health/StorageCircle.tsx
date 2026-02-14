
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../constants/theme';
import { Text } from '../primitives/Text';

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
      return theme.colors.healthy;
    }
    if (daysRemaining >= 7) {
      return theme.colors.attention;
    }
    if (daysRemaining > 0) {
      return theme.colors.critical;
    }
    return theme.colors.divider;
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
        <Text weight="bold" style={[styles.daysText, { fontSize: diameter * 0.4, color }]}>
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
  daysText: {},
});

export default StorageCircle;
