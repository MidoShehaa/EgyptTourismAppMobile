import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useUser } from '../store/UserContext';

const { width } = Dimensions.get('window');

export default function PlaceDetailsScreen({ route, navigation }) {
    const { place } = route.params;
    const { toggleFavorite, isFavorite, t, settings } = useUser();
    const insets = useSafeAreaInsets();
    const isRTL = settings?.language === 'ar';

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Image Header */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: place.imageUrl }} style={styles.image} />
                    <View style={[styles.headerOverlay, { paddingTop: insets.top + 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(place.id)}
                        >
                            <Ionicons
                                name={isFavorite(place.id) ? "heart" : "heart-outline"}
                                size={24}
                                color={isFavorite(place.id) ? COLORS.error : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <View style={[styles.detailsContainer, { marginTop: -30 }]}>
                    <View style={[styles.titleRow, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                            <Text style={styles.title}>{place.nameEn}</Text>
                            <View style={[styles.locationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Ionicons name="location" size={16} color={COLORS.primary} />
                                <Text style={[styles.locationText, isRTL ? { marginRight: 4, marginLeft: 0 } : { marginLeft: 4 }]}>{place.cityEn}</Text>
                            </View>
                        </View>
                        <View style={styles.ratingBox}>
                            <Ionicons name="star" size={16} color={COLORS.accent} />
                            <Text style={styles.ratingText}>{place.rating}</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('about')}</Text>
                    <Text style={[styles.description, isRTL && { textAlign: 'right' }]}>{place.descriptionEn}</Text>

                    <View style={[styles.infoGrid, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoLabel}>{t('duration')}</Text>
                            <Text style={styles.infoValue}>{place.duration}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoLabel}>{t('price')}</Text>
                            <Text style={styles.infoValue}>{place.price}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoLabel}>{t('category')}</Text>
                            <Text style={styles.infoValue}>{place.category}</Text>
                        </View>
                    </View>

                    {place.highlights && (
                        <>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('highlights')}</Text>
                            <View style={[styles.highlightsContainer, isRTL && { alignItems: 'flex-end' }]}>
                                {place.highlights.map((highlight, index) => (
                                    <View key={index} style={[styles.highlightItem, isRTL && { flexDirection: 'row-reverse' }]}>
                                        <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                                        <Text style={styles.highlightText}>{highlight}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <SafeAreaView edges={['bottom']} style={[styles.bottomBar, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[styles.priceContainer, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={styles.priceLabel}>{t('startingFrom')}</Text>
                    <Text style={styles.priceTotal}>{place.price}</Text>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>{t('bookNow')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgMain,
    },
    content: {
        paddingBottom: 100,
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        flex: 1,
        backgroundColor: COLORS.bgMain,
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: SPACING.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgElevated,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 22,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.lg,
        backgroundColor: COLORS.bgCard,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    infoItem: {
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginTop: 2,
    },
    highlightsContainer: {
        gap: 8,
    },
    highlightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    highlightText: {
        fontSize: 14,
        color: COLORS.textMain,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.bgCard,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderSubtle,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    priceTotal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: BORDER_RADIUS.full,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
