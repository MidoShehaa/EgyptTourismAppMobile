/**
 * ============================================================
 *  ADMIN DATA MANAGER
 *  CRUD operations for admin-created content.
 *  All data is stored in AsyncStorage under 'admin_*' keys.
 *  At startup, UserContext merges this with local constants.
 * ============================================================
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    PLACES:      '@egypt_admin_places',
    HOTELS:      '@egypt_admin_hotels',
    TRIPS:       '@egypt_admin_trips',
    RESTAURANTS: '@egypt_admin_restaurants',
};

// ─── Generic helpers ─────────────────────────────────────────

async function loadList(key) {
    try {
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

async function saveList(key, list) {
    await AsyncStorage.setItem(key, JSON.stringify(list));
}

// ─── PLACES ─────────────────────────────────────────────────

export async function getAdminPlaces() {
    return loadList(KEYS.PLACES);
}

export async function addAdminPlace(place) {
    const list = await getAdminPlaces();
    // Guard against duplicate ids
    if (list.find(p => p.id === place.id)) {
        throw new Error(`A place with id ${place.id} already exists.`);
    }
    const enriched = { ...place, _adminAdded: true, _createdAt: Date.now() };
    await saveList(KEYS.PLACES, [...list, enriched]);
    return enriched;
}

export async function editAdminPlace(id, updates) {
    const list = await getAdminPlaces();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error(`Place id ${id} not found in admin data.`);
    list[idx] = { ...list[idx], ...updates, _updatedAt: Date.now() };
    await saveList(KEYS.PLACES, list);
    return list[idx];
}

export async function removeAdminPlace(id) {
    const list = await getAdminPlaces();
    await saveList(KEYS.PLACES, list.filter(p => p.id !== id));
}

// ─── HOTELS ─────────────────────────────────────────────────

export async function getAdminHotels() {
    return loadList(KEYS.HOTELS);
}

export async function addAdminHotel(hotel) {
    const list = await getAdminHotels();
    if (list.find(h => h.id === hotel.id)) {
        throw new Error(`A hotel with id ${hotel.id} already exists.`);
    }
    const enriched = { ...hotel, _adminAdded: true, _createdAt: Date.now() };
    await saveList(KEYS.HOTELS, [...list, enriched]);
    return enriched;
}

export async function editAdminHotel(id, updates) {
    const list = await getAdminHotels();
    const idx = list.findIndex(h => h.id === id);
    if (idx === -1) throw new Error(`Hotel id ${id} not found in admin data.`);
    list[idx] = { ...list[idx], ...updates, _updatedAt: Date.now() };
    await saveList(KEYS.HOTELS, list);
    return list[idx];
}

export async function removeAdminHotel(id) {
    const list = await getAdminHotels();
    await saveList(KEYS.HOTELS, list.filter(h => h.id !== id));
}

// ─── FIXED TRIPS ─────────────────────────────────────────────

export async function getAdminTrips() {
    return loadList(KEYS.TRIPS);
}

export async function addAdminTrip(trip) {
    const list = await getAdminTrips();
    if (list.find(t => t.id === trip.id)) {
        throw new Error(`A trip with id "${trip.id}" already exists.`);
    }
    const enriched = { ...trip, _adminAdded: true, _createdAt: Date.now() };
    await saveList(KEYS.TRIPS, [...list, enriched]);
    return enriched;
}

export async function editAdminTrip(id, updates) {
    const list = await getAdminTrips();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Trip id "${id}" not found in admin data.`);
    list[idx] = { ...list[idx], ...updates, _updatedAt: Date.now() };
    await saveList(KEYS.TRIPS, list);
    return list[idx];
}

export async function removeAdminTrip(id) {
    const list = await getAdminTrips();
    await saveList(KEYS.TRIPS, list.filter(t => t.id !== id));
}

// ─── RESTAURANTS ─────────────────────────────────────────────

export async function getAdminRestaurants() {
    return loadList(KEYS.RESTAURANTS);
}

export async function addAdminRestaurant(rest) {
    const list = await getAdminRestaurants();
    if (list.find(r => r.id === rest.id)) {
        throw new Error(`A restaurant with id ${rest.id} already exists.`);
    }
    const enriched = { ...rest, _adminAdded: true, _createdAt: Date.now() };
    await saveList(KEYS.RESTAURANTS, [...list, enriched]);
    return enriched;
}

export async function editAdminRestaurant(id, updates) {
    const list = await getAdminRestaurants();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`Restaurant id ${id} not found.`);
    list[idx] = { ...list[idx], ...updates, _updatedAt: Date.now() };
    await saveList(KEYS.RESTAURANTS, list);
    return list[idx];
}

export async function removeAdminRestaurant(id) {
    const list = await getAdminRestaurants();
    await saveList(KEYS.RESTAURANTS, list.filter(r => r.id !== id));
}

// ─── EXPORT ALL (for backup / import UI) ─────────────────────

export async function exportAllAdminData() {
    const [places, hotels, trips, restaurants] = await Promise.all([
        getAdminPlaces(),
        getAdminHotels(),
        getAdminTrips(),
        getAdminRestaurants(),
    ]);
    return {
        exportedAt: new Date().toISOString(),
        version: 1,
        places,
        hotels,
        trips,
        restaurants,
    };
}

export async function importAdminData(jsonData) {
    const results = { places: 0, hotels: 0, trips: 0, restaurants: 0, errors: [] };

    for (const place of (jsonData.places || [])) {
        try { await addAdminPlace(place); results.places++; }
        catch (e) { results.errors.push(e.message); }
    }
    for (const hotel of (jsonData.hotels || [])) {
        try { await addAdminHotel(hotel); results.hotels++; }
        catch (e) { results.errors.push(e.message); }
    }
    for (const trip of (jsonData.trips || [])) {
        try { await addAdminTrip(trip); results.trips++; }
        catch (e) { results.errors.push(e.message); }
    }
    for (const rest of (jsonData.restaurants || [])) {
        try { await addAdminRestaurant(rest); results.restaurants++; }
        catch (e) { results.errors.push(e.message); }
    }

    return results;
}

// ─── CLEAR ALL admin data (use carefully!) ───────────────────

export async function clearAllAdminData() {
    await Promise.all(Object.values(KEYS).map(k => AsyncStorage.removeItem(k)));
}
