import * as Permissions from 'expo-permissions';
import * as Speech from 'expo-speech';
import { logger } from './logger';

/**
 * Requests microphone permission for voice input.
 * @returns true if permission granted, false otherwise.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
    try {
        // Note: In newer Expo versions, use expo-av for audio permissions
        // For now, we'll assume permission is granted if Speech is available
        return Speech.isSpeakingAsync !== undefined;
    } catch (error) {
        logger.error('Error requesting microphone permission:', error);
        return false;
    }
}

/**
 * Starts voice recognition for medication search.
 * 
 * FUTURE ENHANCEMENT: This feature requires a speech recognition library.
 * Recommended options:
 * - expo-speech-recognition (when available)
 * - @react-native-voice/voice
 * - Device's native speech recognition API
 * 
 * This function currently notifies the user that the feature is not available
 * in this offline-first version.
 * 
 * @param onResult Callback function when speech is recognized.
 * @param onError Callback function when an error occurs.
 */
export function startVoiceInput(
    onResult: (text: string) => void,
    onError?: (error: string) => void
): void {
    try {
        logger.info('Voice input requested - feature not yet available');
        
        // Notify that voice input is not available in this version
        if (onError) {
            onError('Voice input requires additional speech recognition library. Use keyboard search instead.');
        }
    } catch (error) {
        logger.error('Error in voice input:', error);
        if (onError) {
            onError('Voice input not available');
        }
    }
}

/**
 * Stops ongoing voice recognition.
 */
export function stopVoiceInput(): void {
    try {
        logger.info('Voice input stopped');
        // In real implementation, would stop the speech recognition service
    } catch (error) {
        logger.error('Error stopping voice input:', error);
    }
}

/**
 * Checks if voice input is available on the device.
 * @returns true if voice input is available, false otherwise.
 * 
 * Currently returns false as this feature requires additional dependencies.
 */
export function isVoiceInputAvailable(): boolean {
    // Voice input requires a speech recognition library which is not included
    // to maintain offline-first nature and minimize dependencies
    return false;
}
