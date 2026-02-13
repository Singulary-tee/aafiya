
import React from 'react';
import { View, StyleSheet, Text, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { FONT_WEIGHTS } from '@/src/constants/typography';

interface ProfileAvatarProps {
  name: string;
  color: string;
  size?: 'small' | 'medium' | 'large';
}

export function ProfileAvatar({ name, color, size = 'medium' }: ProfileAvatarProps) {
  const firstLetter = name.charAt(0).toUpperCase();
  const avatarSize = size === 'large' ? 80 : size === 'medium' ? 50 : 30;

  const avatarStyle: ViewStyle = {
    backgroundColor: color,
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const letterStyle: TextStyle = {
    color: 'white',
    fontSize: avatarSize / 2,
    fontWeight: FONT_WEIGHTS.bold as any,
  };

  return (
    <View style={avatarStyle}>
      <Text style={letterStyle}>{firstLetter}</Text>
    </View>
  );
}
