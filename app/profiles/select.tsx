
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { useProfile } from '@/src/hooks/useProfile';
import { ProfileRepository } from '@/src/database/repositories/ProfileRepository';
import { Profile } from '@/src/database/models/Profile';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';

export default function SelectProfileScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { db, isLoading: isDbLoading } = useDatabase();
  const router = useRouter();
  const { switchProfile } = useProfile();

  useEffect(() => {
    if (!isDbLoading && db) {
      const profileRepo = new ProfileRepository(db);
      profileRepo.findAll().then(setProfiles);
    }
  }, [db, isDbLoading]);

  const handleSelectProfile = (profile: Profile) => {
    switchProfile(profile.id);
    // The navigation is handled by the root layout component based on the active profile.
    // Manually navigating here creates a conflict.
  };

  const renderProfile = ({ item }: { item: Profile }) => (
    <TouchableOpacity style={styles.profileItem} onPress={() => handleSelectProfile(item)}>
      <View style={[styles.avatar, { backgroundColor: item.avatar_color }]} />
      <Text style={styles.profileName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (isDbLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Profile</Text>
      <FlatList
        data={profiles}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      <Button
        title="Create New Profile"
        onPress={() => router.push('/profiles/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  list: {
    marginBottom: theme.spacing.lg,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  profileName: {
    fontSize: theme.fontSizes.body,
  },
});
