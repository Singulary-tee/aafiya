import {
    ExpoSpeechRecognitionModule,
    addSpeechRecognizedListener,
    addSpeechErrorListener,
    getStateAsync,
    start,
    stop,
    requestPermissionsAsync,
    getPermissionsAsync,
} from 'expo-speech-recognition';
import * as Speech from 'expo-speech';
import { logger } from './logger';

// Store the recognition instance state
let isListening = false;

/**
 * Requests microphone permission for voice input.
 * @returns true if permission granted, false otherwise.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
    try {
        const { status } = await requestPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        logger.error('Error requesting microphone permission:', error);
        return false;
    }
}

/**
 * Checks if microphone permission is granted.
 * @returns true if permission is granted, false otherwise.
 */
export async function hasMicrophonePermission(): Promise<boolean> {
    try {
        const { status } = await getPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        logger.error('Error checking microphone permission:', error);
        return false;
    }
}

/**
 * Starts voice recognition for medication search using expo-speech-recognition.
 * This is a native module that works on both Android and iOS devices.
 * 
 * @param onResult Callback function when speech is recognized.
 * @param onError Callback function when an error occurs.
 * @returns Cleanup function to remove listeners
 */
export function startVoiceInput(
    onResult: (text: string) => void,
    onError?: (error: string) => void
): () => void {
    try {
        // Set up listeners
        const resultSubscription = addSpeechRecognizedListener((event) => {
            logger.info('Voice input recognized:', event.results);
            
            // Get the most recent recognized text
            if (event.results && event.results.length > 0) {
                const lastResult = event.results[event.results.length - 1];
                if (lastResult.transcript && lastResult.transcript.length > 0) {
                    const transcript = lastResult.transcript;
                    logger.info('Recognized text:', transcript);
                    onResult(transcript);
                }
            }
        });

        const errorSubscription = addSpeechErrorListener((event) => {
            logger.error('Voice input error:', event.error);
            isListening = false;
            if (onError) {
                onError(`Speech recognition error: ${event.error}`);
            }
        });

        // Start recognition
        start({
            lang: 'en-US',
            interimResults: false,
            maxAlternatives: 1,
            continuous: false,
            requiresOnDeviceRecognition: false,
            addsPunctuation: false,
            contextualStrings: ['medication', 'medicine', 'drug', 'pill', 'tablet'],
        });

        isListening = true;
        logger.info('Voice input started');

        // Return cleanup function
        return () => {
            resultSubscription.remove();
            errorSubscription.remove();
            if (isListening) {
                stop();
                isListening = false;
            }
        };
    } catch (error) {
        logger.error('Error starting voice input:', error);
        isListening = false;
        if (onError) {
            onError('Failed to start voice input. Please type the medication name.');
        }
        return () => {}; // Return no-op cleanup function
    }
}

/**
 * Stops ongoing voice recognition.
 */
export async function stopVoiceInput(): Promise<void> {
    try {
        if (isListening) {
            await stop();
            isListening = false;
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
export async function isVoiceInputAvailable(): Promise<boolean> {
    try {
        // Check if the module is available
        if (!ExpoSpeechRecognitionModule) {
            return false;
        }
        
        // Check if we have permissions
        const { status } = await getPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        logger.error('Error checking voice input availability:', error);
        return false;
    }
}

/**
 * Gets the current state of speech recognition.
 * @returns The current state (e.g., 'inactive', 'starting', 'recognizing')
 */
export async function getVoiceInputState(): Promise<string> {
    try {
        const state = await getStateAsync();
        return state;
    } catch (error) {
        logger.error('Error getting voice input state:', error);
        return 'inactive';
    }
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
