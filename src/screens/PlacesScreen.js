import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    StatusBar,
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { places, CATEGORIES } from '../constants/placesData';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useUser } from '../store/UserContext';

const fontFamilyHeavy = Platform.OS === 'ios' ? 'Futura' : 'sans-serif-black';
const fontFamilyMedium = Platform.OS === 'ios' ? 'San Francisco' : 'sans-serif-medium';

const PlaceCard = React.memo(({ item, isRTL, C, t, navigation, isFavorite, toggleFavorite }) => {
    const placeName = isRTL ? item.name : item.nameEn;
    const placeCity = isRTL ? item.city : item.cityEn;
    const placeDesc = isRTL ? item.description : item.descriptionEn;
    const [imgError, setImgError] = useState(false);

    return (
        <View style={styles.cardWrapper}>
            <View style={[styles.card, { backgroundColor: C.bgCard, borderColor: C.borderMain || '#000' }]}>
                {imgError ? (
                    <View style={[styles.cardImage, styles.imgPlaceholder, { backgroundColor: C.bgElevated }]}>
                        <Text style={styles.imgPlaceholderEmoji}>{item.image}</Text>
                        <Text style={[styles.imgPlaceholderText, { color: C.textMuted }]}>{placeName}</Text>
                    </View>
                ) : (
                    <Image
                        source={item.imageSource ? item.imageSource : {
                            uri: item.imageUrl,
                            headers: { 'User-Agent': 'EgyptTourismApp/1.0' }
                        }}
                        style={[styles.cardImage, { borderColor: C.borderMain || '#000' }]}
                        onError={() => setImgError(true)}
                    />
                )}

                <TouchableOpacity
                    style={[styles.favoriteButton, isRTL ? { left: 16 } : { right: 16 }]}
                    onPress={() => toggleFavorite(item.id)}
                >
                    <Ionicons
                        name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                        size={24}
                        color={isFavorite(item.id) ? COLORS.error : '#fff'}
                    />
                </TouchableOpacity>

                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: C.textMain }, isRTL && { textAlign: 'right' }]} numberOfLines={2}>{placeName}</Text>

                    <View style={[styles.cardMetaRow, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={[styles.cardPill, { borderColor: C.borderMain || '#000' }]}>
                            <Text style={[styles.cardPillText, { color: C.textMain }]}>{t('categories.' + item.category)}</Text>
                        </View>
                        <View style={[styles.cardPill, { borderColor: C.borderMain || '#000' }]}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={[styles.cardPillText, { color: C.textMain, marginLeft: 4 }]}>{item.rating}</Text>
                        </View>
                    </View>

                    <Text style={[styles.cardDescription, { color: C.textMuted }, isRTL && { textAlign: 'right' }]} numberOfLines={2}>
                        {placeDesc}
                    </Text>

                    <View style={[styles.cardFooter, { borderTopColor: C.borderSubtle }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={isRTL ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }}>
                            <Text style={[styles.priceLabel, { color: C.textMuted }]}>{t('price')}</Text>
                            <Text style={[styles.priceText, { color: C.textMain }]}>{item.price}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.bookButton, { backgroundColor: '#CC9933', borderColor: '#000' }]}
                            onPress={() => navigation.navigate('PlaceDetails', { place: item })}
                        >
                            <Text style={[styles.bookButtonText, { color: '#000' }]}>{isRTL ? 'تفاصيل أكثر' : 'VIEW DETAILS'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
});

export default function PlacesScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { toggleFavorite, isFavorite, t, settings } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const filteredPlaces = useMemo(() => {
        return places.filter(place => {
            const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
            const matchesSearch = searchQuery === '' ||
                place.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                place.cityEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                place.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const handleCategoryChange = (category) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedCategory(category);
    };

    const renderPlaceCard = ({ item }) => (
        <PlaceCard
            item={item}
            isRTL={isRTL}
            C={C}
            t={t}
            navigation={navigation}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
        />
    );

    const renderHeader = () => (
        <View>
            {/* Search Bar - Brutalist Style */}
            <View style={[styles.topBar, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[styles.searchPill, { backgroundColor: C.bgCard, borderColor: C.borderMain || '#000' }]}>
                    <Ionicons name="search" size={20} color={C.textMuted} style={isRTL ? { marginLeft: 12 } : { marginRight: 12 }} />
                    <TextInput
                        style={[styles.searchInput, { color: C.textMain }, isRTL && { textAlign: 'right' }]}
                        placeholder={t('searchPlaceholder')}
                        placeholderTextColor={C.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Brutalist Header Block */}
            <View style={[styles.headerBlock, isRTL && { alignItems: 'flex-end' }]}>
                <Text 
                    style={[styles.titleLine, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                >
                    {isRTL ? 'استكشف' : 'EXPLORING'}
                </Text>
                <Text 
                    style={[styles.titleLine, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                >
                    {isRTL ? 'مصر' : 'EGYPT'}
                </Text>

                <View style={[styles.headerSubBlock, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.headerBody, { color: C.textMain }, isRTL && { textAlign: 'right', marginRight: 0, marginLeft: 16 }]}>
                        {isRTL ? 'رحلة لا تُنسى عبر أبرز معالم البلاد التاريخية والسياحية المميزة.' : 'An unforgettable journey through the country\'s main attractions.'}
                    </Text>
                    <View style={styles.headerMeta}>
                        <Text style={[styles.headerMetaText, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                            {isRTL ? 'اكتشف ٤٤ مَعلماً' : 'UNCOVER 44'}
                        </Text>
                        <Text style={[styles.headerMetaText, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                            {isRTL ? 'ابدأ الآن.' : 'HIDDEN GEMS.'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
            >
                {CATEGORIES.map(category => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryChip,
                            { 
                                backgroundColor: selectedCategory === category.id ? '#000' : C.bgCard, 
                                borderColor: selectedCategory === category.id ? '#000' : C.borderMain || '#000' 
                            }
                        ]}
                        onPress={() => handleCategoryChange(category.id)}
                    >
                        <Text
                            style={[
                                styles.categoryChipText,
                                { color: selectedCategory === category.id ? '#fff' : C.textMain }
                            ]}
                        >
                            {t('categories.' + category.id)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bgMain} />

            <FlatList
                data={filteredPlaces}
                renderItem={renderPlaceCard}
                keyExtractor={item => item.id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: SPACING.md }}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.lg,
        alignItems: 'center',
    },
    searchPill: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    headerBlock: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
    },
    titleLine: {
        fontFamily: fontFamilyHeavy,
        fontSize: 62,
        fontWeight: '900',
        letterSpacing: -2,
        lineHeight: 64,
        textTransform: 'uppercase',
    },
    headerSubBlock: {
        flexDirection: 'row',
        marginTop: SPACING.lg,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerBody: {
        flex: 1.2,
        fontSize: 15,
        lineHeight: 22,
        marginRight: 16,
        fontWeight: '700',
    },
    headerMeta: {
        flex: 0.8,
    },
    headerMetaText: {
        fontSize: 12,
        fontWeight: '900',
        lineHeight: 18,
        textTransform: 'uppercase',
    },
    categoriesContainer: {
        paddingBottom: SPACING.md,
    },
    categoriesContent: {
        paddingHorizontal: SPACING.md,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    cardWrapper: {
        marginBottom: SPACING.lg,
    },
    card: {
        borderRadius: 24,
        borderWidth: 3,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 300,
        borderBottomWidth: 3,
    },
    imgPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgPlaceholderEmoji: {
        fontSize: 48,
    },
    imgPlaceholderText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        padding: SPACING.lg,
        gap: 12,
    },
    cardTitle: {
        fontFamily: fontFamilyHeavy,
        fontSize: 32,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: -1,
        lineHeight: 36,
    },
    cardMetaRow: {
        flexDirection: 'row',
        gap: 8,
    },
    cardPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    cardPillText: {
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    cardDescription: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 2,
    },
    priceLabel: {
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    priceText: {
        fontSize: 22,
        fontWeight: '900',
    },
    bookButton: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 2,
    },
    bookButtonText: {
        fontSize: 13,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
});
