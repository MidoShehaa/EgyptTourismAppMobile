import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import storage from '../utils/storage';
import { TRANSLATIONS } from '../constants/translations';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [itinerary, setItinerary] = useState(null);
    const [settings, setSettings] = useState({ language: 'en' });
    const [isHydrated, setIsHydrated] = useState(false);

    // Translation Helper
    const t = useCallback((key) => {
        const lang = settings.language || 'en';
        const keys = key.split('.');
        let value = TRANSLATIONS[lang];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    }, [settings.language]);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            const [savedFavorites, savedItinerary, savedSettings] = await Promise.all([
                storage.load(storage.keys.FAVORITES),
                storage.load(storage.keys.ITINERARY),
                storage.load(storage.keys.SETTINGS),
            ]);

            if (savedFavorites) setFavorites(savedFavorites);
            if (savedItinerary) setItinerary(savedItinerary);
            if (savedSettings) setSettings(savedSettings);

            setIsHydrated(true);
        };

        loadData();
    }, []);

    // Save favorites when changed
    useEffect(() => {
        if (isHydrated) {
            storage.save(storage.keys.FAVORITES, favorites);
        }
    }, [favorites, isHydrated]);

    // Toggle favorite
    const toggleFavorite = useCallback((placeId) => {
        setFavorites(prev => {
            if (prev.includes(placeId)) {
                return prev.filter(id => id !== placeId);
            }
            return [...prev, placeId];
        });
    }, []);

    // Check if favorite
    const isFavorite = useCallback((placeId) => {
        return favorites.includes(placeId);
    }, [favorites]);

    // Update itinerary
    const updateItinerary = useCallback((newItinerary) => {
        setItinerary(newItinerary);
        storage.save(storage.keys.ITINERARY, newItinerary);
    }, []);

    // Clear itinerary
    const clearItinerary = useCallback(() => {
        setItinerary(null);
        storage.remove(storage.keys.ITINERARY);
    }, []);

    // Update settings
    const updateSettings = useCallback((newSettings) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            storage.save(storage.keys.SETTINGS, updated);
            return updated;
        });
    }, []);

    const value = useMemo(() => ({
        favorites,
        toggleFavorite,
        isFavorite,
        itinerary,
        updateItinerary,
        clearItinerary,
        settings,
        updateSettings,
        isHydrated,
        t,
    }), [favorites, toggleFavorite, isFavorite, itinerary, updateItinerary, clearItinerary, settings, updateSettings, isHydrated, t]);


    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};

export default UserContext;
