import * as crypto from 'crypto';
import { hashPassword } from '@libs/index';

/**
 * Generates a strong, email-safe temporary password containing:
 * - Uppercase letters (excluding easily confused I, O)
 * - Lowercase letters (excluding easily confused l)
 * - Numbers (excluding easily confused 0, 1)
 * - Safe special characters (@#$!%*) that won't break HTML emails or copy-paste
 * 
 * @param length The total length of the password (default 12)
 * @returns A randomly generated strong, safe password string
 */
export function generateStrongPassword(length = 12): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const specials = '@#$!%*';
    const allChars = uppercase + lowercase + numbers + specials;

    let password = '';
    
    // Guarantee at least one of each required type
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += specials[crypto.randomInt(0, specials.length)];

    // Fill the rest randomly from all characters
    for (let i = password.length; i < length; i++) {
        password += allChars[crypto.randomInt(0, allChars.length)];
    }

    // Shuffle the characters
    return password
        .split('')
        .sort(() => crypto.randomInt(0, 2) - 1)
        .join('');
}

/**
 * Generates a strong password and securely hashes it for database storage.
 * 
 * @param length The total length of the password (default 12)
 * @returns An object containing both the raw password and the hashed password.
 */
export async function generateAndHashPassword(length = 12): Promise<{ plainTextPassword: string, hashedPassword: string }> {
    const plainTextPassword = generateStrongPassword(length);
    const hashedPassword = await hashPassword(plainTextPassword);

    return { plainTextPassword, hashedPassword };
}
