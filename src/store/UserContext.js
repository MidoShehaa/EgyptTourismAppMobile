import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import storage from '../utils/storage';
import { TRANSLATIONS } from '../constants/translations';
import { places as localPlaces } from '../constants/placesData';
import { HOTELS as localHotels } from '../constants/hotelsData';
import {
    getAdminPlaces,
    getAdminHotels,
    getAdminTrips,
    addAdminPlace,
    addAdminHotel,
    addAdminTrip,
    editAdminPlace,
    editAdminHotel,
    editAdminTrip,
    removeAdminPlace,
    removeAdminHotel,
    removeAdminTrip,
    exportAllAdminData,
    importAdminData,
    clearAllAdminData,
} from '../utils/adminDataManager';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [itinerary, setItinerary] = useState(null);
    const [settings, setSettings] = useState({ language: 'en' });
    const [isHydrated, setIsHydrated] = useState(false);

    // ── Core data: local constants merged with admin additions ──
    const [adminPlaces, setAdminPlaces] = useState([]);
    const [adminHotels, setAdminHotels] = useState([]);
    const [adminTrips, setAdminTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Merged views exposed to screens
    const places = useMemo(() => [...localPlaces, ...adminPlaces], [adminPlaces]);
    const hotels = useMemo(() => [...localHotels, ...adminHotels], [adminHotels]);

    // ── Toast ────────────────────────────────────────────────────
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success', icon: 'checkmark-circle' });
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(-50)).current;

    const showToast = useCallback((message, type = 'success', icon = 'checkmark-circle') => {
        setToast({ visible: true, message, type, icon });
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(translateYAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(translateYAnim, { toValue: -50, duration: 400, useNativeDriver: true }),
            ]).start(() => setToast(prev => ({ ...prev, visible: false })));
        }, 3000);
    }, [fadeAnim, translateYAnim]);

    // ── Translation Helper ───────────────────────────────────────
    const t = useCallback((key, params = {}) => {
        const lang = settings.language || 'en';
        const keys = key.split('.');
        let value = TRANSLATIONS[lang];
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }
        if (typeof value !== 'string') return key;
        Object.keys(params).forEach(p => {
            value = value.replace(new RegExp(`{{${p}}}`, 'g'), params[p]);
        });
        return value;
    }, [settings.language]);

    // ── Load everything on mount ─────────────────────────────────
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [savedFavorites, savedItinerary, savedSettings, aPlaces, aHotels, aTrips] =
                    await Promise.all([
                        storage.load(storage.keys.FAVORITES),
                        storage.load(storage.keys.ITINERARY),
                        storage.load(storage.keys.SETTINGS),
                        getAdminPlaces(),
                        getAdminHotels(),
                        getAdminTrips(),
                    ]);

                if (savedFavorites) setFavorites(savedFavorites);
                if (savedItinerary) setItinerary(savedItinerary);
                if (savedSettings)  setSettings(savedSettings);
                setAdminPlaces(aPlaces);
                setAdminHotels(aHotels);
                setAdminTrips(aTrips);
            } catch (error) {
                console.warn('Data load failed, using defaults:', error);
            } finally {
                setIsHydrated(true);
            }
        };
        loadInitialData();
    }, []);

    // ── Persist favorites ────────────────────────────────────────
    useEffect(() => {
        if (isHydrated) storage.save(storage.keys.FAVORITES, favorites);
    }, [favorites, isHydrated]);

    // ── Favorites ────────────────────────────────────────────────
    const toggleFavorite = useCallback((placeId) => {
        setFavorites(prev =>
            prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId]
        );
    }, []);

    const isFavorite = useCallback((placeId) => favorites.includes(placeId), [favorites]);

    // ── Itinerary ────────────────────────────────────────────────
    const updateItinerary = useCallback((newItinerary) => {
        setItinerary(newItinerary);
        storage.save(storage.keys.ITINERARY, newItinerary);
    }, []);

    const addActivityToPlanner = useCallback((dayNumber, activityData) => {
        setItinerary(prev => {
            const current = prev || { name: 'My Trip to Egypt', days: [] };
            const newDays = [...current.days];
            while (newDays.length < dayNumber) newDays.push({ activities: [] });
            newDays[dayNumber - 1] = {
                ...newDays[dayNumber - 1],
                activities: [...(newDays[dayNumber - 1].activities || []), activityData],
            };
            const updated = { ...current, days: newDays };
            storage.save(storage.keys.ITINERARY, updated);
            return updated;
        });
    }, []);

    const removeActivityFromPlanner = useCallback((dayNumber, placeId) => {
        setItinerary(prev => {
            if (!prev?.days?.[dayNumber - 1]) return prev;
            const newDays = [...prev.days];
            const activities = newDays[dayNumber - 1].activities || [];
            const idx = activities.findIndex(a => a.placeId === placeId);
            if (idx === -1) return prev;
            const newActivities = [...activities];
            newActivities.splice(idx, 1);
            newDays[dayNumber - 1] = { ...newDays[dayNumber - 1], activities: newActivities };
            const updated = { ...prev, days: newDays };
            storage.save(storage.keys.ITINERARY, updated);
            return updated;
        });
    }, []);

    const clearItinerary = useCallback(() => {
        setItinerary(null);
        storage.remove(storage.keys.ITINERARY);
    }, []);

    // ── Settings ─────────────────────────────────────────────────
    const updateSettings = useCallback((newSettings) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            storage.save(storage.keys.SETTINGS, updated);
            return updated;
        });
    }, []);

    // ── Admin: Places ─────────────────────────────────────────────
    const adminAddPlace = useCallback(async (place) => {
        setIsLoading(true);
        try {
            const saved = await addAdminPlace(place);
            setAdminPlaces(prev => [...prev, saved]);
            showToast('Place added successfully!', 'success');
            return { ok: true };
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
            return { ok: false, error: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const adminEditPlace = useCallback(async (id, updates) => {
        setIsLoading(true);
        try {
            const saved = await editAdminPlace(id, updates);
            setAdminPlaces(prev => prev.map(p => p.id === id ? saved : p));
            showToast('Place updated!', 'success');
            return { ok: true };
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
            return { ok: false, error: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const adminRemovePlace = useCallback(async (id) => {
        await removeAdminPlace(id);
        setAdminPlaces(prev => prev.filter(p => p.id !== id));
        showToast('Place removed.', 'success');
    }, [showToast]);

    // ── Admin: Hotels ─────────────────────────────────────────────
    const adminAddHotel = useCallback(async (hotel) => {
        setIsLoading(true);
        try {
            const saved = await addAdminHotel(hotel);
            setAdminHotels(prev => [...prev, saved]);
            showToast('Hotel added successfully!', 'success');
            return { ok: true };
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
            return { ok: false, error: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const adminEditHotel = useCallback(async (id, updates) => {
        setIsLoading(true);
        try {
            const saved = await editAdminHotel(id, updates);
            setAdminHotels(prev => prev.map(h => h.id === id ? saved : h));
            showToast('Hotel updated!', 'success');
            return { ok: true };
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
            return { ok: false, error: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const adminRemoveHotel = useCallback(async (id) => {
        await removeAdminHotel(id);
        setAdminHotels(prev => prev.filter(h => h.id !== id));
        showToast('Hotel removed.', 'success');
    }, [showToast]);

    // ── Admin: Trips ──────────────────────────────────────────────
    const adminAddTrip = useCallback(async (trip) => {
        setIsLoading(true);
        try {
            const saved = await addAdminTrip(trip);
            setAdminTrips(prev => [...prev, saved]);
            showToast('Trip added successfully!', 'success');
            return { ok: true };
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
            return { ok: false, error: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const adminEditTrip = useCallback(async (id, updates) => {
        setIsLoading(true);
        try {
            const saved = await editAdminTrip(id, updates);
            setAdminTrips(prev => prev.map(t => t.id === id ? saved : t));
            showToast('Trip updated!', 'success');
            return { ok: true };
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
            return { ok: false, error: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const adminRemoveTrip = useCallback(async (id) => {
        await removeAdminTrip(id);
        setAdminTrips(prev => prev.filter(t => t.id !== id));
        showToast('Trip removed.', 'success');
    }, [showToast]);

    // ── Admin: Export / Import ────────────────────────────────────
    const adminExport = useCallback(() => exportAllAdminData(), []);

    const adminImport = useCallback(async (jsonData) => {
        const results = await importAdminData(jsonData);
        const [aPlaces, aHotels, aTrips] = await Promise.all([
            getAdminPlaces(), getAdminHotels(), getAdminTrips(),
        ]);
        setAdminPlaces(aPlaces);
        setAdminHotels(aHotels);
        setAdminTrips(aTrips);
        showToast(
            `Imported: ${results.places} places, ${results.hotels} hotels, ${results.trips} trips`,
            results.errors.length ? 'error' : 'success',
        );
        return results;
    }, [showToast]);

    const adminClearAll = useCallback(async () => {
        await clearAllAdminData();
        setAdminPlaces([]);
        setAdminHotels([]);
        setAdminTrips([]);
        showToast('All admin data cleared.', 'success');
    }, [showToast]);

    // ── Context value ─────────────────────────────────────────────
    const value = useMemo(() => ({
        // Data
        places,
        hotels,
        adminTrips,
        isLoading,
        // User
        favorites, toggleFavorite, isFavorite,
        itinerary, updateItinerary, addActivityToPlanner, removeActivityFromPlanner, clearItinerary,
        settings, updateSettings, isHydrated,
        t, showToast,
        // Admin CRUD
        adminAddPlace, adminEditPlace, adminRemovePlace,
        adminAddHotel, adminEditHotel, adminRemoveHotel,
        adminAddTrip,  adminEditTrip,  adminRemoveTrip,
        adminExport, adminImport, adminClearAll,
        // Raw admin lists (for AdminPanel display)
        adminPlaces, adminHotels,
    }), [
        places, hotels, adminTrips, isLoading,
        favorites, toggleFavorite, isFavorite,
        itinerary, updateItinerary, addActivityToPlanner, removeActivityFromPlanner, clearItinerary,
        settings, updateSettings, isHydrated, t, showToast,
        adminAddPlace, adminEditPlace, adminRemovePlace,
        adminAddHotel, adminEditHotel, adminRemoveHotel,
        adminAddTrip,  adminEditTrip,  adminRemoveTrip,
        adminExport, adminImport, adminClearAll,
        adminPlaces, adminHotels,
    ]);

    const C = settings?.darkMode ? DARK_COLORS : COLORS;

    return (
        <UserContext.Provider value={value}>
            {children}
            {toast.visible && (
                <SafeAreaView style={styles.toastSafeArea} pointerEvents="none">
                    <Animated.View style={[
                        styles.toastContainer,
                        { backgroundColor: C.bgCard, borderColor: C.borderSubtle },
                        { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
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
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 9999, alignItems: 'center',
    },
    toastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        borderRadius: 24,
        backgroundColor: 'rgba(18, 18, 18, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        width: '90%',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    toastText: { 
        flex: 1, 
        fontSize: 15, 
        fontWeight: '700',
        color: '#FFFFFF',
    },

});

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};

export default UserContext;
