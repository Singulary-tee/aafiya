
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { DoseLogRepository } from '@/src/database/repositories/DoseLogRepository';
import { DoseLog } from '@/src/database/models/DoseLog';
import HealthStats from '@/src/components/health/HealthStats';
import { COLORS } from '@/src/constants/colors';

export default function StatisticsScreen() {
  const { profileId } = useLocalSearchParams();
  const { db, isLoading: isDbLoading } = useDatabase();
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ adherence: 0, streak: 0, missedDoses: 0 });

  useEffect(() => {
    if (!isDbLoading && db && profileId) {
      const doseLogRepo = new DoseLogRepository(db);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      doseLogRepo.findByProfileIdAndDateRange(profileId as string, startDate.getTime(), endDate.getTime()).then((allLogs: DoseLog[]) => {
        setLogs(allLogs);

        const relevantLogs = allLogs.filter(log => log.status === 'taken' || log.status === 'missed');
        const takenCount = relevantLogs.filter(log => log.status === 'taken').length;
        const missedCount = relevantLogs.length - takenCount;
        
        const adherence = relevantLogs.length > 0 ? (takenCount / relevantLogs.length) * 100 : 100;

        const logsByDay = allLogs.reduce((acc, log) => {
            const date = new Date(log.scheduled_time).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(log);
            return acc;
        }, {} as Record<string, DoseLog[]>);

        let calculatedStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() - 1); // Start from yesterday

        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        while (currentDate >= thirtyDaysAgo) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayLogs = logsByDay[dateStr];

            if (dayLogs && dayLogs.length > 0) {
                const hasMissed = dayLogs.some(log => log.status === 'missed');
                if (hasMissed) {
                    break; 
                }
                const hasTaken = dayLogs.some(log => log.status === 'taken');
                if (!hasTaken) {
                    break;
                }
                calculatedStreak++;
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
        }

        setStats({
          adherence,
          missedDoses: missedCount,
          streak: calculatedStreak,
        });

        setIsLoading(false);
      });
    }
  }, [db, profileId, isDbLoading]);

  if (isDbLoading || isLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      
      <HealthStats {...stats} />

      <View style={styles.historySection}>
        <Text style={styles.subtitle}>Recent Activity</Text>
        {logs.slice(0, 10).map((log) => (
          <View key={log.id} style={styles.logItem}>
            <Text>{new Date(log.scheduled_time).toLocaleDateString()}</Text>
            <Text style={[styles.status, { color: getStatusColor(log.status) }]}>
              {log.status.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'taken': return 'green';
    case 'missed': return 'red';
    case 'skipped': return 'orange';
    default: return 'gray';
  }
};

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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  historySection: {
    marginBottom: 24,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  status: {
    fontWeight: 'bold',
  },
});
