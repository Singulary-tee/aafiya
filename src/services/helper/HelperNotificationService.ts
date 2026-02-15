import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { HelperPairingRepository } from '../../database/repositories/HelperPairingRepository';
import { ProfileRepository } from '../../database/repositories/ProfileRepository';
import { MedicationRepository } from '../../database/repositories/MedicationRepository';
import { DoseLog } from '../../database/models/DoseLog';
import { logger } from '../../utils/logger';

/**
 * HelperNotificationService
 * Sends notifications to helpers when a patient misses a dose.
 * Only sends notifications when on WiFi network.
 */
export class HelperNotificationService {
    private pairingRepository: HelperPairingRepository;
    private profileRepository: ProfileRepository;
    private medicationRepository: MedicationRepository;

    constructor(
        pairingRepository: HelperPairingRepository,
        profileRepository: ProfileRepository,
        medicationRepository: MedicationRepository
    ) {
        this.pairingRepository = pairingRepository;
        this.profileRepository = profileRepository;
        this.medicationRepository = medicationRepository;
    }

    /**
     * Checks if the device is on WiFi network
     */
    private async isOnWiFi(): Promise<boolean> {
        try {
            const state = await NetInfo.fetch();
            return state.isConnected === true && state.type === 'wifi';
        } catch (error) {
            logger.error('Failed to check WiFi status:', error);
            return false;
        }
    }

    /**
     * Notifies all helpers of a patient about a missed dose.
     * Only sends notification if on WiFi network.
     * 
     * @param profileId The patient's profile ID
     * @param missedDose The missed dose log
     */
    async notifyHelpersOfMissedDose(profileId: string, missedDose: DoseLog): Promise<void> {
        try {
            // Check if on WiFi
            const onWiFi = await this.isOnWiFi();
            if (!onWiFi) {
                logger.log('Not on WiFi, skipping helper notification');
                return;
            }

            // Get all active helpers for this profile
            const helpers = await this.pairingRepository.findAllByProfileId(profileId, 'active');
            
            if (helpers.length === 0) {
                logger.log('No active helpers found for profile:', profileId);
                return;
            }

            // Get profile and medication details for notification content
            const profile = await this.profileRepository.findById(profileId);
            const medication = await this.medicationRepository.findById(missedDose.medication_id);

            if (!profile || !medication) {
                logger.warn('Profile or medication not found for notification');
                return;
            }

            // Send local notification for each helper
            // In a real implementation with device-to-device communication,
            // this would send notifications through WiFi Direct/mDNS
            for (const helper of helpers) {
                await this.sendHelperNotification(
                    profile.name,
                    medication.name,
                    new Date(missedDose.scheduled_time),
                    helper.helper_profile_id
                );
            }

            logger.log(`Notified ${helpers.length} helpers about missed dose for ${profile.name}`);
        } catch (error) {
            logger.error('Failed to notify helpers of missed dose:', error);
        }
    }

    /**
     * Sends a local notification about a missed dose.
     * In a production app with multiple devices, this would use WiFi Direct/mDNS
     * to send the notification to the helper's device.
     * 
     * @param patientName Name of the patient
     * @param medicationName Name of the medication
     * @param scheduledTime When the dose was scheduled
     * @param helperProfileId The helper's profile ID (for future device-to-device communication)
     */
    private async sendHelperNotification(
        patientName: string,
        medicationName: string,
        scheduledTime: Date,
        helperProfileId: string | null
    ): Promise<void> {
        try {
            const timeStr = scheduledTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⚠️ Missed Dose Alert',
                    body: `${patientName} missed their ${medicationName} dose scheduled for ${timeStr}`,
                    data: {
                        type: 'helper_missed_dose',
                        patientName,
                        medicationName,
                        scheduledTime: scheduledTime.getTime(),
                        helperProfileId,
                    },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null, // Send immediately
            });

            logger.log(`Sent helper notification for ${patientName} - ${medicationName}`);
        } catch (error) {
            logger.error('Failed to send helper notification:', error);
        }
    }

    /**
     * Batch notify helpers about multiple missed doses
     * 
     * @param profileId The patient's profile ID
     * @param missedDoses Array of missed dose logs
     */
    async notifyHelpersOfMissedDoses(profileId: string, missedDoses: DoseLog[]): Promise<void> {
        for (const dose of missedDoses) {
            await this.notifyHelpersOfMissedDose(profileId, dose);
        }
    }
}
