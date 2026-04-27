import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal, Alert, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { WHATSAPP_NUMBER } from '../constants/config';
import PharaonicBackground from '../components/PharaonicBackground';

export default function PlannerScreen({ navigation }) {
    const { 
        itinerary, 
        removeActivityFromPlanner, 
        updateItinerary, 
        t, 
        settings, 
        showToast, 
        places, 
        hotels, 
    } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [isWizardVisible, setIsWizardVisible] = useState(false);
    const [duration, setDuration] = useState(3);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [travelerType, setTravelerType] = useState('couple'); // solo, couple, family, group


    const toggleInterest = (category) => {
        setSelectedInterests(prev =>
            prev.includes(category)
                ? prev.filter(i => i !== category)
                : [...prev, category]
        );
    };

    // --- GEOGRAPHIC CLUSTERING UTILITIES ---
    
    /** Haversine distance in km between two lat/lng points */
    const haversineDistance = (lat1, lng1, lat2, lng2) => {
        const toRad = (x) => (x * Math.PI) / 180;
        const R = 6371; // Earth radius in km
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    /** Parse duration string ("2-3 hours", "Full Day", "1-2 hours") into hours */
    const parseDuration = (durationStr) => {
        if (!durationStr) return 2;
        const lower = durationStr.toLowerCase();
        if (lower.includes('full day')) return 5;
        if (lower.includes('half day')) return 3;
        if (lower.includes('day')) {
            const match = durationStr.match(/(\d+)/);
            return match ? parseInt(match[1]) * 6 : 5;
        }
        // "2-3 hours" → take average, "1 hour" → take 1
        const rangeMatch = durationStr.match(/(\d+)\s*-\s*(\d+)/);
        if (rangeMatch) return (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
        const singleMatch = durationStr.match(/(\d+)/);
        if (singleMatch) return parseInt(singleMatch[1]);
        return 2;
    };

    /** Parse price string ("400 EGP", "Free", "Variable") into a number */
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        if (priceStr.toLowerCase() === 'free') return 0;
        if (priceStr.toLowerCase() === 'variable') return 200; // estimate
        const match = priceStr.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    };

    /** Format minutes since midnight to "HH:MM AM/PM" */
    const minutesToTimeStr = (totalMinutes) => {
        const hours24 = Math.floor(totalMinutes / 60) % 24;
        const mins = totalMinutes % 60;
        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        let hours12 = hours24 % 12;
        if (hours12 === 0) hours12 = 12;
        return `${hours12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
    };

    /** Estimate transit time between two places in minutes */
    const estimateTransit = (place1, place2) => {
        if (!place1?.lat || !place2?.lat) return 45;
        const dist = haversineDistance(place1.lat, place1.lng, place2.lat, place2.lng);
        if (dist < 5) return 20;       // Same area
        if (dist < 20) return 45;      // Same city
        if (dist < 100) return 90;     // Nearby cities
        return 180;                     // Long distance (e.g., Cairo→Luxor implies flight/train)
    };

    // --- SMART TRIP GENERATION ---
    
    const generateSmartTrip = () => {
        if (selectedInterests.length === 0) {
            showToast(t('selectInterests'), 'error', 'warning');
            return;
        }

        try {
            const newItinerary = { 
                name: isRTL ? 'رحلتي الذكية في مصر' : 'My Smart Egypt Tour', 
                days: [] 
            };
            
            // 1. Filter places by interests + traveler type adjustments
            let candidatePlaces = (places || [])
                .filter(p => selectedInterests.includes(p.category) && p.lat && p.lng)
                .sort((a, b) => b.rating - a.rating);
            
            // Family mode: favor shorter durations, skip nightlife/diving
            if (travelerType === 'family') {
                candidatePlaces = candidatePlaces.filter(p => 
                    p.category !== 'Nightlife' && p.category !== 'Diving'
                );
            }
            
            if (candidatePlaces.length === 0) {
                showToast(isRTL ? 'لا توجد أماكن تطابق اهتماماتك' : 'No places match your interests', 'error', 'warning');
                return;
            }

            // 2. Geographic clustering — group places by proximity
            // Find distinct city clusters using actual coordinates
            const clusters = [];
            const assigned = new Set();
            
            for (const place of candidatePlaces) {
                if (assigned.has(place.id)) continue;
                
                // Start a new cluster with this place
                const cluster = { 
                    places: [place], 
                    centerLat: place.lat, 
                    centerLng: place.lng,
                    city: place.cityEn 
                };
                assigned.add(place.id);
                
                // Find all other unassigned places within 30km
                for (const other of candidatePlaces) {
                    if (assigned.has(other.id)) continue;
                    const dist = haversineDistance(place.lat, place.lng, other.lat, other.lng);
                    if (dist < 30) {
                        cluster.places.push(other);
                        assigned.add(other.id);
                    }
                }
                
                clusters.push(cluster);
            }

            // 3. Sort clusters geographically (north → south for natural travel flow)
            clusters.sort((a, b) => b.centerLat - a.centerLat);

            // 4. Allocate days to clusters proportionally
            let totalDays = duration;
            const clusterDays = clusters.map(c => ({
                ...c,
                allocatedDays: Math.max(1, Math.round((c.places.length / candidatePlaces.length) * totalDays))
            }));
            
            // Adjust to match exact duration
            let sumDays = clusterDays.reduce((s, c) => s + c.allocatedDays, 0);
            while (sumDays > totalDays && clusterDays.length > 0) {
                const largest = clusterDays.reduce((a, b) => a.allocatedDays > b.allocatedDays ? a : b);
                largest.allocatedDays--;
                sumDays--;
            }
            while (sumDays < totalDays) {
                const smallest = clusterDays.reduce((a, b) => a.allocatedDays < b.allocatedDays ? a : b);
                smallest.allocatedDays++;
                sumDays++;
            }

            // 5. Generate daily schedule with realistic timing
            let totalEstimatedCost = 0;
            const DAY_START = 9 * 60; // 9:00 AM in minutes
            const DAY_END = 21 * 60;  // 9:00 PM in minutes
            const TRANSIT_BUFFER = 45; // minutes between activities
            // Family/solo pace adjustment
            const maxPlacesPerDay = travelerType === 'family' ? 2 : (travelerType === 'solo' ? 4 : 3);
            
            const visitedCities = new Set();
            
            for (const cluster of clusterDays) {
                if (cluster.allocatedDays <= 0) continue;
                
                let placeQueue = [...cluster.places];
                
                for (let d = 0; d < cluster.allocatedDays; d++) {
                    const dayActivities = [];
                    let currentTime = DAY_START;

                    // Add hotel placeholder on first day in a new city
                    if (d === 0 && !visitedCities.has(cluster.city)) {
                        visitedCities.add(cluster.city);
                        dayActivities.push({
                            placeId: `CHOOSE_HOTEL_${cluster.city}`,
                            type: 'hotel_placeholder',
                            city: cluster.city,
                            time: minutesToTimeStr(currentTime)
                        });
                        currentTime += 60; // 1 hour for check-in
                    }

                    // Fill the day with places
                    let placesThisDay = 0;
                    let lastPlace = null;
                    
                    while (placeQueue.length > 0 && placesThisDay < maxPlacesPerDay) {
                        const nextPlace = placeQueue[0];
                        const visitDurationMinutes = parseDuration(nextPlace.duration) * 60;
                        const transit = lastPlace ? estimateTransit(lastPlace, nextPlace) : 0;
                        
                        // Check if this place fits in the remaining day
                        if (currentTime + transit + visitDurationMinutes > DAY_END) break;
                        
                        currentTime += transit;
                        
                        dayActivities.push({
                            placeId: nextPlace.id,
                            type: 'place',
                            time: minutesToTimeStr(currentTime)
                        });
                        
                        totalEstimatedCost += parsePrice(nextPlace.price);
                        currentTime += visitDurationMinutes + TRANSIT_BUFFER;
                        lastPlace = nextPlace;
                        placeQueue.shift();
                        placesThisDay++;
                    }

                    // Add lunch break if day has morning activities
                    if (placesThisDay > 0) {
                        const lunchTime = Math.max(currentTime, 13 * 60); // At least 1 PM
                        if (lunchTime < DAY_END - 60) {
                            dayActivities.push({
                                placeId: 'LUNCH',
                                type: 'meal',
                                time: minutesToTimeStr(Math.min(lunchTime, 14 * 60))
                            });
                        }
                    }

                    // Add dinner
                    dayActivities.push({
                        placeId: 'DINNER',
                        type: 'meal',
                        time: minutesToTimeStr(20 * 60) // 8:00 PM
                    });

                    // Sort activities by time
                    dayActivities.sort((a, b) => {
                        const timeToMinutes = (t) => {
                            const [time, mod] = t.split(' ');
                            let [h, m] = time.split(':').map(Number);
                            if (mod === 'PM' && h !== 12) h += 12;
                            if (mod === 'AM' && h === 12) h = 0;
                            return h * 60 + m;
                        };
                        return timeToMinutes(a.time) - timeToMinutes(b.time);
                    });

                    if (dayActivities.length > 1) { // At least one place + dinner
                        newItinerary.days.push({ activities: dayActivities });
                    }
                }
            }

            if (newItinerary.days.length === 0) {
                showToast(isRTL ? 'يرجى اختيار اهتمامات أكثر!' : 'Please select more interests!', 'error', 'warning');
                return;
            }

            // Store estimated cost for display
            newItinerary.estimatedCost = totalEstimatedCost;

            updateItinerary(newItinerary);
            const costMsg = totalEstimatedCost > 0 
                ? ` | ~${totalEstimatedCost.toLocaleString()} EGP` 
                : '';
            showToast(
                isRTL 
                    ? `تم إنشاء رحلة ${newItinerary.days.length} أيام!${costMsg}` 
                    : `${newItinerary.days.length}-Day Trip Created!${costMsg}`, 
                'success', 
                'sparkles'
            );
            setIsWizardVisible(false);
        } catch (error) {
            console.error('Smart Trip Error:', error);
            showToast(isRTL ? 'خطأ في توليد الرحلة' : 'Generation Error', 'error', 'alert');
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
                        if (act.type === 'hotel_placeholder') {
                            place = {
                                id: act.placeId,
                                name: isRTL ? `اختر فندقك في ${act.city}` : `Choose Hotel in ${act.city}`,
                                nameEn: `Choose Hotel in ${act.city}`,
                                image: '🏨',
                                category: 'Selection Required',
                                isPlaceholder: true,
                                city: act.city
                            };
                        } else if (act.type === 'hotel') {
                            const hotel = (hotels || []).find(h => h.id === act.placeId);
                            if (hotel) {
                                place = {
                                    ...hotel,
                                    nameEn: hotel.name,
                                    image: '🏨',
                                    category: isRTL ? 'تسجيل الدخول (فندق)' : 'Check-in (Hotel)'
                                };
                            }
                        } else {
                            place = (places || []).find(p => p.id === act.placeId);
                        }
                        
                        return { ...act, place };
                    })
                    .filter(item => item && item.place)
            }))
            .filter(day => day.activities.length > 0);
    }, [itinerary, isRTL, places, hotels]);

    const renderActivityItem = ({ item, dayNumber }) => {
        const isMeal = item.type === 'meal';
        const isHotel = item.type === 'hotel' || item.type === 'hotel_placeholder';
        
        return (
            <View style={styles.timelineItem}>
                <View style={styles.timeLineContainer}>
                    <View style={[styles.timelineDot, { backgroundColor: isMeal ? '#FFA500' : (isHotel ? '#FF69B4' : C.primary) }]} />
                    <View style={styles.timelineLine} />
                </View>
                
                <View style={[styles.activityCard, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }]}>
                    <View style={styles.activityContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.timeText}>{item.time}</Text>
                            <Text style={[styles.activityTitle, { color: C.textMain }]} numberOfLines={1}>
                                {isRTL ? item.place.name : (item.place.nameEn || item.place.name)}
                            </Text>
                            <Text style={styles.catTagText}>{item.place.category}</Text>
                        </View>
                        
                        {item.place.isPlaceholder ? (
                            <TouchableOpacity 
                                style={[styles.chooseBtn, { backgroundColor: C.primary }]}
                                onPress={() => navigation.navigate('HotelsCity', { city: item.place.cityEn || item.place.city })}
                            >
                                <Ionicons name="add" size={20} color="#000" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => removeActivityFromPlanner(dayNumber, item.placeId)}>
                                <Ionicons name="close-circle-outline" size={24} color="#555" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <PharaonicBackground />
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: C.textMain }]}>{t('myItinerary')}</Text>
                    <Text style={[styles.subtitle, { color: C.textMuted }]}>{t('planYourPerfectTrip')}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    {groupedItinerary.length > 0 && (
                        <TouchableOpacity 
                            style={[styles.iconBtn, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }]}
                            onPress={async () => {
                                try {
                                    let text = `✨ ${itinerary?.name || 'My Egypt Trip'}\n\n`;
                                    groupedItinerary.forEach(day => {
                                        text += `--- ${isRTL ? 'اليوم' : 'Day'} ${day.dayNumber} ---\n`;
                                        day.activities.forEach(act => {
                                            const name = isRTL ? act.place?.name : (act.place?.nameEn || act.place?.name);
                                            text += `  ${act.time} - ${name || ''}\n`;
                                        });
                                        text += '\n';
                                    });
                                    text += isRTL ? 'تم إنشاؤها بواسطة Egypt Tourism App' : 'Created with Egypt Tourism App';
                                    await Share.share({ message: text, title: itinerary?.name });
                                } catch (e) { /* user cancelled */ }
                            }}
                        >
                            <Ionicons name="share-social-outline" size={22} color={C.textMain} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        style={[styles.iconBtn, { backgroundColor: C.primary }]}
                        onPress={() => setIsWizardVisible(true)}
                    >
                        <Ionicons name="sparkles" size={22} color="#000" />
                    </TouchableOpacity>
                </View>
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
                    initialNumToRender={3}
                    renderItem={({ item: day }) => (
                        <View style={styles.daySection}>
                            <View style={styles.dayHeader}>
                                <Text style={[styles.dayTitle, { color: C.textMain }]}>{t('day')} {day.dayNumber}</Text>
                                <View style={[styles.dayLine, { backgroundColor: C.primary }]} />
                            </View>
                            {day.activities.map((act, idx) => (
                                <View key={`act-${idx}`}>
                                    {renderActivityItem({ item: act, dayNumber: day.dayNumber })}
                                </View>
                            ))}
                        </View>
                    )}
                    ListFooterComponent={
                        <TouchableOpacity 
                            style={[styles.submitRequestBtn, { backgroundColor: C.primary }]}
                            onPress={async () => {
                                try {
                                    let text = `🇪🇬 ${itinerary?.name || 'My Egypt Trip'}\n\n`;
                                    groupedItinerary.forEach(day => {
                                        text += `--- ${isRTL ? 'اليوم' : 'Day'} ${day.dayNumber} ---\n`;
                                        day.activities.forEach(act => {
                                            const name = isRTL ? act.place?.name : (act.place?.nameEn || act.place?.name);
                                            text += `  ${act.time} - ${name || ''}\n`;
                                        });
                                        text += '\n';
                                    });
                                    const msg = encodeURIComponent(text);
                                    await Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
                                } catch (e) { /* ignore */ }
                            }}
                        >
                            <Ionicons name="logo-whatsapp" size={22} color="#000" style={{ marginRight: 10 }} />
                            <Text style={styles.submitRequestText}>
                                {isRTL ? 'احجز رحلتك كاملة' : 'BOOK FULL TRIP'}
                            </Text>
                        </TouchableOpacity>
                    }

                />
            )}



            {/* Smart Wizard Modal */}
            <Modal visible={isWizardVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
                        <Text style={[styles.modalTitle, { color: C.textMain }]}>{t('smartTripWizard')}</Text>
                        
                        {/* Traveler Type */}
                        <Text style={[styles.label, { color: C.textMuted }]}>{isRTL ? 'نوع المسافر' : 'TRAVELER TYPE'}</Text>
                        <View style={styles.durationRow}>
                            {[
                                { key: 'solo', icon: '🧑', label: isRTL ? 'فردي' : 'Solo' },
                                { key: 'couple', icon: '💑', label: isRTL ? 'ثنائي' : 'Couple' },
                                { key: 'family', icon: '👨‍👩‍👧‍👦', label: isRTL ? 'عائلي' : 'Family' },
                                { key: 'group', icon: '👥', label: isRTL ? 'مجموعة' : 'Group' },
                            ].map(tt => (
                                <TouchableOpacity 
                                    key={tt.key} 
                                    style={[styles.travelerChip, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }, travelerType === tt.key && { backgroundColor: C.gold, borderColor: C.gold }]}
                                    onPress={() => setTravelerType(tt.key)}
                                >
                                    <Text style={styles.travelerEmoji}>{tt.icon}</Text>
                                    <Text style={[styles.travelerLabel, { color: C.textMain }, travelerType === tt.key && { color: '#000' }]}>{tt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: C.textMuted }]}>{t('durationDays')}</Text>
                        <View style={styles.durationRow}>
                            {[3, 5, 7, 10, 15].map(d => (
                                <TouchableOpacity 
                                    key={d} 
                                    style={[styles.durationBox, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }, duration === d && { backgroundColor: C.gold, borderColor: C.gold }]}
                                    onPress={() => setDuration(d)}
                                >
                                    <Text style={[styles.durationText, { color: C.textMain }, duration === d && { color: '#000' }]}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: C.textMuted }]}>{t('yourInterests')}</Text>
                        <View style={styles.interestsGrid}>
                            {['Pharaonic', 'Islamic', 'Beach', 'Nature', 'Diving', 'Cultural', 'Medical', 'Nightlife'].map(cat => (
                                <TouchableOpacity 
                                    key={cat}
                                    style={[styles.interestChip, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }, selectedInterests.includes(cat) && { backgroundColor: C.primary, borderColor: C.primary }]}
                                    onPress={() => toggleInterest(cat)}
                                >
                                    <Text style={[styles.interestText, { color: C.textMain }, selectedInterests.includes(cat) && { color: '#000' }]}>{t('categories.' + cat) || cat}</Text>
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
    header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '900' },
    subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4 },
    iconBtn: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingHorizontal: 24, paddingBottom: 100 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.3 },
    emptyText: { marginTop: 20, fontSize: 18, fontWeight: '700' },
    daySection: { marginBottom: 32 },
    dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    dayTitle: { fontSize: 20, fontWeight: '900', marginRight: 16 },
    dayLine: { flex: 1, height: 2, borderRadius: 1, opacity: 0.3 },
    timelineItem: { flexDirection: 'row', minHeight: 100 },
    timeLineContainer: { alignItems: 'center', width: 20, marginRight: 16 },
    timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
    timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
    activityCard: { flex: 1, borderRadius: 24, marginBottom: 16, padding: 16 },
    activityContent: { flexDirection: 'row', alignItems: 'center' },
    timeText: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
    activityTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    catTagText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
    chooseBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    submitRequestBtn: { flexDirection: 'row', height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 40 },
    submitRequestText: { fontSize: 16, fontWeight: '900', color: '#000' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 24 },
    modalContent: { borderRadius: 32, padding: 32, backgroundColor: '#121212' },
    modalTitle: { fontSize: 26, fontWeight: '900', marginBottom: 24 },
    label: { fontSize: 12, fontWeight: '900', opacity: 0.6, marginBottom: 12, marginTop: 24 },
    durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    durationBox: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
    durationText: { fontSize: 16, fontWeight: '900', color: '#fff' },
    interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    interestChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, backgroundColor: '#1A1A1A' },
    interestText: { fontWeight: '700', fontSize: 13, color: 'rgba(255,255,255,0.6)' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 40, gap: 16 },
    cancelBtn: { padding: 16 },
    cancelBtnText: { fontWeight: '900', color: '#555' },
    generateBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
    generateBtnText: { fontWeight: '900', color: '#000' },
    travelerChip: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, backgroundColor: '#1A1A1A' },
    travelerEmoji: { fontSize: 20, marginBottom: 4 },
    travelerLabel: { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.6)' },
});

