import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { places } from '../constants/placesData';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function PlannerScreen({ navigation }) {
    const { itinerary, updateItinerary } = useUser();

    // Group itinerary items by day
    const groupedItinerary = useMemo(() => {
        if (!itinerary) return [];
        return itinerary.days.map((day, index) => ({
            dayNumber: index + 1,
            activities: day.activities.map(act => {
                const place = places.find(p => p.id === act.placeId);
                return { ...act, place };
            }).filter(item => item.place) // Filter out if place not found
        }));
    }, [itinerary]);

    const renderActivityItem = ({ item }) => (
        <TouchableOpacity
            style={styles.activityCard}
            onPress={() => navigation.navigate('PlaceDetails', { place: item.place })}
        >
            <View style={styles.timeBox}>
                <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <Image source={{ uri: item.place.imageUrl }} style={styles.activityImage} />
            <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{item.place.nameEn}</Text>
                <Text style={styles.activityDuration}>{item.place.duration}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
    );

    const renderDaySection = ({ item }) => (
        <View style={styles.daySection}>
            <View style={styles.dayHeader}>
                <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>Day {item.dayNumber}</Text>
                </View>
                <View style={styles.dayLine} />
            </View>
            <FlatList
                data={item.activities}
                renderItem={renderActivityItem}
                keyExtractor={(act, index) => `${item.dayNumber}-${index}`}
                scrollEnabled={false}
            />
        </View>
    );

    if (!itinerary) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Itinerary Yet</Text>
                <Text style={styles.emptyText}>Start exploring places and add them to your planner!</Text>
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => navigation.navigate('Explore')}
                >
                    <Text style={styles.exploreButtonText}>Explore Places</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Trip</Text>
                <Text style={styles.headerSubtitle}>{itinerary.name || 'Custom Itinerary'}</Text>
            </View>

            <FlatList
                data={groupedItinerary}
                renderItem={renderDaySection}
                keyExtractor={item => `day-${item.dayNumber}`}
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
    emptyContainer: {
        flex: 1,
        backgroundColor: COLORS.bgMain,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginTop: SPACING.lg,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    exploreButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
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
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    daySection: {
        marginBottom: SPACING.xl,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    dayBadge: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
        marginRight: SPACING.md,
    },
    dayBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    dayLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.borderSubtle,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    timeBox: {
        paddingHorizontal: SPACING.sm,
        alignItems: 'center',
        minWidth: 60,
    },
    timeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textMuted,
    },
    activityImage: {
        width: 60,
        height: 60,
        borderRadius: BORDER_RADIUS.md,
        marginRight: SPACING.md,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    activityDuration: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
});
