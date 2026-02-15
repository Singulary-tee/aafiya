import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { openDatabase } from '../../src/database';
import { MedicationRepository } from '../../src/database/repositories/MedicationRepository';
import { Medication } from '../../src/database/models/Medication';
import { unarchiveMedication } from '../../src/utils/medicationManagement';
import { useProfile } from '../../src/hooks/useProfile';
import { logger } from '../../src/utils/logger';

export default function ArchivedMedicationsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { currentProfile } = useProfile();
    const [archivedMedications, setArchivedMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadArchivedMedications();
    }, [currentProfile]);

    const loadArchivedMedications = async () => {
        if (!currentProfile) return;

        try {
            setLoading(true);
            const db = await openDatabase();
            const medicationRepo = new MedicationRepository(db);
            const allMedications = await medicationRepo.findByProfileId(currentProfile.id);
            
            // Filter for archived medications
            const archived = allMedications.filter(med => med.archived === 1);
            setArchivedMedications(archived);
        } catch (error) {
            logger.error('Error loading archived medications:', error);
            Alert.alert('Error', 'Failed to load archived medications');
        } finally {
            setLoading(false);
        }
    };

    const handleUnarchive = async (medication: Medication) => {
        Alert.alert(
            'Unarchive Medication',
            `Do you want to restore ${medication.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    onPress: async () => {
                        try {
                            const db = await openDatabase();
                            const medicationRepo = new MedicationRepository(db);
                            await unarchiveMedication(medicationRepo, medication.id);
                            await loadArchivedMedications();
                            Alert.alert('Success', `${medication.name} has been restored`);
                        } catch (error) {
                            logger.error('Error unarchiving medication:', error);
                            Alert.alert('Error', 'Failed to restore medication');
                        }
                    },
                },
            ]
        );
    };

    const renderMedicationItem = ({ item }: { item: Medication }) => (
        <View style={[styles.medicationCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.medicationInfo}>
                <Text style={[styles.medicationName, { color: theme.colors.text }]}>
                    {item.name}
                </Text>
                {item.strength && (
                    <Text style={[styles.medicationStrength, { color: theme.colors.textSecondary }]}>
                        {item.strength}
                    </Text>
                )}
                {item.archived_at && (
                    <Text style={[styles.archivedDate, { color: theme.colors.textSecondary }]}>
                        Archived: {new Date(item.archived_at).toLocaleDateString()}
                    </Text>
                )}
                {item.therapy_type === 'limited' && (
                    <Text style={[styles.therapyBadge, { color: theme.colors.primary }]}>
                        📅 Limited Therapy
                    </Text>
                )}
            </View>
            <TouchableOpacity
                style={[styles.unarchiveButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleUnarchive(item)}
                accessibilityRole="button"
                accessibilityLabel={`Restore ${item.name}`}
            >
                <Ionicons name="arrow-undo" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    if (!currentProfile) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.text }}>No profile selected</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                    Archived Medications
                </Text>
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
                </View>
            ) : archivedMedications.length === 0 ? (
                <View style={styles.centerContent}>
                    <Ionicons name="archive-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                        No Archived Medications
                    </Text>
                    <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
                        Completed therapies and archived medications will appear here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={archivedMedications}
                    renderItem={renderMedicationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 60,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    medicationCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medicationInfo: {
        flex: 1,
    },
    medicationName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    medicationStrength: {
        fontSize: 14,
        marginBottom: 4,
    },
    archivedDate: {
        fontSize: 12,
        marginTop: 4,
    },
    therapyBadge: {
        fontSize: 12,
        marginTop: 4,
    },
    unarchiveButton: {
        padding: 12,
        borderRadius: 8,
        marginLeft: 12,
    },
});
