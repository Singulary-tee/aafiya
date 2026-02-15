import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as TextExtractor from 'expo-text-extractor';
import { logger } from './logger';

/**
 * Requests camera permission for OCR.
 * @returns true if permission granted, false otherwise.
 */
export async function requestCameraPermission(): Promise<boolean> {
    try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        logger.error('Error requesting camera permission:', error);
        return false;
    }
}

/**
 * Checks if camera permission is granted.
 * @returns true if permission is granted, false otherwise.
 */
export async function hasCameraPermission(): Promise<boolean> {
    try {
        const { status } = await Camera.getCameraPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        logger.error('Error checking camera permission:', error);
        return false;
    }
}

/**
 * Takes a photo and extracts text from it using expo-text-extractor.
 * This is a native Expo module that works on Android and iOS devices.
 * 
 * @param cameraRef Reference to the camera component.
 * @param onResult Callback function with extracted text.
 * @param onError Callback function when an error occurs.
 */
export async function captureAndExtractText(
    cameraRef: Camera | null,
    onResult: (text: string) => void,
    onError?: (error: string) => void
): Promise<void> {
    try {
        if (!cameraRef) {
            throw new Error('Camera reference is not available');
        }

        // Check permission
        const hasPermission = await hasCameraPermission();
        if (!hasPermission) {
            throw new Error('Camera permission not granted');
        }

        // Take photo
        const photo = await cameraRef.takePictureAsync({
            quality: 0.8,
            base64: false,
            skipProcessing: false,
        });

        logger.info('Photo captured:', photo.uri);

        // Process image with expo-text-extractor
        try {
            const extractedText = await performOCR(photo.uri);
            
            // Clean up the temporary photo
            await FileSystem.deleteAsync(photo.uri, { idempotent: true });
            
            if (extractedText && extractedText.trim().length > 0) {
                onResult(extractedText.trim());
            } else {
                if (onError) {
                    onError('No text found in image. Please try again or type manually.');
                }
            }
        } catch (ocrError) {
            logger.error('OCR processing error:', ocrError);
            // Clean up the temporary photo
            await FileSystem.deleteAsync(photo.uri, { idempotent: true });
            if (onError) {
                onError('Failed to read text from image. Please type medication name manually.');
            }
        }
    } catch (error) {
        logger.error('Error capturing photo:', error);
        if (onError) {
            onError(error instanceof Error ? error.message : 'Failed to capture photo');
        }
    }
}

/**
 * Performs OCR on an image using expo-text-extractor.
 * This is a native Expo module that works on Android and iOS.
 * 
 * @param imageUri URI of the image to process.
 * @returns Extracted text from the image.
 */
async function performOCR(imageUri: string): Promise<string> {
    try {
        logger.info('Starting OCR processing with expo-text-extractor...');
        
        // Use expo-text-extractor to extract text from the image
        const result = await TextExtractor.extractTextFromImageAsync(imageUri);
        
        logger.info('OCR completed, extracted text length:', result.text.length);
        return result.text;
    } catch (error) {
        logger.error('expo-text-extractor OCR error:', error);
        throw error;
    }
}

/**
 * Processes an image URI and extracts text from it.
 * This can be used with image picker or camera roll.
 * 
 * @param imageUri URI of the image to process.
 * @param onResult Callback function with extracted text.
 * @param onError Callback function when an error occurs.
 */
export async function extractTextFromImage(
    imageUri: string,
    onResult: (text: string) => void,
    onError?: (error: string) => void
): Promise<void> {
    try {
        logger.info('Processing image for text extraction:', imageUri);

        // Perform OCR on the image
        const extractedText = await performOCR(imageUri);
        
        if (extractedText && extractedText.trim().length > 0) {
            onResult(extractedText.trim());
        } else {
            if (onError) {
                onError('No text found in image.');
            }
        }
    } catch (error) {
        logger.error('Error extracting text from image:', error);
        if (onError) {
            onError(error instanceof Error ? error.message : 'Failed to extract text');
        }
    }
}

/**
 * Parses extracted text to find potential medication names.
 * Uses heuristics to identify medication-related text.
 * 
 * @param text The extracted text from OCR.
 * @returns Array of potential medication names.
 */
export function parseMedicationNames(text: string): string[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const medicationNames: string[] = [];
    
    // Common patterns for medication names:
    // - Capitalized words
    // - Words ending in common medication suffixes
    // - Words with dosage information nearby
    const medicationSuffixes = ['ol', 'in', 'pril', 'stat', 'vir', 'mab', 'ide', 'one', 'pine', 'pam', 'zole'];
    const dosagePatterns = /\d+\s*(mg|ml|mcg|g|units|%)/i;
    
    for (const line of lines) {
        // Check if line contains dosage information
        const hasDosage = dosagePatterns.test(line);
        
        // Check if line starts with capital letter (potential drug name)
        const words = line.split(/\s+/);
        for (const word of words) {
            if (word.length > 3 && word[0] === word[0].toUpperCase()) {
                // Check if word ends with common medication suffix
                const endsWithSuffix = medicationSuffixes.some(suffix => 
                    word.toLowerCase().endsWith(suffix)
                );
                
                if (endsWithSuffix || hasDosage) {
                    // Clean the word (remove punctuation)
                    const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
                    if (cleanWord.length > 3 && !medicationNames.includes(cleanWord)) {
                        medicationNames.push(cleanWord);
                    }
                }
            }
        }
    }
    
    return medicationNames;
}
