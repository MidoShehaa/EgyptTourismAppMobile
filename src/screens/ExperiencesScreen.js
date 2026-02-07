import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function ExperiencesScreen() {
    const experiences = ['Ancient Wonders', 'Nile Cruises', 'Desert Safari', 'Diving'];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Elevated Experiences</Text>
                    <Text style={styles.subtitle}>Immersive journeys through time and space</Text>
                </View>

                {/* VR Feature Card */}
                <TouchableOpacity style={styles.vrCard} activeOpacity={0.9}>
                    <View style={styles.vrOverlay}>
                        <View style={styles.vrBadge}>
                            <Text style={styles.vrBadgeText}>VR TOUR</Text>
                            <View style={styles.vrRating}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.vrRatingText}>4.9</Text>
                            </View>
                        </View>
                        <Text style={styles.vrTitle}>Pyramids from the Sky</Text>
                        <Text style={styles.vrDescription}>
                            Experience the Giza Plateau from a drone's perspective
                        </Text>
                        <View style={styles.playButton}>
                            <Ionicons name="play-circle" size={48} color="#fff" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* AR Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="eye" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Augmented Reality</Text>
                    </View>
                    <TouchableOpacity style={styles.arCard}>
                        <View style={styles.arIcon}>
                            <Ionicons name="time" size={24} color={COLORS.textGold} />
                        </View>
                        <View style={styles.arContent}>
                            <Text style={styles.arTitle}>Temple Time Travel</Text>
                            <Text style={styles.arDescription}>
                                Point your camera at Karnak Temple to see it as it was in 1200 BC
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <View style={styles.categories}>
                    {experiences.map((exp, i) => (
                        <TouchableOpacity key={i} style={styles.categoryCard}>
                            <Text style={styles.categoryText}>{exp}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgMain,
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    header: {
        marginBottom: SPACING.lg,
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
    vrCard: {
        height: 220,
        backgroundColor: COLORS.secondary,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
    },
    vrOverlay: {
        flex: 1,
        padding: SPACING.lg,
        justifyContent: 'flex-end',
    },
    vrBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    vrBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#C084FC',
        backgroundColor: 'rgba(192,132,252,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: 8,
    },
    vrRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vrRatingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: 4,
    },
    vrTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    vrDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -24,
        marginLeft: -24,
        opacity: 0.9,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginLeft: 8,
    },
    arCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    arIcon: {
        width: 56,
        height: 56,
        backgroundColor: COLORS.bgElevated,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    arContent: {
        flex: 1,
    },
    arTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    arDescription: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        backgroundColor: COLORS.bgElevated,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
});
