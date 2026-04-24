import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import storage from '../utils/storage';
import { TRANSLATIONS } from '../constants/translations';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [itinerary, setItinerary] = useState(null);
    const [settings, setSettings] = useState({ language: 'en' });
    const [isHydrated, setIsHydrated] = useState(false);
    
    // Toast State
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success', icon: 'checkmark-circle' });
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(-50)).current;

    const showToast = useCallback((message, type = 'success', icon = 'checkmark-circle') => {
        setToast({ visible: true, message, type, icon });
        
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(translateYAnim, { toValue: 0, duration: 400, useNativeDriver: true })
        ]).start();

        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(translateYAnim, { toValue: -50, duration: 400, useNativeDriver: true })
            ]).start(() => {
                setToast(prev => ({ ...prev, visible: false }));
            });
        }, 3000);
    }, [fadeAnim, translateYAnim]);

    // Enhanced Translation Helper
    const t = useCallback((key, params = {}) => {
        const lang = settings.language || 'en';
        const keys = key.split('.');
        let value = TRANSLATIONS[lang];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        if (typeof value !== 'string') return key;

        // Simple placeholder replacement: {{name}}
        Object.keys(params).forEach(p => {
            value = value.replace(new RegExp(`{{${p}}}`, 'g'), params[p]);
        });

        return value;
    }, [settings.language]);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [savedFavorites, savedItinerary, savedSettings] = await Promise.all([
                    storage.load(storage.keys.FAVORITES),
                    storage.load(storage.keys.ITINERARY),
                    storage.load(storage.keys.SETTINGS),
                ]);

                if (savedFavorites) setFavorites(savedFavorites);
                if (savedItinerary) setItinerary(savedItinerary);
                if (savedSettings) setSettings(savedSettings);
            } catch (error) {
                console.error('Failed to hydrate user data:', error);
            } finally {
                setIsHydrated(true);
            }
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

    // Update itinerary deeply
    const updateItinerary = useCallback((newItinerary) => {
        setItinerary(newItinerary);
        storage.save(storage.keys.ITINERARY, newItinerary);
    }, []);

    // Add activity to planner
    const addActivityToPlanner = useCallback((dayNumber, activityData) => {
        setItinerary(prev => {
            const currentItinerary = prev || { name: 'My Trip to Egypt', days: [] };

            // Ensure days array has enough days
            const newDays = [...currentItinerary.days];
            while (newDays.length < dayNumber) {
                newDays.push({ activities: [] });
            }

            // Add activity to the specified day
            newDays[dayNumber - 1] = {
                ...newDays[dayNumber - 1],
                activities: [...(newDays[dayNumber - 1].activities || []), activityData]
            };

            const updatedItinerary = { ...currentItinerary, days: newDays };
            storage.save(storage.keys.ITINERARY, updatedItinerary);
            return updatedItinerary;
        });
    }, []);

    // Remove activity from planner
    const removeActivityFromPlanner = useCallback((dayNumber, placeId) => {
        setItinerary(prev => {
            if (!prev || !prev.days || !prev.days[dayNumber - 1]) return prev;

            const newDays = [...prev.days];
            const activities = newDays[dayNumber - 1].activities || [];
            // Find the FIRST occurrence only, to avoid removing duplicates
            const indexToRemove = activities.findIndex(a => a.placeId === placeId);
            if (indexToRemove === -1) return prev;

            const newActivities = [...activities];
            newActivities.splice(indexToRemove, 1);

            newDays[dayNumber - 1] = {
                ...newDays[dayNumber - 1],
                activities: newActivities
            };

            const updatedItinerary = { ...prev, days: newDays };
            storage.save(storage.keys.ITINERARY, updatedItinerary);
            return updatedItinerary;
        });
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
        addActivityToPlanner,
        removeActivityFromPlanner,
        clearItinerary,
        settings,
        updateSettings,
        isHydrated,
        t,
        showToast,
    }), [favorites, toggleFavorite, isFavorite, itinerary, updateItinerary, addActivityToPlanner, removeActivityFromPlanner, clearItinerary, settings, updateSettings, isHydrated, t, showToast]);


    const C = settings?.darkMode ? DARK_COLORS : COLORS;

    return (
        <UserContext.Provider value={value}>
            {children}
            {toast.visible && (
                <SafeAreaView style={styles.toastSafeArea} pointerEvents="none">
                    <Animated.View style={[
                        styles.toastContainer, 
                        { backgroundColor: C.bgCard, borderColor: C.borderSubtle },
                        { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }
                    ]}>
                        <View style={[styles.iconBox, { backgroundColor: toast.type === 'success' ? '#10B98120' : '#EF444420' }]}>
                            <Ionicons name={toast.icon} size={24} color={toast.type === 'success' ? '#10B981' : '#EF4444'} />
                        </View>
                        <Text style={[styles.toastText, { color: C.textMain }]} numberOfLines={2}>
                            {toast.message}
                        </Text>
                    </Animated.View>
                </SafeAreaView>
            )}
        </UserContext.Provider>
    );
};

const styles = StyleSheet.create({
    toastSafeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
    },
    toastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 10,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        width: '90%',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    toastText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    }
});

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};

export default UserContext;
