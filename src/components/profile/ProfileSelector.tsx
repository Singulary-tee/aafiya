
import { Profile } from '@/database/models/Profile';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfile: Profile;
  onSelectProfile: (profile: Profile) => void;
}

export function ProfileSelector({ profiles, activeProfile, onSelectProfile }: ProfileSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const renderProfileItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={() => {
        onSelectProfile(item);
        setModalVisible(false);
      }}
    >
      <View style={[styles.avatar, { backgroundColor: item.avatar_color }]} />
      <ThemedText style={styles.profileName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={[styles.avatar, { backgroundColor: activeProfile.avatar_color }]} />
        <ThemedText style={styles.activeProfileName}>{activeProfile.name}</ThemedText>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Select a Profile</ThemedText>
            <FlatList
              data={profiles}
              renderItem={renderProfileItem}
              keyExtractor={(item) => item.id}
            />
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12,
  },
  activeProfileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileName: {
    fontSize: 18,
  },
});
