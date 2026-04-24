import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useUser } from '../store/UserContext';

const fontFamilyHeavy = Platform.OS === 'ios' ? 'Futura' : 'sans-serif-black';
const fontFamilyMedium = Platform.OS === 'ios' ? 'San Francisco' : 'sans-serif-medium';

const CULTURE_CATEGORIES = [
    { id: 1, title: 'Language', titleAr: 'اللغة', icon: 'chatbubbles', color: '#3B82F6' },
    { id: 2, title: 'Etiquette', titleAr: 'الآداب', icon: 'globe', color: '#10B981' },
    { id: 3, title: 'Cuisine', titleAr: 'المطبخ', icon: 'restaurant', color: '#F59E0B' },
    { id: 4, title: 'Arts', titleAr: 'الفنون', icon: 'color-palette', color: '#EC4899' },
];

const ESSENTIAL_TIPS = [
    {
        id: 1,
        title: "Online Tickets Guide",
        titleAr: "دليل التذاكر",
        content: "To avoid long queues, book your tickets online in advance through official portals.",
        contentAr: "لتجنب الطوابير الطويلة، خاصة في المعالم الرئيسيةاحجز تذاكرك مسبقاً عبر البوابات الرسمية.",
        icon: "ticket"
    },
    {
        id: 2,
        title: "Street Food Safety",
        titleAr: "طعام الشارع",
        content: "Cairo's street food is delicious. Opt for busy stalls and wash fruits.",
        contentAr: "اختر الأكشاك المزدحمة، واغسل الفواكه، واشرب المياه المعبأة.",
        icon: "restaurant"
    },
    {
        id: 3,
        title: "Modest Dress Code",
        titleAr: "اللباس المحتشم",
        content: "When visiting mosques and local areas, dress modestly. Cover shoulders and knees.",
        contentAr: "عند زيارة المساجد والمناطق المحلية، ارتدِ ملابس محتشمة تغطي الأكتاف والركبتين.",
        icon: "shirt"
    }
];

export default function CultureScreen() {
    const { t, settings } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top', 'left', 'right']}>
            <View style={[styles.headerBlock, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.titleLine, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'الثقافة' : 'CULTURE'}
                </Text>
                <Text style={[styles.titleLine, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'المصرية' : 'EGYPTIAN'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: C.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('cultureSubtitle')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Categories Grid - Brutalist Pills */}
                <View style={[styles.categoriesGrid, isRTL && { flexDirection: 'row-reverse' }]}>
                    {CULTURE_CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.id} style={[styles.categoryPill, { backgroundColor: C.bgCard, borderColor: C.borderGold }]}>
                            <View style={[styles.categoryIconWrap, { borderRightColor: C.borderGold, borderRightWidth: isRTL ? 0 : 2, borderLeftColor: C.borderGold, borderLeftWidth: isRTL ? 2 : 0 }]}>
                                <Ionicons name={cat.icon} size={24} color={C.textMain} />
                            </View>
                            <View style={styles.categoryTextWrap}>
                                <Text style={[styles.categoryTitle, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{isRTL ? cat.titleAr : cat.title}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Essential Tips Heading */}
                <Text style={[styles.sectionTitle, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{t('essentialTips')}</Text>

                {/* Brutalist Tip List */}
                <View style={styles.tipsList}>
                    {ESSENTIAL_TIPS.map((tip) => (
                        <View key={tip.id} style={[styles.tipCard, { backgroundColor: C.bgCard, borderColor: C.borderGold }, isRTL && { flexDirection: 'row-reverse' }]}>
                            <View style={[styles.tipIcon, { borderRightColor: C.borderGold, borderRightWidth: isRTL ? 0 : 2, borderLeftColor: C.borderGold, borderLeftWidth: isRTL ? 2 : 0 }]}>
                                <Ionicons name={tip.icon} size={32} color={C.primary} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={[styles.tipTitle, { color: C.textMain }, isRTL && { textAlign: 'right' }]}>{isRTL ? tip.titleAr : tip.title}</Text>
                                <Text style={[styles.tipText, { color: C.textMuted }, isRTL && { textAlign: 'right' }]}>{isRTL ? tip.contentAr : tip.content}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBlock: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
    },
    titleLine: {
        fontFamily: fontFamilyHeavy,
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -1.5,
        lineHeight: 52,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontFamily: fontFamilyMedium,
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: SPACING.sm,
    },
    content: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.xxl,
    },
    categoryPill: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 30,
        marginBottom: SPACING.sm,
    },
    categoryIconWrap: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryTextWrap: {
        flex: 1,
        paddingHorizontal: SPACING.sm,
    },
    categoryTitle: {
        fontFamily: fontFamilyHeavy,
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontFamily: fontFamilyHeavy,
        fontSize: 24,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: SPACING.lg,
    },
    tipsList: {
        flexDirection: 'column',
    },
    tipCard: {
        flexDirection: 'row',
        borderWidth: 2,
        borderRadius: 16,
        marginBottom: SPACING.md,
        overflow: 'hidden',
    },
    tipIcon: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipContent: {
        flex: 1,
        padding: SPACING.md,
    },
    tipTitle: {
        fontFamily: fontFamilyHeavy,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    tipText: {
        fontFamily: fontFamilyMedium,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 22,
    },
});
