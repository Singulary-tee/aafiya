
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { useProfile } from '@/src/hooks/useProfile';
import { ProfileRepository } from '@/src/database/repositories/ProfileRepository';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import { TextInput } from '@/src/components/primitives/TextInput';
import Button from '@/src/components/common/Button';

export default function CreateProfileScreen() {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(theme.colors.primary);
  const { db, isLoading: isDbLoading } = useDatabase();
  const router = useRouter();
  const { switchProfile } = useProfile();

  const handleCreateProfile = async () => {
    if (name.trim() === '' || !db) {
      return;
    }

    const profileRepo = new ProfileRepository(db);
    const newProfile = await profileRepo.create({ name, avatar_color: selectedColor });
    if (newProfile) {
      switchProfile(newProfile.id);
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Profile Name"
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.colorLabel}>Select an Avatar Color:</Text>
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
      <Button title="Create Profile" onPress={handleCreateProfile} disabled={isDbLoading} />
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
  title: {
    fontSize: theme.fontSizes.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  colorLabel: {
    fontSize: theme.fontSizes.body,
    marginBottom: theme.spacing.sm,
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
