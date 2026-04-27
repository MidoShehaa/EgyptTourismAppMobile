import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Modal, TextInput, Platform, StatusBar } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useUser } from '../store/UserContext';
import CulturalInsight from '../components/CulturalInsight';
import PharaonicBackground from '../components/PharaonicBackground';

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
            <PharaonicBackground />
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Image Header - Immersive */}
                <View style={styles.imageContainer}>
                    {imgError ? (
                        <View style={[styles.image, styles.imgFallback, { backgroundColor: C.bgElevated }]}>
                            <Ionicons name="image-outline" size={80} color={C.textMuted} />
                        </View>
                    ) : (
                        place.images && place.images.length > 1 ? (
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                style={styles.image}
                            >
                                {place.images.map((imgUrl, idx) => (
                                    <Image
                                        key={idx}
                                        source={{ 
                                            uri: imgUrl,
                                            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                                        }}
                                        style={{ width: width, height: 500, resizeMode: 'cover' }}
                                        onError={() => setImgError(true)}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <Image
                                source={place.imageSource ? place.imageSource : { 
                                    uri: place.imageUrl,
                                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                                }}
                                style={styles.image}
                                onError={() => setImgError(true)}
                            />
                        )
                    )}
                    
                    {/* Header Controls */}
                    <View style={[styles.headerOverlay, { paddingTop: insets.top + 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <BlurView intensity={40} tint="dark" style={styles.actionCircle}>
                                <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={22} color="#fff" />
                            </BlurView>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => toggleFavorite(place.id)}>
                            <BlurView intensity={40} tint="dark" style={styles.actionCircle}>
                                <Ionicons
                                    name={isFavorite(place.id) ? "heart" : "heart-outline"}
                                    size={22}
                                    color={isFavorite(place.id) ? '#FF5252' : '#fff'}
                                />
                            </BlurView>
                        </TouchableOpacity>
                    </View>

                    {/* Immersive Rating Overlay */}
                    <BlurView intensity={50} tint="dark" style={[styles.imageBadge, isRTL ? { left: 20 } : { right: 20 }]}>
                        <Ionicons name="star" size={14} color={C.primary} />
                        <Text style={styles.imageBadgeText}>{place.rating}</Text>
                    </BlurView>
                </View>


                {/* Content Block */}
                <View style={[styles.detailsContainer, { backgroundColor: C.bgMain }]}>
                    <View style={isRTL ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }}>
                        <Text style={[styles.title, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>
                            {placeName}
                        </Text>
                        
                        <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Ionicons name="location-sharp" size={16} color={C.primary} />
                            <Text style={[styles.locationText, { color: C.textMuted }]}>{placeCity}</Text>
                        </View>
                    </View>


                    <Text style={[styles.description, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{placeDesc}</Text>

                    {/* Traveler Tip Section - TripAdvisor Inspired */}
                    {place.tip && (
                        <View style={[styles.tipCard, { backgroundColor: C.bgElevated }]}>
                            <View style={[styles.tipHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Ionicons name="bulb" size={20} color={C.primary} />
                                <Text style={[styles.tipTitle, { color: C.primary }]}>{isRTL ? 'نصيحة المسافر' : 'TRAVELER TIP'}</Text>
                            </View>
                            <Text style={[styles.tipText, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{place.tip}</Text>
                        </View>
                    )}


                    {/* Stats Grid - Premium Cards */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statItem, { backgroundColor: C.bgElevated }]}>
                            <Ionicons name="time-outline" size={20} color={C.primary} />
                            <Text style={[styles.statValue, { color: C.textMain }]}>{place.duration}</Text>
                            <Text style={[styles.statLabel, { color: C.textMuted }]}>{t('duration')}</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: C.bgElevated }]}>
                            <Ionicons name="ticket-outline" size={20} color={C.primary} />
                            <Text style={[styles.statValue, { color: C.textMain }]}>{place.price}</Text>
                            <Text style={[styles.statLabel, { color: C.textMuted }]}>{t('price')}</Text>
                        </View>
                    </View>


                    {place.highlights && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{t('highlights')}</Text>
                            <View style={styles.highlightsList}>
                                {place.highlights.map((highlight, index) => (
                                    <View key={index} style={[styles.highlightCard, { backgroundColor: C.bgElevated }, isRTL && { flexDirection: 'row-reverse' }]}>
                                        <Ionicons name="checkmark-circle" size={18} color={C.primary} />
                                        <Text style={[styles.highlightText, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{highlight}</Text>
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
                <TouchableOpacity style={[styles.fab, { backgroundColor: C.primary }]} onPress={handleAddToPlanner}>
                    <Text style={[styles.fabText, { color: '#000' }]}>{t('addToItinerary')}</Text>
                    <Ionicons name="calendar-outline" size={20} color="#000" style={{ marginLeft: 12 }} />
                </TouchableOpacity>
            </SafeAreaView>


            {/* Cultural Floating Insight */}
            <CulturalInsight city={place.cityEn} />

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
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imageBadge: {
        position: 'absolute',
        bottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    imageBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 6,
    },
    detailsContainer: {
        padding: SPACING.lg,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 38,
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.xl,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '700',
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        fontWeight: '500',
        opacity: 0.8,
        marginBottom: SPACING.xl,
    },
    tipCard: {
        padding: 20,
        borderRadius: 24,
        marginBottom: SPACING.xl,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    tipTitle: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        marginLeft: 8,
    },
    tipText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: SPACING.xl,
    },
    statItem: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        gap: 8,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    statValue: {
        fontSize: 18,
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
        fontSize: 22,
        fontWeight: '900',
    },
    reviewCount: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 10,
    },
    reviewCountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    highlightsList: {
        gap: 12,
    },
    highlightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 12,
    },
    highlightText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    reviewsScroll: {
        gap: 16,
        paddingRight: SPACING.lg,
    },
    reviewCard: {
        width: 280,
        padding: 20,
        borderRadius: 32,
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
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        opacity: 0.7,
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
        shadowColor: '#4CD8D0',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    fabText: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modalContent: {
        width: '100%',
        borderRadius: 32,
        padding: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 20,
    },
    modalInput: {
        height: 60,
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBtnText: {
        fontSize: 14,
        fontWeight: '900',
    },
    imgFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

