import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSettings } from '../store/SettingsContext';
import { COLORS, DARK_COLORS, getFontFamily } from '../constants/theme';
import { PHRASEBOOK_DATA } from '../constants/phrasebookData';
import DynamicBackground from '../components/DynamicBackground';

export default function PhrasebookScreen({ navigation }) {
    const { settings, t } = useSettings();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [activeCategory, setActiveCategory] = useState(PHRASEBOOK_DATA[0].category);

    const renderPhrase = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} style={[styles.phraseCard, { backgroundColor: C.bgCard }]}>
            <Text style={[styles.phraseEn, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{item.en}</Text>
            <View style={styles.arContainer}>
                <Text style={[styles.phraseAr, { color: C.primary, fontFamily: getFontFamily(isRTL, 'bold') }]}>{item.ar}</Text>
            </View>
        </Animated.View>
    );

    const activeData = PHRASEBOOK_DATA.find(c => c.category === activeCategory)?.phrases || [];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground city="Cairo" />

            <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color={C.textMain} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{t('phrasebookTitle')}</Text>
            </View>

            <View style={[styles.categoriesWrap, { height: 45 }]}>
                <FlashList
                    horizontal
                    data={PHRASEBOOK_DATA}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.category}
                    renderItem={({ item }) => {
                        const isActive = activeCategory === item.category;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.categoryChip,
                                    { borderColor: C.borderSoft || '#333', backgroundColor: isActive ? C.primary : C.bgCard }
                                ]}
                                onPress={() => setActiveCategory(item.category)}
                            >
                                <Ionicons name={item.icon} size={16} color={isActive ? '#000' : C.primary} style={{ marginRight: 6 }} />
                                <Text style={[styles.categoryText, { color: isActive ? '#000' : C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>
                                    {item.category.split(' / ')[isRTL ? 1 : 0]}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                    estimatedItemSize={120}
                    contentContainerStyle={[styles.categoriesList, isRTL && { flexDirection: 'row-reverse' }]}
                />
            </View>

            <View style={{ flex: 1 }}>
                <FlashList
                    data={activeData}
                    keyExtractor={item => item.en}
                renderItem={renderPhrase}
                    contentContainerStyle={styles.phrasesList}
                    showsVerticalScrollIndicator={false}
                    estimatedItemSize={90}
                />
            </View>
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
    title: { fontSize: 24, fontWeight: '900' },
    categoriesWrap: { marginBottom: 16 },
    categoriesList: { paddingHorizontal: 20, gap: 10 },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryText: { fontSize: 14, fontWeight: '700' },
    phrasesList: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
    phraseCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    phraseEn: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    arContainer: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 12,
        borderRadius: 8,
    },
    phraseAr: { fontSize: 16, fontWeight: '900', textAlign: 'right' },
});
