import { logger } from '../../utils/logger';

const APP_SCHEME = 'aafiya';
const PAIRING_PATH = '/pair';

/**
 * Prepares data for QR code generation.
 * This service formats a pairing code into a structured URI, which makes it
 * robust and easy for the mobile app to parse.
 */
export class QRCodeGenerator {

    /**
     * Generates a URI-formatted string to be encoded into a QR code.
     * The format is `app_scheme://path?query_param=value`.
     * Example: `aafiya:/pair?code=1234-5678`
     *
     * @param pairingCode The raw pairing code to be embedded in the QR data.
     * @returns A formatted string ready for QR code generation.
     */
    generateQRCodeData(pairingCode: string): string {
        if (!pairingCode) {
            logger.warn('Attempted to generate QR code data with an empty pairing code.');
            throw new Error('Pairing code cannot be empty.');
        }

        const url = new URL(`${APP_SCHEME}:${PAIRING_PATH}`);
        url.searchParams.append('code', pairingCode);

        const qrData = url.toString();
        logger.log(`Generated QR code data: ${qrData}`);

        return qrData;
    }

    /**
     * Parses the pairing code from a scanned QR code URI.
     *
     * @param qrCodeData The full string scanned from the QR code.
     * @returns The extracted pairing code.
     * @throws An error if the data is not in the expected format.
     */
    parseQRCodeData(qrCodeData: string): string {
        logger.log(`Parsing QR code data: ${qrCodeData}`);
        try {
            const url = new URL(qrCodeData);

            // Validate the scheme and path
            if (url.protocol !== `${APP_SCHEME}:` || url.pathname !== PAIRING_PATH) {
                throw new Error('QR code is not a valid pairing code for this app.');
            }

            const pairingCode = url.searchParams.get('code');
            if (!pairingCode) {
                throw new Error('QR code does not contain a pairing code.');
            }

            logger.log(`Successfully parsed pairing code: ${pairingCode}`);
            return pairingCode;
        } catch (error) {
            logger.error(`Failed to parse QR code data: ${qrCodeData}`, error);
            throw new Error('Invalid QR code format.');
        }
    }
}
