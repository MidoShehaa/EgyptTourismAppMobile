import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const HOTELS = [
    {
        id: 1,
        name: 'Marriott Mena House',
        city: 'Giza',
        category: 'luxury',
        rating: 4.8,
        price: 4500,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        amenities: ['Pool', 'Spa', 'Restaurant'],
    },
    {
        id: 2,
        name: 'Four Seasons Cairo',
        city: 'Cairo',
        category: 'luxury',
        rating: 4.9,
        price: 5200,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        amenities: ['Nile View', 'Spa', 'Pool'],
    },
    {
        id: 3,
        name: 'Steigenberger Tahrir',
        city: 'Cairo',
        category: 'mid-range',
        rating: 4.5,
        price: 2800,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
        amenities: ['Restaurant', 'Gym', 'WiFi'],
    },
];

export default function HotelsScreen() {
    const renderHotelCard = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />

            {/* Category Badge */}
            <View style={[styles.categoryBadge, item.category === 'luxury' && styles.luxuryBadge]}>
                <Text style={styles.categoryText}>
                    {item.category === 'luxury' ? 'Luxury' : 'Mid-Range'}
                </Text>
            </View>

            {/* Price */}
            <View style={styles.priceBadge}>
                <Text style={styles.priceAmount}>{item.price.toLocaleString()}</Text>
                <Text style={styles.priceUnit}> EGP/night</Text>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color={COLORS.textMuted} />
                    <Text style={styles.locationText}>{item.city}</Text>
                </View>

                {/* Rating */}
                <View style={styles.ratingRow}>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <View style={styles.amenities}>
                        {item.amenities.slice(0, 3).map((a, i) => (
                            <Text key={i} style={styles.amenityText}>{a}</Text>
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Add to Planner</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Hotels & Stays</Text>
                <Text style={styles.subtitle}>Find your perfect accommodation</Text>
            </View>

            <FlatList
                data={HOTELS}
                renderItem={renderHotelCard}
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
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 160,
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    luxuryBadge: {
        backgroundColor: '#F59E0B',
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
    },
    priceBadge: {
        position: 'absolute',
        top: 120,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    priceUnit: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
    },
    cardContent: {
        padding: SPACING.md,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgElevated,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginLeft: 4,
    },
    amenities: {
        flexDirection: 'row',
    },
    amenityText: {
        fontSize: 10,
        color: COLORS.textMuted,
        backgroundColor: COLORS.bgElevated,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
        marginLeft: 6,
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.md,
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
