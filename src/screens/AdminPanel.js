import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Modal, Alert, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FlashList } from '@shopify/flash-list';
import SafeImage from '../components/SafeImage';
import { useSettings } from '../store/SettingsContext';
import { useData } from '../store/DataContext';
import { COLORS, DARK_COLORS } from '../constants/theme';
import { validatePlace, validateHotel, validateTrip, validateRestaurant, PLACE_CATEGORIES, HOTEL_CATEGORIES } from '../constants/DATA_TEMPLATES';
import { FIXED_TRIPS } from '../constants/ridesData';

const TABS = ['Places', 'Hotels', 'Trips', 'Restaurants'];

// ── Field row ─────────────────────────────────────────────────
function Field({ label, value, onChangeText, keyboardType = 'default', multiline = false, placeholder }) {
    return (
        <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                style={[styles.fieldInput, multiline && { height: 80, textAlignVertical: 'top' }]}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                multiline={multiline}
                placeholder={placeholder || label}
                placeholderTextColor="#888"
            />
        </View>
    );
}

// ── Pill selector ──────────────────────────────────────────────
function PillSelect({ label, options, value, onChange }) {
    return (
        <View style={{ marginBottom: 12 }}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {options.map(opt => (
                    <TouchableOpacity
                        key={opt}
                        onPress={() => onChange(opt)}
                        style={[styles.pill, value === opt && styles.pillActive]}
                    >
                        <Text style={[styles.pillText, value === opt && styles.pillTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

// ── Item card (list row) ───────────────────────────────────────
function ItemCard({ title, subtitle, onEdit, onDelete, isBuiltIn, colors }) {
    return (
        <View style={[styles.itemCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.textMain }]} numberOfLines={1}>{title}</Text>
                <Text style={[styles.itemSub, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {isBuiltIn && <View style={[styles.builtInBadge, { backgroundColor: colors.bgCard }]}><Text style={styles.builtInText}>BUILT-IN</Text></View>}
                <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
                    <Ionicons name="pencil" size={16} color="#CC9933" />
                </TouchableOpacity>
                {!isBuiltIn && (
                    <TouchableOpacity onPress={onDelete} style={[styles.iconBtn, { borderColor: '#EF4444' }]}>
                        <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// ── Image Upload Field (Local URI — no Firebase Storage needed) ──
function ImageUploadField({ label, value, onChangeText }) {
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]) {
            onChangeText(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="https://... or pick image"
                    placeholderTextColor="#888"
                />
                <TouchableOpacity 
                    style={[styles.iconBtn, { width: 50, height: 46, backgroundColor: '#CC9933', borderColor: '#000' }]}
                    onPress={pickImage}
                >
                    <Ionicons name="image-outline" size={20} color="#000" />
                </TouchableOpacity>
            </View>
            {!!value && value.length > 5 && (
                <SafeImage uri={value} style={{ width: '100%', height: 120, borderRadius: 10, marginTop: 8 }} />
            )}
        </View>
    );
}

// ── Place form ─────────────────────────────────────────────────
function PlaceForm({ initial, onSave, onCancel }) {
    const empty = { id: '', name: '', nameEn: '', city: '', cityEn: '', category: 'Pharaonic', description: '', descriptionEn: '', image: '🏛️', imageUrl: '', rating: '4.5', duration: '2-3 hours', price: '400 EGP', highlights: '', tip: '', lat: '', lng: '' };
    const [f, setF] = useState(initial ? { ...initial, id: String(initial.id), rating: String(initial.rating), highlights: (initial.highlights || []).join(', '), lat: String(initial.lat), lng: String(initial.lng) } : empty);
    const set = (k) => (v) => setF(p => ({ ...p, [k]: v }));

    const submit = () => {
        const obj = { ...f, id: Number(f.id), rating: Number(f.rating), lat: Number(f.lat), lng: Number(f.lng), highlights: f.highlights.split(',').map(s => s.trim()).filter(Boolean) };
        const errs = validatePlace(obj);
        if (errs.length) { Alert.alert('Validation Errors', errs.join('\n')); return; }
        onSave(obj);
    };

    return (
        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            <Field label="ID (unique number)" value={f.id} onChangeText={set('id')} keyboardType="numeric" />
            <Field label="Name (Arabic)" value={f.name} onChangeText={set('name')} />
            <Field label="Name (English)" value={f.nameEn} onChangeText={set('nameEn')} />
            <Field label="City (Arabic)" value={f.city} onChangeText={set('city')} />
            <Field label="City (English)" value={f.cityEn} onChangeText={set('cityEn')} />
            <PillSelect label="Category" options={PLACE_CATEGORIES} value={f.category} onChange={set('category')} />
            <Field label="Description (Arabic)" value={f.description} onChangeText={set('description')} multiline />
            <Field label="Description (English)" value={f.descriptionEn} onChangeText={set('descriptionEn')} multiline />
            <Field label="Emoji Icon" value={f.image} onChangeText={set('image')} />
            <ImageUploadField label="Image URL / Local Image" value={f.imageUrl} onChangeText={set('imageUrl')} />
            <Field label="Rating (1.0 – 5.0)" value={f.rating} onChangeText={set('rating')} keyboardType="decimal-pad" />
            <Field label="Duration (e.g. 2-3 hours)" value={f.duration} onChangeText={set('duration')} />
            <Field label="Price (e.g. 400 EGP or Free)" value={f.price} onChangeText={set('price')} />
            <Field label="Highlights (comma-separated)" value={f.highlights} onChangeText={set('highlights')} placeholder="Temple, Lake, Museum" />
            <Field label="Tip for tourists" value={f.tip} onChangeText={set('tip')} multiline />
            <Field label="Latitude (from Google Maps)" value={f.lat} onChangeText={set('lat')} keyboardType="decimal-pad" />
            <Field label="Longitude (from Google Maps)" value={f.lng} onChangeText={set('lng')} keyboardType="decimal-pad" />
            <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={submit}><Text style={styles.saveBtnText}>✅ Save</Text></TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ── Hotel form ─────────────────────────────────────────────────
function HotelForm({ initial, onSave, onCancel }) {
    const empty = { id: '', name: '', city: '', category: 'mid-range', rating: '4.5', price: '', image: '', amenities: '' };
    const [f, setF] = useState(initial ? { ...initial, id: String(initial.id), rating: String(initial.rating), price: String(initial.price), amenities: (initial.amenities || []).join(', ') } : empty);
    const set = (k) => (v) => setF(p => ({ ...p, [k]: v }));

    const submit = () => {
        const obj = { ...f, id: Number(f.id), rating: Number(f.rating), price: Number(f.price), amenities: f.amenities.split(',').map(s => s.trim()).filter(Boolean) };
        const errs = validateHotel(obj);
        if (errs.length) { Alert.alert('Validation Errors', errs.join('\n')); return; }
        onSave(obj);
    };

    return (
        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            <Field label="ID (unique number)" value={f.id} onChangeText={set('id')} keyboardType="numeric" />
            <Field label="Hotel Name" value={f.name} onChangeText={set('name')} />
            <Field label="City (English)" value={f.city} onChangeText={set('city')} />
            <PillSelect label="Category" options={HOTEL_CATEGORIES} value={f.category} onChange={set('category')} />
            <Field label="Rating (1.0 – 5.0)" value={f.rating} onChangeText={set('rating')} keyboardType="decimal-pad" />
            <Field label="Price per night (EGP number)" value={f.price} onChangeText={set('price')} keyboardType="numeric" />
            <ImageUploadField label="Image URL / Local Image" value={f.image} onChangeText={set('image')} />
            <Field label="Amenities (comma-separated)" value={f.amenities} onChangeText={set('amenities')} placeholder="Pool, WiFi, Nile View" />
            <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={submit}><Text style={styles.saveBtnText}>✅ Save</Text></TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ── Trip form ──────────────────────────────────────────────────
function TripForm({ initial, onSave, onCancel }) {
    const empty = { id: '', nameEn: '', nameAr: '', from: '', to: '', durationHours: '', distanceKm: '', basePrice: '', stops: '', imageUrl: '', rating: '4.5', reviewCount: '50', category: 'Pharaonic' };
    const [f, setF] = useState(initial ? { ...initial, durationHours: String(initial.durationHours), distanceKm: String(initial.distanceKm), basePrice: String(initial.basePrice), stops: (initial.stops || []).join(', '), rating: String(initial.rating), reviewCount: String(initial.reviewCount) } : empty);
    const set = (k) => (v) => setF(p => ({ ...p, [k]: v }));

    const submit = () => {
        const obj = { ...f, durationHours: Number(f.durationHours), distanceKm: Number(f.distanceKm), basePrice: Number(f.basePrice), rating: Number(f.rating), reviewCount: Number(f.reviewCount), stops: f.stops.split(',').map(s => s.trim()).filter(Boolean) };
        const errs = validateTrip(obj);
        if (errs.length) { Alert.alert('Validation Errors', errs.join('\n')); return; }
        onSave(obj);
    };

    return (
        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            <Field label="ID (e.g. cairo-luxor)" value={f.id} onChangeText={set('id')} />
            <Field label="Name (English)" value={f.nameEn} onChangeText={set('nameEn')} />
            <Field label="Name (Arabic)" value={f.nameAr} onChangeText={set('nameAr')} />
            <Field label="From City" value={f.from} onChangeText={set('from')} />
            <Field label="To City" value={f.to} onChangeText={set('to')} />
            <Field label="Duration (hours)" value={f.durationHours} onChangeText={set('durationHours')} keyboardType="numeric" />
            <Field label="Distance (km)" value={f.distanceKm} onChangeText={set('distanceKm')} keyboardType="numeric" />
            <Field label="Base Price EGP (Sedan)" value={f.basePrice} onChangeText={set('basePrice')} keyboardType="numeric" />
            <Field label="Stops (comma-separated)" value={f.stops} onChangeText={set('stops')} placeholder="Temple, Museum, Market" />
            <ImageUploadField label="Image URL" value={f.imageUrl} onChangeText={set('imageUrl')} />
            <Field label="Rating (1.0 – 5.0)" value={f.rating} onChangeText={set('rating')} keyboardType="decimal-pad" />
            <Field label="Review Count" value={f.reviewCount} onChangeText={set('reviewCount')} keyboardType="numeric" />
            <PillSelect label="Category" options={['Pharaonic', 'Islamic', 'Beach', 'Nature', 'Cultural', 'Diving']} value={f.category} onChange={set('category')} />
            <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={submit}><Text style={styles.saveBtnText}>✅ Save</Text></TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ── Restaurant form ────────────────────────────────────────────
function RestaurantForm({ initial, onSave, onCancel }) {
    const empty = { id: '', name: '', city: '', cuisine: '', highlightDish: '', rating: '4.5', image: '', description: '' };
    const [f, setF] = useState(initial ? { ...initial, id: String(initial.id), rating: String(initial.rating) } : empty);
    const set = (k) => (v) => setF(p => ({ ...p, [k]: v }));

    const submit = () => {
        const obj = { ...f, id: Number(f.id), rating: Number(f.rating) };
        const errs = validateRestaurant(obj);
        if (errs.length) { Alert.alert('Validation Errors', errs.join('\n')); return; }
        onSave(obj);
    };

    return (
        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            <Field label="ID (unique number)" value={f.id} onChangeText={set('id')} keyboardType="numeric" />
            <Field label="Restaurant Name" value={f.name} onChangeText={set('name')} />
            <Field label="City (English)" value={f.city} onChangeText={set('city')} />
            <PillSelect label="Cuisine" options={['Egyptian', 'Mediterranean', 'Seafood', 'Italian', 'Oriental', 'International', 'Street Food']} value={f.cuisine} onChange={set('cuisine')} />
            <Field label="Signature Dish" value={f.highlightDish} onChangeText={set('highlightDish')} />
            <Field label="Rating (1.0 – 5.0)" value={f.rating} onChangeText={set('rating')} keyboardType="decimal-pad" />
            <ImageUploadField label="Image URL" value={f.image} onChangeText={set('image')} />
            <Field label="Description" value={f.description} onChangeText={set('description')} multiline />
            <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={submit}><Text style={styles.saveBtnText}>✅ Save</Text></TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ── Main screen ────────────────────────────────────────────────
export default function AdminPanel({ navigation }) {
    const { settings } = useSettings();
    const {
        places, adminPlaces, hotels, adminHotels, adminTrips,
        restaurants, adminRestaurants,
        adminAddPlace, adminEditPlace, adminRemovePlace,
        adminAddHotel, adminEditHotel, adminRemoveHotel,
        adminAddTrip, adminEditTrip, adminRemoveTrip,
        adminAddRestaurant, adminEditRestaurant, adminRemoveRestaurant,
    } = useData();
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [activeTab, setActiveTab] = useState(0);
    const [modal, setModal] = useState(null); // { type: 'place'|'hotel'|'trip'|'restaurant', mode: 'add'|'edit', item? }
    const [adminName, setAdminName] = useState('');
    const [isAuthed, setIsAuthed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        import('../utils/adminAuth').then(({ isAdminSetup, getAdminUsername }) => {
            isAdminSetup().then(setup => {
                if (!setup) {
                    navigation.replace('AdminAuth');
                } else {
                    setIsAuthed(true);
                    getAdminUsername().then(name => { if (name) setAdminName(name); });
                }
            });
        });
    }, []);

    if (!isAuthed) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4CD8D0" />
            </View>
        );
    }

    const closeModal = () => setModal(null);

    const handleSavePlace = async (obj) => {
        const result = modal.mode === 'add'
            ? await adminAddPlace(obj)
            : await adminEditPlace(obj.id, obj);
        if (result?.ok !== false) closeModal();
    };

    const handleSaveHotel = async (obj) => {
        const result = modal.mode === 'add'
            ? await adminAddHotel(obj)
            : await adminEditHotel(obj.id, obj);
        if (result?.ok !== false) closeModal();
    };

    const handleSaveTrip = async (obj) => {
        const result = modal.mode === 'add'
            ? await adminAddTrip(obj)
            : await adminEditTrip(obj.id, obj);
        if (result?.ok !== false) closeModal();
    };

    const handleSaveRestaurant = async (obj) => {
        const result = modal.mode === 'add'
            ? await adminAddRestaurant(obj)
            : await adminEditRestaurant(obj.id, obj);
        if (result?.ok !== false) closeModal();
    };

    const confirmDelete = (type, id, name) => {
        Alert.alert(`Delete ${type}?`, `"${name}" will be permanently removed.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: () => {
                    if (type === 'Place') adminRemovePlace(id);
                    else if (type === 'Hotel') adminRemoveHotel(id);
                    else if (type === 'Trip') adminRemoveTrip(id);
                    else adminRemoveRestaurant(id);
                },
            },
        ]);
    };

    // Sort Places: By City then Name
    const sortedPlaces = [...places].sort((a, b) => {
        const cityA = (a.cityEn || a.city || '').toLowerCase();
        const cityB = (b.cityEn || b.city || '').toLowerCase();
        if (cityA < cityB) return -1;
        if (cityA > cityB) return 1;
        const nameA = (a.nameEn || a.name || '').toLowerCase();
        const nameB = (b.nameEn || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // Sort Hotels: By City then Name
    const sortedHotels = [...hotels].sort((a, b) => {
        const cityA = (a.city || '').toLowerCase();
        const cityB = (b.city || '').toLowerCase();
        if (cityA < cityB) return -1;
        if (cityA > cityB) return 1;
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // All trips = built-in + admin
    const allTrips = [...FIXED_TRIPS, ...adminTrips].sort((a, b) => {
        const cityA = (a.from || '').toLowerCase();
        const cityB = (b.from || '').toLowerCase();
        if (cityA < cityB) return -1;
        if (cityA > cityB) return 1;
        const nameA = (a.nameEn || a.nameAr || '').toLowerCase();
        const nameB = (b.nameEn || b.nameAr || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // Sort Restaurants: By City then Name
    const sortedRestaurants = [...restaurants].sort((a, b) => {
        const cityA = (a.city || '').toLowerCase();
        const cityB = (b.city || '').toLowerCase();
        if (cityA < cityB) return -1;
        if (cityA > cityB) return 1;
        return (a.name || '').localeCompare(b.name || '');
    });

    // ── Search filter ──
    const filterBySearch = (list) => {
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(item => {
            const name = (item.nameEn || item.name || '').toLowerCase();
            const city = (item.cityEn || item.city || item.from || '').toLowerCase();
            const cat = (item.category || item.cuisine || '').toLowerCase();
            return name.includes(q) || city.includes(q) || cat.includes(q);
        });
    };

    const filteredData = activeTab === 0 ? filterBySearch(sortedPlaces) :
                         activeTab === 1 ? filterBySearch(sortedHotels) :
                         activeTab === 2 ? filterBySearch(allTrips) :
                         filterBySearch(sortedRestaurants);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.textMain} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: C.textMain }]}>ADMIN PANEL</Text>
                    <Text style={[styles.subtitle, { color: C.textMuted }]}>
                        {adminName ? `@${adminName}` : 'Manage Content'}
                    </Text>
                </View>
                <View style={[styles.lockBadge, { backgroundColor: '#CC9933' }]}>
                    <Ionicons name="shield-checkmark" size={18} color="#000" />
                </View>
            </View>

            {/* Tabs */}
            <View style={[styles.tabRow, { borderColor: '#000', backgroundColor: C.bgCard }]}>
                {TABS.map((tab, i) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === i && { backgroundColor: '#000' }]}
                        onPress={() => { setActiveTab(i); setSearchQuery(''); }}
                    >
                        <Text style={[styles.tabText, { color: activeTab === i ? '#CC9933' : C.textMuted }]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Search Bar */}
            <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                <View style={[styles.searchBar, { backgroundColor: C.bgCard, borderColor: isDark ? '#333' : '#ddd' }]}>
                    <Ionicons name="search" size={18} color={C.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: C.textMain }]}
                        placeholder={`Search ${TABS[activeTab].toLowerCase()}...`}
                        placeholderTextColor={C.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={C.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* List */}
            <FlashList
                data={filteredData}
                estimatedItemSize={70}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                renderItem={({ item }) => {
                    const isAdmin = !!item._adminAdded;
                    return (
                        <ItemCard
                            title={item.nameEn || item.name}
                            subtitle={
                                activeTab === 0 ? `${item.cityEn || item.city} · ${item.category}` :
                                activeTab === 1 ? `${item.city} · ${item.category} · ${item.price?.toLocaleString()} EGP` :
                                activeTab === 2 ? `${item.from} → ${item.to} · ${item.basePrice?.toLocaleString()} EGP` :
                                `${item.city} · ${item.cuisine || 'Restaurant'} · ⭐${item.rating}`
                            }
                            isBuiltIn={!isAdmin}
                            colors={{ bgCard: isDark ? '#1a1a1a' : '#f8f8f8', borderColor: isDark ? '#333' : '#e0e0e0', textMain: C.textMain, textMuted: C.textMuted }}
                            onEdit={() => setModal({
                                type: activeTab === 0 ? 'place' : activeTab === 1 ? 'hotel' : activeTab === 2 ? 'trip' : 'restaurant',
                                mode: 'edit',
                                item,
                            })}
                            onDelete={() => confirmDelete(
                                activeTab === 0 ? 'Place' : activeTab === 1 ? 'Hotel' : activeTab === 2 ? 'Trip' : 'Restaurant',
                                item.id,
                                item.nameEn || item.name,
                            )}
                        />
                    );
                }}
                ListHeaderComponent={
                    <Text style={[styles.listHeader, { color: C.textMuted }]}>
                        {searchQuery ? `${filteredData.length} results` :
                         activeTab === 0 ? `${places.length} places (${adminPlaces.length} admin-added)` :
                         activeTab === 1 ? `${hotels.length} hotels (${adminHotels.length} admin-added)` :
                         activeTab === 2 ? `${allTrips.length} trips (${adminTrips.length} admin-added)` :
                         `${restaurants.length} restaurants (${adminRestaurants.length} admin-added)`}
                    </Text>
                }
                ListEmptyComponent={
                    searchQuery ? (
                        <View style={{ alignItems: 'center', paddingTop: 40 }}>
                            <Ionicons name="search-outline" size={48} color={C.textMuted} />
                            <Text style={{ color: C.textMuted, marginTop: 12, fontWeight: '700' }}>No results for "{searchQuery}"</Text>
                        </View>
                    ) : null
                }
            />

            {/* FAB Add */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: '#CC9933' }]}
                onPress={() => setModal({
                    type: activeTab === 0 ? 'place' : activeTab === 1 ? 'hotel' : activeTab === 2 ? 'trip' : 'restaurant',
                    mode: 'add',
                })}
            >
                <Ionicons name="add" size={28} color="#000" />
            </TouchableOpacity>

            {/* Form Modal */}
            <Modal visible={!!modal} animationType="slide" onRequestClose={closeModal}>
                <SafeAreaView style={[styles.modalSafe, { backgroundColor: C.bgMain }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: C.textMain }]}>
                            {modal?.mode === 'add' ? '➕' : '✏️'} {modal?.mode === 'add' ? 'Add' : 'Edit'} {modal?.type === 'place' ? 'Place' : modal?.type === 'hotel' ? 'Hotel' : modal?.type === 'restaurant' ? 'Restaurant' : 'Trip'}
                        </Text>
                        <TouchableOpacity onPress={closeModal}>
                            <Ionicons name="close-circle" size={28} color="#CC9933" />
                        </TouchableOpacity>
                    </View>
                    {modal?.type === 'place' && <PlaceForm initial={modal.item} onSave={handleSavePlace} onCancel={closeModal} />}
                    {modal?.type === 'hotel' && <HotelForm initial={modal.item} onSave={handleSaveHotel} onCancel={closeModal} />}
                    {modal?.type === 'trip'  && <TripForm  initial={modal.item} onSave={handleSaveTrip}  onCancel={closeModal} />}
                    {modal?.type === 'restaurant' && <RestaurantForm initial={modal.item} onSave={handleSaveRestaurant} onCancel={closeModal} />}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '900', textTransform: 'uppercase' },
    subtitle: { fontSize: 12, fontWeight: '700' },
    lockBadge: { marginLeft: 'auto', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    tabRow: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 14, borderWidth: 2, overflow: 'hidden' },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
    tabText: { fontWeight: '900', fontSize: 13, textTransform: 'uppercase' },
    listHeader: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
    itemCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 14, padding: 12, marginBottom: 10 },
    itemTitle: { fontWeight: '800', fontSize: 14 },
    itemSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    iconBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 2, borderColor: '#CC9933', justifyContent: 'center', alignItems: 'center' },
    builtInBadge: { backgroundColor: '#f0f0f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    builtInText: { fontSize: 9, fontWeight: '900', color: '#888' },
    fab: { position: 'absolute', bottom: 32, right: 24, width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#000', justifyContent: 'center', alignItems: 'center', elevation: 8 },
    modalSafe: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderColor: '#000' },
    modalTitle: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
    form: { flex: 1, padding: 16 },
    fieldRow: { marginBottom: 14 },
    fieldLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', color: '#888', marginBottom: 6, letterSpacing: 0.5 },
    fieldInput: { borderWidth: 2, borderColor: '#000', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: '600', color: '#000', backgroundColor: '#fafafa' },
    pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#000', marginRight: 8, backgroundColor: '#f0f0f0' },
    pillActive: { backgroundColor: '#000' },
    pillText: { fontWeight: '800', fontSize: 12, color: '#000' },
    pillTextActive: { color: '#CC9933' },
    formActions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 60 },
    cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#000', alignItems: 'center' },
    cancelBtnText: { fontWeight: '900', fontSize: 14 },
    saveBtn: { flex: 2, padding: 16, borderRadius: 12, backgroundColor: '#CC9933', borderWidth: 2, borderColor: '#000', alignItems: 'center' },
    saveBtnText: { fontWeight: '900', fontSize: 14, color: '#000' },
    searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
    searchInput: { flex: 1, fontSize: 14, fontWeight: '600', paddingVertical: 4 },
});
