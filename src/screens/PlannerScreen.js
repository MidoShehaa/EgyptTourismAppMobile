import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal, Animated, Platform, StatusBar, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { places, CATEGORIES } from '../constants/placesData';
import { HOTELS } from '../constants/hotelsData';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import Watermark from '../components/Watermark';
import { SUGGESTED_PLANS } from '../constants/itinerarySuggestions';

export default function PlannerScreen({ navigation }) {
    const { itinerary, removeActivityFromPlanner, updateItinerary, t, settings, showToast } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [isWizardVisible, setIsWizardVisible] = useState(false);
    const [duration, setDuration] = useState(3);
    const [selectedInterests, setSelectedInterests] = useState([]);

    const toggleInterest = (category) => {
        setSelectedInterests(prev =>
            prev.includes(category)
                ? prev.filter(i => i !== category)
                : [...prev, category]
        );
    };

    const addHoursToTime = (startTimeStr, hoursToAdd) => {
        try {
            if (!startTimeStr || typeof startTimeStr !== 'string') return "09:00 AM";
            const [time, modifier] = startTimeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            // Convert to 24h total minutes from midnight
            let totalMinutes24 = (modifier === 'PM' && hours !== 12 ? hours + 12 : (modifier === 'AM' && hours === 12 ? 0 : hours)) * 60 + minutes;
            totalMinutes24 += Math.round(hoursToAdd * 60);
            // Wrap around 24h
            totalMinutes24 = totalMinutes24 % (24 * 60);

            const totalHours24 = Math.floor(totalMinutes24 / 60);
            const newMinutes = totalMinutes24 % 60;
            const newModifier = totalHours24 >= 12 ? 'PM' : 'AM';
            let newHours = totalHours24 % 12;
            if (newHours === 0) newHours = 12;

            return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')} ${newModifier}`;
        } catch (e) {
            return startTimeStr;
        }
    };

    const parseDuration = (durationStr) => {
        if (!durationStr) return 2;
        if (durationStr.toLowerCase().includes('half day')) return 4;
        const match = durationStr.match(/(\d+)/);
        if (match) return parseInt(match[1]);
        return 2;
    };

    const generateSmartTrip = () => {
        if (selectedInterests.length === 0) {
            showToast(t('selectInterests'), 'error', 'warning');
            return;
        }

        const interestedPlaces = places.filter(p => selectedInterests.includes(p.category));
        
        // 1. Group places by city
        const cityGroups = {};
        interestedPlaces.forEach(p => {
            if (!cityGroups[p.cityEn]) cityGroups[p.cityEn] = [];
            cityGroups[p.cityEn].push(p);
        });

        // Sort cities by the number of matching places to start where the user has the most interest
        const cities = Object.keys(cityGroups).sort((a, b) => cityGroups[b].length - cityGroups[a].length);
        if (cities.length === 0) {
            showToast(isRTL ? 'لا توجد أماكن تطابق اهتماماتك.' : 'No places match your interests.', 'error', 'warning');
            return;
        }

        try {
            const newItinerary = { name: isRTL ? 'خطتي المثالية' : 'My Perfect Trip', days: [] };
            
            let currentCityIndex = 0;
            let visitedPlaceIds = new Set();
            let currentCity = cities[currentCityIndex];
            let placesInCurrentCity = [...cityGroups[currentCity]].sort((a, b) => b.rating - a.rating);

            for (let d = 1; d <= duration; d++) {
                let activities = [];
                
                // Check remaining unvisited places in current city
                let unvisitedInCity = placesInCurrentCity.filter(p => !visitedPlaceIds.has(p.id));

                // Switch city if we run out of unvisited places, or every 2-3 days based on duration
                if (unvisitedInCity.length === 0 || (d > 1 && (d - 1) % 3 === 0 && currentCityIndex < cities.length - 1)) {
                    currentCityIndex = (currentCityIndex + 1) % cities.length;
                    currentCity = cities[currentCityIndex];
                    placesInCurrentCity = cityGroups[currentCity] ? [...cityGroups[currentCity]].sort((a, b) => b.rating - a.rating) : [];
                    unvisitedInCity = placesInCurrentCity.filter(p => !visitedPlaceIds.has(p.id));
                }

                // Morning / Check-in
                if (d === 1 || (d > 1 && (d - 1) % 3 === 0 && unvisitedInCity.length > 0) || (unvisitedInCity.length === 0 && currentCityIndex > 0)) {
                    // Find the best hotel in this city
                    const cityHotels = HOTELS.filter(h => h.city === currentCity);
                    if (cityHotels.length > 0 && !activities.some(a => a.type === 'hotel')) {
                        const bestHotel = cityHotels.sort((a, b) => b.rating - a.rating)[0];
                        activities.push({
                            placeId: bestHotel.id,
                            type: 'hotel',
                            time: "10:00 AM"
                        });
                    }
                }

                // Morning Activity
                const morningPlace = unvisitedInCity.shift();
                if (morningPlace) {
                    visitedPlaceIds.add(morningPlace.id);
                    activities.push({
                        placeId: morningPlace.id,
                        type: 'place',
                        time: activities.length > 0 ? "11:30 AM" : "10:00 AM",
                    });
                }

                // Lunch (only if we have activities)
                if (activities.length > 0) {
                    activities.push({
                        placeId: 'LUNCH',
                        type: 'meal',
                        time: "01:30 PM",
                    });
                }

                // Afternoon Activity
                const afternoonPlace = unvisitedInCity.shift();
                if (afternoonPlace) {
                    visitedPlaceIds.add(afternoonPlace.id);
                    activities.push({
                        placeId: afternoonPlace.id,
                        type: 'place',
                        time: "03:30 PM",
                    });
                }

                // Evening Activity / Dinner (Nightlife or Cultural prioritized)
                const eveningPlace = unvisitedInCity.find(p => p.category === 'Nightlife' || p.category === 'Cultural');
                if (eveningPlace) {
                    visitedPlaceIds.add(eveningPlace.id);
                    unvisitedInCity = unvisitedInCity.filter(p => p.id !== eveningPlace.id); // Remove from unvisited list
                    activities.push({
                        placeId: eveningPlace.id,
                        type: 'place',
                        time: "07:00 PM",
                    });
                } else if (activities.length > 0) {
                    activities.push({
                        placeId: 'DINNER',
                        type: 'meal',
                        time: "08:00 PM",
                    });
                }

                if (activities.length > 0) {
                    newItinerary.days.push({ activities });
                }
            }

            if (newItinerary.days.length === 0) {
                showToast(isRTL ? 'يرجى تحديد اهتماماتك أولاً!' : 'Please select interests first!', 'error', 'warning');
                return;
            }

            updateItinerary(newItinerary);
            showToast(isRTL ? 'تم إنشاء خطتك الذكية!' : 'Smart Trip Generated!', 'success', 'sparkles');
            setIsWizardVisible(false);
        } catch (error) {
            console.error('Itinerary Generation Error:', error);
            showToast(isRTL ? 'حدث خطأ أثناء إنشاء الرحلة' : 'Error generating trip', 'error', 'alert');
        }
    };

    const groupedItinerary = useMemo(() => {
        if (!itinerary || !itinerary.days) return [];
        return itinerary.days
            .map((day, index) => ({
                dayNumber: index + 1,
                activities: (day.activities || [])
                    .map(act => {
                        if (act.placeId === 'LUNCH') {
                            return {
                                ...act, 
                                place: { 
                                    id: 'LUNCH', 
                                    name: isRTL ? 'غداء محلي' : 'Local Lunch', 
                                    nameEn: 'Local Lunch', 
                                    image: '🍲',
                                    category: isRTL ? 'استراحة' : 'Break'
                                }
                            };
                        }
                        if (act.placeId === 'DINNER') {
                            return {
                                ...act, 
                                place: { 
                                    id: 'DINNER', 
                                    name: isRTL ? 'عشاء فاخر' : 'Fine Dinner', 
                                    nameEn: 'Fine Dinner', 
                                    image: '🍽️',
                                    category: isRTL ? 'استراحة' : 'Break'
                                }
                            };
                        }
                        
                        let place;
                        if (act.type === 'hotel') {
                            const hotel = HOTELS.find(h => h.id === act.placeId);
                            if (hotel) {
                                place = {
                                    ...hotel,
                                    nameEn: hotel.name,
                                    image: '🏨',
                                    category: isRTL ? 'تسجيل الدخول (فندق)' : 'Check-in (Hotel)'
                                };
                            }
                        } else {
                            place = places.find(p => p.id === act.placeId);
                        }
                        
                        return { ...act, place };
                    })
                    .filter(item => item && item.place)
            }))
            .filter(day => day.activities.length > 0);
    }, [itinerary, isRTL]);

    const renderActivityItem = ({ item, dayNumber }) => (
        <View style={[styles.activityCard, { backgroundColor: C.bgCard, borderColor: '#000', borderWidth: 2 }]}>
            <View style={[styles.timeColumn, { backgroundColor: C.bgElevated }]}>
                <Text style={[styles.timeText, { color: C.textMain }]}>{item.time}</Text>
            </View>
            <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, { color: C.textMain }]}>{isRTL ? item.place.name : (item.place.nameEn || item.place.name)}</Text>
                <View style={styles.activityFooter}>
                    <View style={[styles.catTag, { backgroundColor: C.bgElevated }]}>
                        <Text style={[styles.catTagText, { color: C.textMuted }]}>{item.place.category}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeActivityFromPlanner(dayNumber, item.placeId)}>
                        <Ionicons name="trash-outline" size={20} color="#FF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <Watermark />
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: C.textMain }]}>{t('myItinerary')}</Text>
                    <Text style={[styles.subtitle, { color: C.textMuted }]}>{t('planYourPerfectTrip') || 'خطط لرحلتك المثالية'}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.smartBtn, { backgroundColor: C.gold }]}
                    onPress={() => setIsWizardVisible(true)}
                >
                    <Ionicons name="sparkles" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Suggested Plans Horizontal List */}
            <View style={styles.suggestedSection}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: C.textMain }]}>{isRTL ? 'خطط مقترحة (TripAdvisor)' : 'Suggested Plans (TripAdvisor)'}</Text>
                </View>
                <FlatList
                    horizontal
                    data={SUGGESTED_PLANS}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestedList}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.suggestedCard, { backgroundColor: C.bgCard, borderColor: '#000', borderWidth: 2 }]}
                            onPress={() => {
                                Alert.alert(
                                    isRTL ? 'تحميل الخطة؟' : 'Load Plan?',
                                    isRTL ? `هل تريد تحميل خطة "${item.title}"؟ سيؤدي ذلك لاستبدال خطتك الحالية.` : `Load "${item.titleEn}"? This will replace your current plan.`,
                                    [
                                        { text: t('cancel'), style: 'cancel' },
                                        { text: isRTL ? 'تحميل' : 'Load', onPress: () => {
                                            // Wrap plan with required itinerary structure
                                            const loadedItinerary = {
                                                name: isRTL ? item.title : item.titleEn,
                                                days: item.plan?.days || [],
                                            };
                                            updateItinerary(loadedItinerary);
                                            showToast(isRTL ? 'تم تحميل الخطة بنجاح!' : 'Plan loaded successfully!', 'success', 'checkmark-circle');
                                        }}
                                    ]
                                );
                            }}
                        >
                            <Image source={{ uri: item.image }} style={styles.suggestedImg} />
                            <View style={styles.suggestedInfo}>
                                <Text style={[styles.suggestedTitle, { color: C.textMain }]} numberOfLines={1}>
                                    {isRTL ? item.title : item.titleEn}
                                </Text>
                                <View style={styles.suggestedMeta}>
                                    <Text style={[styles.suggestedDays, { color: C.gold }]}>{item.days} {t('days')}</Text>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={12} color={C.gold} />
                                        <Text style={[styles.ratingText, { color: C.textMuted }]}>{item.rating}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.divider} />

            {groupedItinerary.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={80} color={C.textMuted} />
                    <Text style={[styles.emptyText, { color: C.textMuted }]}>{t('noItineraryYet')}</Text>
                </View>
            ) : (
                <FlatList
                    data={groupedItinerary}
                    keyExtractor={item => `day-${item.dayNumber}`}
                    contentContainerStyle={styles.listContent}
                    initialNumToRender={3}
                    renderItem={({ item: day }) => (
                        <View style={styles.daySection}>
                            <View style={styles.dayHeader}>
                                <Text style={[styles.dayTitle, { color: C.textMain }]}>{t('day')} {day.dayNumber}</Text>
                                <View style={[styles.dayLine, { backgroundColor: C.gold }]} />
                            </View>
                            {day.activities.map((act, idx) => (
                                <View key={`act-${idx}`}>
                                    {renderActivityItem({ item: act, dayNumber: day.dayNumber })}
                                </View>
                            ))}
                        </View>
                    )}
                />
            )}

            {/* Smart Wizard Modal */}
            <Modal visible={isWizardVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
                        <Text style={[styles.modalTitle, { color: C.textMain }]}>{t('smartTripWizard')}</Text>
                        
                        <Text style={[styles.label, { color: C.textMuted }]}>{t('durationDays')}</Text>
                        <View style={styles.durationRow}>
                            {[1, 3, 5, 7].map(d => (
                                <TouchableOpacity 
                                    key={d} 
                                    style={[styles.durationBox, duration === d && { backgroundColor: C.gold, borderColor: '#000' }]}
                                    onPress={() => setDuration(d)}
                                >
                                    <Text style={[styles.durationText, duration === d && { color: '#000' }]}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: C.textMuted }]}>{t('yourInterests')}</Text>
                        <View style={styles.interestsGrid}>
                            {['Pharaonic', 'Islamic', 'Beach', 'Nature', 'Diving'].map(cat => (
                                <TouchableOpacity 
                                    key={cat}
                                    style={[styles.interestChip, selectedInterests.includes(cat) && { backgroundColor: '#000', borderColor: C.gold }]}
                                    onPress={() => toggleInterest(cat)}
                                >
                                    <Text style={[styles.interestText, selectedInterests.includes(cat) && { color: '#fff' }]}>{t('categories.' + cat)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsWizardVisible(false)}>
                                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.generateBtn, { backgroundColor: C.gold }]} onPress={generateSmartTrip}>
                                <Text style={styles.generateBtnText}>{t('generate')}</Text>
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
    header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontFamily: FONTS.heavy, fontSize: 26, fontWeight: '900', textTransform: 'uppercase' },
    subtitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
    smartBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    suggestedSection: { marginBottom: SPACING.md },
    sectionHeader: { paddingHorizontal: SPACING.lg, marginBottom: 10 },
    sectionTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    suggestedList: { paddingHorizontal: SPACING.lg, paddingBottom: 10 },
    suggestedCard: { width: 200, borderRadius: 20, marginRight: 16, overflow: 'hidden' },
    suggestedImg: { width: '100%', height: 110, resizeMode: 'cover' },
    suggestedInfo: { padding: 12 },
    suggestedTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
    suggestedMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    suggestedDays: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
    listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
    emptyText: { marginTop: 16, fontSize: 18, fontWeight: '700' },
    daySection: { marginBottom: 30 },
    dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    dayTitle: { fontSize: 22, fontWeight: '900', textTransform: 'uppercase', marginRight: 12 },
    dayLine: { flex: 1, height: 4, borderRadius: 2 },
    activityCard: { flexDirection: 'row', borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
    timeColumn: { width: 80, justifyContent: 'center', alignItems: 'center', borderRightWidth: 2, borderColor: '#000' },
    timeText: { fontSize: 12, fontWeight: '900' },
    activityInfo: { flex: 1, padding: 16 },
    activityTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
    activityFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    catTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    catTagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 24, padding: 24, borderWidth: 3, borderColor: '#000' },
    modalTitle: { fontFamily: FONTS.heavy, fontSize: 24, fontWeight: '900', textTransform: 'uppercase', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12, marginTop: 16 },
    durationRow: { flexDirection: 'row', gap: 12 },
    durationBox: { width: 50, height: 50, borderRadius: 12, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center' },
    durationText: { fontSize: 18, fontWeight: '900' },
    interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    interestChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 2, borderColor: '#000' },
    interestText: { fontWeight: '800', fontSize: 13 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 30, gap: 16 },
    cancelBtn: { padding: 12 },
    cancelBtnText: { fontWeight: '800', textTransform: 'uppercase' },
    generateBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: '#000' },
    generateBtnText: { fontWeight: '900', textTransform: 'uppercase' }
});
