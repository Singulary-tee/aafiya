
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { ProfileRepository } from '@/src/database/repositories/ProfileRepository';
import { Profile } from '@/src/database/models/Profile';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import { TextInput } from '@/src/components/primitives/TextInput';
import Button from '@/src/components/common/Button';

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
        {Object.values(theme.colors).map((color, index) => (
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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: theme.fontSizes.body,
    marginBottom: theme.spacing.sm,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: theme.spacing.sm,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: theme.colors.textPrimary,
  },
});
