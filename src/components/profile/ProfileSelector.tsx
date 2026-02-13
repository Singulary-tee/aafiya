
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProfileAvatar } from './ProfileAvatar';
import Button from '../common/Button';
import { SPACING } from '@/src/constants/spacing';

// TODO: Move to a dedicated types file
export interface Profile {
  id: string;
  name: string;
  avatarColor: string;
}

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedProfileId: string | null;
  onSelectProfile: (profileId: string) => void;
  onAddProfile: () => void;
}

export function ProfileSelector({ profiles, selectedProfileId, onSelectProfile, onAddProfile }: ProfileSelectorProps) {
  const { t } = useTranslation('common');

  return (
    <View style={styles.container}>
      <FlatList
        data={profiles}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.profileContainer, selectedProfileId === item.id && styles.selected]}>
            <ProfileAvatar
              name={item.name}
              color={item.avatarColor}
              size="medium"
              onPress={() => onSelectProfile(item.id)}
            />
          </View>
        )}
        ListFooterComponent={<Button title={t('add_profile')} onPress={onAddProfile} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  profileContainer: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
    borderRadius: 50,
  },
  selected: {
    borderColor: 'blue', // Placeholder for selection color
    borderWidth: 2,
  },
});
