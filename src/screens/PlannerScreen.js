import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity, Modal, Share, Linking, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { WHATSAPP_NUMBER } from '../constants/config';
import DynamicBackground from '../components/DynamicBackground';
import { generateSmartItinerary } from '../utils/itineraryEngine';
import { requestPermissions, scheduleMorningReminder } from '../utils/notificationService';

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
        restaurants,
    } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [isWizardVisible, setIsWizardVisible] = useState(false);
    const [duration, setDuration] = useState(3);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [travelerType, setTravelerType] = useState('couple');
    const [tripStyle, setTripStyle] = useState('comfort'); // economy | comfort | luxury
    const [includeHiddenGems, setIncludeHiddenGems] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);


    const toggleInterest = (category) => {
        setSelectedInterests(prev =>
            prev.includes(category)
                ? prev.filter(i => i !== category)
                : [...prev, category]
        );
    };

    // --- SMART TRIP GENERATION (powered by itineraryEngine) ---
    const generateSmartTrip = () => {
        if (selectedInterests.length === 0) {
            showToast(t('selectInterests'), 'error', 'warning');
            return;
        }

        try {
            setIsGenerating(true);

            const { itinerary: newItinerary, warnings, estimatedCost } = generateSmartItinerary({
                places,
                duration,
                selectedInterests,
                travelerType,
                tripStyle,
                includeHiddenGems,
                isRTL,
            });

            if (!newItinerary) {
                const msg = isRTL
                    ? 'لا توجد أماكن تطابق اهتماماتك. جرب اختيار فئات أكثر.'
                    : 'No places match. Try selecting more categories.';
                showToast(msg, 'error', 'warning');
                setIsGenerating(false);
                return;
            }

            // Show warnings about long-distance travel
            if (warnings.includes('LONG_DISTANCE_TRANSIT')) {
                showToast(
                    isRTL
                        ? '⚠️ الرحلة تتضمن سفراً بعيداً — تأكد من حجز القطار أو الطيران مسبقاً'
                        : '⚠️ Trip includes long-distance travel — book trains/flights in advance',
                    'error', 'alert-circle'
                );
            }

            updateItinerary(newItinerary);

            const costMsg = estimatedCost > 0
                ? ` | ~${estimatedCost.toLocaleString()} EGP`
                : '';
            showToast(
                isRTL
                    ? `✅ تم إنشاء رحلة ${newItinerary.days.length} أيام!${costMsg}`
                    : `✅ ${newItinerary.days.length}-Day Trip Created!${costMsg}`,
                'success',
                'sparkles'
            );
            setIsWizardVisible(false);

            // Schedule morning reminders
            requestPermissions().then(granted => {
                if (granted) {
                    const firstAct = newItinerary.days?.[0]?.activities?.[0];
                    const actName = firstAct?.placeId
                        ? (places.find(p => p.id === firstAct.placeId)?.[isRTL ? 'name' : 'nameEn'] || '')
                        : '';
                    scheduleMorningReminder(
                        newItinerary.name || (isRTL ? 'رحلتي' : 'My Trip'),
                        actName,
                        isRTL
                    );
                }
            });
        } catch (error) {
            console.error('Smart Trip Error:', error);
            showToast(isRTL ? 'خطأ في توليد الرحلة' : 'Generation Error', 'error', 'alert');
        } finally {
            setIsGenerating(false);
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
                                    name: isRTL ? 'غداء محلي (اضغط للاختيار)' : 'Local Lunch (Tap to Select)', 
                                    nameEn: 'Local Lunch (Tap to Select)', 
                                    image: '🍲',
                                    category: 'Selection Required',
                                    isPlaceholder: true,
                                    isMeal: true,
                                    mealType: 'Lunch',
                                    city: act.city
                                }
                            };
                        }
                        if (act.placeId === 'DINNER') {
                            return {
                                ...act, 
                                place: { 
                                    id: 'DINNER', 
                                    name: isRTL ? 'عشاء فاخر (اضغط للاختيار)' : 'Fine Dinner (Tap to Select)', 
                                    nameEn: 'Fine Dinner (Tap to Select)', 
                                    image: '🍽️',
                                    category: 'Selection Required',
                                    isPlaceholder: true,
                                    isMeal: true,
                                    mealType: 'Dinner',
                                    city: act.city
                                }
                            };
                        }
                        
                        let place;
                        if (act.type === 'restaurant') {
                            const rest = (restaurants || []).find(r => r.id === act.placeId);
                            if (rest) {
                                place = {
                                    ...rest,
                                    nameEn: rest.name,
                                    image: '🍽️',
                                    category: isRTL ? 'مطعم' : 'Restaurant'
                                };
                            }
                        } else if (act.type === 'hotel_placeholder') {
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
    }, [itinerary, isRTL, places, hotels, restaurants]);

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
                                onPress={() => {
                                    if (item.place.isMeal) {
                                        navigation.navigate('Dining', { meal: item.place.mealType, city: item.place.city });
                                    } else {
                                        navigation.navigate('HotelsCity', { city: item.place.cityEn || item.place.city });
                                    }
                                }}
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

    // Calculate Trip Budget Estimate
    const tripBudget = useMemo(() => {
        let activitiesCost = 0;
        let mealsCost = 0;
        
        groupedItinerary.forEach(day => {
            day.activities.forEach(act => {
                if (act.place) {
                    if (act.place.isPlaceholder && act.place.isMeal) {
                        mealsCost += act.place.mealType === 'Dinner' ? 600 : 300;
                    } else if (act.place.price) {
                        const priceStr = String(act.place.price);
                        const match = priceStr.match(/\d+/);
                        if (match) {
                            activitiesCost += parseInt(match[0], 10);
                        }
                    }
                }
            });
        });

        const daysCount = groupedItinerary.length;
        const hotelCost = daysCount * 1200; // Average 1200 EGP per night
        const transportCost = daysCount * 400; // Average 400 EGP per day
        const total = activitiesCost + mealsCost + hotelCost + transportCost;

        return {
            activities: activitiesCost,
            meals: mealsCost,
            hotel: hotelCost,
            transport: transportCost,
            total,
            days: daysCount
        };
    }, [groupedItinerary]);

    const renderBudgetEstimator = () => {
        if (groupedItinerary.length === 0) return null;
        
        return (
            <View style={[styles.budgetCard, { backgroundColor: C.bgCard }]}>
                <View style={[styles.budgetHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Ionicons name="wallet-outline" size={24} color={C.primary} />
                    <Text style={[styles.budgetTitle, { color: C.textMain }]}>{isRTL ? 'تقدير ميزانية الرحلة' : 'Trip Budget Estimator'}</Text>
                </View>

                <View style={styles.budgetGrid}>
                    <View style={[styles.budgetItem, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Ionicons name="ticket-outline" size={16} color={C.textMuted} />
                        <Text style={[styles.budgetLabel, { color: C.textMuted }, isRTL && { textAlign: 'right' }]}>{isRTL ? 'الأنشطة والتذاكر' : 'Activities & Tickets'}</Text>
                        <Text style={[styles.budgetValue, { color: C.textMain }]}>{tripBudget.activities.toLocaleString()} EGP</Text>
                    </View>
                    <View style={[styles.budgetItem, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Ionicons name="restaurant-outline" size={16} color={C.textMuted} />
                        <Text style={[styles.budgetLabel, { color: C.textMuted }, isRTL && { textAlign: 'right' }]}>{isRTL ? 'الطعام (تقديري)' : 'Meals (Est.)'}</Text>
                        <Text style={[styles.budgetValue, { color: C.textMain }]}>{tripBudget.meals.toLocaleString()} EGP</Text>
                    </View>
                    <View style={[styles.budgetItem, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Ionicons name="business-outline" size={16} color={C.textMuted} />
                        <Text style={[styles.budgetLabel, { color: C.textMuted }, isRTL && { textAlign: 'right' }]}>{isRTL ? 'الفنادق (متوسط)' : 'Hotels (Avg.)'}</Text>
                        <Text style={[styles.budgetValue, { color: C.textMain }]}>{tripBudget.hotel.toLocaleString()} EGP</Text>
                    </View>
                    <View style={[styles.budgetItem, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Ionicons name="car-outline" size={16} color={C.textMuted} />
                        <Text style={[styles.budgetLabel, { color: C.textMuted }, isRTL && { textAlign: 'right' }]}>{isRTL ? 'التنقلات' : 'Transport'}</Text>
                        <Text style={[styles.budgetValue, { color: C.textMain }]}>{tripBudget.transport.toLocaleString()} EGP</Text>
                    </View>
                </View>

                <View style={[styles.budgetTotalRow, { borderTopColor: C.borderSoft || '#333' }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.budgetTotalLabel, { color: C.textMain }]}>{isRTL ? 'الإجمالي التقديري' : 'Estimated Total'}</Text>
                    <Text style={[styles.budgetTotalValue, { color: C.primary }]}>{tripBudget.total.toLocaleString()} EGP</Text>
                </View>
                <Text style={[styles.budgetDisclaimer, { color: C.textMuted }, isRTL && { textAlign: 'right' }]}>
                    {isRTL ? '* هذه الأسعار تقريبية وقد تتغير حسب اختيارك الفعلي للمطاعم والفنادق.' : '* These are estimated costs and may vary based on your actual hotel and dining choices.'}
                </Text>
            </View>
        );
    };

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
                    ListFooterComponent={renderBudgetEstimator}
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
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
                        <Text style={[styles.modalTitle, { color: C.textMain }]}>
                            {isRTL ? '✨ معالج الرحلة الذكية' : '✨ Smart Trip Wizard'}
                        </Text>

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

                        {/* Trip Style */}
                        <Text style={[styles.label, { color: C.textMuted }]}>{isRTL ? 'نمط الرحلة' : 'TRIP STYLE'}</Text>
                        <View style={styles.durationRow}>
                            {[
                                { key: 'economy', icon: '🚌', label: isRTL ? 'اقتصادية' : 'Economy' },
                                { key: 'comfort', icon: '🚕', label: isRTL ? 'مريحة' : 'Comfort' },
                                { key: 'luxury', icon: '🚗', label: isRTL ? 'فاخرة' : 'Luxury' },
                            ].map(ts => (
                                <TouchableOpacity
                                    key={ts.key}
                                    style={[styles.travelerChip, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }, tripStyle === ts.key && { backgroundColor: C.primary, borderColor: C.primary }]}
                                    onPress={() => setTripStyle(ts.key)}
                                >
                                    <Text style={styles.travelerEmoji}>{ts.icon}</Text>
                                    <Text style={[styles.travelerLabel, { color: C.textMain }, tripStyle === ts.key && { color: '#000' }]}>{ts.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Duration */}
                        <Text style={[styles.label, { color: C.textMuted }]}>{t('durationDays')}</Text>
                        <View style={styles.durationRow}>
                            {[3, 5, 7, 10, 14].map(d => (
                                <TouchableOpacity
                                    key={d}
                                    style={[styles.durationBox, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }, duration === d && { backgroundColor: C.gold, borderColor: C.gold }]}
                                    onPress={() => setDuration(d)}
                                >
                                    <Text style={[styles.durationText, { color: C.textMain }, duration === d && { color: '#000' }]}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Interests */}
                        <Text style={[styles.label, { color: C.textMuted }]}>{t('yourInterests')}</Text>
                        <View style={styles.interestsGrid}>
                            {[
                                { cat: 'Pharaonic', icon: '🏛️' }, { cat: 'Islamic', icon: '🕌' },
                                { cat: 'Beach', icon: '🏖️' }, { cat: 'Nature', icon: '🌵' },
                                { cat: 'Diving', icon: '🤿' }, { cat: 'Cultural', icon: '🎭' },
                                { cat: 'Medical', icon: '♨️' }, { cat: 'Nightlife', icon: '🪩' },
                            ].map(({ cat, icon }) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.interestChip, { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.borderSoft || '#e0e0e0' }, selectedInterests.includes(cat) && { backgroundColor: C.primary, borderColor: C.primary }]}
                                    onPress={() => toggleInterest(cat)}
                                >
                                    <Text style={{ fontSize: 16 }}>{icon}</Text>
                                    <Text style={[styles.interestText, { color: C.textMain }, selectedInterests.includes(cat) && { color: '#000' }]}>
                                        {t('categories.' + cat) || cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Hidden Gems Toggle */}
                        <View style={[styles.gemRow, { borderColor: C.borderSoft || '#333' }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.gemTitle, { color: C.textMain }]}>
                                    {isRTL ? '💎 اكتشف الجواهر الخفية' : '💎 Discover Hidden Gems'}
                                </Text>
                                <Text style={[styles.gemSub, { color: C.textMuted }]}>
                                    {isRTL ? 'أضف أماكن أقل شهرة ولكنها مميزة' : 'Add lesser-known but unique spots'}
                                </Text>
                            </View>
                            <Switch
                                value={includeHiddenGems}
                                onValueChange={setIncludeHiddenGems}
                                trackColor={{ false: '#333', true: C.primary }}
                                thumbColor={includeHiddenGems ? C.gold : '#888'}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsWizardVisible(false)}>
                                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.generateBtn, { backgroundColor: isGenerating ? '#555' : C.gold }, { opacity: isGenerating ? 0.7 : 1 }]}
                                onPress={generateSmartTrip}
                                disabled={isGenerating}
                            >
                                {isGenerating
                                    ? <Ionicons name="hourglass-outline" size={18} color="#000" />
                                    : <Text style={styles.generateBtnText}>{t('generate')}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                    </ScrollView>
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
    activityCard: { flex: 1, borderRadius: 24, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    activityContent: { flexDirection: 'row', alignItems: 'center' },
    timeText: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
    activityTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    catTagText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
    chooseBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    submitRequestBtn: { flexDirection: 'row', height: 60, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    submitRequestText: { fontSize: 16, fontWeight: '900', color: '#000' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 },
    modalContent: { borderRadius: 36, padding: 32, backgroundColor: 'rgba(18, 18, 18, 0.9)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 24 },
    label: { fontSize: 12, fontWeight: '900', opacity: 0.6, marginBottom: 12, marginTop: 24 },
    durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    durationBox: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
    durationText: { fontSize: 16, fontWeight: '900', color: '#fff' },
    interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    interestChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 30, backgroundColor: '#1A1A1A' },
    interestText: { fontWeight: '700', fontSize: 13, color: 'rgba(255,255,255,0.6)' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 40, gap: 16 },
    cancelBtn: { padding: 16 },
    cancelBtnText: { fontWeight: '900', color: '#555' },
    generateBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', minWidth: 120 },
    generateBtnText: { fontWeight: '900', color: '#000' },
    travelerChip: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, backgroundColor: '#1A1A1A' },
    travelerEmoji: { fontSize: 20, marginBottom: 4 },
    travelerLabel: { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.6)' },
    gemRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
    gemTitle: { fontSize: 14, fontWeight: '800', marginBottom: 3 },
    gemSub: { fontSize: 11, fontWeight: '600', opacity: 0.7 },
});

