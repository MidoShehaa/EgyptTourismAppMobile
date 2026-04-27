import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../store/UserContext';

export default function MapScreen() {
    const navigation = useNavigation();
    const { settings, places } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;
    const [selectedPlace, setSelectedPlace] = React.useState(null);

    const initialRegion = {
        latitude: 26.8206,
        longitude: 30.8025,
        zoom: 6
    };

    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { padding: 0; margin: 0; background-color: #000; }
                #map { height: 100vh; width: 100vw; }
                .leaflet-container { background: #000 !important; }
                .leaflet-tile { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
                .custom-marker {
                    background: #1A1A1A;
                    border: 2px solid #4CD8D0;
                    border-radius: 50%;
                    text-align: center;
                    line-height: 36px;
                    font-size: 20px;
                    box-shadow: 0 4px 15px rgba(76, 216, 208, 0.3);
                }
            </style>

        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map', { zoomControl: false }).setView([${initialRegion.latitude}, ${initialRegion.longitude}], ${initialRegion.zoom});
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                var places = ${JSON.stringify(places.filter(p => p.lat && p.lng))};
                
                places.forEach(function(place) {
                    var icon = L.divIcon({
                        className: 'custom-marker',
                        html: place.image,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18]
                    });
                    var marker = L.marker([place.lat, place.lng], {icon: icon}).addTo(map);
                    marker.on('click', function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerClick', placeId: place.id }));
                    });
                });
            </script>
        </body>
        </html>
    `;

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'markerClick') {
                const place = places.find(p => p.id === data.placeId);
                if (place) setSelectedPlace(place);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <View style={[styles.headerBlock, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.titleLine, { color: '#fff' }]}>
                    {isRTL ? 'الخريطة' : 'Explore'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: C.textMuted }]}>
                    {isRTL ? 'اكتشف معالم مصر' : 'Discover Egypt\'s wonders'}
                </Text>
            </View>


            <View style={styles.mapContainer}>
                {Platform.OS === 'web' ? (
                    <iframe 
                        srcDoc={mapHtml} 
                        style={{ width: '100%', height: '100%', borderWidth: 0 }} 
                    />
                ) : (
                    <WebView
                        source={{ html: mapHtml }}
                        style={styles.map}
                        onMessage={handleMessage}
                        scrollEnabled={false}
                        bounces={false}
                    />
                )}

                {selectedPlace && (
                    <View style={[styles.infoCard, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }]}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPlace(null)}>
                            <Ionicons name="close-circle" size={32} color="#555" />
                        </TouchableOpacity>
                        
                        <View style={styles.infoContent}>
                            <View style={styles.infoText}>
                                <Text style={[styles.infoTitle, { color: C.textMain }]} numberOfLines={1}>
                                    {isRTL ? selectedPlace.name : selectedPlace.nameEn}
                                </Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={14} color={C.primary} />
                                    <Text style={[styles.infoMeta, { color: C.textMain }]}>{selectedPlace.rating}</Text>
                                    <Text style={[styles.infoCity, { color: C.textMuted }]}> • {isRTL ? selectedPlace.city : selectedPlace.cityEn}</Text>
                                </View>
                            </View>
                        </View>
                        
                        <TouchableOpacity
                            style={[styles.detailsButton, { backgroundColor: C.primary }]}
                            onPress={() => navigation.navigate('PlaceDetails', { place: selectedPlace })}
                        >
                            <Text style={styles.detailsButtonText}>
                                {isRTL ? 'عرض التفاصيل' : 'View Details'}
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
    headerBlock: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
    titleLine: { fontSize: 32, fontWeight: '900' },
    headerSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, opacity: 0.6 },
    mapContainer: { flex: 1 },
    map: { flex: 1 },
    infoCard: { position: 'absolute', bottom: 120, left: 24, right: 24, borderRadius: 32, padding: 24 },
    closeButton: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
    infoContent: { marginBottom: 20 },
    infoText: { flex: 1 },
    infoTitle: { fontSize: 22, fontWeight: '900', marginBottom: 6 },
    infoCity: { fontSize: 14, fontWeight: '600' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoMeta: { fontSize: 14, fontWeight: '900' },
    detailsButton: { height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    detailsButtonText: { fontSize: 16, fontWeight: '900', color: '#000' },
});

