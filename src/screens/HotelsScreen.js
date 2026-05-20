import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Platform, Dimensions, ScrollView, Linking, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useSettings } from '../store/SettingsContext';
import { useData } from '../store/DataContext';
import { usePlanner } from '../store/PlannerContext';
import DynamicBackground from '../components/DynamicBackground';
import CulturalInsight from '../components/CulturalInsight';
import SafeImage from '../components/SafeImage';
import { WHATSAPP_NUMBER } from '../constants/config';

export default function HotelsScreen({ route, navigation }) {
    const { settings, t, showToast } = useSettings();
    const { hotels, isLoading } = useData();
    const { addActivityToPlanner } = usePlanner();
    const filterCity = route?.params?.city;
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [minRating, setMinRating] = useState(0);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [dayNumber, setDayNumber] = useState('1');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const filteredHotels = (hotels || []).filter(hotel => {
        const matchesCity = !filterCity || hotel.city === filterCity || hotel.cityEn === filterCity;
        if (!matchesCity) return false;

        if (selectedCategory === 'All') {} 
        else if (selectedCategory === 'Hotels' && !['luxury', 'mid-range'].includes(hotel.category)) return false;
        else if (selectedCategory === 'Hostels' && !['hostel', 'budget'].includes(hotel.category)) return false;

        if (minRating > 0 && (hotel.rating || 0) < minRating) return false;

        if (selectedAmenities.length > 0) {
            const hasAll = selectedAmenities.every(a => 
                (hotel.amenities || []).some(ha => ha.toLowerCase().includes(a.toLowerCase()))
            );
            if (!hasAll) return false;
        }

        return true;
    });

    const handleAddToPlanner = (hotel) => {
        setSelectedHotel(hotel);
        setIsModalVisible(true);
    };

    const confirmAdd = () => {
        const day = parseInt(dayNumber);
        if (isNaN(day) || day < 1) {
            Alert.alert(t('error'), t('validDayNumber'));
            return;
        }

        addActivityToPlanner(day, {
            placeId: selectedHotel.id,
            time: "02:00 PM",
            type: 'hotel'
        });

        setIsModalVisible(false);
        setDayNumber('1');
        showToast(t('addedToDay') + " " + day, 'success');
    };

    const getBadgeStyle = (category) => {
        switch (category) {
            case 'luxury': return styles.luxuryBadge;
            case 'budget': return styles.budgetBadge;
            default: return styles.hostelBadge;
        }
    };

    const getBadgeLabel = (category) => {
        switch (category) {
            case 'luxury': return t('luxury');
            case 'mid-range': return t('midRange');
            case 'budget': return t('hostelCamp');
            default: return category;
        }
    };

    const [imgErrors, setImgErrors] = useState({});

    const renderHotelCard = ({ item }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: C.bgCard }]} activeOpacity={0.9}>
            <View style={styles.imageContainer}>
                <SafeImage 
                    uri={item.image}
                    style={styles.cardImage}
                    icon="hotel"
                />
                
                {/* Top Overlays */}
                <View style={[styles.cardTopOverlay, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={C.primary} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: item.category === 'luxury' ? C.primary : 'rgba(0,0,0,0.6)' }]}>
                        <Text style={[styles.categoryText, { color: item.category === 'luxury' ? '#000' : '#fff' }]}>{getBadgeLabel(item.category)}</Text>
                    </View>
                </View>

                {/* Bottom Overlay - Glassmorphism */}
                <View style={styles.cardBottomOverlay}>
                    <View style={styles.glassContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>{isRTL ? (item.nameAr || item.name) : (item.nameEn || item.name)}</Text>
                            <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Ionicons name="location-sharp" size={12} color={C.primary} />
                                <Text style={[styles.locationText, isRTL && { textAlign: 'right' }]}>{isRTL ? (item.cityAr || item.city) : (item.cityEn || item.city)}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity 
                                style={[styles.addBtnCircle, { backgroundColor: '#25D366', marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0 }]}
                                onPress={() => {
                                    const message = isRTL ? `مرحباً، أود حجز ${item.nameAr || item.name} في ${item.cityAr || item.city}.` : `Hello, I'd like to book ${item.nameEn || item.name} in ${item.cityEn || item.city}.`;
                                    Linking.openURL(`whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`).catch(() => {
                                        showToast(t('whatsappNotInstalled'), 'error');
                                    });
                                }}
                            >
                                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.addBtnCircle, { backgroundColor: '#003580', marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0 }]}
                                onPress={() => {
                                    const hotelSearchName = encodeURIComponent(item.nameEn || item.name);
                                    const bookingUrl = `https://www.booking.com/search.html?ss=${hotelSearchName}+${encodeURIComponent(item.cityEn || item.city)}+Egypt`;
                                    Linking.openURL(bookingUrl).catch(() => {
                                        showToast(t('couldNotOpenBooking'), 'error');
                                    });
                                }}
                            >
                                <Ionicons name="globe-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.addBtnCircle}
                                onPress={() => handleAddToPlanner(item)}
                            >
                                <Ionicons name="add" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
                <View style={styles.priceTag}>
                    <Text style={styles.priceAmount}>{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</Text>
                    <Text style={styles.priceUnit}> {t('currency')}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground city={filterCity} />
            <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
                    {/* Back button — only shown when navigated as Stack (from Planner) */}
                    {route?.params?.city && (
                        <TouchableOpacity
                            onPress={() => navigation?.goBack?.()}
                            style={{ width: 40, height: 40, borderRadius: 12, borderWidth: 2, borderColor: '#000', backgroundColor: C.bgCard, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={C.textMain} />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text style={[styles.title, { color: C.textMain }]}>{t('hotelsAndStays')}</Text>
                        <Text style={[styles.subtitle, { color: C.textMuted }]}>
                            {filterCity ? `📍 ${filterCity}` : t('findAccommodation')}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{ paddingBottom: SPACING.xl }}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={[styles.filterRow, isRTL && { flexDirection: 'row-reverse' }, { paddingBottom: 0 }]}
                >
                    {['All', 'Hotels', 'Hostels'].map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.filterTab,
                                { borderColor: C.borderSoft || (isDark ? '#333' : '#e0e0e0') },
                                selectedCategory === cat ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.filterTabText,
                                selectedCategory === cat ? styles.filterTabTextActive : { color: C.textMain }
                            ]}>
                                {cat === 'All' ? t('filterAll') : (cat === 'Hotels' ? t('hotelsOnly') : t('hostelsOnly'))}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <View style={{ width: 1, backgroundColor: C.borderSoft || '#333', marginVertical: 8, marginHorizontal: 4 }} />

                    {[4.5, 4.0].map((star) => (
                        <TouchableOpacity
                            key={`star-${star}`}
                            style={[
                                styles.filterTab, 
                                { borderColor: C.borderSoft || '#333', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }, 
                                minRating === star ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }
                            ]}
                            onPress={() => {
                            Haptics.selectionAsync();
                            setMinRating(prev => prev === star ? 0 : star);
                        }}
                        >
                            <Ionicons name="star" size={14} color={minRating === star ? '#000' : C.primary} />
                            <Text style={[styles.filterTabText, minRating === star ? styles.filterTabTextActive : { color: C.textMain }]}>{star}+</Text>
                        </TouchableOpacity>
                    ))}

                    <View style={{ width: 1, backgroundColor: C.borderSoft || '#333', marginVertical: 8, marginHorizontal: 4 }} />

                    {['Pool', 'WiFi', 'Nile View', 'Beach', 'Spa'].map((amenity) => {
                        const isActive = selectedAmenities.includes(amenity);
                        return (
                            <TouchableOpacity
                                key={`am-${amenity}`}
                                style={[
                                    styles.filterTab, 
                                    { borderColor: C.borderSoft || '#333' }, 
                                    isActive ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }
                                ]}
                                onPress={() => setSelectedAmenities(prev => isActive ? prev.filter(a => a !== amenity) : [...prev, amenity])}
                            >
                                <Text style={[styles.filterTabText, isActive ? styles.filterTabTextActive : { color: C.textMain }]}>{isRTL ? t(amenity) || amenity : amenity}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <FlashList
                data={filteredHotels}
                renderItem={renderHotelCard}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={400}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />
                }
            />

            {/* Cultural Floating Insight - show only if a specific city is being filtered */}
            {filterCity && <CulturalInsight city={filterCity} />}

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
                        <Text style={[styles.modalTitle, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                            {t('addToPlannerPromptTitle')}
                        </Text>
                        <TextInput
                            style={[styles.modalInput, { color: C.textMain, backgroundColor: C.bgMain, borderColor: C.borderSoft || '#e0e0e0', borderWidth: 1 }]}
                            value={dayNumber}
                            onChangeText={setDayNumber}
                            keyboardType="number-pad"
                            placeholder="1"
                            placeholderTextColor={C.textMuted}
                            autoFocus
                        />

                        <View style={[styles.modalActions, isRTL && { flexDirection: 'row-reverse' }]}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalAddBtn, { backgroundColor: C.primary }]}
                                onPress={confirmAdd}
                            >
                                <Text style={[styles.modalAddText, { color: '#000' }]}>{t('add')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.xl,
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 9999,
        borderWidth: 1,
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '700',
    },
    filterTabTextActive: {
        color: '#000',
    },
    listContent: {
        paddingHorizontal: SPACING.md,
        paddingBottom: 100,
    },
    card: {
        height: 380,
        borderRadius: 36,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    imageContainer: {
        flex: 1,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    cardTopOverlay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    cardBottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    glassContent: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
    },
    addBtnCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4CD8D0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceTag: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: '#4CD8D0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceAmount: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000',
    },
    priceUnit: {
        fontSize: 10,
        fontWeight: '800',
        color: '#000',
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
    modalCancelBtn: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#555',
    },
    modalAddBtn: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalAddText: {
        fontSize: 14,
        fontWeight: '900',
    },
    imgFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

