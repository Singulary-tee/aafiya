import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { openDatabase } from '../../src/database';
import { CustomHealthMetricsRepository } from '../../src/database/repositories/CustomHealthMetricsRepository';
import { CustomHealthMetric, CustomHealthMetricHelpers } from '../../src/database/models/CustomHealthMetrics';
import { useProfile } from '../../src/hooks/useProfile';
import { logger } from '../../src/utils/logger';

export default function HealthMetricsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { currentProfile } = useProfile();
    
    // Blood pressure state
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    
    // Glucose state
    const [glucose, setGlucose] = useState('');
    
    // Recent metrics
    const [recentMetrics, setRecentMetrics] = useState<CustomHealthMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecentMetrics();
    }, [currentProfile]);

    const loadRecentMetrics = async () => {
        if (!currentProfile) return;

        try {
            setLoading(true);
            const db = await openDatabase();
            const metricsRepo = new CustomHealthMetricsRepository(db);
            const metrics = await metricsRepo.findByProfileId(currentProfile.id, undefined, 10);
            setRecentMetrics(metrics);
        } catch (error) {
            logger.error('Error loading health metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogBloodPressure = async () => {
        if (!currentProfile) return;
        
        const sys = parseInt(systolic);
        const dia = parseInt(diastolic);
        
        if (isNaN(sys) || isNaN(dia) || sys < 50 || sys > 250 || dia < 30 || dia > 150) {
            Alert.alert('Invalid Input', 'Please enter valid blood pressure values');
            return;
        }

        try {
            const db = await openDatabase();
            const metricsRepo = new CustomHealthMetricsRepository(db);
            
            await metricsRepo.create({
                profile_id: currentProfile.id,
                metric_type: 'blood_pressure',
                value: CustomHealthMetricHelpers.createBloodPressureValue(sys, dia),
                unit: 'mmHg',
                notes: null,
                recorded_at: Date.now(),
            });
            
            setSystolic('');
            setDiastolic('');
            await loadRecentMetrics();
            Alert.alert('Success', 'Blood pressure logged');
        } catch (error) {
            logger.error('Error logging blood pressure:', error);
            Alert.alert('Error', 'Failed to log blood pressure');
        }
    };

    const handleLogGlucose = async () => {
        if (!currentProfile) return;
        
        const glucoseValue = parseFloat(glucose);
        
        if (isNaN(glucoseValue) || glucoseValue < 20 || glucoseValue > 600) {
            Alert.alert('Invalid Input', 'Please enter a valid glucose value (20-600 mg/dL)');
            return;
        }

        try {
            const db = await openDatabase();
            const metricsRepo = new CustomHealthMetricsRepository(db);
            
            await metricsRepo.create({
                profile_id: currentProfile.id,
                metric_type: 'glucose',
                value: CustomHealthMetricHelpers.createNumericValue(glucoseValue),
                unit: 'mg/dL',
                notes: null,
                recorded_at: Date.now(),
            });
            
            setGlucose('');
            await loadRecentMetrics();
            Alert.alert('Success', 'Glucose level logged');
        } catch (error) {
            logger.error('Error logging glucose:', error);
            Alert.alert('Error', 'Failed to log glucose level');
        }
    };

    const formatMetricValue = (metric: CustomHealthMetric): string => {
        if (metric.metric_type === 'blood_pressure') {
            const bp = CustomHealthMetricHelpers.parseBloodPressureValue(metric.value);
            if (bp) {
                return `${bp.systolic}/${bp.diastolic} ${metric.unit || ''}`;
            }
        }
        const numValue = CustomHealthMetricHelpers.parseNumericValue(metric.value);
        if (numValue !== null) {
            return `${numValue} ${metric.unit || ''}`;
        }
        return metric.value;
    };

    const getMetricIcon = (type: string): string => {
        switch (type) {
            case 'blood_pressure': return 'heart-outline';
            case 'glucose': return 'water-outline';
            case 'weight': return 'scale-outline';
            case 'heart_rate': return 'pulse-outline';
            case 'temperature': return 'thermometer-outline';
            default: return 'fitness-outline';
        }
    };

    const getMetricLabel = (type: string): string => {
        switch (type) {
            case 'blood_pressure': return 'Blood Pressure';
            case 'glucose': return 'Glucose';
            case 'weight': return 'Weight';
            case 'heart_rate': return 'Heart Rate';
            case 'temperature': return 'Temperature';
            default: return 'Other';
        }
    };

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
                    Health Metrics
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Blood Pressure Section */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="heart-outline" size={24} color={theme.colors.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Blood Pressure
                        </Text>
                    </View>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
                            placeholder="Systolic"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={systolic}
                            onChangeText={setSystolic}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                        <Text style={[styles.separator, { color: theme.colors.text }]}>/</Text>
                        <TextInput
                            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
                            placeholder="Diastolic"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={diastolic}
                            onChangeText={setDiastolic}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                        <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>mmHg</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.logButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleLogBloodPressure}
                    >
                        <Text style={styles.logButtonText}>Log Blood Pressure</Text>
                    </TouchableOpacity>
                </View>

                {/* Glucose Section */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="water-outline" size={24} color={theme.colors.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Blood Glucose
                        </Text>
                    </View>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, styles.fullInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                            placeholder="Glucose level"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={glucose}
                            onChangeText={setGlucose}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                        <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>mg/dL</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.logButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleLogGlucose}
                    >
                        <Text style={styles.logButtonText}>Log Glucose</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Metrics */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Recent Readings
                    </Text>
                    {recentMetrics.length === 0 ? (
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No readings yet
                        </Text>
                    ) : (
                        recentMetrics.map((metric) => (
                            <View key={metric.id} style={styles.metricItem}>
                                <View style={styles.metricIcon}>
                                    <Ionicons 
                                        name={getMetricIcon(metric.metric_type) as any} 
                                        size={20} 
                                        color={theme.colors.primary} 
                                    />
                                </View>
                                <View style={styles.metricInfo}>
                                    <Text style={[styles.metricLabel, { color: theme.colors.text }]}>
                                        {getMetricLabel(metric.metric_type)}
                                    </Text>
                                    <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                                        {formatMetricValue(metric)}
                                    </Text>
                                    <Text style={[styles.metricDate, { color: theme.colors.textSecondary }]}>
                                        {new Date(metric.recorded_at).toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
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
    content: {
        padding: 16,
    },
    section: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    fullInput: {
        flex: 2,
    },
    separator: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 8,
    },
    unit: {
        fontSize: 14,
        marginLeft: 8,
    },
    logButton: {
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    logButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd',
    },
    metricIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    metricInfo: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 2,
    },
    metricDate: {
        fontSize: 12,
        marginTop: 2,
    },
});
