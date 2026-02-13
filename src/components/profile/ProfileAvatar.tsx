
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { FONT_WEIGHTS } from '@/src/constants/typography';

interface ProfileAvatarProps {
  name: string;
  color: string;
  size?: 'small' | 'medium' | 'large';
}

export function ProfileAvatar({ name, color, size = 'medium' }: ProfileAvatarProps) {
  const firstLetter = name.charAt(0).toUpperCase();
  const avatarSize = size === 'large' ? 80 : size === 'medium' ? 50 : 30;

  return (
    <View style={[styles.avatar, { backgroundColor: color, width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
      <Text style={[styles.letter, { fontSize: avatarSize / 2 }]}>{firstLetter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: 'white',
    fontWeight: FONT_WEIGHTS.bold,
  },
});
