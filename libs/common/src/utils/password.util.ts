import * as bcrypt from 'bcrypt';

/**
 * Securely hashes a plain text password for database storage.
 * 
 * @param plainTextPassword The raw password to hash
 * @returns The hashed password string
 */
export async function hashPassword(plainTextPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainTextPassword, salt);
}

/**
 * Compares a plain text password with a hashed password to verify a match.
 * 
 * @param plainTextPassword The raw password provided by the user
 * @param hash The hashed password stored in the database
 * @returns True if the password matches the hash, false otherwise
 */
export async function comparePassword(plainTextPassword: string, hash: string = ''): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hash);
}
