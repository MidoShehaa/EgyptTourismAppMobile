import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS } from '../constants/theme';
import { CATEGORIES } from '../constants/placesData';
import DynamicBackground from '../components/DynamicBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'explorer_5',     icon: '🏛️', threshold: 5,   type: 'favorites', nameEn: 'Explorer',            nameAr: 'مستكشف',            descEn: 'Add 5 places to favorites',     descAr: 'أضف 5 أماكن للمفضلة' },
    { id: 'explorer_15',    icon: '🌍', threshold: 15,  type: 'favorites', nameEn: 'World Traveler',       nameAr: 'مسافر عالمي',        descEn: 'Add 15 places to favorites',    descAr: 'أضف 15 مكاناً للمفضلة' },
    { id: 'explorer_30',    icon: '👑', threshold: 30,  type: 'favorites', nameEn: 'Egypt Master',         nameAr: 'خبير مصر',           descEn: 'Add 30 places to favorites',    descAr: 'أضف 30 مكاناً للمفضلة' },
    { id: 'planner_1',      icon: '📅', threshold: 1,   type: 'days',      nameEn: 'First Plan',           nameAr: 'أول خطة',            descEn: 'Create your first itinerary',   descAr: 'أنشئ أول خطة رحلة' },
    { id: 'planner_3',      icon: '🗺️', threshold: 3,   type: 'days',      nameEn: 'Trip Planner',         nameAr: 'مخطط رحلات',         descEn: 'Plan a 3-day trip',             descAr: 'خطط لرحلة 3 أيام' },
    { id: 'planner_7',      icon: '✈️', threshold: 7,   type: 'days',      nameEn: 'Grand Tour',           nameAr: 'الجولة الكبرى',      descEn: 'Plan a 7-day trip',             descAr: 'خطط لرحلة 7 أيام' },
    { id: 'pharaonic',      icon: '🔺', threshold: 3,   type: 'category',  category: 'Pharaonic', nameEn: 'Pharaoh\'s Friend',  nameAr: 'صديق الفراعنة',      descEn: 'Favorite 3 Pharaonic sites',    descAr: 'فضّل 3 مواقع فرعونية' },
    { id: 'diver',          icon: '🤿', threshold: 2,   type: 'category',  category: 'Diving',    nameEn: 'Deep Diver',         nameAr: 'غواص محترف',         descEn: 'Favorite 2 diving spots',       descAr: 'فضّل موقعين غوص' },
    { id: 'beach_lover',    icon: '🏖️', threshold: 3,   type: 'category',  category: 'Beach',     nameEn: 'Beach Lover',        nameAr: 'عاشق الشواطئ',       descEn: 'Favorite 3 beaches',            descAr: 'فضّل 3 شواطئ' },
    { id: 'culture_buff',   icon: '🕌', threshold: 3,   type: 'category',  category: 'Islamic',   nameEn: 'Culture Buff',       nameAr: 'محب الثقافة',        descEn: 'Favorite 3 Islamic sites',      descAr: 'فضّل 3 مواقع إسلامية' },
    { id: 'cities_3',       icon: '🏙️', threshold: 3,   type: 'cities',    nameEn: 'City Hopper',          nameAr: 'متنقل المدن',        descEn: 'Favorite places in 3 cities',   descAr: 'فضّل أماكن في 3 مدن' },
    { id: 'cities_6',       icon: '🚀', threshold: 6,   type: 'cities',    nameEn: 'Egypt Explorer',       nameAr: 'مستكشف مصر',         descEn: 'Favorite places in 6 cities',   descAr: 'فضّل أماكن في 6 مدن' },
];

export default function TripStatsScreen({ navigation }) {
    const { settings, favorites, itinerary, places } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const stats = useMemo(() => {
        const favPlaces = (places || []).filter(p => favorites.includes(p.id));
        const cities = [...new Set(favPlaces.map(p => p.cityEn || p.city))];
        const daysPlanned = itinerary?.days?.filter(d => d.activities?.length > 0)?.length || 0;
        const totalActivities = itinerary?.days?.reduce((sum, d) => sum + (d.activities?.length || 0), 0) || 0;

        // Category breakdown
        const categoryBreakdown = {};
        favPlaces.forEach(p => {
            const cat = p.category || 'Other';
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
        });

        return {
            favCount: favorites.length,
            citiesCount: cities.length,
            cities,
            daysPlanned,
            totalActivities,
            categoryBreakdown,
            favPlaces,
        };
    }, [favorites, places, itinerary]);

    // Evaluate achievements
    const achievements = useMemo(() => {
        return ACHIEVEMENTS.map(ach => {
            let current = 0;
            if (ach.type === 'favorites') current = stats.favCount;
            else if (ach.type === 'days') current = stats.daysPlanned;
            else if (ach.type === 'cities') current = stats.citiesCount;
            else if (ach.type === 'category') current = stats.categoryBreakdown[ach.category] || 0;

            return {
                ...ach,
                current,
                unlocked: current >= ach.threshold,
                progress: Math.min(current / ach.threshold, 1),
            };
        });
    }, [stats]);

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground city="Cairo" />

            <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color={C.textMain} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: C.textMain }]}>{isRTL ? 'إحصائيات رحلتي' : 'My Trip Stats'}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Summary Cards */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: C.bgCard }]}>
                        <View style={[styles.statIconCircle, { backgroundColor: '#FFD70020' }]}>
                            <Text style={{ fontSize: 28 }}>❤️</Text>
                        </View>
                        <Text style={[styles.statNumber, { color: C.textMain }]}>{stats.favCount}</Text>
                        <Text style={[styles.statLabel, { color: C.textMuted }]}>{isRTL ? 'مكان مفضل' : 'Favorites'}</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: C.bgCard }]}>
                        <View style={[styles.statIconCircle, { backgroundColor: '#4A90D920' }]}>
                            <Text style={{ fontSize: 28 }}>🏙️</Text>
                        </View>
                        <Text style={[styles.statNumber, { color: C.textMain }]}>{stats.citiesCount}</Text>
                        <Text style={[styles.statLabel, { color: C.textMuted }]}>{isRTL ? 'مدينة' : 'Cities'}</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: C.bgCard }]}>
                        <View style={[styles.statIconCircle, { backgroundColor: '#2ECC7120' }]}>
                            <Text style={{ fontSize: 28 }}>📅</Text>
                        </View>
                        <Text style={[styles.statNumber, { color: C.textMain }]}>{stats.daysPlanned}</Text>
                        <Text style={[styles.statLabel, { color: C.textMuted }]}>{isRTL ? 'يوم مخطط' : 'Days Planned'}</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: C.bgCard }]}>
                        <View style={[styles.statIconCircle, { backgroundColor: '#E74C3C20' }]}>
                            <Text style={{ fontSize: 28 }}>📍</Text>
                        </View>
                        <Text style={[styles.statNumber, { color: C.textMain }]}>{stats.totalActivities}</Text>
                        <Text style={[styles.statLabel, { color: C.textMuted }]}>{isRTL ? 'نشاط في الخطة' : 'Activities'}</Text>
                    </View>
                </View>

                {/* Category Breakdown */}
                {Object.keys(stats.categoryBreakdown).length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: C.textMain }]}>{isRTL ? '📊 توزيع التصنيفات' : '📊 Category Breakdown'}</Text>
                        <View style={[styles.breakdownCard, { backgroundColor: C.bgCard }]}>
                            {Object.entries(stats.categoryBreakdown)
                                .sort(([,a], [,b]) => b - a)
                                .map(([cat, count]) => {
                                    const catInfo = CATEGORIES.find(c => c.id === cat);
                                    const maxCount = Math.max(...Object.values(stats.categoryBreakdown));
                                    const barWidth = (count / maxCount) * 100;
                                    return (
                                        <View key={cat} style={styles.breakdownRow}>
                                            <View style={[styles.breakdownLabel, isRTL && { flexDirection: 'row-reverse' }]}>
                                                <Text style={{ fontSize: 18 }}>{catInfo?.icon || '📌'}</Text>
                                                <Text style={[styles.breakdownText, { color: C.textMain }]}>
                                                    {isRTL ? (catInfo?.name || cat) : (catInfo?.nameEn || cat)}
                                                </Text>
                                            </View>
                                            <View style={styles.barContainer}>
                                                <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: C.primary }]} />
                                            </View>
                                            <Text style={[styles.breakdownCount, { color: C.primary }]}>{count}</Text>
                                        </View>
                                    );
                                })}
                        </View>
                    </View>
                )}

                {/* Achievements */}
                <View style={styles.section}>
                    <View style={[styles.achievementHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.sectionTitle, { color: C.textMain }]}>{isRTL ? '🏆 الإنجازات' : '🏆 Achievements'}</Text>
                        <View style={[styles.achievementCounter, { backgroundColor: C.primary }]}>
                            <Text style={styles.achievementCounterText}>{unlockedCount}/{achievements.length}</Text>
                        </View>
                    </View>

                    <View style={styles.achievementGrid}>
                        {achievements.map(ach => (
                            <View
                                key={ach.id}
                                style={[
                                    styles.achievementCard,
                                    { backgroundColor: C.bgCard, opacity: ach.unlocked ? 1 : 0.5 },
                                    ach.unlocked && { borderColor: C.primary, borderWidth: 2 }
                                ]}
                            >
                                <Text style={styles.achievementIcon}>{ach.icon}</Text>
                                <Text style={[styles.achievementName, { color: C.textMain }, isRTL && { textAlign: 'center' }]}>
                                    {isRTL ? ach.nameAr : ach.nameEn}
                                </Text>
                                <Text style={[styles.achievementDesc, { color: C.textMuted }, isRTL && { textAlign: 'center' }]}>
                                    {isRTL ? ach.descAr : ach.descEn}
                                </Text>

                                {/* Progress bar */}
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${ach.progress * 100}%`, backgroundColor: ach.unlocked ? C.primary : C.textMuted }]} />
                                </View>
                                <Text style={[styles.progressText, { color: ach.unlocked ? C.primary : C.textMuted }]}>
                                    {ach.current}/{ach.threshold}
                                </Text>

                                {ach.unlocked && (
                                    <View style={[styles.unlockedBadge, { backgroundColor: C.primary }]}>
                                        <Ionicons name="checkmark" size={12} color="#000" />
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 16,
    },
    backBtn: { padding: 4 },
    title: { fontSize: 28, fontWeight: '900' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 30,
    },
    statCard: {
        width: (SCREEN_WIDTH - 52) / 2,
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 36,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 16 },
    breakdownCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 16,
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    breakdownLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 120,
    },
    breakdownText: { fontSize: 14, fontWeight: '700' },
    barContainer: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    barFill: { height: '100%', borderRadius: 4 },
    breakdownCount: { fontSize: 16, fontWeight: '900', minWidth: 30, textAlign: 'right' },
    achievementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    achievementCounter: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    achievementCounterText: { color: '#000', fontWeight: '900', fontSize: 14 },
    achievementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    achievementCard: {
        width: (SCREEN_WIDTH - 52) / 2,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    achievementIcon: { fontSize: 36, marginBottom: 8 },
    achievementName: { fontSize: 15, fontWeight: '900', marginBottom: 4, textAlign: 'center' },
    achievementDesc: { fontSize: 12, fontWeight: '500', textAlign: 'center', marginBottom: 12, lineHeight: 16 },
    progressBar: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: { height: '100%', borderRadius: 3 },
    progressText: { fontSize: 12, fontWeight: '800' },
    unlockedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
