import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    LayoutAnimation,
    Platform,
    UIManager,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { FlashList } from '@shopify/flash-list';

import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CATEGORIES } from '../constants/placesData';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useSettings } from '../store/SettingsContext';
import { useData } from '../store/DataContext';
import { usePlanner } from '../store/PlannerContext';
import DynamicBackground from '../components/DynamicBackground';
import SafeImage from '../components/SafeImage';
import * as Location from 'expo-location';

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};const PlaceCard = React.memo(({ item, isRTL, C, t, navigation, isFavorite, toggleFavorite }) => {
    const placeName = isRTL ? item.name : item.nameEn;
    const placeCity = isRTL ? item.city : item.cityEn;
    return (
        <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.cardWrapper}
            onPress={() => navigation.navigate('PlaceDetails', { place: item })}
        >
            <View style={[styles.card, { backgroundColor: C.bgCard }]}>
                <SafeImage 
                    uri={item.imageUrl || item.image}
                    style={styles.cardImage}
                    icon="place"
                />

                {/* Top Overlay: Favorite & Rating */}
                <View style={[styles.cardTopOverlay, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color={C.primary} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    
                    <TouchableOpacity
                        style={styles.favoriteCircle}
                        onPress={() => toggleFavorite(item.id)}
                    >
                        <Ionicons
                            name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isFavorite(item.id) ? '#FF5252' : '#fff'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Bottom Overlay: Title & Price */}
                <View style={styles.cardBottomOverlay}>
                    <BlurView intensity={30} tint={C === DARK_COLORS ? 'dark' : 'light'} style={styles.glassContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>{placeName}</Text>
                            <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Ionicons name="location-sharp" size={12} color={C.primary} />
                                <Text style={[styles.locationText, isRTL && { textAlign: 'right' }]}>
                                    {placeCity} {item.distance !== undefined ? ` • ${Math.round(item.distance)} km` : ''}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={styles.cardPrice}>{item.price}</Text>
                        </View>
                    </BlurView>
                </View>
            </View>
        </TouchableOpacity>
    );
});


export default function PlacesScreen({ navigation, route }) {
    const { settings, t, showToast } = useSettings();
    const { places } = useData();
    const { isFavorite, toggleFavorite } = usePlanner();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || 'All');
    const [selectedCity, setSelectedCity] = useState('All');
    const [minRating, setMinRating] = useState(0);
    const [selectedPriceType, setSelectedPriceType] = useState('All');
    const [userLocation, setUserLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleCityChange = async (city) => {
        Haptics.selectionAsync();
        setSelectedCity(city);
        if (city === 'Nearby' && !userLocation) {
            setIsLocating(true);
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    showToast('Location permission denied', 'error', 'warning');
                    setSelectedCity('All');
                    setIsLocating(false);
                    return;
                }
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation(location.coords);
            } catch (err) {
                showToast('Could not fetch location', 'error', 'warning');
                setSelectedCity('All');
            }
            setIsLocating(false);
        }
    };

    const handleTitleTap = () => {
        navigation.navigate('AdminAuth');
    };

    const cities = useMemo(() => {
        const cSet = new Set();
        (places || []).forEach(p => {
            if (p.cityEn) cSet.add(p.cityEn);
            else if (p.city) cSet.add(p.city);
        });
        return Array.from(cSet).sort();
    }, [places]);

    const filteredPlaces = useMemo(() => {
        let result = (places || []).filter(place => {
            const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
            const matchesCity = selectedCity === 'All' || selectedCity === 'Nearby' || place.cityEn === selectedCity || place.city === selectedCity;
            
            const isFree = place.price === 'Free' || place.price === 'مجاناً' || place.price === 'مجاني' || String(place.price).toLowerCase() === 'free';
            const matchesPrice = selectedPriceType === 'All' || 
                               (selectedPriceType === 'Free' && isFree) || 
                               (selectedPriceType === 'Paid' && !isFree);
            
            const matchesRating = minRating === 0 || (place.rating || 0) >= minRating;

            const matchesSearch = searchQuery === '' ||
                place.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                place.cityEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                place.name?.toLowerCase().includes(searchQuery.toLowerCase());
                
            return matchesCategory && matchesCity && matchesPrice && matchesRating && matchesSearch;
        });

        if (selectedCity === 'Nearby' && userLocation) {
            result = result.map(p => ({
                ...p,
                distance: p.lat && p.lng ? getDistance(userLocation.latitude, userLocation.longitude, p.lat, p.lng) : 9999
            }))
            .sort((a, b) => a.distance - b.distance)
            .filter(p => p.distance < 100);
        }

        return result;
    }, [searchQuery, selectedCategory, selectedCity, selectedPriceType, minRating, places, userLocation]);

    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const handleCategoryChange = (category) => {
        Haptics.selectionAsync();
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
        <View style={styles.headerContainer}>
            {/* Header Top: Greeting & Search Toggle */}
            <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
                <View>
                    <Text style={[styles.greetingText, { color: C.textMuted }]}>{t('welcome')},</Text>
                    <TouchableOpacity onPress={handleTitleTap}>
                        <Text style={[styles.userNameText, { color: C.textMain }]}>{t('explorerTitle') || 'Explorer'}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                    style={styles.headerIconBtn}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Ionicons name="person-circle-outline" size={32} color={C.textMain} />
                </TouchableOpacity>
            </View>

            {/* Immersive Search Section */}
            <View style={[styles.searchSection, { backgroundColor: C.bgElevated }]}>
                <Ionicons name="search" size={20} color={C.textMuted} />
                <TextInput
                    style={[styles.searchInput, { color: C.textMain }, isRTL && { textAlign: 'right' }]}
                    placeholder={t('searchPlaceholder')}
                    placeholderTextColor={C.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity style={styles.filterBtn} onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={C.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Premium Categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
            >
                {[{ id: 'All', name: 'All', nameEn: 'All', icon: '🗺️' }, ...CATEGORIES].map(category => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryChip,
                            selectedCategory === category.id && { backgroundColor: C.primary }
                        ]}
                        onPress={() => handleCategoryChange(category.id)}
                    >
                        <Text style={{ fontSize: 14, marginRight: 4 }}>{category.icon}</Text>
                        <Text
                            style={[
                                styles.categoryChipText,
                                { color: selectedCategory === category.id ? '#000' : C.textMuted }
                            ]}
                        >
                            {t('categories.' + category.id) !== category.id ? t('categories.' + category.id) : (category.nameEn || category.name)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Advanced Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: SPACING.xl }}
                contentContainerStyle={[styles.filterRow, isRTL && { flexDirection: 'row-reverse' }]}
            >
                {/* Cities */}
                <TouchableOpacity
                    style={[styles.filterTab, { borderColor: C.borderSoft || '#333' }, selectedCity === 'All' ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }]}
                    onPress={() => handleCityChange('All')}
                >
                    <Text style={[styles.filterTabText, selectedCity === 'All' ? styles.filterTabTextActive : { color: C.textMain }]}>{t('filterAll') || 'All Cities'}</Text>
                </TouchableOpacity>

                {/* Nearby Toggle */}
                <TouchableOpacity
                    style={[styles.filterTab, { borderColor: C.borderSoft || '#333', flexDirection: 'row', alignItems: 'center', gap: 6 }, selectedCity === 'Nearby' ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }]}
                    onPress={() => handleCityChange('Nearby')}
                >
                    <Ionicons name="location" size={14} color={selectedCity === 'Nearby' ? '#000' : C.primary} />
                    <Text style={[styles.filterTabText, selectedCity === 'Nearby' ? styles.filterTabTextActive : { color: C.textMain }]}>
                        {t('nearby') || 'Nearby'}
                    </Text>
                    {isLocating && <ActivityIndicator size="small" color="#000" />}
                </TouchableOpacity>

                {cities.map(city => (
                    <TouchableOpacity
                        key={city}
                        style={[styles.filterTab, { borderColor: C.borderSoft || '#333' }, selectedCity === city ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }]}
                        onPress={() => handleCityChange(city)}
                    >
                        <Text style={[styles.filterTabText, selectedCity === city ? styles.filterTabTextActive : { color: C.textMain }]}>{isRTL ? t(city) || city : city}</Text>
                    </TouchableOpacity>
                ))}

                <View style={{ width: 1, backgroundColor: C.borderSoft || '#333', marginVertical: 8, marginHorizontal: 4 }} />

                {/* Rating */}
                {[4.5, 4.0].map((star) => (
                    <TouchableOpacity
                        key={`star-${star}`}
                        style={[styles.filterTab, { borderColor: C.borderSoft || '#333', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }, minRating === star ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setMinRating(prev => prev === star ? 0 : star);
                        }}
                    >
                        <Ionicons name="star" size={14} color={minRating === star ? '#000' : C.primary} />
                        <Text style={[styles.filterTabText, minRating === star ? styles.filterTabTextActive : { color: C.textMain }]}>{star}+</Text>
                    </TouchableOpacity>
                ))}

                <View style={{ width: 1, backgroundColor: C.borderSoft || '#333', marginVertical: 8, marginHorizontal: 4 }} />

                {/* Price */}
                {['Free', 'Paid'].map(pType => (
                    <TouchableOpacity
                        key={`price-${pType}`}
                        style={[styles.filterTab, { borderColor: C.borderSoft || '#333' }, selectedPriceType === pType ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.bgCard }]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedPriceType(prev => prev === pType ? 'All' : pType);
                        }}
                    >
                        <Text style={[styles.filterTabText, selectedPriceType === pType ? styles.filterTabTextActive : { color: C.textMain }]}>{pType === 'Free' ? (t('free') || 'Free') : (t('paid') || 'Paid')}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[styles.sectionTitle, { color: C.textMain }]}>
                    {t('featuredDestinations') || 'Popular Destinations'}
                </Text>
                <TouchableOpacity onPress={() => { handleCategoryChange('All'); setSelectedCity('All'); setMinRating(0); setSelectedPriceType('All'); }}>
                    <Text style={[styles.viewAllText, { color: C.primary }]}>{t('allPlaces') || 'View all'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top', 'left', 'right']}>
            <DynamicBackground category={selectedCategory !== 'All' ? selectedCategory : undefined} />
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bgMain} />

            <FlashList
                data={filteredPlaces}
                renderItem={renderPlaceCard}
                keyExtractor={item => item.id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: SPACING.md }}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={400}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingTop: SPACING.lg,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.xl,
    },
    greetingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    userNameText: {
        fontSize: 24,
        fontWeight: '900',
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.md,
        paddingHorizontal: 20,
        height: 56,
        borderRadius: 24,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '600',
    },
    filterBtn: {
        padding: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '700',
    },
    categoriesContainer: {
        marginBottom: SPACING.md,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        gap: 10,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 9999,
        borderWidth: 1,
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '700',
    },
    filterTabTextActive: {
        color: '#000',
    },
    categoriesContent: {
        paddingHorizontal: SPACING.md,
        gap: 12,
        alignItems: 'center',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 9999,
        backgroundColor: 'rgba(18, 18, 18, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '700',
    },
    cardWrapper: {
        marginBottom: SPACING.lg,
    },
    card: {
        height: 380,
        borderRadius: 36,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    cardTopOverlay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    favoriteCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    glassContent: {
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
    },
    priceContainer: {
        backgroundColor: '#4CD8D0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    cardPrice: {
        color: '#000',
        fontSize: 16,
        fontWeight: '900',
    },
    imgPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

