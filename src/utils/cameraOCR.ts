import { Camera, CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
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
 * Takes a photo and attempts to extract text from it.
 * Note: This is a placeholder implementation. In a production app, you would use:
 * - expo-image-manipulator for image processing
 * - vision-camera with text recognition plugin
 * - Google Cloud Vision API or AWS Textract for OCR
 * - react-native-text-recognition
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
            skipProcessing: true,
        });

        logger.info('Photo captured:', photo.uri);

        // In a real implementation, you would:
        // 1. Send the image to an OCR service (Google Cloud Vision, AWS Textract, etc.)
        // 2. Or use a local text recognition library
        // 3. Process the response and extract medication names
        
        // For now, we'll provide a placeholder response
        // In production, replace this with actual OCR implementation
        const mockExtractedText = 'Lisinopril 10mg'; // Placeholder
        
        // Clean up the temporary photo
        await FileSystem.deleteAsync(photo.uri, { idempotent: true });
        
        onResult(mockExtractedText);
    } catch (error) {
        logger.error('Error capturing and extracting text:', error);
        if (onError) {
            onError(error instanceof Error ? error.message : 'Failed to extract text from image');
        }
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

        // In a real implementation:
        // 1. Read the image from the URI
        // 2. Send to OCR service or use local library
        // 3. Parse the response
        // 4. Extract medication-related text (names, dosages)
        
        // Placeholder implementation
        const mockExtractedText = 'Sample medication name';
        onResult(mockExtractedText);
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
    const medicationSuffixes = ['ol', 'in', 'pril', 'stat', 'vir', 'mab', 'ide', 'one', 'pine'];
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
