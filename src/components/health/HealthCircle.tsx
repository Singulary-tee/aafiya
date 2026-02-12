
import { COLORS } from '@/constants/colors';
import { ThemedText } from '@/src/components/themed-text';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

// Props as defined in the blueprint
interface HealthCircleProps {
  score: number;
  size: number;
  animated?: boolean;
}

const getHealthStatus = (score: number): { color: string; label: string } => {
  if (score >= 75) {
    return { color: COLORS.light.tint, label: 'Healthy' }; // Green
  }
  if (score >= 50) {
    return { color: '#FFC107', label: 'Needs Attention' }; // Yellow
  }
  if (score >= 25) {
    return { color: '#FF9800', label: 'At Risk' }; // Orange
  }
  return { color: '#F44336', label: 'Critical' }; // Red
};

export function HealthCircle({ score, size }: HealthCircleProps) {
  const strokeWidth = size * 0.12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = circumference - (score / 100) * circumference;

  const { color, label } = getHealthStatus(score);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          stroke="#E0E0E0"
          fill="transparent"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <Circle
          stroke={color}
          fill="transparent"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Center Text */}
        <SvgText
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          fontSize={size * 0.25}
          fontWeight="bold"
          fill={color}
        >
          {`${Math.round(score)}%`}
        </SvgText>
      </Svg>
      <ThemedText style={[styles.statusLabel, { color }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '500',
  },
});
