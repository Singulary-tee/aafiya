
import { useState, useEffect, useCallback, useMemo } from 'react';
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
    const { db, isLoading } = useDatabase();
    const [pairing, setPairing] = useState<HelperPairing | null>(null);
    const [helpers, setHelpers] = useState<HelperPairing[]>([]);
    const [patients, setPatients] = useState<HelperPairing[]>([]);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isPaired, setIsPaired] = useState<boolean>(false);

    const pairingRepo = useMemo(() => db ? new HelperPairingRepository(db) : null, [db]);
    const profileRepo = useMemo(() => db ? new ProfileRepository(db) : null, [db]);

    useEffect(() => {
        const loadPairings = async () => {
            if (!isLoading && db && profileId && pairingRepo && profileRepo) {
                // Load helpers (this user is the primary, others are helpers)
                const myHelpers = await pairingRepo.findAllByProfileId(profileId, 'active');
                setHelpers(myHelpers);

                // Load patients (this user is a helper for others)
                const myPatients = await pairingRepo.findAllByHelperProfileId(profileId, 'active');
                setPatients(myPatients);

                const totalPairings = myHelpers.length + myPatients.length;
                setIsPaired(totalPairings > 0);
                
                if (myHelpers.length > 0) {
                    setPairing(myHelpers[0]);
                } else if (myPatients.length > 0) {
                    setPairing(myPatients[0]);
                }
                
                logger.log(`Loaded ${myHelpers.length} helpers and ${myPatients.length} patients.`);
            }
        };
        loadPairings();
    }, [db, profileId, isLoading, pairingRepo, profileRepo]);

    const generatePairingData = useCallback(async () => {
        if (isLoading || !db || !profileId || !pairingRepo || !profileRepo) return;

        try {
            logger.log('Generating new pairing data for QR code.');
            const manager = new HelperConnectionManager(pairingRepo, profileRepo);
            const secureChannel = new SecureChannel();

            const pairingCode = await manager.initiatePairing(profileId);
            const encryptionKey = await secureChannel.establishChannel(pairingCode);

            // Store the profile info with the pairing code for later use
            const pairingData = { 
                pairingCode, 
                encryptionKey, 
                profileId,
                timestamp: Date.now()
            };

            // Generate QR code data - pass as JSON string directly
            const qrData = JSON.stringify(pairingData);

            setQrCode(qrData);
            logger.log('QR code for helper pairing generated successfully.');
        } catch (error) {
            logger.error('Failed to generate pairing data:', error);
        }
    }, [db, profileId, isLoading, pairingRepo, profileRepo]);

    const pairWithPrimary = useCallback(async (qrCodeData: string) => {
        if (isLoading || !db || !pairingRepo || !profileRepo) return;

        try {
            logger.log('Attempting to pair with primary user from QR code data.');
            const parsedData = JSON.parse(qrCodeData);
            const { pairingCode, encryptionKey, profileId: primaryProfileId } = parsedData;

            if (!pairingCode || !encryptionKey || !primaryProfileId) {
                throw new Error('Invalid QR code data.');
            }

            const primaryUser = await profileRepo.findById(primaryProfileId);
            if (!primaryUser) {
                throw new Error("Primary user not found.");
            }

            const manager = new HelperConnectionManager(pairingRepo, profileRepo);

            const storageKey = `${SECURE_KEY_PREFIX}${pairingCode}`;
            await storeSecureData(storageKey, encryptionKey);

            // Confirm pairing - the helper's profile ID and primary user's pairing code
            const primaryProfileIdResult = await manager.confirmPairing(profileId, pairingCode, 'My Helper');
            
            const newPairing = await pairingRepo.findByCode(pairingCode);

            if (newPairing) {
                setPatients([newPairing, ...patients]);
                setPairing(newPairing);
                setIsPaired(true);
            }
            setQrCode(null);
            logger.log(`Successfully paired with primary user: ${primaryProfileId}`);
        } catch (error) {
            logger.error('Failed to pair with primary user:', error);
            throw error;
        }
    }, [db, profileId, isLoading, pairingRepo, profileRepo, patients]);

    const unpair = useCallback(async (pairingId?: string) => {
        if (isLoading || !db || !pairingRepo || !profileRepo) return;

        const targetPairingId = pairingId || pairing?.id;
        if (!targetPairingId) return;

        try {
            logger.log(`Unpairing from pairing ID: ${targetPairingId}`);
            const targetPairing = await pairingRepo.findById(targetPairingId);
            if (!targetPairing) {
                throw new Error('Pairing not found');
            }

            const manager = new HelperConnectionManager(pairingRepo, profileRepo);
            const secureChannel = new SecureChannel();

            await manager.unpair(targetPairingId);
            await secureChannel.terminateChannel(targetPairing.pairing_code);

            // Remove from local state
            setHelpers(helpers.filter(h => h.id !== targetPairingId));
            setPatients(patients.filter(p => p.id !== targetPairingId));
            
            if (pairing?.id === targetPairingId) {
                setPairing(null);
            }
            
            setIsPaired(helpers.length > 1 || patients.length > 1);
            setQrCode(null);
            logger.log('Successfully unpaired.');
        } catch (error) {
            logger.error('Failed to unpair:', error);
            throw error;
        }
    }, [db, pairing, helpers, patients, isLoading, pairingRepo, profileRepo]);

    return { 
        isPaired, 
        qrCode, 
        pairing, 
        helpers,
        patients,
        generatePairingData, 
        pairWithPrimary, 
        unpair 
    };
}
