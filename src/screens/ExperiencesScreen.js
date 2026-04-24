import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, DARK_COLORS, SPACING } from '../constants/theme';
import { useUser } from '../store/UserContext';
import { RESTAURANTS, CRUISES } from '../constants/diningData';

const fontFamilyHeavy = Platform.OS === 'ios' ? 'Futura' : 'sans-serif-black';

export default function ExperiencesScreen() {
    const { t, settings } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;
    
    // Using high-res Pexels images for authentic Egyptian feel
    const VR_IMAGE = 'https://images.pexels.com/photos/2180583/pexels-photo-2180583.jpeg'; 

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={[styles.title, { color: C.textMain }]}>{isRTL ? 'تجارب استثنائية' : 'Elevated Experiences'}</Text>
                    <Text style={[styles.subtitle, { color: C.textMuted }]}>{isRTL ? 'رحلات غامرة في قلب مصر' : 'Immersive Journeys'}</Text>
                </View>

                {/* NILE CRUISES SECTION - Horizontal Luxury Cards */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeading, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{isRTL ? 'أفخم الرحلات النيلية' : 'LUXURY NILE CRUISES'}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {CRUISES.map(cruise => (
                            <TouchableOpacity key={cruise.id} style={[styles.cruiseCard, { backgroundColor: C.bgCard, borderColor: C.borderMain || '#000' }]}>
                                <Image source={{ uri: cruise.image }} style={styles.cruiseImage} />
                                <View style={styles.cruiseBadge}>
                                    <Text style={styles.cruiseBadgeText}>5.0 ★</Text>
                                </View>
                                <View style={styles.cruiseContent}>
                                    <Text style={[styles.cruiseTitle, { color: C.textMain }]} numberOfLines={1}>{cruise.name}</Text>
                                    <Text style={[styles.cruiseRoute, { color: C.textGold || '#CC9933' }]}>{cruise.route}</Text>
                                    <Text style={[styles.cruiseHighlight, { color: C.textMuted }]} numberOfLines={2}>{cruise.keyHighlight}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* RESTAURANTS SECTION - List Style */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeading, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{isRTL ? 'أفضل المطاعم' : 'TOP DINING DESTINATIONS'}</Text>
                    {RESTAURANTS.map(rest => (
                        <TouchableOpacity key={rest.id} style={[styles.horizontalTour, { backgroundColor: C.bgCard, borderColor: C.borderMain || '#000', marginBottom: 12 }]}>
                            <Image source={{ uri: rest.image }} style={styles.tourSideImage} />
                            <View style={styles.tourSideContent}>
                                <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Text style={[styles.tourSideTitle, { color: C.textMain }, { flex: 1 }]} numberOfLines={1}>{rest.name}</Text>
                                    <Text style={[styles.ratingSmall, { color: C.textGold || '#CC9933' }]}>{rest.rating} ★</Text>
                                </View>
                                <Text style={[styles.restCuisine, { color: C.textMuted }]} numberOfLines={1}>{rest.cuisine} • {rest.city}</Text>
                                <Text style={[styles.restHighlight, { color: C.textMain }]} numberOfLines={1}>Must try: {rest.highlightDish}</Text>
                                <TouchableOpacity style={styles.miniAction}>
                                    <Text style={styles.miniActionText}>{isRTL ? 'احجز طاولة' : 'BOOK TABLE'}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* VR FEATURE BLOCK */}
                <TouchableOpacity style={[styles.editorialCard, { borderColor: C.borderMain || '#000' }]} activeOpacity={0.9}>
                    <View style={styles.cardHeader}>
                         <View style={styles.editorialBadge}>
                            <Text style={styles.editorialBadgeText}>{t('vrTour')}</Text>
                        </View>
                    </View>
                    <Image source={{ uri: VR_IMAGE }} style={styles.editorialImage} />
                    <View style={[styles.editorialContent, { backgroundColor: C.bgCard }]}>
                        <Text style={[styles.editorialTitle, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{t('pyramidsSky')}</Text>
                        <Text style={[styles.editorialDesc, { color: C.textMuted }, isRTL && { textAlign: 'right' }]}>{t('pyramidsSkyDesc')}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.categoryGrid}>
                    {[t('categories.Pharaonic'), t('categories.Nature'), t('categories.Diving')].map((cat, i) => (
                        <TouchableOpacity key={i} style={[styles.catPill, { backgroundColor: C.bgElevated, borderColor: C.borderMain || '#000' }]}>
                            <Text style={[styles.catText, { color: C.textMain }]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontFamily: fontFamilyHeavy,
        fontSize: 32,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 4,
        letterSpacing: 1,
    },
    // Editorial Card
    editorialCard: {
        borderRadius: 24,
        borderWidth: 3,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
    },
    cardHeader: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editorialBadge: {
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fff',
    },
    editorialBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    ratingBadge: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#000',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '900',
        marginLeft: 4,
    },
    editorialImage: {
        width: '100%',
        height: 250,
    },
    editorialContent: {
        padding: SPACING.lg,
        borderTopWidth: 3,
        borderColor: '#000',
    },
    editorialTitle: {
        fontFamily: fontFamilyHeavy,
        fontSize: 28,
        fontWeight: '900',
        textTransform: 'uppercase',
        lineHeight: 32,
    },
    editorialDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
        fontWeight: '600',
    },
    editorialFooter: {
        marginTop: SPACING.lg,
    },
    playBtnPill: {
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#fff',
    },
    playBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 8,
        textTransform: 'uppercase',
    },
    // Section styles
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeading: {
        fontFamily: fontFamilyHeavy,
        fontSize: 22,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: SPACING.lg,
    },
    bentoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: 20,
        borderWidth: 2,
    },
    bentoIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#000',
    },
    bentoText: {
        flex: 1,
        marginHorizontal: SPACING.md,
    },
    bentoTitle: {
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    bentoDesc: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    // Horizontal Tour
    horizontalTour: {
        flexDirection: 'row',
        borderRadius: 20,
        borderWidth: 2,
        overflow: 'hidden',
        height: 110,
    },
    tourSideImage: {
        width: 110,
        height: '100%',
        borderRightWidth: 2,
        borderColor: '#000',
    },
    tourSideContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    tourSideTitle: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    tourMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tourMetaText: {
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 4,
    },
    miniAction: {
        alignSelf: 'flex-start',
        borderBottomWidth: 2,
        borderColor: '#CC9933',
    },
    miniActionText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#CC9933',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    catPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 2,
    },
    catText: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    // New Styles
    horizontalScroll: {
        gap: 16,
        paddingRight: SPACING.lg,
    },
    cruiseCard: {
        width: 260,
        borderRadius: 20,
        borderWidth: 2,
        overflow: 'hidden',
    },
    cruiseImage: {
        width: '100%',
        height: 150,
        borderBottomWidth: 2,
        borderColor: '#000',
    },
    cruiseBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#fff',
    },
    cruiseBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    cruiseContent: {
        padding: 12,
    },
    cruiseTitle: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    cruiseRoute: {
        fontSize: 12,
        fontWeight: '800',
        marginTop: 2,
    },
    cruiseHighlight: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        lineHeight: 14,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingSmall: {
        fontSize: 12,
        fontWeight: '900',
    },
    restCuisine: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 2,
    },
    restHighlight: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        fontStyle: 'italic',
    },
});
