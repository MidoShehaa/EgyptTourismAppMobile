import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Modal, TextInput, Platform, StatusBar, Animated } from 'react-native';
import Reanimated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, DARK_COLORS, SPACING, getFontFamily } from '../constants/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSettings } from '../store/SettingsContext';
import { usePlanner } from '../store/PlannerContext';
import CulturalInsight from '../components/CulturalInsight';
import DynamicBackground from '../components/DynamicBackground';
import SafeImage from '../components/SafeImage';
import WeatherWidget from '../components/WeatherWidget';
import ReviewSection from '../components/ReviewSection';

const { width } = Dimensions.get('window');

export default function PlaceDetailsScreen({ route, navigation }) {
    const { place } = route.params;
    const { toggleFavorite, isFavorite, addActivityToPlanner } = usePlanner();
    const { t, settings, showToast } = useSettings();
    const insets = useSafeAreaInsets();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;
    const placeName = isRTL ? place.name : place.nameEn;
    const placeCity = isRTL ? place.city : place.cityEn;
    const placeDesc = isRTL ? place.description : place.descriptionEn;

    const [isPlannerModalVisible, setPlannerModalVisible] = useState(false);
    const [plannerDay, setPlannerDay] = useState('');
    const [isImageViewerVisible, setImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const favoriteScale = useRef(new Animated.Value(1)).current;

    const imageList = place.gallery || [place.imageUrl].filter(Boolean);

    const handleToggleFavorite = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleFavorite(place.id);
        Animated.sequence([
            Animated.timing(favoriteScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
            Animated.spring(favoriteScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true })
        ]).start();
    };

    const handleAddToPlanner = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setPlannerDay('');
        setPlannerModalVisible(true);
    };

    const confirmAddToPlanner = () => {
        const dayNumber = parseInt(plannerDay, 10);
        if (!isNaN(dayNumber) && dayNumber > 0 && dayNumber <= 30) {
            addActivityToPlanner(dayNumber, { placeId: place.id, time: '09:00 AM', type: 'place' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPlannerModalVisible(false);
            showToast(`${placeName} ${t('addedToDay')} ${dayNumber}! 🗓️`, 'success', 'calendar');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showToast(t('validDayNumber'), 'error', 'warning');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: C.bgMain }]}>
            <DynamicBackground category={place.category} city={place.cityEn || place.city} />
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Image Header - Immersive */}
                <View style={styles.imageContainer}>
                    {imageList.length > 1 ? (
                        <View style={{ flex: 1 }}>
                            <ScrollView 
                                horizontal 
                                pagingEnabled 
                                showsHorizontalScrollIndicator={false}
                                onScroll={(e) => {
                                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                    setCurrentImageIndex(index);
                                }}
                                scrollEventThrottle={16}
                                style={styles.image}
                            >
                                {imageList.map((img, idx) => (
                                    <TouchableOpacity key={idx} activeOpacity={0.9} onPress={() => { setCurrentImageIndex(idx); setImageViewerVisible(true); }} style={{ width }}>
                                        <SafeImage 
                                            uri={img}
                                            style={{ width, height: '100%' }}
                                            icon="place"
                                            iconSize={80}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <View style={[styles.paginationDots, { bottom: 60, position: 'absolute', width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 8 }]} pointerEvents="none">
                                {imageList.map((_, i) => (
                                    <View key={i} style={[styles.dot, currentImageIndex === i ? { backgroundColor: C.primary, width: 24 } : { backgroundColor: 'rgba(255,255,255,0.4)', width: 8 }]} />
                                ))}
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity activeOpacity={0.9} onPress={() => setImageViewerVisible(true)}>
                            <SafeImage 
                                uri={imageList[0]}
                                style={styles.image}
                                icon="place"
                                iconSize={80}
                            />
                        </TouchableOpacity>
                    )}
                    <View style={[styles.tapHint, isRTL ? { left: 20 } : { right: 20 }, { bottom: imageList.length > 1 ? 80 : 50 }]} pointerEvents="none">
                        <Ionicons name="expand-outline" size={16} color="#fff" />
                    </View>
                    
                    {/* Header Controls */}
                    <View style={[styles.headerOverlay, { paddingTop: insets.top + 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <BlurView intensity={40} tint="dark" style={styles.actionCircle}>
                                <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={22} color="#fff" />
                            </BlurView>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={handleToggleFavorite}>
                            <BlurView intensity={40} tint="dark" style={styles.actionCircle}>
                                <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
                                    <Ionicons
                                        name={isFavorite(place.id) ? "heart" : "heart-outline"}
                                        size={22}
                                        color={isFavorite(place.id) ? '#FF5252' : '#fff'}
                                    />
                                </Animated.View>
                            </BlurView>
                        </TouchableOpacity>
                    </View>

                    {/* Immersive Rating Overlay */}
                    <BlurView intensity={50} tint="dark" style={[styles.imageBadge, isRTL ? { left: 20 } : { right: 20 }]}>
                        <Ionicons name="star" size={14} color={C.primary} />
                        <Text style={[styles.imageBadgeText, { fontFamily: getFontFamily(isRTL, 'bold') }]}>{place.rating}</Text>
                    </BlurView>
                </View>


                {/* Content Block */}
                <Reanimated.View 
                    entering={SlideInUp.duration(500).springify().damping(18)}
                    style={[styles.detailsContainer, { backgroundColor: C.bgMain }]}
                >
                    <View style={isRTL ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }}>
                        <Text style={[styles.title, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }, isRTL && { textAlign: 'right' }]}>
                            {placeName}
                        </Text>
                        
                        <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Ionicons name="location-sharp" size={16} color={C.primary} />
                            <Text style={[styles.locationText, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'semibold') }]}>{placeCity}</Text>
                        </View>
                    </View>


                    <Text style={[styles.description, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'regular') }, isRTL && { textAlign: 'right' }]}>{placeDesc}</Text>

                    {/* Traveler Tip Section - TripAdvisor Inspired */}
                    {place.tip && (
                        <View style={[styles.tipCard, { backgroundColor: C.bgElevated }]}>
                            <View style={[styles.tipHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Ionicons name="bulb" size={20} color={C.primary} />
                                <Text style={[styles.tipTitle, { color: C.primary, fontFamily: getFontFamily(isRTL, 'bold') }]}>{t('travelTip') || 'TRAVELER TIP'}</Text>
                            </View>
                            <Text style={[styles.tipText, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'medium') }, isRTL && { textAlign: 'right' }]}>{place.tip}</Text>
                        </View>
                    )}


                    {/* Stats Grid - Premium Cards */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statItem, { backgroundColor: C.bgElevated }]}>
                            <Ionicons name="time-outline" size={20} color={C.primary} />
                            <Text style={[styles.statValue, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{place.duration}</Text>
                            <Text style={[styles.statLabel, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'semibold') }]}>{t('duration')}</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: C.bgElevated }]}>
                            <Ionicons name="ticket-outline" size={20} color={C.primary} />
                            <Text style={[styles.statValue, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{place.price}</Text>
                            <Text style={[styles.statLabel, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'semibold') }]}>{t('price')}</Text>
                        </View>
                        {place.openingHours && (
                            <View style={[styles.statItem, { backgroundColor: C.bgElevated }]}>
                                <Ionicons name="calendar-outline" size={20} color={C.primary} />
                                <Text style={[styles.statValue, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{place.openingHours}</Text>
                                <Text style={[styles.statLabel, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'semibold') }]}>{t('openingHours') || 'Hours'}</Text>
                            </View>
                        )}
                    </View>

                    {/* Weather for this city */}
                    <View style={{ marginTop: 16 }}>
                        <WeatherWidget city={place.cityEn || place.city} colors={C} isRTL={isRTL} />
                    </View>


                    {place.highlights && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }, isRTL && { textAlign: 'right' }]}>{t('highlights')}</Text>
                            <View style={styles.highlightsList}>
                                {place.highlights.map((highlight, index) => (
                                    <View key={index} style={[styles.highlightCard, { backgroundColor: C.bgElevated }, isRTL && { flexDirection: 'row-reverse' }]}>
                                        <Ionicons name="checkmark-circle" size={18} color={C.primary} />
                                        <Text style={[styles.highlightText, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'medium') }, isRTL && { textAlign: 'right' }]}>{highlight}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <ReviewSection placeId={place.id} />

                </Reanimated.View>
            </ScrollView>

            {/* Floating Action Bar */}
            <SafeAreaView style={styles.fabWrapper} edges={['bottom']}>
                <Reanimated.View entering={FadeInDown.delay(300).duration(500).springify()}>
                    <TouchableOpacity style={[styles.fab, { backgroundColor: C.primary }]} onPress={handleAddToPlanner}>
                        <Text style={[styles.fabText, { color: '#000', fontFamily: getFontFamily(isRTL, 'bold') }]}>{t('addToItinerary')}</Text>
                        <Ionicons name="calendar-outline" size={20} color="#000" style={{ marginLeft: 12 }} />
                    </TouchableOpacity>
                </Reanimated.View>
            </SafeAreaView>

            {/* Cultural Floating Insight */}
            <CulturalInsight city={place.cityEn} />

            {/* Planner Modal */}
            <Modal visible={isPlannerModalVisible} animationType="fade" transparent={true} onRequestClose={() => setPlannerModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: 'rgba(18, 18, 18, 0.95)' }]}>
                        <Text style={[styles.modalTitle, isRTL && { textAlign: 'right' }, { color: C.textMain }]}>{t('addToPlannerPromptTitle')}</Text>
                        <TextInput
                            style={[styles.modalInput, isRTL && { textAlign: 'right' }, { backgroundColor: 'rgba(0,0,0,0.5)', color: C.textMain }]}
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

            {/* Full-Screen Image Viewer */}
            <Modal visible={isImageViewerVisible} animationType="fade" transparent={true} onRequestClose={() => setImageViewerVisible(false)}>
                <View style={styles.imageViewerOverlay}>
                    <TouchableOpacity style={styles.imageViewerClose} onPress={() => setImageViewerVisible(false)}>
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>
                    {imageList.length > 1 ? (
                        <ScrollView 
                            horizontal 
                            pagingEnabled 
                            showsHorizontalScrollIndicator={false}
                            contentOffset={{ x: currentImageIndex * width, y: 0 }}
                            onScroll={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(index);
                            }}
                            scrollEventThrottle={16}
                            style={{ flex: 1, width }}
                        >
                            {imageList.map((img, idx) => (
                                <View key={idx} style={{ width, justifyContent: 'center', alignItems: 'center' }}>
                                    <SafeImage 
                                        uri={img} 
                                        style={styles.imageViewerImage} 
                                        resizeMode="contain" 
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <SafeImage
                            uri={imageList[0]}
                            style={styles.imageViewerImage}
                            icon="place"
                            iconSize={120}
                        />
                    )}
                    <View style={styles.imageViewerCaption} pointerEvents="none">
                        <Text style={styles.imageViewerText}>{placeName}</Text>
                        <Text style={styles.imageViewerSubtext}>{placeCity}</Text>
                        {imageList.length > 1 && (
                            <View style={[styles.paginationDots, { marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                                {imageList.map((_, i) => (
                                    <View key={i} style={[styles.dot, currentImageIndex === i ? { backgroundColor: C.primary, width: 24 } : { backgroundColor: 'rgba(255,255,255,0.4)', width: 8 }]} />
                                ))}
                            </View>
                        )}
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
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
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
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    highlightText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
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
    tapHint: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageViewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageViewerClose: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageViewerImage: {
        width: width,
        height: width * 0.75,
        resizeMode: 'contain',
    },
    imageViewerCaption: {
        position: 'absolute',
        bottom: 80,
        alignItems: 'center',
    },
    imageViewerText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
    },
    imageViewerSubtext: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
});

