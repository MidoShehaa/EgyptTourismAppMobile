import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import storage from '../utils/storage';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const PlannerContext = createContext(null);

export const PlannerProvider = ({ children }) => {
    const { isHydrated } = useSettings();
    const { user } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [itinerary, setItinerary] = useState(null);
    const syncTimerRef = useRef(null);

    // ── Load on mount / auth change ─────────────────────────────
    useEffect(() => {
        const loadPlannerData = async () => {
            try {
                if (user) {
                    // Load from Firestore
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.favorites) setFavorites(data.favorites);
                        if (data.itinerary) setItinerary(data.itinerary);
                        return;
                    }
                }
                
                // Fallback to local
                const [savedFavorites, savedItinerary] = await Promise.all([
                    storage.load(storage.keys.FAVORITES),
                    storage.load(storage.keys.ITINERARY),
                ]);
                if (savedFavorites) setFavorites(savedFavorites);
                if (savedItinerary) setItinerary(savedItinerary);
            } catch (error) {
                console.warn('Planner data load failed:', error);
            }
        };
        loadPlannerData();
    }, [user]);

    // ── Sync to Cloud (debounced) ───────────────────────────────
    const syncToCloud = useCallback(async (newFavorites, newItinerary) => {
        if (!user) return;
        try {
            await setDoc(doc(db, 'users', user.uid), {
                favorites: newFavorites,
                itinerary: newItinerary
            }, { merge: true });
        } catch (error) {
            console.warn('Failed to sync to cloud:', error);
        }
    }, [user]);

    // ── Persist favorites (local immediately, cloud debounced) ───
    useEffect(() => {
        if (isHydrated) {
            // Save locally immediately
            storage.save(storage.keys.FAVORITES, favorites);
            // Debounce cloud sync (2 seconds)
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
            syncTimerRef.current = setTimeout(() => {
                syncToCloud(favorites, itinerary);
            }, 2000);
        }
        return () => {
            if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        };
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
        syncToCloud(favorites, newItinerary);
    }, [favorites, syncToCloud]);

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
            syncToCloud(favorites, updated);
            return updated;
        });
    }, [favorites, syncToCloud]);

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
            syncToCloud(favorites, updated);
            return updated;
        });
    }, [favorites, syncToCloud]);

    const clearItinerary = useCallback(() => {
        setItinerary(null);
        storage.remove(storage.keys.ITINERARY);
        syncToCloud(favorites, null);
    }, [favorites, syncToCloud]);

    // ── Context value ─────────────────────────────────────────────
    const value = useMemo(() => ({
        favorites,
        toggleFavorite,
        isFavorite,
        itinerary,
        updateItinerary,
        addActivityToPlanner,
        removeActivityFromPlanner,
        clearItinerary,
    }), [
        favorites, toggleFavorite, isFavorite,
        itinerary, updateItinerary, addActivityToPlanner, removeActivityFromPlanner, clearItinerary,
    ]);

    return (
        <PlannerContext.Provider value={value}>
            {children}
        </PlannerContext.Provider>
    );
};

export const usePlanner = () => {
    const context = useContext(PlannerContext);
    if (!context) throw new Error('usePlanner must be used within PlannerProvider');
    return context;
};

export default PlannerContext;
