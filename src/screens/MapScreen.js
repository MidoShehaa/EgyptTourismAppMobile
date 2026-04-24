import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { places } from '../constants/placesData';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../store/UserContext';

export default function MapScreen() {
    const navigation = useNavigation();
    const { settings } = useUser();
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
                body { padding: 0; margin: 0; background-color: ${C.bgMain}; }
                #map { height: 100vh; width: 100vw; }
                .custom-marker {
                    background: ${C.bgElevated};
                    border: 2px solid #000;
                    border-radius: 20px;
                    text-align: center;
                    line-height: 28px;
                    font-size: 18px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
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
                <Text style={[styles.titleLine, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'خريطة' : 'EGYPT'}
                </Text>
                <Text style={[styles.titleLine, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'مصر' : 'MAP'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: C.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'اكتشف الأماكن القريبة' : 'DISCOVER PLACES NEARBY'}
                </Text>
            </View>

            <View style={[styles.mapContainer, { borderTopColor: C.borderGold }]}>
                <WebView
                    source={{ html: mapHtml }}
                    style={styles.map}
                    onMessage={handleMessage}
                    scrollEnabled={false}
                    bounces={false}
                />

                {selectedPlace && (
                    <View style={[styles.infoCard, { backgroundColor: C.bgCard, borderColor: C.borderGold }]}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPlace(null)}>
                            <Ionicons name="close-circle" size={28} color={C.textMuted} />
                        </TouchableOpacity>
                        <View style={styles.infoContent}>
                            <View style={[styles.infoEmojiBox, { backgroundColor: C.bgElevated, borderRadius: 16 }]}>
                                <Text style={styles.infoEmoji}>{selectedPlace.image}</Text>
                            </View>
                            <View style={styles.infoText}>
                                <Text style={[styles.infoTitle, { color: C.textMain }]} numberOfLines={1}>
                                    {isRTL ? selectedPlace.name : selectedPlace.nameEn}
                                </Text>
                                <Text style={[styles.infoCity, { color: C.textMuted }]}>
                                    {isRTL ? selectedPlace.city : selectedPlace.cityEn}
                                </Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={14} color="#FFD700" />
                                    <Text style={[styles.infoMeta, { color: C.textMain, marginLeft: 4 }]}>
                                        {selectedPlace.rating}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.detailsButton, { backgroundColor: C.gold, borderColor: '#000' }]}
                            onPress={() => navigation.navigate('PlaceDetails', { place: selectedPlace })}
                        >
                            <Text style={[styles.detailsButtonText, { color: '#000' }]}>
                                {isRTL ? 'عرض التفاصيل' : 'VIEW DETAILS'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBlock: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
    },
    titleLine: {
        fontFamily: FONTS.heavy,
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -1.5,
        lineHeight: 52,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontFamily: FONTS.medium,
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: SPACING.sm,
    },
    mapContainer: {
        flex: 1,
        borderTopWidth: 3,
    },
    map: {
        flex: 1,
    },
    placeListFallback: {
        padding: SPACING.md,
        paddingBottom: 120,
    },
    mapBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: 20,
        borderWidth: 2,
        marginBottom: SPACING.md,
    },
    placeListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: SPACING.sm,
    },
    placeListEmoji: {
        fontSize: 32,
        width: 48,
        textAlign: 'center',
    },
    placeListName: {
        fontFamily: FONTS.heavy,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    placeListCity: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 2,
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerSelected: {
        transform: [{ scale: 1.2 }],
    },
    markerBadge: {
        padding: 4,
        borderRadius: 20,
        borderWidth: 2,
    },
    markerText: {
        fontSize: 20,
    },
    infoCard: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        borderRadius: 24,
        padding: SPACING.md,
        borderWidth: 3,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
        padding: 4,
    },
    infoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    infoEmojiBox: {
        padding: SPACING.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoEmoji: {
        fontSize: 42,
    },
    infoText: {
        flex: 1,
        paddingHorizontal: SPACING.md,
    },
    infoTitle: {
        fontFamily: FONTS.heavy,
        fontSize: 20,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    infoCity: {
        fontFamily: FONTS.medium,
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    infoMeta: {
        fontFamily: FONTS.heavy,
        fontSize: 14,
        fontWeight: '900',
    },
    detailsButton: {
        borderRadius: 30,
        borderWidth: 2,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsButtonText: {
        fontFamily: FONTS.heavy,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
});
