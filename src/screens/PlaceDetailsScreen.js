import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Modal, TextInput, Platform, StatusBar } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useUser } from '../store/UserContext';

const { width } = Dimensions.get('window');

export default function PlaceDetailsScreen({ route, navigation }) {
    const { place } = route.params;
    const { toggleFavorite, isFavorite, t, settings, addActivityToPlanner, showToast } = useUser();
    const insets = useSafeAreaInsets();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;
    const [imgError, setImgError] = useState(false);
    const placeName = isRTL ? place.name : place.nameEn;
    const placeCity = isRTL ? place.city : place.cityEn;
    const placeDesc = isRTL ? place.description : place.descriptionEn;

    const [isPlannerModalVisible, setPlannerModalVisible] = useState(false);
    const [plannerDay, setPlannerDay] = useState('');

    const handleAddToPlanner = () => {
        setPlannerDay('');
        setPlannerModalVisible(true);
    };

    const confirmAddToPlanner = () => {
        const dayNumber = parseInt(plannerDay, 10);
        if (!isNaN(dayNumber) && dayNumber > 0) {
            addActivityToPlanner(dayNumber, { placeId: place.id, time: '10:00 AM', type: 'place' });
            setPlannerModalVisible(false);
            showToast(`${placeName} ${t('addedToDay')} ${dayNumber}!`, 'success', 'calendar');
        } else {
            showToast(t('validDayNumber'), 'error', 'warning');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: C.bgMain }]}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Image Header - Full Editorial */}
                <View style={[styles.imageContainer, { borderColor: '#000' }]}>
                    {imgError ? (
                        <View style={[styles.image, styles.imgFallback, { backgroundColor: C.bgElevated }]}>
                            <Text style={styles.imgFallbackEmoji}>{place.image}</Text>
                            <Text style={[styles.imgFallbackText, { color: C.textMuted }]}>{placeName}</Text>
                        </View>
                    ) : (
                        <Image
                            source={place.imageSource ? place.imageSource : { 
                                uri: place.imageUrl,
                                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                            }}
                            style={styles.image}
                            onError={() => setImgError(true)}
                        />
                    )}
                    
                    {/* Header Controls */}
                    <View style={[styles.headerOverlay, { paddingTop: insets.top + 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <TouchableOpacity
                            style={[styles.actionCircle, { backgroundColor: '#000', borderColor: '#fff', borderWidth: 2 }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.actionCircle, { backgroundColor: '#fff', borderColor: '#000', borderWidth: 2 }]}
                            onPress={() => toggleFavorite(place.id)}
                        >
                            <Ionicons
                                name={isFavorite(place.id) ? "heart" : "heart-outline"}
                                size={24}
                                color={isFavorite(place.id) ? COLORS.error : '#000'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Floating Info Badge on Image */}
                    <View style={[styles.imageBadge, isRTL ? { left: 20 } : { right: 20 }]}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.imageBadgeText}>{place.rating}</Text>
                    </View>
                </View>

                {/* Content Block */}
                <View style={styles.detailsContainer}>
                    <View style={isRTL ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }}>
                        <Text 
                            style={[styles.title, { color: C.textMain }, isRTL && { textAlign: 'right' }]} 
                            numberOfLines={2}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.7}
                        >
                            {placeName}
                        </Text>
                        
                        <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                            <View style={[styles.cityPill, { backgroundColor: '#CC9933' }]}>
                                <Text style={styles.cityPillText}>{placeCity}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={[styles.description, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{placeDesc}</Text>

                    {/* Traveler Tip Section - TripAdvisor Inspired */}
                    {place.tip && (
                        <View style={[styles.tipCard, { backgroundColor: isDark ? '#1A1500' : '#F9F5EB', borderColor: '#CC9933' }]}>
                            <View style={[styles.tipHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Ionicons name="bulb" size={20} color="#CC9933" />
                                <Text style={[styles.tipTitle, { color: '#CC9933' }]}>{isRTL ? 'نصيحة المسافر' : 'TRAVELER TIP'}</Text>
                            </View>
                            <Text style={[styles.tipText, { color: isDark ? '#E5D5A0' : '#000' }, isRTL && { textAlign: 'right' }]}>{place.tip}</Text>
                        </View>
                    )}

                    {/* Editorial Stats Grid */}
                    <View style={[styles.statsGrid, { borderColor: '#000' }]}>
                        <View style={[styles.statItem, { backgroundColor: C.bgCard }]}>
                            <Text style={[styles.statLabel, { color: C.textMuted }]}>{t('duration')}</Text>
                            <Text style={[styles.statValue, { color: C.textMain }]}>{place.duration}</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: '#CC9933', borderColor: '#000', borderLeftWidth: 3 }]}>
                            <Text style={[styles.statLabel, { color: '#000' }]}>{t('price')}</Text>
                            <Text style={[styles.statValue, { color: '#000' }]}>{place.price}</Text>
                        </View>
                    </View>

                    {place.highlights && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{t('highlights')}</Text>
                            <View style={styles.highlightsList}>
                                {place.highlights.map((highlight, index) => (
                                    <View key={index} style={[styles.highlightCard, { borderColor: '#000', backgroundColor: C.bgCard }, isRTL && { flexDirection: 'row-reverse' }]}>
                                        <View style={styles.highlightBullet} />
                                        <Text style={[styles.highlightText, { color: C.textMain }]}>{highlight}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Community Reviews Section */}
                    <View style={styles.section}>
                         <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.sectionTitle, { color: C.textMain }]}>{isRTL ? 'آراء الزوار' : 'REVIEWS'}</Text>
                            <View style={styles.reviewCount}>
                                <Text style={styles.reviewCountText}>3</Text>
                            </View>
                        </View>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewsScroll}>
                            {[
                                { id: 1, name: 'SARAH J.', initial: 'S', rate: 5, comment: isRTL ? 'تجربة مذهلة وتفاصيل دقيقة جداً!' : 'Incredible experience! The history here is palpable.' },
                                { id: 2, name: 'AHMED M.', initial: 'A', rate: 4, comment: isRTL ? 'مكان يستحق الزيارة بكل تأكيد.' : 'Absolutely stunning, must visit.' },
                                { id: 3, name: 'ELENA R.', initial: 'E', rate: 5, comment: isRTL ? 'المرشدين هنا محترفين جداً.' : 'Great staff and very informative tours.' },
                            ].map(review => (
                                <View key={review.id} style={[styles.reviewCard, { backgroundColor: C.bgCard, borderColor: '#000' }]}>
                                    <View style={[styles.reviewTop, isRTL && { flexDirection: 'row-reverse' }]}>
                                        <View style={styles.ratingStars}>
                                            {[...Array(review.rate)].map((_, i) => (
                                                <Ionicons key={i} name="star" size={12} color="#CC9933" />
                                            ))}
                                        </View>
                                        <Text style={[styles.reviewAuthor, { color: C.textMain }]}>{review.name}</Text>
                                    </View>
                                    <Text style={[styles.reviewText, { color: C.textMuted }, isRTL && { textAlign: 'right' }]} numberOfLines={3}>"{review.comment}"</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Bar */}
            <SafeAreaView style={styles.fabWrapper} edges={['bottom']}>
                <TouchableOpacity style={[styles.fab, { backgroundColor: '#000', borderColor: '#fff' }]} onPress={handleAddToPlanner}>
                    <Text style={styles.fabText}>{t('addToItinerary')}</Text>
                    <Ionicons name="sparkles" size={20} color="#CC9933" style={{ marginLeft: 12 }} />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Planner Modal */}
            <Modal visible={isPlannerModalVisible} animationType="fade" transparent={true} onRequestClose={() => setPlannerModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: C.bgCard, borderColor: '#000' }]}>
                        <Text style={[styles.modalTitle, isRTL && { textAlign: 'right' }, { color: C.textMain }]}>{t('addToPlannerPromptTitle')}</Text>
                        <TextInput
                            style={[styles.modalInput, isRTL && { textAlign: 'right' }, { backgroundColor: C.bgMain, borderColor: '#000', color: C.textMain }]}
                            placeholder={t('dayPlaceholder')}
                            placeholderTextColor={C.textMuted}
                            keyboardType="number-pad"
                            value={plannerDay}
                            onChangeText={setPlannerDay}
                            autoFocus
                        />
                        <View style={[styles.modalActions, isRTL && { flexDirection: 'row-reverse' }]}>
                            <TouchableOpacity style={[styles.modalBtn, { borderColor: '#000' }]} onPress={() => setPlannerModalVisible(false)}>
                                <Text style={[styles.modalBtnText, { color: C.textMuted }]}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#000', borderColor: '#fff' }]} onPress={confirmAddToPlanner}>
                                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t('add')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 150,
    },
    imageContainer: {
        height: 500,
        width: '100%',
        borderBottomWidth: 4,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    actionCircle: {
        width: 54,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageBadge: {
        position: 'absolute',
        bottom: 24,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    imageBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 6,
    },
    detailsContainer: {
        padding: SPACING.lg,
        marginTop: -30, // Overlap effect
    },
    title: {
        fontFamily: FONTS.heavy,
        fontSize: 42,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: -1.5,
        lineHeight: 44,
        backgroundColor: '#fff', 
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 3,
        borderColor: '#000',
        alignSelf: 'flex-start',
        maxWidth: width - 40,
    },
    locationRow: {
        marginTop: 12,
        marginBottom: SPACING.xl,
    },
    cityPill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#000',
    },
    cityPillText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600',
        marginBottom: SPACING.lg,
    },
    tipCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginBottom: SPACING.xl,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipTitle: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        marginLeft: 8,
    },
    tipText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    statsGrid: {
        flexDirection: 'row',
        borderWidth: 3,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
    },
    statItem: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        fontFamily: FONTS.heavy,
        fontSize: 22,
        fontWeight: '900',
    },
    section: {
        marginTop: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontFamily: FONTS.heavy,
        fontSize: 24,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    reviewCount: {
        backgroundColor: '#000',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    reviewCountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    highlightsList: {
        gap: 10,
    },
    highlightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 2,
        borderRadius: 12,
    },
    highlightBullet: {
        width: 8,
        height: 8,
        backgroundColor: '#CC9933',
        marginHorizontal: 12,
    },
    highlightText: {
        fontSize: 14,
        fontWeight: '800',
        flex: 1,
    },
    reviewsScroll: {
        gap: 16,
        paddingRight: SPACING.lg,
    },
    reviewCard: {
        width: 280,
        padding: 20,
        borderRadius: 24,
        borderWidth: 3,
    },
    reviewTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingStars: {
        flexDirection: 'row',
    },
    reviewAuthor: {
        fontSize: 12,
        fontWeight: '900',
    },
    reviewText: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    fabWrapper: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    },
    fab: {
        height: 64,
        borderRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    fabText: {
        color: '#fff',
        fontFamily: FONTS.heavy,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modalContent: {
        width: '100%',
        borderWidth: 3,
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontFamily: FONTS.heavy,
        fontSize: 24,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: 20,
    },
    modalInput: {
        height: 60,
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        height: 54,
        borderRadius: 27,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBtnText: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    imgFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgFallbackEmoji: {
        fontSize: 80,
        marginBottom: 10,
    },
    imgFallbackText: {
        fontSize: 24,
        fontWeight: '900',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
});
