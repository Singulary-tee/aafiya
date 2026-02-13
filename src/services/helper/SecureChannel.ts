import { encryptData, decryptData, generateEncryptionKey } from '../../utils/encryption';
import { storeSecureData, getSecureData } from '../../utils/storage';
import { logger } from '../../utils/logger';

const SECURE_KEY_PREFIX = 'secure_channel_key_';

/**
 * Manages the end-to-end encryption for a communication channel between a primary user and a helper.
 * This service handles the local lifecycle of the symmetric encryption key, including its
 * generation, secure storage, and use for encrypting/decrypting data.
 *
 * NOTE: This service manages the key on the local device only. The secure exchange of this key
 * between the primary user and helper devices must be handled by a separate mechanism.
 */
export class SecureChannel {

    private getStorageKey(pairingId: string): string {
        return `${SECURE_KEY_PREFIX}${pairingId}`;
    }

    /**
     * Establishes a new secure channel by generating and storing a symmetric encryption key.
     * This should be called by one party (e.g., the primary user) after a pairing is confirmed.
     *
     * @param pairingId The unique identifier for the helper pairing.
     * @returns The generated encryption key. This key must then be securely transmitted to the other party.
     */
    async establishChannel(pairingId: string): Promise<string> {
        logger.log(`Establishing secure channel for pairing: ${pairingId}`);
        try {
            const key = await generateEncryptionKey();
            const storageKey = this.getStorageKey(pairingId);
            await storeSecureData(storageKey, key);
            logger.log(`Successfully generated and stored key for pairing: ${pairingId}`);
            return key;
        } catch (error) {
            logger.error(`Failed to establish secure channel for pairing ${pairingId}:`, error);
            throw new Error('Could not create and store encryption key.');
        }
    }

    /**
     * Encrypts data for a specific channel using its stored key.
     *
     * @param pairingId The ID of the pairing channel.
     * @param data The data to be encrypted.
     * @returns The encrypted ciphertext.
     * @throws An error if the encryption key for the channel is not found.
     */
    async encryptForChannel(pairingId: string, data: any): Promise<string> {
        const storageKey = this.getStorageKey(pairingId);
        const key = await getSecureData(storageKey);
        if (!key) {
            throw new Error(`No encryption key found for pairing ${pairingId}. Cannot encrypt.`);
        }
        return encryptData(data, key);
    }

    /**
     * Decrypts data from a specific channel using its stored key.
     *
     * @param pairingId The ID of the pairing channel.
     * @param ciphertext The encrypted data to be decrypted.
     * @returns The original, decrypted data.
     * @throws An error if the encryption key for the channel is not found or if decryption fails.
     */
    async decryptFromChannel(pairingId: string, ciphertext: string): Promise<any> {
        const storageKey = this.getStorageKey(pairingId);
        const key = await getSecureData(storageKey);
        if (!key) {
            throw new Error(`No encryption key found for pairing ${pairingId}. Cannot decrypt.`);
        }
        return decryptData(ciphertext, key);
    }

    /**
     * Permanently terminates a secure channel by deleting its encryption key from storage.
     * This should be called when a helper is unpaired from a primary user.
     *
     * @param pairingId The ID of the pairing channel to terminate.
     */
    async terminateChannel(pairingId: string): Promise<void> {
        logger.log(`Terminating secure channel for pairing: ${pairingId}`);
        const storageKey = this.getStorageKey(pairingId);
        // SecureStore's delete is what we'd use here, but our abstraction uses store with null.
        // Assuming storing null effectively deletes it or overwrites it.
        await storeSecureData(storageKey, ''); // Overwrite with empty string to invalidate
        logger.log(`Successfully terminated channel for pairing: ${pairingId}`);
    }
}
