import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { places, CATEGORIES } from '../constants/placesData';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useUser } from '../store/UserContext';

export default function PlacesScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { toggleFavorite, isFavorite, t, settings } = useUser();
    const isRTL = settings?.language === 'ar';

    const filteredPlaces = useMemo(() => {
        return places.filter(place => {
            const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
            const matchesSearch = searchQuery === '' ||
                place.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (place.cityEn && place.cityEn.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    const renderPlaceCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('PlaceDetails', { place: item })}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />

            {/* Rating Badge */}
            <View style={[styles.ratingBadge, isRTL ? { right: 12, left: undefined } : { left: 12 }]}>
                <Ionicons name="star" size={12} color={COLORS.primary} />
                <Text style={styles.ratingText}>{item.rating}</Text>
            </View>

            {/* Category Badge */}
            <View style={[styles.categoryBadge, isRTL ? { left: undefined, right: undefined, left: 12 } : { right: 50 }]}>
                <Text style={styles.categoryText}>{item.category}</Text>
            </View>

            {/* Favorite Button */}
            <TouchableOpacity
                style={[styles.favoriteButton, isRTL ? { left: 12, right: undefined } : { right: 12 }]}
                onPress={() => toggleFavorite(item.id)}
            >
                <Ionicons
                    name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite(item.id) ? '#EF4444' : '#fff'}
                />
            </TouchableOpacity>

            {/* Content */}
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, isRTL && { textAlign: 'right' }]}>{item.nameEn}</Text>
                <Text style={[styles.cardCity, isRTL && { textAlign: 'right' }]}>{item.cityEn}</Text>
                <Text style={[styles.cardDescription, isRTL && { textAlign: 'right' }]} numberOfLines={2}>
                    {item.descriptionEn}
                </Text>

                <View style={[styles.cardMeta, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.metaItem, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Ionicons name="time-outline" size={12} color={COLORS.primary} />
                        <Text style={[styles.metaText, isRTL ? { marginRight: 4, marginLeft: 0 } : { marginLeft: 4 }]}>{item.duration}</Text>
                    </View>
                    <Text style={styles.priceText}>{item.price}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgMain} />

            {/* Header */}
            <View style={[styles.header, isRTL && styles.headerRTL]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, isRTL && { textAlign: 'right' }]}>{t('discoverTitle')}</Text>
                    <Text style={[styles.headerSubtitle, isRTL && { textAlign: 'right' }]}>{t('discoverSubtitle')}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.settingsButton}>
                    <Ionicons name="settings-outline" size={24} color={COLORS.textMain} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} />
                <TextInput
                    style={[styles.searchInput, isRTL && { textAlign: 'right' }]}
                    placeholder={t('searchPlaceholder')}
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
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
                        key={category}
                        style={[
                            styles.categoryChip,
                            selectedCategory === category && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text
                            style={[
                                styles.categoryChipText,
                                selectedCategory === category && styles.categoryChipTextActive,
                            ]}
                        >
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Places List */}
            <FlatList
                data={filteredPlaces}
                renderItem={renderPlaceCard}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgMain,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerRTL: {
        flexDirection: 'row-reverse',
    },
    settingsButton: {
        padding: 8,
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        marginHorizontal: SPACING.lg,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    searchInput: {
        flex: 1,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        fontSize: 16,
        color: COLORS.textMain,
    },
    categoriesContainer: {
        marginTop: SPACING.md,
        maxHeight: 50,
    },
    categoriesContent: {
        paddingHorizontal: SPACING.lg,
    },
    categoryChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        marginRight: SPACING.sm,
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textMuted,
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 200,
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginLeft: 4,
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        right: 50,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 8,
        borderRadius: BORDER_RADIUS.full,
    },
    cardContent: {
        padding: SPACING.md,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    cardCity: {
        fontSize: 12,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    cardDescription: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 8,
        lineHeight: 20,
    },
    cardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderSubtle,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});
