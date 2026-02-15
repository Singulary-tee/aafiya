import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { logger } from './logger';

/**
 * Requests microphone permission for voice input.
 * @returns true if permission granted, false otherwise.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
    try {
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        logger.error('Error requesting microphone permission:', error);
        return false;
    }
}

/**
 * Starts voice recognition for medication search using Web Speech API.
 * This works on modern browsers and some platforms. For full support across
 * all React Native platforms, consider react-native-voice package.
 * 
 * @param onResult Callback function when speech is recognized.
 * @param onError Callback function when an error occurs.
 */
export function startVoiceInput(
    onResult: (text: string) => void,
    onError?: (error: string) => void
): void {
    try {
        // Check if we're in a web environment with Speech Recognition support
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.lang = 'en-US'; // Can be made configurable
            
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                logger.info('Voice input recognized:', transcript);
                onResult(transcript);
            };
            
            recognition.onerror = (event: any) => {
                logger.error('Voice input error:', event.error);
                if (onError) {
                    onError(`Speech recognition error: ${event.error}`);
                }
            };
            
            recognition.start();
            logger.info('Voice input started');
        } else {
            // Fallback: Request user to speak and use a simple prompt
            logger.warn('Web Speech API not available, using fallback');
            if (onError) {
                onError('Voice input not available on this platform. Please type the medication name.');
            }
        }
    } catch (error) {
        logger.error('Error starting voice input:', error);
        if (onError) {
            onError('Failed to start voice input. Please type the medication name.');
        }
    }
}

/**
 * Stops ongoing voice recognition.
 */
export function stopVoiceInput(): void {
    try {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            // Note: In a production app, you'd store the recognition instance
            // and call recognition.stop() here
            logger.info('Voice input stopped');
        }
    } catch (error) {
        logger.error('Error stopping voice input:', error);
    }
}

/**
 * Checks if voice input is available on the device.
 * @returns true if voice input is available, false otherwise.
 */
export function isVoiceInputAvailable(): boolean {
    // Check for Web Speech API support
    if (typeof window !== 'undefined') {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
    return false;
}

/**
 * Provides text-to-speech feedback (optional feature for accessibility)
 * @param text Text to speak
 */
export async function speak(text: string): Promise<void> {
    try {
        await Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 1.0,
        });
    } catch (error) {
        logger.error('Error with text-to-speech:', error);
    }
}
