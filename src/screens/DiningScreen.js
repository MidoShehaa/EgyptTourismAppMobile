import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING } from '../constants/theme';
import { useUser } from '../store/UserContext';
import DynamicBackground from '../components/DynamicBackground';
import SafeImage from '../components/SafeImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DiningScreen({ route, navigation }) {
    const { settings, addActivityToPlanner, t, showToast, restaurants } = useUser();
    const filterMeal = route?.params?.meal || 'All';
    const filterCity = route?.params?.city;

    const [selectedMeal, setSelectedMeal] = useState(filterMeal);
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [dayNumber, setDayNumber] = useState('1');

    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    // Get unique cuisines for the filter
    const cuisines = useMemo(() => {
        const cSet = new Set();
        (restaurants || []).forEach(r => {
            if (r.cuisine) cSet.add(r.cuisine);
        });
        return Array.from(cSet).sort();
    }, [restaurants]);

    const filteredRestaurants = useMemo(() => {
        return (restaurants || []).filter(r => {
            const matchesCity = !filterCity || r.city === filterCity || r.cityEn === filterCity;
            const matchesMeal = selectedMeal === 'All' || r.meal === selectedMeal;
            const matchesCuisine = selectedCuisine === 'All' || r.cuisine === selectedCuisine;
            
            return matchesCity && matchesMeal && matchesCuisine;
        });
    }, [restaurants, filterCity, selectedMeal, selectedCuisine]);

    const handleAddToPlanner = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setIsModalVisible(true);
    };

    const confirmAdd = () => {
        const day = parseInt(dayNumber);
        if (isNaN(day) || day < 1) {
            Alert.alert(t('error'), t('validDayNumber') || 'Enter a valid day number');
            return;
        }

        addActivityToPlanner(day, {
            placeId: selectedRestaurant.id,
            time: selectedRestaurant.meal === 'Breakfast' ? '09:00 AM' : (selectedRestaurant.meal === 'Lunch' ? '02:00 PM' : '08:00 PM'),
            type: 'restaurant'
        });

        setIsModalVisible(false);
        setDayNumber('1');
        showToast((t('addedToDay') || 'Added to Day') + " " + day, 'success');
    };

    const [imgErrors, setImgErrors] = useState({});

    const renderRestaurantCard = ({ item }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: C.bgCard }]} activeOpacity={0.9}>
            <View style={styles.imageContainer}>
                <SafeImage 
                    uri={item.image}
                    style={styles.cardImage}
                    icon="restaurant"
                />
                
                {/* Top Overlays */}
                <View style={[styles.cardTopOverlay, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={C.primary} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: C.primary }]}>
                        <Text style={[styles.categoryText, { color: '#000' }]}>{isRTL ? (item.meal === 'Breakfast' ? 'فطار' : item.meal === 'Lunch' ? 'غداء' : 'عشاء') : item.meal}</Text>
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
                            <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }, { marginTop: 4 }]}>
                                <Ionicons name="restaurant" size={12} color={C.gold} />
                                <Text style={[styles.locationText, isRTL && { textAlign: 'right' }, { color: C.gold }]}>{item.cuisine} • {item.highlightDish}</Text>
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
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground city={filterCity} />
            <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={{ width: 40, height: 40, borderRadius: 12, borderWidth: 2, borderColor: '#000', backgroundColor: C.bgCard, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={C.textMain} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.title, { color: C.textMain }]}>{isRTL ? 'المطاعم والكافيهات' : 'Dining & Cafes'}</Text>
                        <Text style={[styles.subtitle, { color: C.textMuted }]}>
                            {filterCity ? `📍 ${filterCity}` : (isRTL ? 'اكتشف أفضل الأكلات' : 'Discover the best tastes')}
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
                    {['All', 'Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                        <TouchableOpacity
                            key={meal}
                            style={[
                                styles.filterTab,
                                { borderColor: C.borderSoft || (isDark ? '#333' : '#e0e0e0') },
                                selectedMeal === meal ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }
                            ]}
                            onPress={() => setSelectedMeal(meal)}
                        >
                            <Text style={[
                                styles.filterTabText,
                                selectedMeal === meal ? styles.filterTabTextActive : { color: C.textMain }
                            ]}>
                                {meal === 'All' ? (isRTL ? 'الكل' : 'All') : (isRTL ? (meal === 'Breakfast' ? 'فطار' : meal === 'Lunch' ? 'غداء' : 'عشاء') : meal)}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <View style={{ width: 1, backgroundColor: C.borderSoft || '#333', marginVertical: 8, marginHorizontal: 4 }} />

                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            { borderColor: C.borderSoft || (isDark ? '#333' : '#e0e0e0') },
                            selectedCuisine === 'All' ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }
                        ]}
                        onPress={() => setSelectedCuisine('All')}
                    >
                        <Text style={[
                            styles.filterTabText,
                            selectedCuisine === 'All' ? styles.filterTabTextActive : { color: C.textMain }
                        ]}>
                            {isRTL ? 'كل الأكلات' : 'All Cuisines'}
                        </Text>
                    </TouchableOpacity>

                    {cuisines.map((c) => (
                        <TouchableOpacity
                            key={c}
                            style={[
                                styles.filterTab, 
                                { borderColor: C.borderSoft || '#333' }, 
                                selectedCuisine === c ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }
                            ]}
                            onPress={() => setSelectedCuisine(c)}
                        >
                            <Text style={[styles.filterTabText, selectedCuisine === c ? styles.filterTabTextActive : { color: C.textMain }]}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredRestaurants}
                renderItem={renderRestaurantCard}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={{ color: C.textMuted, textAlign: 'center', marginTop: 40 }}>{isRTL ? 'لا توجد نتائج' : 'No results found'}</Text>}
            />

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
                        <Text style={[styles.modalTitle, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                            {t('addToPlannerPromptTitle') || 'Add to Planner (Day Number)'}
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
                                <Text style={styles.modalCancelText}>{t('cancel') || 'Cancel'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalAddBtn, { backgroundColor: C.primary }]}
                                onPress={confirmAdd}
                            >
                                <Text style={[styles.modalAddText, { color: '#000' }]}>{t('add') || 'Add'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: SPACING.lg, paddingBottom: SPACING.md, paddingHorizontal: SPACING.md },
    title: { fontSize: 24, fontWeight: '900' },
    subtitle: { fontSize: 14, fontWeight: '600', marginTop: 2 },
    filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl, gap: 12 },
    filterTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9999, borderWidth: 1 },
    filterTabText: { fontSize: 13, fontWeight: '700' },
    filterTabTextActive: { color: '#000' },
    listContent: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
    card: { height: 320, borderRadius: 36, overflow: 'hidden', marginBottom: SPACING.xl, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    imageContainer: { flex: 1 },
    cardImage: { width: '100%', height: '100%', position: 'absolute' },
    cardTopOverlay: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
    ratingText: { color: '#fff', fontSize: 12, fontWeight: '900' },
    categoryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    categoryText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    cardBottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
    glassContent: { backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
    addBtnCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4CD8D0', justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 30 },
    modalContent: { width: '100%', borderRadius: 32, padding: 24 },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
    modalInput: { height: 60, borderRadius: 16, paddingHorizontal: 20, fontSize: 18, fontWeight: '700', marginBottom: 24 },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalCancelBtn: { flex: 1, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    modalCancelText: { fontSize: 14, fontWeight: '900', color: '#555' },
    modalAddBtn: { flex: 1, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    modalAddText: { fontSize: 14, fontWeight: '900' },
    imgFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
