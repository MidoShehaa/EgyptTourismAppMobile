import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { CATEGORIES } from '../constants/placesData';
import DynamicBackground from '../components/DynamicBackground';
import SafeImage from '../components/SafeImage';
import WeatherWidget from '../components/WeatherWidget';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH * 0.7;

export default function HomeScreen({ navigation }) {
    const { settings, t, places, hotels, isFavorite } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    // Get Top Rated Places for "Trending Now"
    const trendingPlaces = useMemo(() => {
        if (!places) return [];
        return [...places]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
    }, [places]);

    // Get Top Rated Hotels for "Recommended For You"
    const recommendedHotels = useMemo(() => {
        if (!hotels) return [];
        return [...hotels]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
    }, [hotels]);

    // Random Suggestion
    const dailySuggestion = useMemo(() => {
        if (!places || places.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * places.length);
        return places[randomIndex];
    }, [places]);

    const renderHeader = () => (
        <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.greeting, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('welcome')}
                </Text>
                <Text style={[styles.title, { color: C.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('appName')}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                    style={[styles.headerBtn, { backgroundColor: '#E74C3C20' }]}
                    onPress={() => navigation.navigate('Emergency')}
                >
                    <Ionicons name="shield-checkmark" size={22} color="#E74C3C" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.headerBtn, { backgroundColor: C.primary + '20' }]}
                    onPress={() => navigation.navigate('TourGuide')}
                >
                    <Ionicons name="chatbubble-ellipses" size={22} color={C.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.headerBtn, { backgroundColor: C.bgElevated }]}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Ionicons name="person-outline" size={22} color={C.textMain} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSearchBar = () => (
        <TouchableOpacity 
            style={[styles.searchBar, { backgroundColor: C.bgElevated, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Search')}
        >
            <Ionicons name="search" size={24} color={C.textMuted} />
            <Text style={[styles.searchText, { color: C.textMuted, textAlign: isRTL ? 'right' : 'left', flex: 1, paddingHorizontal: 12 }]}>
                {t('searchPlaceholder')}
            </Text>
            <View style={[styles.searchFilter, { backgroundColor: C.primary }]}>
                <Ionicons name="options" size={20} color="#000" />
            </View>
        </TouchableOpacity>
    );

    const renderCategories = () => (
        <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[styles.sectionTitle, { color: C.textMain }]}>{t('categories')}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoriesScroll, isRTL && { flexDirection: 'row-reverse' }]}>
                {CATEGORIES.map(cat => (
                    <TouchableOpacity 
                        key={cat.id} 
                        style={[styles.categoryCard, { backgroundColor: C.bgElevated }]}
                        onPress={() => navigation.navigate('Explore', { category: cat.id })}
                    >
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text style={[styles.categoryText, { color: C.textMain }]}>{isRTL ? cat.name : cat.nameEn}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderPlaceCard = (item, isDaily = false) => {
        const placeName = isRTL ? item.name : item.nameEn;
        const placeCity = isRTL ? item.city : item.cityEn;
        
        return (
            <TouchableOpacity 
                key={item.id}
                style={[styles.placeCard, { width: isDaily ? SCREEN_WIDTH - 40 : CARD_WIDTH, backgroundColor: C.bgCard }]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('PlaceDetails', { place: item })}
            >
                <SafeImage 
                    uri={item.imageUrl}
                    style={styles.cardImage}
                    icon="place"
                />
                <View style={[styles.cardTopOverlay, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={C.primary} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <Ionicons
                        name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite(item.id) ? '#FF5252' : '#fff'}
                    />
                </View>
                <View style={styles.cardBottomOverlay}>
                    <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={styles.glassContent}>
                        <Text style={[styles.cardTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>{placeName}</Text>
                        <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Ionicons name="location-sharp" size={12} color={C.primary} />
                            <Text style={[styles.locationText, { color: '#fff' }]}>{placeCity}</Text>
                        </View>
                    </BlurView>
                </View>
            </TouchableOpacity>
        );
    };

    const renderHotelCard = (item) => {
        const hotelName = isRTL ? (item.nameAr || item.name) : (item.nameEn || item.name);
        const hotelCity = isRTL ? (item.cityAr || item.city) : (item.cityEn || item.city);
        
        return (
            <TouchableOpacity 
                key={item.id}
                style={[styles.placeCard, { width: CARD_WIDTH, backgroundColor: C.bgCard }]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Hotels', { city: item.city })}
            >
                <SafeImage 
                    uri={item.image}
                    style={styles.cardImage}
                    icon="hotel"
                />
                <View style={[styles.cardTopOverlay, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={C.primary} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>
                <View style={styles.cardBottomOverlay}>
                    <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={styles.glassContent}>
                        <Text style={[styles.cardTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>{hotelName}</Text>
                        <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Ionicons name="location-sharp" size={12} color={C.primary} />
                            <Text style={[styles.locationText, { color: '#fff' }]}>{hotelCity}</Text>
                        </View>
                    </BlurView>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground city="Cairo" />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {renderHeader()}
                {renderSearchBar()}
                
                {/* Weather Widget */}
                <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                    <WeatherWidget city="Cairo" colors={C} isRTL={isRTL} />
                </View>

                {renderCategories()}
                
                {/* Trending Places */}
                <View style={styles.section}>
                    <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.sectionTitle, { color: C.textMain }]}>{t('trendingNow')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                            <Text style={[styles.seeAllText, { color: C.primary }]}>{t('seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.horizontalScroll, isRTL && { flexDirection: 'row-reverse' }]}>
                        {trendingPlaces.map(item => renderPlaceCard(item))}
                    </ScrollView>
                </View>

                {/* Daily Suggestion */}
                {dailySuggestion && (
                    <View style={styles.section}>
                        <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.sectionTitle, { color: C.textMain }]}>{t('randomSuggestion')}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 20 }}>
                            {renderPlaceCard(dailySuggestion, true)}
                        </View>
                    </View>
                )}

                {/* Recommended Hotels */}
                <View style={[styles.section, { paddingBottom: 100 }]}>
                    <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.sectionTitle, { color: C.textMain }]}>{t('recommendedForYou')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Hotels')}>
                            <Text style={[styles.seeAllText, { color: C.primary }]}>{t('seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.horizontalScroll, isRTL && { flexDirection: 'row-reverse' }]}>
                        {recommendedHotels.map(item => renderHotelCard(item))}
                    </ScrollView>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 20,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 18,
        fontWeight: '600',
        opacity: 0.8,
        marginBottom: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
    },
    searchBar: {
        marginHorizontal: 20,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchText: {
        fontSize: 16,
        fontWeight: '600',
    },
    searchFilter: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '700',
    },
    categoriesScroll: {
        paddingHorizontal: 15,
        gap: 12,
    },
    categoryCard: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        width: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    horizontalScroll: {
        paddingHorizontal: 15,
        gap: 16,
    },
    placeCard: {
        height: 280,
        borderRadius: 32,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardTopOverlay: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    cardBottomOverlay: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
    glassContent: {
        padding: 16,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.9,
    },
});
