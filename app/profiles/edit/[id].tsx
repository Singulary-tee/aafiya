
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { ProfileRepository } from '@/src/database/repositories/ProfileRepository';
import { Profile } from '@/src/database/models/Profile';
import { COLORS } from '@/src/constants/colors';

export default function EditProfileScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { db, isLoading: isDbLoading } = useDatabase();
  const router = useRouter();

  useEffect(() => {
    if (!isDbLoading && db && id) {
      const profileRepo = new ProfileRepository(db);
      profileRepo.findById(id as string).then((p) => {
        if (p) {
          setProfile(p);
          setName(p.name);
          setSelectedColor(p.avatar_color);
        }
      });
    }
  }, [db, id, isDbLoading]);

  const handleUpdate = async () => {
    if (db && profile) {
      const profileRepo = new ProfileRepository(db);
      await profileRepo.update(profile.id, {
        name,
        avatar_color: selectedColor,
      });
      router.back();
    }
  };

  if (isDbLoading || !profile) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Avatar Color</Text>
      <View style={styles.colorContainer}>
        {Object.values(COLORS).map((color, index) => (
          <View
            key={index}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor,
            ]}
            onTouchEnd={() => setSelectedColor(color)}
          />
        ))}
      </View>
      <Button title="Update Profile" onPress={handleUpdate} disabled={isDbLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: 'black',
  },
});
