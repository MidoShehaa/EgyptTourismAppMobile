import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Modal, FlatList, Alert, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS } from '../constants/theme';
import { validatePlace, validateHotel, validateTrip, PLACE_CATEGORIES, HOTEL_CATEGORIES } from '../constants/DATA_TEMPLATES';
import { FIXED_TRIPS } from '../constants/ridesData';

const TABS = ['Places', 'Hotels', 'Trips'];

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
function ItemCard({ title, subtitle, onEdit, onDelete, isBuiltIn }) {
    return (
        <View style={styles.itemCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{subtitle}</Text>
            </View>
            {isBuiltIn ? (
                <View style={styles.builtInBadge}><Text style={styles.builtInText}>BUILT-IN</Text></View>
            ) : (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
                        <Ionicons name="pencil" size={16} color="#CC9933" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={[styles.iconBtn, { borderColor: '#EF4444' }]}>
                        <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
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
            <Field label="Image URL (https://...)" value={f.imageUrl} onChangeText={set('imageUrl')} />
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
            <Field label="Image URL (https://...)" value={f.image} onChangeText={set('image')} />
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
            <Field label="Image URL (https://...)" value={f.imageUrl} onChangeText={set('imageUrl')} />
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

// ── Main screen ────────────────────────────────────────────────
export default function AdminPanel({ navigation }) {
    const {
        places, adminPlaces, hotels, adminHotels, adminTrips,
        adminAddPlace, adminEditPlace, adminRemovePlace,
        adminAddHotel, adminEditHotel, adminRemoveHotel,
        adminAddTrip, adminEditTrip, adminRemoveTrip,
        settings,
    } = useUser();
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [activeTab, setActiveTab] = useState(0);
    const [modal, setModal] = useState(null); // { type: 'place'|'hotel'|'trip', mode: 'add'|'edit', item? }
    const [adminName, setAdminName] = useState('');

    React.useEffect(() => {
        import('../utils/adminAuth').then(({ getAdminUsername }) => {
            getAdminUsername().then(name => { if (name) setAdminName(name); });
        });
    }, []);

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

    const confirmDelete = (type, id, name) => {
        Alert.alert(`Delete ${type}?`, `"${name}" will be permanently removed.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: () => {
                    if (type === 'Place') adminRemovePlace(id);
                    else if (type === 'Hotel') adminRemoveHotel(id);
                    else adminRemoveTrip(id);
                },
            },
        ]);
    };

    // All trips = built-in + admin
    const allTrips = [...FIXED_TRIPS, ...adminTrips];

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
                        onPress={() => setActiveTab(i)}
                    >
                        <Text style={[styles.tabText, { color: activeTab === i ? '#CC9933' : C.textMuted }]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <FlatList
                data={
                    activeTab === 0 ? places :
                    activeTab === 1 ? hotels :
                    allTrips
                }
                keyExtractor={item => String(item.id)}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                renderItem={({ item }) => {
                    const isAdmin = !!item._adminAdded;
                    return (
                        <ItemCard
                            title={item.nameEn || item.name || item.nameEn}
                            subtitle={
                                activeTab === 0 ? `${item.cityEn || item.city} · ${item.category}` :
                                activeTab === 1 ? `${item.city} · ${item.category} · ${item.price?.toLocaleString()} EGP` :
                                `${item.from} → ${item.to} · ${item.basePrice?.toLocaleString()} EGP`
                            }
                            isBuiltIn={!isAdmin}
                            onEdit={() => setModal({
                                type: activeTab === 0 ? 'place' : activeTab === 1 ? 'hotel' : 'trip',
                                mode: 'edit',
                                item,
                            })}
                            onDelete={() => confirmDelete(
                                activeTab === 0 ? 'Place' : activeTab === 1 ? 'Hotel' : 'Trip',
                                item.id,
                                item.nameEn || item.name,
                            )}
                        />
                    );
                }}
                ListHeaderComponent={
                    <Text style={[styles.listHeader, { color: C.textMuted }]}>
                        {activeTab === 0 ? `${places.length} places (${adminPlaces.length} admin-added)` :
                         activeTab === 1 ? `${hotels.length} hotels (${adminHotels.length} admin-added)` :
                         `${allTrips.length} trips (${adminTrips.length} admin-added)`}
                    </Text>
                }
            />

            {/* FAB Add */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: '#CC9933' }]}
                onPress={() => setModal({
                    type: activeTab === 0 ? 'place' : activeTab === 1 ? 'hotel' : 'trip',
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
                            {modal?.mode === 'add' ? '➕' : '✏️'} {modal?.mode === 'add' ? 'Add' : 'Edit'} {modal?.type === 'place' ? 'Place' : modal?.type === 'hotel' ? 'Hotel' : 'Trip'}
                        </Text>
                        <TouchableOpacity onPress={closeModal}>
                            <Ionicons name="close-circle" size={28} color="#CC9933" />
                        </TouchableOpacity>
                    </View>
                    {modal?.type === 'place' && <PlaceForm initial={modal.item} onSave={handleSavePlace} onCancel={closeModal} />}
                    {modal?.type === 'hotel' && <HotelForm initial={modal.item} onSave={handleSaveHotel} onCancel={closeModal} />}
                    {modal?.type === 'trip'  && <TripForm  initial={modal.item} onSave={handleSaveTrip}  onCancel={closeModal} />}
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
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', borderRadius: 14, padding: 12, marginBottom: 10 },
    itemTitle: { fontWeight: '800', fontSize: 14, color: '#000' },
    itemSub: { fontSize: 11, color: '#666', fontWeight: '600', marginTop: 2 },
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
});
