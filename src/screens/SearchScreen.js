import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS, SPACING } from '../constants/theme';
import SafeImage from '../components/SafeImage';
import DynamicBackground from '../components/DynamicBackground';

export default function SearchScreen({ navigation }) {
    const { settings, t, places, hotels, restaurants } = useUser();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('All'); // 'All', 'Places', 'Hotels', 'Dining'

    const allData = useMemo(() => {
        const p = (places || []).map(item => ({ ...item, searchType: 'Places' }));
        const h = (hotels || []).map(item => ({ ...item, searchType: 'Hotels' }));
        const r = (restaurants || []).map(item => ({ ...item, searchType: 'Dining' }));
        return [...p, ...h, ...r];
    }, [places, hotels, restaurants]);

    const filteredData = useMemo(() => {
        if (!query.trim() && filter === 'All') return []; // Show empty or recent searches if no query

        let results = allData;

        if (filter !== 'All') {
            results = results.filter(item => item.searchType === filter);
        }

        if (query.trim()) {
            const q = query.toLowerCase();
            results = results.filter(item => {
                const name1 = (item.name || '').toLowerCase();
                const name2 = (item.nameEn || item.nameAr || '').toLowerCase();
                const city1 = (item.city || '').toLowerCase();
                const city2 = (item.cityEn || item.cityAr || '').toLowerCase();
                const desc = (item.description || item.descriptionEn || '').toLowerCase();

                return name1.includes(q) || name2.includes(q) || city1.includes(q) || city2.includes(q) || desc.includes(q);
            });
        }

        return results;
    }, [allData, query, filter]);

    const getIconForType = (type) => {
        if (type === 'Places') return 'compass-outline';
        if (type === 'Hotels') return 'business-outline';
        return 'restaurant-outline';
    };

    const handlePress = (item) => {
        if (item.searchType === 'Places') {
            navigation.navigate('PlaceDetails', { place: item });
        } else if (item.searchType === 'Hotels') {
            navigation.navigate('HotelsCity', { city: item.city });
        } else if (item.searchType === 'Dining') {
            navigation.navigate('Dining', { city: item.city });
        }
    };

    const renderHeader = () => (
        <View style={[styles.header, { backgroundColor: C.bgMain }, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color={C.textMain} />
            </TouchableOpacity>
            
            <View style={[styles.searchInputContainer, { backgroundColor: C.bgElevated }, isRTL && { flexDirection: 'row-reverse' }]}>
                <Ionicons name="search" size={20} color={C.textMuted} />
                <TextInput
                    style={[styles.searchInput, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder={t('searchHint') || 'Search...'}
                    placeholderTextColor={C.textMuted}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                        <Ionicons name="close-circle" size={20} color={C.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderFilters = () => {
        const filters = ['All', 'Places', 'Hotels', 'Dining'];
        return (
            <View style={[styles.filtersRow, isRTL && { flexDirection: 'row-reverse' }]}>
                {filters.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterChip,
                            { backgroundColor: filter === f ? C.primary : C.bgElevated, borderColor: filter === f ? C.primary : 'rgba(255,255,255,0.05)' }
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: filter === f ? '#000' : C.textMain }
                        ]}>
                            {f === 'All' ? t('filterAll') || 'All' : t(`filter${f}`) || f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderItem = ({ item }) => {
        const itemName = isRTL ? (item.nameAr || item.name) : (item.nameEn || item.name);
        const itemCity = isRTL ? (item.cityAr || item.city) : (item.cityEn || item.city);
        const iconType = item.searchType === 'Places' ? 'place' : item.searchType === 'Hotels' ? 'hotel' : 'restaurant';

        return (
            <TouchableOpacity 
                style={[styles.resultCard, { backgroundColor: C.bgCard, borderColor: 'rgba(255,255,255,0.05)' }, isRTL && { flexDirection: 'row-reverse' }]}
                activeOpacity={0.8}
                onPress={() => handlePress(item)}
            >
                <View style={styles.imageContainer}>
                    <SafeImage uri={item.imageUrl || item.image} style={styles.image} icon={iconType} iconSize={24} />
                </View>
                
                <View style={[styles.itemDetails, isRTL ? { paddingRight: 16 } : { paddingLeft: 16 }]}>
                    <View style={[styles.titleRow, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.itemTitle, { color: C.textMain }, isRTL && { textAlign: 'right' }]} numberOfLines={1}>{itemName}</Text>
                    </View>
                    
                    <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Ionicons name="location-sharp" size={14} color={C.primary} />
                        <Text style={[styles.locationText, { color: C.textMuted }, isRTL && { textAlign: 'right' }]}>{itemCity}</Text>
                    </View>
                    
                    <View style={[styles.typeRow, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={[styles.typeBadge, { backgroundColor: C.bgElevated }]}>
                            <Ionicons name={getIconForType(item.searchType)} size={12} color={C.primary} />
                            <Text style={[styles.typeText, { color: C.textMain }]}>{t(`filter${item.searchType}`) || item.searchType}</Text>
                        </View>
                        {item.rating && (
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={12} color={C.primary} />
                                <Text style={styles.ratingText}>{item.rating}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => {
        if (query.trim() === '' && filter === 'All') {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="search-circle-outline" size={100} color={C.textMuted} style={{ opacity: 0.2 }} />
                    <Text style={[styles.emptyText, { color: C.textMuted }]}>{t('searchHint') || 'Type to start searching...'}</Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <Ionicons name="sad-outline" size={60} color={C.textMuted} style={{ opacity: 0.5, marginBottom: 16 }} />
                <Text style={[styles.emptyText, { color: C.textMuted }]}>{t('noResults')}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground city="Cairo" />
            {renderHeader()}
            {renderFilters()}
            
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={filteredData}
                    keyExtractor={(item, index) => `${item.searchType}-${item.id || index}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 12,
    },
    backBtn: {
        padding: 4,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 16,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        height: '100%',
    },
    filtersRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 15,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 16,
    },
    resultCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '900',
        flex: 1,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '600',
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: '900',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
