
import * as Crypto from 'expo-crypto';

/**
 * Generates a random numeric code of a given length.
 * This is sufficient for generating short, non-critical codes like pairing codes.
 * @param length The desired length of the code.
 * @returns A string containing the random numeric code.
 */
export async function generateSecureCode(length: number): Promise<string> {
    if (length <= 0) {
        return '';
    }

    const randomBytes = await Crypto.getRandomBytesAsync(length);
    let code = '';
    for (let i = 0; i < randomBytes.length; i++) {
        code += randomBytes[i] % 10;
    }
    return code;
}
