import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal, Animated, Platform, StatusBar, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { places, CATEGORIES } from '../constants/placesData';
import { HOTELS } from '../constants/hotelsData';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const fontFamilyHeavy = Platform.OS === 'ios' ? 'Futura' : 'sans-serif-black';
const fontFamilyMedium = Platform.OS === 'ios' ? 'San Francisco' : 'sans-serif-medium';

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

    const generateSmartTrip = () => {
        if (selectedInterests.length === 0) {
            showToast(t('selectInterests'), 'error', 'warning');
            return;
        }

        const newItinerary = { name: isRTL ? 'رحلتي الذكية' : 'My Smart Trip', days: [] };
        const cityPlaces = places.filter(p => selectedInterests.includes(p.category));
        
        let cityPlaceIndex = 0;
        for (let d = 1; d <= duration; d++) {
            let activities = [];
            let currentTimeStr = "09:00 AM";
            let currentDayHours = 0;

            while (currentDayHours < 8 && cityPlaceIndex < cityPlaces.length) {
                const p = cityPlaces[cityPlaceIndex];
                activities.push({
                    placeId: p.id,
                    time: currentTimeStr,
                });
                
                const placeHours = 2; // Default
                currentTimeStr = addHoursToTime(currentTimeStr, placeHours + 0.5);
                currentDayHours += placeHours + 0.5;
                cityPlaceIndex++;

                if (currentDayHours >= 4 && currentDayHours <= 5) {
                    activities.push({
                        placeId: 'LUNCH',
                        time: currentTimeStr,
                    });
                    currentTimeStr = addHoursToTime(currentTimeStr, 1.5);
                    currentDayHours += 1.5;
                }
            }
            if (activities.length > 0) newItinerary.days.push({ activities });
        }

        updateItinerary(newItinerary);
        showToast(t('smartTripGenerated'), 'success', 'sparkles');
        setIsWizardVisible(false);
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
                                    name: isRTL ? 'استراحة وغداء' : 'Lunch & Rest Time', 
                                    nameEn: 'Lunch & Rest Time', 
                                    image: '🍱',
                                    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
                                    category: 'General'
                                }
                            };
                        }
                        const place = act.type === 'hotel' 
                                     ? HOTELS.find(h => h.id === act.placeId)
                                     : places.find(p => p.id === act.placeId);
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
            <View style={styles.header}>
                <Text style={[styles.title, { color: C.textMain }]}>{t('myItinerary')}</Text>
                <TouchableOpacity 
                    style={[styles.smartBtn, { backgroundColor: C.gold }]}
                    onPress={() => setIsWizardVisible(true)}
                >
                    <Ionicons name="sparkles" size={20} color="#000" />
                    <Text style={styles.smartBtnText}>{t('generateSmartTrip')}</Text>
                </TouchableOpacity>
            </View>

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
    header: { padding: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontFamily: fontFamilyHeavy, fontSize: 28, fontWeight: '900', textTransform: 'uppercase' },
    smartBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: '#000' },
    smartBtnText: { marginLeft: 8, fontWeight: '900', textTransform: 'uppercase', fontSize: 12 },
    listContent: { padding: SPACING.lg },
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
    modalTitle: { fontFamily: fontFamilyHeavy, fontSize: 24, fontWeight: '900', textTransform: 'uppercase', marginBottom: 20 },
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
