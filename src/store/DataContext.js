import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { places as localPlaces } from '../constants/placesData';
import { expandedPlaces } from '../constants/expandedData';
import { HOTELS as localHotels } from '../constants/hotelsData';
import { RESTAURANTS } from '../constants/diningData';
import { NUWEIBA_TABA_DATA } from '../constants/newCitiesData';
import {
    getAdminPlaces,
    getAdminHotels,
    getAdminTrips,
    getAdminRestaurants,
    addAdminPlace,
    addAdminHotel,
    addAdminTrip,
    addAdminRestaurant,
    editAdminPlace,
    editAdminHotel,
    editAdminTrip,
    editAdminRestaurant,
    removeAdminPlace,
    removeAdminHotel,
    removeAdminTrip,
    removeAdminRestaurant,
    exportAllAdminData,
    importAdminData,
    clearAllAdminData,
    getOverrides,
    saveOverride
} from '../utils/adminDataManager';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const { showToast } = useSettings();

    // ── Core data: local constants merged with admin additions ──
    const [adminPlaces, setAdminPlaces] = useState([]);
    const [adminHotels, setAdminHotels] = useState([]);
    const [adminTrips, setAdminTrips] = useState([]);
    const [adminRestaurants, setAdminRestaurants] = useState([]);
    const [overrides, setOverrides] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Merged views exposed to screens
    const places = useMemo(() => {
        const basePlaces = [...localPlaces, ...NUWEIBA_TABA_DATA, ...expandedPlaces];
        // Deduplicate by ID — first occurrence wins
        const seenIds = new Set();
        const uniqueBase = basePlaces.filter(p => {
            if (seenIds.has(p.id)) return false;
            seenIds.add(p.id);
            return true;
        });
        const base = uniqueBase.map(p => {
            const override = overrides.find(o => o.id === p.id);
            return override ? { ...p, ...override } : p;
        });
        // Admin places also deduplicated against base
        const adminUnique = adminPlaces.filter(p => !seenIds.has(p.id));
        return [...base, ...adminUnique];
    }, [adminPlaces, overrides]);

    const hotels = useMemo(() => {
        const base = localHotels.map(h => {
            const override = overrides.find(o => o.id === h.id);
            return override ? { ...h, ...override } : h;
        });
        return [...base, ...adminHotels];
    }, [adminHotels, overrides]);

    const restaurants = useMemo(() => {
        return [...RESTAURANTS, ...adminRestaurants];
    }, [adminRestaurants]);

    // ── Load admin data on mount ─────────────────────────────────
    useEffect(() => {
        const loadAdminData = async () => {
            try {
                const [aPlaces, aHotels, aTrips, aRestaurants, aOverrides] = await Promise.all([
                    getAdminPlaces(),
                    getAdminHotels(),
                    getAdminTrips(),
                    getAdminRestaurants(),
                    getOverrides(),
                ]);
                setAdminPlaces(aPlaces);
                setAdminHotels(aHotels);
                setAdminTrips(aTrips);
                setAdminRestaurants(aRestaurants);
                setOverrides(aOverrides || []);
            } catch (error) {
                console.warn('Admin data load failed:', error);
            }
        };
        loadAdminData();
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
            if (localPlaces.some(p => p.id === id)) {
                const saved = await saveOverride(id, updates);
                setOverrides(prev => {
                    const idx = prev.findIndex(o => o.id === id);
                    if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = saved;
                        return next;
                    }
                    return [...prev, saved];
                });
                showToast('Built-in Place updated!', 'success');
                return { ok: true };
            } else {
                const saved = await editAdminPlace(id, updates);
                setAdminPlaces(prev => prev.map(p => p.id === id ? saved : p));
                showToast('Place updated!', 'success');
                return { ok: true };
            }
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
            if (localHotels.some(h => h.id === id)) {
                const saved = await saveOverride(id, updates);
                setOverrides(prev => {
                    const idx = prev.findIndex(o => o.id === id);
                    if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = saved;
                        return next;
                    }
                    return [...prev, saved];
                });
                showToast('Built-in Hotel updated!', 'success');
                return { ok: true };
            } else {
                const saved = await editAdminHotel(id, updates);
                setAdminHotels(prev => prev.map(h => h.id === id ? saved : h));
                showToast('Hotel updated!', 'success');
                return { ok: true };
            }
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

    // ── Admin: Restaurants ────────────────────────────────────────
    const adminAddRestaurant = useCallback(async (rest) => {
        setIsLoading(true);
        try {
            const saved = await addAdminRestaurant(rest);
            setAdminRestaurants(prev => [...prev, saved]);
            showToast('Restaurant added successfully!', 'success');
            return { ok: true };
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
            return { ok: false, error: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const adminEditRestaurant = useCallback(async (id, updates) => {
        setIsLoading(true);
        try {
            const saved = await editAdminRestaurant(id, updates);
            setAdminRestaurants(prev => prev.map(r => r.id === id ? saved : r));
            showToast('Restaurant updated!', 'success');
            return { ok: true };
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
            return { ok: false, error: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const adminRemoveRestaurant = useCallback(async (id) => {
        try {
            await removeAdminRestaurant(id);
            setAdminRestaurants(prev => prev.filter(r => r.id !== id));
            showToast('Restaurant removed.', 'success');
        } catch (e) {
            showToast(e.message, 'error', 'alert-circle');
        }
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
        const aRestaurants = await getAdminRestaurants();
        setAdminRestaurants(aRestaurants);
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
        setAdminRestaurants([]);
        showToast('All admin data cleared.', 'success');
    }, [showToast]);

    // ── Context value ─────────────────────────────────────────────
    const value = useMemo(() => ({
        // Data
        places,
        hotels,
        restaurants,
        adminTrips,
        isLoading,
        // Admin CRUD
        adminAddPlace, adminEditPlace, adminRemovePlace,
        adminAddHotel, adminEditHotel, adminRemoveHotel,
        adminAddTrip,  adminEditTrip,  adminRemoveTrip,
        adminAddRestaurant, adminEditRestaurant, adminRemoveRestaurant,
        adminExport, adminImport, adminClearAll,
        // Raw admin lists (for AdminPanel display)
        adminPlaces, adminHotels, adminRestaurants,
    }), [
        places, hotels, restaurants, adminTrips, isLoading,
        adminAddPlace, adminEditPlace, adminRemovePlace,
        adminAddHotel, adminEditHotel, adminRemoveHotel,
        adminAddTrip,  adminEditTrip,  adminRemoveTrip,
        adminAddRestaurant, adminEditRestaurant, adminRemoveRestaurant,
        adminExport, adminImport, adminClearAll,
        adminPlaces, adminHotels, adminRestaurants,
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};

export default DataContext;
