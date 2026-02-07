import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    FAVORITES: 'egypt_tourism_favorites',
    ITINERARY: 'egypt_tourism_itinerary',
    SETTINGS: 'egypt_tourism_settings',
};

export const storage = {
    async save(key, data) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    },

    async load(key) {
        try {
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    },

    async remove(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    keys: STORAGE_KEYS,
};

export default storage;
