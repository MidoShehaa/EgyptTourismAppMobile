/**
 * ============================================================
 *  ADMIN DATA MANAGER (FIREBASE FIRESTORE VERSION)
 *  CRUD operations for admin-created content.
 *  All data is stored in Firestore collections.
 *  At startup, UserContext merges this with local constants.
 * ============================================================
 */
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    PLACES:      'admin_places',
    HOTELS:      'admin_hotels',
    TRIPS:       'admin_trips',
    RESTAURANTS: 'admin_restaurants',
    OVERRIDES:   'admin_overrides',
};

const CACHE_PREFIX = '@admin_cache_';

// ─── Generic helpers ─────────────────────────────────────────

async function loadList(collectionName) {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const list = [];
        querySnapshot.forEach((doc) => {
            list.push(doc.data());
        });
        // Cache for offline use
        try { await AsyncStorage.setItem(CACHE_PREFIX + collectionName, JSON.stringify(list)); } catch {}
        return list;
    } catch (e) {
        console.warn(`Firestore load failed for ${collectionName}, using cache:`, e);
        // Fallback to cached data
        try {
            const cached = await AsyncStorage.getItem(CACHE_PREFIX + collectionName);
            return cached ? JSON.parse(cached) : [];
        } catch { return []; }
    }
}

function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/<[^>]*>?/gm, '');
}

function sanitizeData(data) {
    if (Array.isArray(data)) return data.map(sanitizeData);
    if (data !== null && typeof data === 'object') {
        const clean = {};
        for (const [key, value] of Object.entries(data)) {
            clean[key] = sanitizeData(value);
        }
        return clean;
    }
    return sanitizeString(data);
}

async function uploadImageAsync(uri) {
    if (!uri || uri.startsWith('http')) return uri;

    try {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function() { resolve(xhr.response); };
            xhr.onerror = function(e) { reject(new TypeError("Network request failed")); };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        const filename = `admin_uploads/${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
        
        // Close the blob if possible to release memory
        if (blob.close) { blob.close(); }
        
        return await getDownloadURL(storageRef);
    } catch (e) {
        console.error("Image upload failed: ", e);
        throw new Error("Failed to upload image to Firebase Storage.");
    }
}

async function saveItem(collectionName, id, item) {
    let finalItem = { ...item };
    
    if (finalItem.imageUrl && (finalItem.imageUrl.startsWith('file://') || finalItem.imageUrl.startsWith('content://'))) {
        finalItem.imageUrl = await uploadImageAsync(finalItem.imageUrl);
    }
    if (finalItem.image && (finalItem.image.startsWith('file://') || finalItem.image.startsWith('content://'))) {
        finalItem.image = await uploadImageAsync(finalItem.image);
    }
    
    await setDoc(doc(db, String(collectionName), String(id)), sanitizeData(finalItem));
}

async function removeItem(collectionName, id) {
    await deleteDoc(doc(db, collectionName, id));
}

// ─── OVERRIDES (Built-in data modifications) ─────────────────

export async function getOverrides() {
    return loadList(KEYS.OVERRIDES);
}

export async function saveOverride(id, updates) {
    const list = await getOverrides();
    const existing = list.find(o => o.id === id) || {};
    const entry = { ...existing, id, ...updates, _overrideAt: Date.now() };
    await saveItem(KEYS.OVERRIDES, id, entry);
    return entry;
}

// ─── PLACES ─────────────────────────────────────────────────

export async function getAdminPlaces() {
    return loadList(KEYS.PLACES);
}

export async function addAdminPlace(place) {
    const list = await getAdminPlaces();
    if (list.find(p => p.id === place.id)) {
        throw new Error(`A place with id ${place.id} already exists.`);
    }
    const enriched = { ...place, _adminAdded: true, _createdAt: Date.now() };
    await saveItem(KEYS.PLACES, place.id, enriched);
    return enriched;
}

export async function editAdminPlace(id, updates) {
    const list = await getAdminPlaces();
    const existing = list.find(p => p.id === id);
    if (!existing) throw new Error(`Place id ${id} not found in admin data.`);
    const updated = { ...existing, ...updates, _updatedAt: Date.now() };
    await saveItem(KEYS.PLACES, id, updated);
    return updated;
}

export async function removeAdminPlace(id) {
    await removeItem(KEYS.PLACES, id);
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
    await saveItem(KEYS.HOTELS, hotel.id, enriched);
    return enriched;
}

export async function editAdminHotel(id, updates) {
    const list = await getAdminHotels();
    const existing = list.find(h => h.id === id);
    if (!existing) throw new Error(`Hotel id ${id} not found in admin data.`);
    const updated = { ...existing, ...updates, _updatedAt: Date.now() };
    await saveItem(KEYS.HOTELS, id, updated);
    return updated;
}

export async function removeAdminHotel(id) {
    await removeItem(KEYS.HOTELS, id);
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
    await saveItem(KEYS.TRIPS, trip.id, enriched);
    return enriched;
}

export async function editAdminTrip(id, updates) {
    const list = await getAdminTrips();
    const existing = list.find(t => t.id === id);
    if (!existing) throw new Error(`Trip id "${id}" not found in admin data.`);
    const updated = { ...existing, ...updates, _updatedAt: Date.now() };
    await saveItem(KEYS.TRIPS, id, updated);
    return updated;
}

export async function removeAdminTrip(id) {
    await removeItem(KEYS.TRIPS, id);
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
    await saveItem(KEYS.RESTAURANTS, rest.id, enriched);
    return enriched;
}

export async function editAdminRestaurant(id, updates) {
    const list = await getAdminRestaurants();
    const existing = list.find(r => r.id === id);
    if (!existing) throw new Error(`Restaurant id ${id} not found.`);
    const updated = { ...existing, ...updates, _updatedAt: Date.now() };
    await saveItem(KEYS.RESTAURANTS, id, updated);
    return updated;
}

export async function removeAdminRestaurant(id) {
    await removeItem(KEYS.RESTAURANTS, id);
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
    // In Firestore, deleting entire collections requires deleting docs one by one from client
    // Here we'll just fetch all and delete
    const [places, hotels, trips, rests, overrides] = await Promise.all([
        getAdminPlaces(), getAdminHotels(), getAdminTrips(), getAdminRestaurants(), getOverrides()
    ]);
    
    await Promise.all([
        ...places.map(p => removeItem(KEYS.PLACES, p.id)),
        ...hotels.map(h => removeItem(KEYS.HOTELS, h.id)),
        ...trips.map(t => removeItem(KEYS.TRIPS, t.id)),
        ...rests.map(r => removeItem(KEYS.RESTAURANTS, r.id)),
        ...overrides.map(o => removeItem(KEYS.OVERRIDES, o.id)),
    ]);
}
