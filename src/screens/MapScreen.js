import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, getFontFamily } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../store/SettingsContext';
import { useData } from '../store/DataContext';
import { usePlanner } from '../store/PlannerContext';
import DynamicBackground from '../components/DynamicBackground';

// Category → emoji icon map for pins
const CATEGORY_EMOJI = {
    Pharaonic:   '🏛️',
    Islamic:     '🕌',
    Beach:       '🏖️',
    Nature:      '🌵',
    Diving:      '🤿',
    Snorkeling:  '🐠',
    Historical:  '⚔️',
    Medical:     '♨️',
    Cultural:    '🎭',
    Nightlife:   '🪩',
};

// City → approximate lat/lng for hotels & dining (since data has no coords)
const CITY_COORDS = {
    'Cairo':          { lat: 30.0444, lng: 31.2357 },
    'Giza':           { lat: 29.9792, lng: 31.1342 },
    'Alexandria':     { lat: 31.2001, lng: 29.9187 },
    'Luxor':          { lat: 25.6872, lng: 32.6396 },
    'Aswan':          { lat: 24.0889, lng: 32.8998 },
    'Hurghada':       { lat: 27.2579, lng: 33.8116 },
    'Sharm El Sheikh':{ lat: 27.9158, lng: 34.3300 },
    'Dahab':          { lat: 28.4900, lng: 34.5140 },
    'Marsa Alam':     { lat: 25.0667, lng: 34.8833 },
    'Siwa':           { lat: 29.2031, lng: 25.5191 },
    'Matrouh':        { lat: 31.3543, lng: 27.2373 },
    'Fayoum':         { lat: 29.3084, lng: 30.8428 },
    'Nuweiba':        { lat: 28.9700, lng: 34.6600 },
    'Taba':           { lat: 29.4900, lng: 34.9000 },
    'El Gouna':       { lat: 27.3950, lng: 33.6743 },
    'Cairo/Gouna':    { lat: 27.3950, lng: 33.6743 },
};

// Add deterministic jitter so overlapping city pins don't stack exactly
const pseudoRandom = (id) => {
    const str = String(id);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    const x = Math.sin(hash || 1) * 10000;
    return x - Math.floor(x);
};
const jitter = (val, id, spread = 0.05) => val + (pseudoRandom(id) - 0.5) * spread;

export default function MapScreen() {
    const navigation = useNavigation();
    const { settings, t } = useSettings();
    const { places, hotels, restaurants } = useData();
    const { itinerary } = usePlanner();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected !== false);
        });
        return () => unsubscribe();
    }, []);

    const initialRegion = { latitude: 26.8206, longitude: 30.8025, zoom: 6 };

    // Build itinerary places
    const itineraryPlaces = useMemo(() => {
        if (!itinerary?.days) return [];
        const result = [];
        itinerary.days.forEach((day, dayIndex) => {
            (day.activities || []).forEach(act => {
                if (act.placeId) {
                    const p = places.find(pl => pl.id === act.placeId);
                    if (p && p.lat && p.lng) {
                        result.push({ id: p.id, lat: p.lat, lng: p.lng, day: dayIndex + 1 });
                    }
                }
            });
        });
        return result;
    }, [itinerary, places]);

    // Minimal places with safe emoji (use category fallback)
    const placesMinimal = useMemo(() => (places || [])
        .filter(p => p.lat && p.lng)
        .map(p => ({
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            emoji: CATEGORY_EMOJI[p.category] || '📍',
        })),
    [places]);

    // Hotels enriched with city-based coords + jitter
    const hotelsMinimal = useMemo(() => (hotels || [])
        .map(h => {
            const coords = CITY_COORDS[h.cityEn || h.city];
            if (!coords) return null;
            return { id: h.id, lat: jitter(coords.lat, h.id), lng: jitter(coords.lng, h.id + 'lng') };
        })
        .filter(Boolean),
    [hotels]);

    // Restaurants enriched with city-based coords + jitter
    const diningMinimal = useMemo(() => (restaurants || [])
        .map(r => {
            const coords = CITY_COORDS[r.city];
            if (!coords) return null;
            return { id: r.id, lat: jitter(coords.lat, r.id, 0.04), lng: jitter(coords.lng, r.id + 'lng', 0.04) };
        })
        .filter(Boolean),
    [restaurants]);

    const getMarkersJS = () => {
        let markersJS = `
            var markers = L.markerClusterGroup({
                maxClusterRadius: 45,
                showCoverageOnHover: false,
                iconCreateFunction: function(cluster) {
                    return L.divIcon({ 
                        html: '<div>' + cluster.getChildCount() + '</div>', 
                        className: 'custom-cluster', 
                        iconSize: [36, 36] 
                    });
                }
            });
        `;

        if (activeFilter === 'all' || activeFilter === 'places') {
            markersJS += `
                var placesData = ${JSON.stringify(placesMinimal)};
                placesData.forEach(function(p) {
                    var icon = L.divIcon({
                        className: '',
                        html: '<div class="marker-pin place-pin">' + p.emoji + '</div>',
                        iconSize: [38, 38], iconAnchor: [19, 38]
                    });
                    markers.addLayer(
                        L.marker([p.lat, p.lng], {icon: icon})
                        .on('click', function() { window.ReactNativeWebView.postMessage(JSON.stringify({type:'click',itemType:'place',id:p.id})); })
                    );
                });
            `;
        }

        if (activeFilter === 'all' || activeFilter === 'hotels') {
            markersJS += `
                var hotelsData = ${JSON.stringify(hotelsMinimal)};
                hotelsData.forEach(function(h) {
                    var icon = L.divIcon({
                        className: '',
                        html: '<div class="marker-pin hotel-pin">🏨</div>',
                        iconSize: [38, 38], iconAnchor: [19, 38]
                    });
                    markers.addLayer(
                        L.marker([h.lat, h.lng], {icon: icon})
                        .on('click', function() { window.ReactNativeWebView.postMessage(JSON.stringify({type:'click',itemType:'hotel',id:h.id})); })
                    );
                });
            `;
        }

        if (activeFilter === 'all' || activeFilter === 'dining') {
            markersJS += `
                var diningData = ${JSON.stringify(diningMinimal)};
                diningData.forEach(function(r) {
                    var icon = L.divIcon({
                        className: '',
                        html: '<div class="marker-pin dining-pin">🍽️</div>',
                        iconSize: [38, 38], iconAnchor: [19, 38]
                    });
                    markers.addLayer(
                        L.marker([r.lat, r.lng], {icon: icon})
                        .on('click', function() { window.ReactNativeWebView.postMessage(JSON.stringify({type:'click',itemType:'dining',id:r.id})); })
                    );
                });
            `;
        }

        markersJS += `\nmap.addLayer(markers);`;

        if (activeFilter === 'itinerary') {
            if (itineraryPlaces.length > 0) {
                markersJS += `
                    var itinData = ${JSON.stringify(itineraryPlaces)};
                    var coords = [];
                    itinData.forEach(function(p) {
                        coords.push([p.lat, p.lng]);
                        var icon = L.divIcon({
                            className: '',
                            html: '<div class="marker-pin itin-pin">' + p.day + '</div>',
                            iconSize: [38, 38], iconAnchor: [19, 38]
                        });
                        L.marker([p.lat, p.lng], {icon: icon}).addTo(map)
                            .on('click', function() { window.ReactNativeWebView.postMessage(JSON.stringify({type:'click',itemType:'place',id:p.id})); });
                    });
                    if (coords.length > 1) {
                        L.polyline(coords, {color: '#FFD700', weight: 3, opacity: 0.8, dashArray: '10,8'}).addTo(map);
                        map.fitBounds(coords, {padding: [60, 60]});
                    } else if (coords.length === 1) {
                        map.setView(coords[0], 10);
                    }
                `;
            }
        }

        return markersJS;
    };

    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>
            <style>
                * { box-sizing: border-box; }
                body { padding: 0; margin: 0; background: ${isDark ? '#0a0a0a' : '#f0f0f0'}; }
                #map { height: 100vh; width: 100vw; }
                .leaflet-container { background: ${isDark ? '#0a0a0a' : '#f0f0f0'} !important; }
                .leaflet-tile { filter: ${isDark ? 'invert(100%) hue-rotate(180deg) sepia(0.2) brightness(95%) contrast(90%)' : 'sepia(0.15) hue-rotate(5deg) contrast(1.05)'}; }

                .leaflet-div-icon { background: transparent !important; border: none !important; }
                .marker-pin {
                    width: 38px; height: 38px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 18px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                    overflow: hidden;
                }
                .place-pin  { background: #1a1a2e; border: 2.5px solid #4CD8D0; }
                .hotel-pin  { background: #1a1a2e; border: 2.5px solid #4A90D9; }
                .dining-pin { background: #1a1a2e; border: 2.5px solid #E67E22; }
                .itin-pin   { background: #FFD700; border: 2.5px solid #FFA500; color: #000; font-size: 15px; font-weight: 900; }
                
                .custom-cluster {
                    background: rgba(26, 26, 46, 0.95);
                    border: 2.5px solid #fff;
                    border-radius: 50%;
                    color: #fff;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.6);
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map', {zoomControl: false}).setView([${initialRegion.latitude}, ${initialRegion.longitude}], ${initialRegion.zoom});
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19, attribution: '© OpenStreetMap'
                }).addTo(map);
                ${getMarkersJS()}
            </script>
        </body>
        </html>
    `;

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'click') {
                let item = null;
                if (data.itemType === 'place') item = places.find(p => p.id === data.id);
                else if (data.itemType === 'hotel') item = (hotels || []).find(h => h.id === data.id);
                else if (data.itemType === 'dining') item = (restaurants || []).find(r => r.id === data.id);
                if (item) setSelectedItem({ ...item, itemType: data.itemType });
            }
        } catch (e) { console.error('Map message error:', e); }
    };

    const handleItemPress = () => {
        if (!selectedItem) return;
        if (selectedItem.itemType === 'place') navigation.navigate('PlaceDetails', { place: selectedItem });
        else if (selectedItem.itemType === 'hotel') navigation.navigate('HotelsCity', { city: selectedItem.cityEn || selectedItem.city });
        else if (selectedItem.itemType === 'dining') navigation.navigate('Dining', { city: selectedItem.city });
        setSelectedItem(null);
    };

    const FILTERS = [
        { key: 'all',       icon: 'globe-outline',      label: t('filterAll') || 'All',     count: placesMinimal.length + hotelsMinimal.length + diningMinimal.length },
        { key: 'places',    icon: 'compass-outline',    label: t('filterPlaces') || 'Places',  count: placesMinimal.length },
        { key: 'hotels',    icon: 'business-outline',   label: t('filterHotels') || 'Hotels',  count: hotelsMinimal.length },
        { key: 'dining',    icon: 'restaurant-outline', label: t('filterDining') || 'Dining',  count: diningMinimal.length },
        { key: 'itinerary', icon: 'map-outline',        label: t('myTrip') || 'My Plan', count: itineraryPlaces.length },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground category="Pharaonic" />
            <View style={[styles.headerBlock, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.titleLine, { color: '#fff', fontFamily: getFontFamily(isRTL, 'bold') }]}>
                    {t('mapTitle') || 'Explore'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'medium') }]}>
                    {t('discoverEgypt') || "Discover Egypt's wonders"}
                </Text>
            </View>

        <View style={{ height: 50, marginBottom: 8 }}>
            {/* Filter Chips — scrollable */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.filtersRow, isRTL && { flexDirection: 'row-reverse' }]}
                keyboardShouldPersistTaps="handled"
            >
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f.key}
                        style={[
                            styles.filterChip,
                            { backgroundColor: activeFilter === f.key ? C.primary : C.bgElevated },
                        ]}
                        onPress={() => { setActiveFilter(f.key); setSelectedItem(null); }}
                    >
                        <Ionicons name={f.icon} size={15} color={activeFilter === f.key ? '#000' : C.textMain} />
                        <Text style={[styles.filterText, { color: activeFilter === f.key ? '#000' : C.textMain, fontFamily: getFontFamily(isRTL, 'semibold') }]}>
                            {f.label}
                        </Text>
                        <View style={[styles.filterBadge, { backgroundColor: activeFilter === f.key ? 'rgba(0,0,0,0.2)' : C.primary + '30' }]}>
                            <Text style={[styles.filterBadgeText, { color: activeFilter === f.key ? '#000' : C.primary, fontFamily: getFontFamily(isRTL, 'bold') }]}>
                                {f.count}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

            <View style={styles.mapContainer}>
                {!isConnected ? (
                    <View style={[styles.emptyState, { backgroundColor: C.bgCard, zIndex: 10 }]}>
                        <Ionicons name="cloud-offline" size={60} color={C.textMuted} style={{ marginBottom: 16 }} />
                        <Text style={[styles.emptyTitle, { color: C.textMain }]}>
                            {isRTL ? 'الخريطة غير متاحة' : 'Map Unavailable'}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: C.textMuted }]}>
                            {isRTL ? 'يرجى الاتصال بالإنترنت لعرض الخريطة.' : 'Please connect to the internet to view the map.'}
                        </Text>
                    </View>
                ) : Platform.OS === 'web' ? (
                    <iframe srcDoc={mapHtml} style={{ width: '100%', height: '100%', borderWidth: 0 }} />
                ) : (
                    <WebView
                        key={activeFilter}
                        source={{ html: mapHtml }}
                        style={styles.map}
                        onMessage={handleMessage}
                        scrollEnabled={false}
                        bounces={false}
                        originWhitelist={['*']}
                    />
                )}

                {/* Empty state for itinerary filter */}
                {activeFilter === 'itinerary' && itineraryPlaces.length === 0 && (
                    <View style={[styles.emptyState, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
                        <Text style={styles.emptyIcon}>🗺️</Text>
                        <Text style={styles.emptyTitle}>
                            {t('noTripPlanYet')}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {t('goToPlannerHint')}
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyBtn, { backgroundColor: C.primary }]}
                            onPress={() => navigation.navigate('Planner')}
                        >
                            <Text style={styles.emptyBtnText}>{t('startPlanning')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {selectedItem && (
                    <View style={[styles.infoCard, { backgroundColor: C.bgCard, borderColor: C.borderSubtle || '#333' }]}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
                            <Ionicons name="close-circle" size={28} color="#555" />
                        </TouchableOpacity>
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoTitle, { color: C.textMain }]} numberOfLines={1}>
                                {isRTL ? (selectedItem.nameAr || selectedItem.name) : (selectedItem.nameEn || selectedItem.name)}
                            </Text>
                            <View style={[styles.ratingRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                {selectedItem.rating && (
                                    <>
                                        <Ionicons name="star" size={14} color={C.primary} />
                                        <Text style={[styles.infoMeta, { color: C.textMain }]}>{selectedItem.rating}</Text>
                                    </>
                                )}
                                <Text style={[styles.infoCity, { color: C.textMuted }]}>
                                    {' • '}{isRTL ? (selectedItem.cityAr || selectedItem.city) : (selectedItem.cityEn || selectedItem.city)}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.detailsButton, { backgroundColor: C.primary }]}
                            onPress={handleItemPress}
                        >
                            <Text style={styles.detailsButtonText}>
                                {t('viewDetails')}
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBlock: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10 },
    titleLine: { fontSize: 28, fontWeight: '900' },
    headerSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 2, opacity: 0.6 },
    filtersRow: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    filterText: { fontSize: 12, fontWeight: '800', marginHorizontal: 6 },
    filterBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
    filterBadgeText: { fontSize: 11, fontWeight: '900' },
    mapContainer: { flex: 1 },
    map: { flex: 1 },
    emptyState: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        padding: 40,
    },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
    emptySubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
    emptyBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20 },
    emptyBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
    infoCard: { position: 'absolute', bottom: 120, left: 20, right: 20, borderRadius: 24, padding: 20, borderWidth: 1 },
    closeButton: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
    infoContent: { marginBottom: 16 },
    infoTitle: { fontSize: 20, fontWeight: '900', marginBottom: 6 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoMeta: { fontSize: 14, fontWeight: '900' },
    infoCity: { fontSize: 14, fontWeight: '600' },
    detailsButton: { height: 52, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    detailsButtonText: { fontSize: 15, fontWeight: '900', color: '#000' },
});
