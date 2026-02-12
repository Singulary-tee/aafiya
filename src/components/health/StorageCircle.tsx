
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

interface StorageCircleProps {
  daysRemaining: number;
  size: 'small' | 'medium';
  onPress: () => void;
}

const getStorageStatus = (days: number): { color: string } => {
  if (days >= 14) {
    return { color: '#4CAF50' }; // Green
  }
  if (days >= 7) {
    return { color: '#FFC107' }; // Yellow
  }
  if (days > 0) {
    return { color: '#F44336' }; // Red
  }
  return { color: '#9E9E9E' }; // Gray
};

export function StorageCircle({ daysRemaining, size, onPress }: StorageCircleProps) {
  const diameter = size === 'small' ? 40 : 60;
  const strokeWidth = 4;
  const radius = (diameter - strokeWidth) / 2;

  const { color } = getStorageStatus(daysRemaining);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}>
        <Circle
          stroke={color}
          fill="transparent"
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <SvgText
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          fontSize={diameter * 0.4}
          fontWeight="bold"
          fill={color}
        >
          {daysRemaining}
        </SvgText>
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8, // For spacing in a horizontal layout
  },
});
