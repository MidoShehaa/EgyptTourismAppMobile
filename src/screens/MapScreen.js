import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// MapView disabled — native map removed for stability
// import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { places } from '../constants/placesData';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../store/UserContext';

const fontFamilyHeavy = Platform.OS === 'ios' ? 'Futura' : 'sans-serif-black';
const fontFamilyMedium = Platform.OS === 'ios' ? 'San Francisco' : 'sans-serif-medium';

export default function MapScreen() {
    const navigation = useNavigation();
    const { settings } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

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
                <ScrollView contentContainerStyle={styles.placeListFallback}>
                    <View style={[styles.mapBanner, { backgroundColor: C.bgCard, borderColor: C.borderGold }]}>
                        <Ionicons name="map" size={32} color={C.textGold || '#CC9933'} />
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text style={{ color: C.textMain, fontFamily: fontFamilyHeavy, fontSize: 16, textTransform: 'uppercase' }}>
                                {isRTL ? 'استكشف المعالم' : 'EXPLORE LANDMARKS'}
                            </Text>
                            <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>
                                {isRTL ? '10 وجهات مميزة في مصر' : '10 iconic destinations across Egypt'}
                            </Text>
                        </View>
                    </View>
                    {places.filter(p => p.lat && p.lng).map((place) => (
                        <TouchableOpacity
                            key={place.id}
                            style={[styles.placeListItem, { backgroundColor: C.bgCard, borderColor: C.borderGold }]}
                            onPress={() => navigation.navigate('PlaceDetails', { place })}
                        >
                            <Text style={styles.placeListEmoji}>{place.image}</Text>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={[styles.placeListName, { color: C.textMain }]} numberOfLines={1}>
                                    {isRTL ? place.name : place.nameEn}
                                </Text>
                                <Text style={[styles.placeListCity, { color: C.textMuted }]}>
                                    {isRTL ? place.city : place.cityEn} • {place.rating} ★
                                </Text>
                            </View>
                            <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color={C.textGold || '#CC9933'} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
        fontFamily: fontFamilyHeavy,
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -1.5,
        lineHeight: 52,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontFamily: fontFamilyMedium,
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
        fontFamily: fontFamilyHeavy,
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
        fontFamily: fontFamilyHeavy,
        fontSize: 20,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    infoCity: {
        fontFamily: fontFamilyMedium,
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
        fontFamily: fontFamilyHeavy,
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
        fontFamily: fontFamilyHeavy,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
});
