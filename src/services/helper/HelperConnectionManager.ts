import { addMinutes } from 'date-fns';
import { HelperPairingRepository, HelperPairing } from '../../database/repositories/HelperPairingRepository';
import { ProfileRepository } from '../../database/repositories/ProfileRepository';
import { logger } from '../../utils/logger';
import { generateUUID } from '../../utils/uuid';

// Pairing codes are valid for a short time to improve security.
const PAIRING_CODE_VALIDITY_MINUTES = 10;

/**
 * Manages the logic for pairing primary users with helpers, including code generation
 * and confirmation of the connection.
 */
export class HelperConnectionManager {
    private pairingRepository: HelperPairingRepository;
    private profileRepository: ProfileRepository;

    constructor(pairingRepository: HelperPairingRepository, profileRepository: ProfileRepository) {
        this.pairingRepository = pairingRepository;
        this.profileRepository = profileRepository;
    }

    /**
     * Finds any active helper pairings for a given primary user's profile.
     *
     * @param profileId The ID of the primary user's profile.
     * @returns A promise that resolves to a list of active pairings.
     */
    async findActivePairings(profileId: string): Promise<HelperPairing[]> {
        return this.pairingRepository.findAllByProfileId(profileId, 'active');
    }

    /**
     * Initiates a pairing request by generating a short-lived, unique code.
     * This code is intended to be displayed as a QR code for a helper to scan.
     *
     * @param profileId The ID of the primary user's profile.
     * @returns The generated pairing code.
     * @throws Throws an error if the profile is not found.
     */
    async initiatePairing(profileId: string): Promise<string> {
        logger.log(`Initiating pairing for profile: ${profileId}`);
        const profile = await this.profileRepository.findById(profileId);
        if (!profile) {
            logger.warn(`Profile not found for ID: ${profileId} during pairing initiation.`);
            throw new Error('Profile not found.');
        }

        // Clear any old, expired codes for this user to keep the table clean.
        await this.pairingRepository.clearExpired();

        const pairingCode = generateUUID(); // A UUID is a sufficiently secure and unique code
        const expiresAt = addMinutes(new Date(), PAIRING_CODE_VALIDITY_MINUTES);

        try {
            await this.pairingRepository.create({
                profile_id: profileId,
                pairing_code: pairingCode,
                expires_at: expiresAt.getTime(),
            });
            logger.log(`Successfully created pairing code for profile: ${profileId}`);
            return pairingCode;
        } catch (error) {
            logger.error(`Failed to create pairing code for profile ${profileId}:`, error);
            throw new Error('Could not initiate pairing process.');
        }
    }

    /**
     * Confirms a pairing request using a code scanned by a helper.
     *
     * @param helperProfileId The profile ID of the helper confirming the connection.
     * @param pairingCode The unique code from the primary user.
     * @param helperName A friendly name for the helper, provided during confirmation.
     * @returns The ID of the primary user's profile they are now paired with.
     * @throws Throws an error if the code is invalid, expired, or already used.
     */
    async confirmPairing(helperProfileId: string, pairingCode: string, helperName: string): Promise<string> {
        logger.log(`Helper profile ${helperProfileId} attempting to confirm pairing with code.`);
        
        const pairingRequest = await this.pairingRepository.findByCode(pairingCode);

        if (!pairingRequest) {
            throw new Error('Invalid or expired pairing code.');
        }

        if (pairingRequest.status !== 'pending') {
            throw new Error('This pairing code has already been used.');
        }

        // The helperProfileId in this context is the one confirming the pairing,
        // but the pairing record is associated with the primary user's profile.
        // We are updating the *existing* record with the helper's name.
        await this.pairingRepository.update(pairingRequest.id, {
            helper_name: helperName,
            status: 'active',
        });

        logger.log(`Successfully paired helper ${helperName} (${helperProfileId}) with primary profile ${pairingRequest.profile_id}`);
        return pairingRequest.profile_id;
    }

    /**
     * Removes a helper pairing.
     *
     * @param pairingId The ID of the pairing to remove.
     */
    async unpair(pairingId: string): Promise<void> {
        logger.log(`Unpairing helper with pairing ID: ${pairingId}`);
        await this.pairingRepository.delete(pairingId);
    }
}
