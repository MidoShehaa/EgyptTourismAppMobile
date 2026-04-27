import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal, Alert, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { WHATSAPP_NUMBER } from '../constants/config';
import DynamicBackground from '../components/DynamicBackground';

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

            // 2. Group places by City (Hub-based approach like TripAdvisor)
            const cityHubsMap = {};
            candidatePlaces.forEach(p => {
                const city = p.cityEn || p.city;
                if (!cityHubsMap[city]) cityHubsMap[city] = [];
                cityHubsMap[city].push(p);
            });

            // 3. Select top N hubs based on duration to avoid excessive travel
            const maxHubs = duration <= 3 ? 1 : (duration <= 7 ? 2 : (duration <= 10 ? 3 : 4));
            const sortedHubs = Object.keys(cityHubsMap)
                .map(city => ({ city, places: cityHubsMap[city] }))
                .sort((a, b) => b.places.length - a.places.length)
                .slice(0, maxHubs);

            // 4. Allocate days to hubs
            let totalDays = duration;
            const hubDays = sortedHubs.map(h => ({
                ...h,
                allocatedDays: Math.max(1, Math.floor(totalDays / sortedHubs.length))
            }));
            
            // Adjust remainder days
            let sumDays = hubDays.reduce((s, h) => s + h.allocatedDays, 0);
            for (let i = 0; i < totalDays - sumDays; i++) {
                hubDays[i % hubDays.length].allocatedDays++;
            }

            // 5. Generate daily schedule
            let totalEstimatedCost = 0;
            const DAY_START = 10 * 60; // 10:00 AM
            const DAY_END = 21 * 60;  // 9:00 PM
            const TRANSIT_BUFFER = 45; 
            const maxPlacesPerDay = travelerType === 'family' ? 2 : (travelerType === 'solo' ? 4 : 3);
            
            const visitedCities = new Set();
            
            for (const hub of hubDays) {
                let placeQueue = [...hub.places];
                
                for (let d = 0; d < hub.allocatedDays; d++) {
                    const dayActivities = [];
                    let currentTime = DAY_START;

                    // Hotel Check-in
                    if (d === 0 && !visitedCities.has(hub.city)) {
                        visitedCities.add(hub.city);
                        dayActivities.push({
                            placeId: `CHOOSE_HOTEL_${hub.city}`,
                            type: 'hotel_placeholder',
                            city: hub.city,
                            time: minutesToTimeStr(currentTime)
                        });
                        currentTime += 90; // 1.5 hours for transit & check-in
                    }

                    // Fill places
                    let placesThisDay = 0;
                    
                    while (placeQueue.length > 0 && placesThisDay < maxPlacesPerDay) {
                        const nextPlace = placeQueue.shift();
                        const visitDurationMinutes = parseDuration(nextPlace.duration) * 60;
                        
                        if (currentTime + visitDurationMinutes > DAY_END) {
                            placeQueue.unshift(nextPlace); // Put it back
                            break;
                        }
                        
                        dayActivities.push({
                            placeId: nextPlace.id,
                            type: 'place',
                            time: minutesToTimeStr(currentTime)
                        });
                        
                        totalEstimatedCost += parsePrice(nextPlace.price);
                        currentTime += visitDurationMinutes + TRANSIT_BUFFER;
                        placesThisDay++;
                    }

                    // Lunch
                    const lunchTime = Math.max(currentTime, 13 * 60);
                    if (lunchTime < 16 * 60) {
                        dayActivities.push({
                            placeId: 'LUNCH',
                            type: 'meal',
                            time: minutesToTimeStr(lunchTime)
                        });
                        currentTime = lunchTime + 60;
                    }

                    // If no places were available (free day)
                    if (placesThisDay === 0) {
                        const fallbacks = [
                            { type: 'leisure_placeholder', title: isRTL ? `استرخاء واكتشاف حر في ${hub.city}` : `Relax & Explore ${hub.city}`, cat: isRTL ? 'وقت حر' : 'Free Time', img: '🌴' },
                            { type: 'driver_placeholder', title: isRTL ? `جولة خاصة بسيارة في ${hub.city}` : `Private City Tour in ${hub.city}`, cat: isRTL ? 'جولة سياحية' : 'City Tour', img: '🚗' },
                            { type: 'dining_placeholder', title: isRTL ? `تجربة طعام محلي في ${hub.city}` : `Local Dining Experience in ${hub.city}`, cat: isRTL ? 'مطاعم' : 'Dining', img: '🍽️' },
                            { type: 'hidden_gem_placeholder', title: isRTL ? `استكشاف الجواهر الخفية في ${hub.city}` : `Discover Hidden Gems in ${hub.city}`, cat: isRTL ? 'استكشاف' : 'Exploration', img: '💎' }
                        ];
                        const randomFallback = fallbacks[d % fallbacks.length];

                        dayActivities.push({
                            placeId: `${randomFallback.type}_${hub.city}_${d}`,
                            type: randomFallback.type,
                            title: randomFallback.title,
                            category: randomFallback.cat,
                            image: randomFallback.img,
                            city: hub.city,
                            time: minutesToTimeStr(currentTime)
                        });
                        currentTime += 180;
                    }

                    // Dinner
                    dayActivities.push({
                        placeId: 'DINNER',
                        type: 'meal',
                        time: minutesToTimeStr(Math.max(currentTime, 20 * 60))
                    });

                    // Sort by time
                    dayActivities.sort((a, b) => {
                        const timeToMins = (t) => {
                            const [time, mod] = t.split(' ');
                            let [h, m] = time.split(':').map(Number);
                            if (mod === 'PM' && h !== 12) h += 12;
                            if (mod === 'AM' && h === 12) h = 0;
                            return h * 60 + m;
                        };
                        return timeToMins(a.time) - timeToMins(b.time);
                    });

                    newItinerary.days.push({ activities: dayActivities });
                }
            }

            if (newItinerary.days.length === 0) {
                showToast(isRTL ? 'حدث خطأ في التوليد' : 'Failed to generate itinerary', 'error', 'warning');
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
                        } else if (act.type.endsWith('_placeholder') && act.type !== 'hotel_placeholder') {
                            place = {
                                id: act.placeId,
                                name: act.title,
                                nameEn: act.title,
                                image: act.image || '✨',
                                category: act.category,
                                isActionable: act.type === 'driver_placeholder',
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
                        ) : item.place.isActionable ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <TouchableOpacity 
                                    style={[styles.chooseBtn, { backgroundColor: C.primary, width: 'auto', paddingHorizontal: 12 }]}
                                    onPress={() => navigation.navigate('Rides')}
                                >
                                    <Ionicons name="car" size={18} color="#000" style={{ marginRight: 4 }} />
                                    <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}>{isRTL ? 'احجز' : 'Book'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => removeActivityFromPlanner(dayNumber, item.placeId)}>
                                    <Ionicons name="close-circle-outline" size={24} color="#555" />
                                </TouchableOpacity>
                            </View>
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


    // Determine dynamic background based on first activity
    const firstActivityPlace = groupedItinerary?.[0]?.activities?.[0]?.place;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground 
                category={firstActivityPlace?.category} 
                city={firstActivityPlace?.cityEn || firstActivityPlace?.city} 
            />
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

