import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Modal, TextInput, Platform, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useUser } from '../store/UserContext';
import PharaonicBackground from '../components/PharaonicBackground';
import CulturalInsight from '../components/CulturalInsight';

export default function HotelsScreen({ route, navigation }) {
    const { settings, addActivityToPlanner, t, showToast, hotels, isLoading } = useUser();
    const filterCity = route?.params?.city;
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [dayNumber, setDayNumber] = useState('1');

    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const filteredHotels = (hotels || []).filter(hotel => {
        const matchesCity = !filterCity || hotel.city === filterCity || hotel.cityEn === filterCity;
        if (!matchesCity) return false;

        if (selectedCategory === 'All') return true;
        if (selectedCategory === 'Hotels') return ['luxury', 'mid-range'].includes(hotel.category);
        if (selectedCategory === 'Hostels') return ['hostel', 'budget'].includes(hotel.category);
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
                {imgErrors[item.id] ? (
                    <View style={[styles.cardImage, styles.imgFallback, { backgroundColor: C.bgElevated }]}>
                        <Ionicons name="business-outline" size={48} color={C.textMuted} />
                    </View>
                ) : (
                    <Image 
                        source={{ uri: item.image, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }} 
                        style={styles.cardImage}
                        onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                    />
                )}
                
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
                        <TouchableOpacity 
                            style={styles.addBtnCircle}
                            onPress={() => handleAddToPlanner(item)}
                        >
                            <Ionicons name="add" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.priceTag}>
                    <Text style={styles.priceAmount}>{item.price.toLocaleString()}</Text>
                    <Text style={styles.priceUnit}> {t('currency')}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <PharaonicBackground />
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

            <View style={[styles.filterRow, isRTL && { flexDirection: 'row-reverse' }]}>
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
            </View>

            <FlatList
                data={filteredHotels}
                renderItem={renderHotelCard}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
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
        paddingVertical: 10,
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
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
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

