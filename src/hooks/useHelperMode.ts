
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

export function useHelperMode(profileId: string) {
    const db = useDatabase();
    const [pairing, setPairing] = useState<HelperPairing | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isPaired, setIsPaired] = useState<boolean>(false);

    useEffect(() => {
        const loadPairing = async () => {
            if (db && profileId) {
                const pairingRepo = new HelperPairingRepository(db);
                const profileRepo = new ProfileRepository(db);
                const manager = new HelperConnectionManager(pairingRepo, profileRepo);

                const existingPairings = await manager.findActivePairings(profileId);
                if (existingPairings.length > 0) {
                    setPairing(existingPairings[0]);
                    setIsPaired(true);
                    logger.log('Existing helper pairing loaded.');
                }
            }
        };
        loadPairing();
    }, [db, profileId]);

    const generatePairingData = useCallback(async () => {
        if (!db || !profileId) return;

        try {
            logger.log('Generating new pairing data for QR code.');
            const pairingRepo = new HelperPairingRepository(db);
            const profileRepo = new ProfileRepository(db);
            const manager = new HelperConnectionManager(pairingRepo, profileRepo);
            const secureChannel = new SecureChannel();

            const pairingCode = await manager.initiatePairing(profileId);
            const encryptionKey = await secureChannel.establishChannel(pairingCode);

            const payload = JSON.stringify({ pairingId: pairingCode, encryptionKey, profileId });

            const qrCodeGenerator = new QRCodeGenerator();
            const qrData = qrCodeGenerator.generateQRCodeData(payload);

            setQrCode(qrData);
            logger.log('QR code for helper pairing generated successfully.');
        } catch (error) {
            logger.error('Failed to generate pairing data:', error);
        }
    }, [db, profileId]);

    const pairWithPrimary = useCallback(async (qrCodeData: string) => {
        if (!db) return;

        try {
            logger.log('Attempting to pair with primary user from QR code data.');
            const { pairingId: pairingCode, encryptionKey, profileId: primaryProfileId } = JSON.parse(qrCodeData);

            if (!pairingCode || !encryptionKey || !primaryProfileId) {
                throw new Error('Invalid QR code data.');
            }

            const profileRepo = new ProfileRepository(db);
            const primaryUser = await profileRepo.findById(primaryProfileId);
            if (!primaryUser) {
                throw new Error("Primary user not found.");
            }

            const pairingRepo = new HelperPairingRepository(db);
            const manager = new HelperConnectionManager(pairingRepo, profileRepo);

            const storageKey = `${SECURE_KEY_PREFIX}${pairingCode}`;
            await storeSecureData(storageKey, encryptionKey);

            const newPairingId = await manager.confirmPairing("", pairingCode, 'My Helper');
            
            const newPairing = await pairingRepo.findById(newPairingId);

            setPairing(newPairing);
            setIsPaired(true);
            setQrCode(null);
            logger.log(`Successfully paired with primary user: ${primaryProfileId}`);
        } catch (error) {
            logger.error('Failed to pair with primary user:', error);
        }
    }, [db]);

    const unpair = useCallback(async () => {
        if (!db || !pairing) return;

        try {
            logger.log(`Unpairing from pairing ID: ${pairing.id}`);
            const pairingRepo = new HelperPairingRepository(db);
            const profileRepo = new ProfileRepository(db);
            const manager = new HelperConnectionManager(pairingRepo, profileRepo);
            const secureChannel = new SecureChannel();

            await manager.unpair(pairing.id);
            await secureChannel.terminateChannel(pairing.pairing_code);

            setPairing(null);
            setIsPaired(false);
            setQrCode(null);
            logger.log('Successfully unpaired.');
        } catch (error) {
            logger.error('Failed to unpair:', error);
        }
    }, [db, pairing]);

    return { isPaired, qrCode, pairing, generatePairingData, pairWithPrimary, unpair };
}
