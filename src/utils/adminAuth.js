import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_KEY = 'egypt_tourism_admin_credentials';

/**
 * Hash a password using a simple but consistent method.
 * For a local app, we store a salted hash to avoid plain-text storage.
 */
function simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit int
    }
    return hash.toString(36);
}

const SALT = 'egypt_tourism_salt_2024';

function hashPassword(password) {
    return simpleHash(SALT + password + SALT);
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
        const creds = {
            username: username.trim().toLowerCase(),
            passwordHash: hashPassword(password),
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
    try {
        const data = await AsyncStorage.getItem(ADMIN_KEY);
        if (!data) return { ok: false, error: 'Admin not set up.' };
        const creds = JSON.parse(data);
        const usernameMatch = creds.username === username.trim().toLowerCase();
        const passwordMatch = creds.passwordHash === hashPassword(password);
        if (usernameMatch && passwordMatch) {
            return { ok: true };
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
        if (creds.passwordHash !== hashPassword(oldPassword)) {
            return { ok: false, error: 'Old password is incorrect.' };
        }
        if (!newPassword || newPassword.length < 6) {
            return { ok: false, error: 'New password must be at least 6 characters.' };
        }
        creds.passwordHash = hashPassword(newPassword);
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
