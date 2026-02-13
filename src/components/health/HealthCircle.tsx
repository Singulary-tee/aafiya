
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { HEALTH_CIRCLE_COLORS, NEUTRAL_COLORS } from '../../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../../constants/typography';

interface HealthCircleProps {
  score: number;
  size: number;
}

const HealthCircle: React.FC<HealthCircleProps> = ({ score, size }) => {
  const { t } = useTranslation('home');
  const strokeWidth = size * 0.12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = circumference - (score / 100) * circumference;

  const getColorAndLabel = () => {
    if (score >= 75) {
      return { color: HEALTH_CIRCLE_COLORS.HEALTHY, label: t('healthStatus.healthy') };
    }
    if (score >= 50) {
      return { color: HEALTH_CIRCLE_COLORS.ATTENTION, label: t('healthStatus.attention') };
    }
    if (score >= 25) {
      return { color: HEALTH_CIRCLE_COLORS.RISK, label: t('healthStatus.risk') };
    }
    return { color: HEALTH_CIRCLE_COLORS.CRITICAL, label: t('healthStatus.critical') };
  };

  const { color, label } = getColorAndLabel();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          stroke={NEUTRAL_COLORS.DIVIDER}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.scoreText, { fontSize: size * 0.3 }]}>{`${Math.round(score)}%`}</Text>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
    </View>
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
  scoreText: {
    color: NEUTRAL_COLORS.TEXT_PRIMARY,
    fontWeight: FONT_WEIGHTS.bold as any,
  },
  label: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.medium as any,
    marginTop: 4,
  },
});

export default HealthCircle;
