import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { HelperPairingRepository, HelperPairing } from '../database/repositories/HelperPairingRepository';
import { ProfileRepository } from '../database/repositories/ProfileRepository';
import { HelperConnectionManager } from '../services/helper/HelperConnectionManager';
import { QRCodeGenerator } from '../services/helper/QRCodeGenerator';
import { SecureChannel } from '../services/helper/SecureChannel';
import { storeSecureData } from '../utils/storage';
import { logger } from '../utils/logger';

const SECURE_KEY_PREFIX = 'secure_channel_key_';

/**
 * Manages the state and actions for helper mode, allowing a primary user to pair with a helper.
 * This hook provides functionalities for both the primary user (generating a QR code) and the helper (scanning the code).
 *
 * @param profileId The ID of the primary user's profile.
 */
export function useHelperMode(profileId: string) {
    const db = useDatabase();
    const [pairing, setPairing] = useState<HelperPairing | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isPaired, setIsPaired] = useState<boolean>(false);

    const [manager, setManager] = useState<HelperConnectionManager | null>(null);
    const [secureChannel, setSecureChannel] = useState<SecureChannel | null>(null);
    const [profileRepo, setProfileRepo] = useState<ProfileRepository | null>(null);

    useEffect(() => {
        if (db) {
            const pairingRepo = new HelperPairingRepository(db);
            const profileRepo = new ProfileRepository(db);
            setManager(new HelperConnectionManager(pairingRepo, profileRepo));
            setSecureChannel(new SecureChannel());
            setProfileRepo(profileRepo);
        }
    }, [db]);

    // Load existing pairing on mount
    useEffect(() => {
        const loadPairing = async () => {
            if (manager) {
                const existingPairings = await manager.findActivePairings(profileId);
                if (existingPairings.length > 0) {
                    setPairing(existingPairings[0]);
                    setIsPaired(true);
                    logger.log('Existing helper pairing loaded.');
                }
            }
        };
        loadPairing();
    }, [manager, profileId]);

    /**
     * (For Primary User) Starts the pairing process by generating a QR code.
     * The QR code contains the necessary info for a helper to connect.
     */
    const generatePairingData = useCallback(async () => {
        if (!manager || !secureChannel || !profileId) return;

        try {
            logger.log('Generating new pairing data for QR code.');
            const pairingCode = await manager.initiatePairing(profileId);
            const encryptionKey = await secureChannel.establishChannel(pairingCode);

            const qrCodeGenerator = new QRCodeGenerator();
            const qrData = qrCodeGenerator.generateQRCodeData(pairingCode)

            const payload = JSON.stringify({ pairingId: pairingCode, encryptionKey, profileId });

            setQrCode(qrData);
            logger.log('QR code for helper pairing generated successfully.');
        } catch (error) {
            logger.error('Failed to generate pairing data:', error);
            // Optionally handle UI feedback for the error
        }
    }, [manager, secureChannel, profileId]);

    /**
     * (For Helper) Pairs with a primary user using the data from a scanned QR code.
     *
     * @param qrCodeData The string data obtained from scanning the QR code.
     */
    const pairWithPrimary = useCallback(async (qrCodeData: string) => {
        if (!manager || !secureChannel || !profileRepo) return;

        try {
            logger.log('Attempting to pair with primary user from QR code data.');
            const qrCodeGenerator = new QRCodeGenerator();
            const pairingCode = qrCodeGenerator.parseQRCodeData(qrCodeData);
            
            const { encryptionKey, profileId: primaryProfileId } = JSON.parse(qrCodeData); // This is not ideal. The key should not be in the QR.

            if (!pairingCode || !encryptionKey || !primaryProfileId) {
                throw new Error('Invalid QR code data.');
            }

            const primaryUser = await profileRepo.findById(primaryProfileId);
            if (!primaryUser) {
                throw new Error("Primary user not found.");
            }

            // Manually store the key received from the primary user
            const storageKey = `${SECURE_KEY_PREFIX}${pairingCode}`;
            await storeSecureData(storageKey, encryptionKey);

            // The helper confirms the pairing, which updates the status on the primary user's side (in a real app)
            // Here, we simulate this by creating a local pairing record for the helper.
            const newPairing = await manager.confirmPairing("", pairingCode, 'My Helper');

            // setPairing(newPairing);
            setIsPaired(true);
            setQrCode(null); // Clear QR code if any was present
            logger.log(`Successfully paired with primary user: ${primaryProfileId}`);
        } catch (error) {
            logger.error('Failed to pair with primary user:', error);
        }
    }, [manager, secureChannel, profileRepo]);

    /**
     * Unpairs from the current helper or primary user.
     */
    const unpair = useCallback(async () => {
        if (!manager || !secureChannel || !pairing) return;

        try {
            logger.log(`Unpairing from pairing ID: ${pairing.id}`);
            await manager.unpair(pairing.id);
            await secureChannel.terminateChannel(pairing.pairing_code);

            setPairing(null);
            setIsPaired(false);
            setQrCode(null);
            logger.log('Successfully unpaired.');
        } catch (error) {
            logger.error('Failed to unpair:', error);
        }
    }, [manager, secureChannel, pairing]);

    return { isPaired, qrCode, pairing, generatePairingData, pairWithPrimary, unpair };
}
