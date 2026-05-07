import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Crypto from 'expo-crypto';

const ADMIN_KEY = 'egypt_tourism_admin_credentials';
const SALT = 'egypt_tourism_salt_2024';

let loginAttempts = 0;
let lockoutUntil = 0;

async function hashPassword(password) {
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        SALT + password + SALT
    );
    return digest;
}

/**
 * Check if admin credentials have been set up.
 * Returns true if a password exists in storage.
 */
export async function isAdminSetup() {
    try {
        const data = await AsyncStorage.getItem(ADMIN_KEY);
        if (!data) return false;
        const creds = JSON.parse(data);
        return !!(creds && creds.passwordHash);
    } catch {
        return false;
    }
}

/**
 * Set up admin credentials for the first time.
 * @param {string} username
 * @param {string} password
 */
export async function setupAdminCredentials(username, password) {
    if (!username || username.trim().length < 3) {
        return { ok: false, error: 'Username must be at least 3 characters.' };
    }
    if (!password || password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters.' };
    }
    try {
        const hashed = await hashPassword(password);
        const creds = {
            username: username.trim().toLowerCase(),
            passwordHash: hashed,
            createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(ADMIN_KEY, JSON.stringify(creds));
        return { ok: true };
    } catch (e) {
        return { ok: false, error: 'Failed to save credentials.' };
    }
}

/**
 * Verify admin login attempt.
 * @param {string} username
 * @param {string} password
 */
export async function verifyAdminLogin(username, password) {
    if (Date.now() < lockoutUntil) {
        const mins = Math.ceil((lockoutUntil - Date.now()) / 60000);
        return { ok: false, error: `Too many attempts. Try again in ${mins} minute(s).` };
    }

    try {
        const data = await AsyncStorage.getItem(ADMIN_KEY);
        if (!data) return { ok: false, error: 'Admin not set up.' };
        const creds = JSON.parse(data);
        const usernameMatch = creds.username === username.trim().toLowerCase();
        
        const hashed = await hashPassword(password);
        const passwordMatch = creds.passwordHash === hashed;
        
        if (usernameMatch && passwordMatch) {
            loginAttempts = 0;
            lockoutUntil = 0;
            return { ok: true };
        }
        
        loginAttempts++;
        if (loginAttempts >= 5) {
            lockoutUntil = Date.now() + 5 * 60 * 1000;
            loginAttempts = 0;
            return { ok: false, error: 'Too many failed attempts. Locked for 5 minutes.' };
        }

        return { ok: false, error: 'Incorrect username or password.' };
    } catch {
        return { ok: false, error: 'Login failed. Please try again.' };
    }
}

/**
 * Change admin password (requires old password verification).
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export async function changeAdminPassword(oldPassword, newPassword) {
    try {
        const data = await AsyncStorage.getItem(ADMIN_KEY);
        if (!data) return { ok: false, error: 'Admin not set up.' };
        const creds = JSON.parse(data);
        
        const oldHashed = await hashPassword(oldPassword);
        if (creds.passwordHash !== oldHashed) {
            return { ok: false, error: 'Old password is incorrect.' };
        }
        if (!newPassword || newPassword.length < 6) {
            return { ok: false, error: 'New password must be at least 6 characters.' };
        }
        
        const newHashed = await hashPassword(newPassword);
        creds.passwordHash = newHashed;
        creds.updatedAt = new Date().toISOString();
        await AsyncStorage.setItem(ADMIN_KEY, JSON.stringify(creds));
        return { ok: true };
    } catch {
        return { ok: false, error: 'Failed to change password.' };
    }
}

/**
 * Get admin username (for display only, never returns password).
 */
export async function getAdminUsername() {
    try {
        const data = await AsyncStorage.getItem(ADMIN_KEY);
        if (!data) return null;
        const creds = JSON.parse(data);
        return creds.username || null;
    } catch {
        return null;
    }
}
