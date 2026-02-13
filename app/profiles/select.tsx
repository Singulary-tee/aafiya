
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { useProfile } from '@/src/hooks/useProfile';
import { ProfileRepository } from '@/src/database/repositories/ProfileRepository';
import { Profile } from '@/src/database/models/Profile';
import { COLORS } from '@/src/constants/colors';

export default function SelectProfileScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const db = useDatabase();
  const router = useRouter();
  const { switchProfile } = useProfile();

  useEffect(() => {
    if (db) {
      const profileRepo = new ProfileRepository(db);
      profileRepo.findAll().then(setProfiles);
    }
  }, [db]);

  const handleSelectProfile = (profile: Profile) => {
    switchProfile(profile.id);
    router.replace('/(tabs)');
  };

  const renderProfile = ({ item }: { item: Profile }) => (
    <TouchableOpacity style={styles.profileItem} onPress={() => handleSelectProfile(item)}>
      <View style={[styles.avatar, { backgroundColor: item.avatar_color }]} />
      <Text style={styles.profileName}>{item.name}</Text>
    </TouchableOpacity>
  );

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
    padding: 16,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  list: {
    marginBottom: 24,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  profileName: {
    fontSize: 18,
  },
});
