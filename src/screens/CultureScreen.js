import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const CULTURE_CATEGORIES = [
    { id: 1, title: 'Language', titleAr: 'اللغة', icon: 'chatbubbles', color: '#3B82F6' },
    { id: 2, title: 'Etiquette', titleAr: 'الآداب', icon: 'globe', color: '#10B981' },
    { id: 3, title: 'Cuisine', titleAr: 'المطبخ', icon: 'restaurant', color: '#F59E0B' },
    { id: 4, title: 'Arts', titleAr: 'الفنون', icon: 'color-palette', color: '#EC4899' },
];

const DAILY_TIP = {
    title: "Tip of the Day",
    content: "When visiting mosques, always remove your shoes and dress modestly. Women should bring a scarf to cover their hair.",
};

export default function CultureScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Egyptian Culture</Text>
                    <Text style={styles.subtitle}>Traditions, customs & heritage</Text>
                </View>

                {/* Daily Tip */}
                <View style={styles.tipCard}>
                    <View style={styles.tipIcon}>
                        <Ionicons name="bulb" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>{DAILY_TIP.title}</Text>
                        <Text style={styles.tipText}>{DAILY_TIP.content}</Text>
                    </View>
                </View>

                {/* Categories Grid */}
                <View style={styles.grid}>
                    {CULTURE_CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                            <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                                <Ionicons name={cat.icon} size={28} color={cat.color} />
                            </View>
                            <Text style={styles.categoryTitle}>{cat.title}</Text>
                            <Text style={styles.categoryTitleAr}>{cat.titleAr}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgMain,
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    header: {
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.bgCard,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.borderGold,
        marginBottom: SPACING.xl,
    },
    tipIcon: {
        width: 48,
        height: 48,
        backgroundColor: `${COLORS.primary}15`,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    tipText: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 18,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '47%',
        backgroundColor: COLORS.bgCard,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    categoryIcon: {
        width: 60,
        height: 60,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    categoryTitleAr: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
});
