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
import { CATEGORIES } from '../constants/placesData';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useUser } from '../store/UserContext';


const PlaceCard = React.memo(({ item, isRTL, C, t, navigation, isFavorite, toggleFavorite }) => {
    const placeName = isRTL ? item.name : item.nameEn;
    const placeCity = isRTL ? item.city : item.cityEn;
    const [imgError, setImgError] = useState(false);

    return (
        <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.cardWrapper}
            onPress={() => navigation.navigate('PlaceDetails', { place: item })}
        >
            <View style={[styles.card, { backgroundColor: C.bgCard }]}>
                {imgError ? (
                    <View style={[styles.cardImage, styles.imgPlaceholder, { backgroundColor: C.bgElevated }]}>
                        <Ionicons name="image-outline" size={48} color={C.textMuted} />
                    </View>
                ) : (
                    <Image 
                        source={item.imageSource ? item.imageSource : { 
                            uri: item.imageUrl,
                            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                        }} 
                        style={styles.cardImage}
                        onError={() => setImgError(true)}
                    />
                )}

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
                    <View style={styles.glassContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>{placeName}</Text>
                            <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Ionicons name="location-sharp" size={12} color={C.primary} />
                                <Text style={[styles.locationText, isRTL && { textAlign: 'right' }]}>{placeCity}</Text>
                            </View>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={styles.cardPrice}>{item.price}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});


export default function PlacesScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { toggleFavorite, isFavorite, t, settings, places, isLoading } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const handleTitleTap = () => {
        navigation.navigate('AdminAuth');
    };

    const filteredPlaces = useMemo(() => {
        return (places || []).filter(place => {
            const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
            const matchesSearch = searchQuery === '' ||
                place.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                place.cityEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                place.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory, places]);

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
        <View style={styles.headerContainer}>
            {/* Header Top: Greeting & Search Toggle */}
            <View style={[styles.headerTop, isRTL && { flexDirection: 'row-reverse' }]}>
                <View>
                    <Text style={[styles.greetingText, { color: C.textMuted }]}>{t('welcome')},</Text>
                    <TouchableOpacity onPress={handleTitleTap}>
                        <Text style={[styles.userNameText, { color: C.textMain }]}>Explorer</Text>
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
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={20} color={C.primary} />
                </TouchableOpacity>
            </View>

            {/* Premium Categories */}
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
                            selectedCategory === category.id && { backgroundColor: C.primary }
                        ]}
                        onPress={() => handleCategoryChange(category.id)}
                    >
                        <Text
                            style={[
                                styles.categoryChipText,
                                { color: selectedCategory === category.id ? '#000' : C.textMuted }
                            ]}
                        >
                            {t('categories.' + category.id)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[styles.sectionTitle, { color: C.textMain }]}>
                    {isRTL ? 'الوجهات المميزة' : 'Popular Destinations'}
                </Text>
                <TouchableOpacity>
                    <Text style={[styles.viewAllText, { color: C.primary }]}>{isRTL ? 'عرض الكل' : 'View all'}</Text>
                </TouchableOpacity>
            </View>
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
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
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
        paddingHorizontal: 16,
        height: 54,
        borderRadius: 20,
        marginBottom: SPACING.xl,
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
        marginBottom: SPACING.xl,
    },
    categoriesContent: {
        paddingHorizontal: SPACING.md,
        gap: 12,
    },
    categoryChip: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 9999,
        backgroundColor: '#1A1A1A',
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '700',
    },
    cardWrapper: {
        marginBottom: SPACING.lg,
    },
    card: {
        height: 420,
        borderRadius: 32,
        overflow: 'hidden',
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
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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

