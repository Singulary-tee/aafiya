
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { useProfile } from '@/src/hooks/useProfile';
import { ProfileRepository } from '@/src/database/repositories/ProfileRepository';
import { COLORS } from '@/src/constants/colors';

export default function CreateProfileScreen() {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS.primary);
  const db = useDatabase();
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
      <Button title="Create Profile" onPress={handleCreateProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  colorLabel: {
    fontSize: 16,
    marginBottom: 8,
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
