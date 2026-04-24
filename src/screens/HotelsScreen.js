import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useUser } from '../store/UserContext';
import { HOTELS } from '../constants/hotelsData';
import Watermark from '../components/Watermark';

export default function HotelsScreen() {
    const { settings, addActivityToPlanner, t, showToast } = useUser();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [dayNumber, setDayNumber] = useState('1');

    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const filteredHotels = HOTELS.filter(hotel => {
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
        <TouchableOpacity style={[styles.card, { backgroundColor: C.bgCard, borderColor: '#000', borderWidth: 2 }]} activeOpacity={0.9}>
            <View style={styles.imageContainer}>
                {imgErrors[item.id] ? (
                    <View style={[styles.cardImage, styles.imgFallback, { backgroundColor: C.bgElevated }]}>
                        <Ionicons name="business" size={48} color={C.textMuted} />
                        <Text style={[styles.imgFallbackText, { color: C.textMuted }]}>{item.name}</Text>
                    </View>
                ) : (
                    <Image 
                        source={{ uri: item.image, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }} 
                        style={styles.cardImage}
                        onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                    />
                )}
                
                {/* Category Badge */}
                <View style={[styles.categoryBadge, getBadgeStyle(item.category)]}>
                    <Text style={styles.categoryText}>{getBadgeLabel(item.category)}</Text>
                </View>

                {/* Price - fixed to bottom of image */}
                <View style={styles.priceBadge}>
                    <Text style={styles.priceAmount}>{item.price.toLocaleString()}</Text>
                    <Text style={styles.priceUnit}> {t('egpPerNight')}</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>{item.name}</Text>
                <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Ionicons name="location" size={14} color={C.textMuted} />
                    <Text style={[styles.locationText, { color: C.textMuted }, isRTL ? { marginRight: 4 } : { marginLeft: 4 }]}>{item.city}</Text>
                </View>

                {/* Rating & Amenities */}
                <View style={[styles.ratingRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.rating, { backgroundColor: C.bgElevated, borderColor: '#000', borderWidth: 1.5 }]}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={[styles.ratingText, { color: C.textMain }]}>{item.rating}</Text>
                    </View>
                    <View style={[styles.amenities, isRTL && { flexDirection: 'row-reverse' }]}>
                        {item.amenities.slice(0, 2).map((a, i) => (
                            <Text key={i} style={[styles.amenityText, { color: C.textMuted, backgroundColor: C.bgElevated, borderColor: '#000', borderWidth: 1 }]}>{a}</Text>
                        ))}
                    </View>
                </View>

                {/* Action Button - Brutalist Style */}
                <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: C.gold }]}
                    onPress={() => handleAddToPlanner(item)}
                >
                    <Ionicons name="calendar-outline" size={20} color="#000" style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                    <Text style={styles.bookButtonText}>{t('addToItinerary')}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <Watermark />
            <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.title, { color: C.textMain }]}>{t('hotelsAndStays')}</Text>
                <Text style={[styles.subtitle, { color: C.textMuted }]}>{t('findAccommodation')}</Text>
            </View>

            <View style={[styles.filterRow, isRTL && { flexDirection: 'row-reverse' }]}>
                {['All', 'Hotels', 'Hostels'].map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.filterTab,
                            { borderColor: '#000' },
                            selectedCategory === cat ? styles.filterTabActive : { backgroundColor: C.bgCard }
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

            {/* Day Picker Modal */}
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
                        <Text style={[styles.modalMessage, { color: C.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                            {t('addToPlannerPromptMessage')}
                        </Text>

                        <TextInput
                            style={[styles.modalInput, { color: C.textMain, borderColor: '#000', backgroundColor: C.bgElevated }]}
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
                                <Text style={[styles.modalCancelText, { color: C.textMuted }]}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalAddBtn}
                                onPress={confirmAdd}
                            >
                                <Text style={styles.modalAddText}>{t('add')}</Text>
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
        padding: SPACING.lg,
        paddingTop: 10,
    },
    title: {
        fontFamily: FONTS.heavy,
        fontSize: 34,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    imageContainer: {
        height: 240,
        width: '100%',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    categoryBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
    },
    luxuryBadge: {
        backgroundColor: '#CC9933',
    },
    budgetBadge: {
        backgroundColor: '#000',
    },
    hostelBadge: {
        backgroundColor: '#000',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#fff',
        textTransform: 'uppercase',
    },
    priceBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#000',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'baseline',
        borderWidth: 1,
        borderColor: '#fff',
    },
    priceAmount: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    priceUnit: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardContent: {
        padding: SPACING.lg,
    },
    cardTitle: {
        fontFamily: FONTS.heavy,
        fontSize: 22,
        fontWeight: '900',
        textTransform: 'uppercase',
        lineHeight: 26,
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 4,
    },
    amenities: {
        flexDirection: 'row',
        gap: 6,
    },
    amenityText: {
        fontSize: 11,
        fontWeight: '800',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        textTransform: 'uppercase',
    },
    bookButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    bookButtonText: {
        fontSize: 15,
        fontWeight: '900',
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    imgFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgFallbackText: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        gap: SPACING.sm,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    filterTabActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    filterTabTextActive: {
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    modalContent: {
        borderRadius: 24,
        padding: SPACING.xl,
        width: '100%',
        maxWidth: 400,
        borderWidth: 3,
        borderColor: '#000',
    },
    modalTitle: {
        fontFamily: FONTS.heavy,
        fontSize: 24,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: SPACING.md,
    },
    modalMessage: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    modalInput: {
        borderWidth: 2,
        borderRadius: 16,
        padding: SPACING.lg,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: SPACING.xl,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.lg,
    },
    modalCancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    modalAddBtn: {
        backgroundColor: '#000',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#fff',
    },
    modalAddText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
});
