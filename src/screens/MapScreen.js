// Note: Ensure react-native-webview is installed
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { COLORS, SPACING } from '../constants/theme';

export default function MapScreen() {
    // Using a static Google Maps URL for embedded view as a simple solution
    // In production, use react-native-maps with a valid API key
    const mapUrl = 'https://www.google.com/maps/d/embed?mid=1vX6g6y6y6y6y6y6y6y6y6y6y6y6y6y6';
    // Note: The above URL is broken/placeholder. Using a generic search URL instead for demo.
    const searchUrl = 'https://www.google.com/maps/search/tourist+attractions+in+egypt/@26.820553,30.802498,6z';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Egypt Map</Text>
                <Text style={styles.subtitle}>Discover places nearby</Text>
            </View>

            <View style={styles.mapContainer}>
                <WebView
                    source={{ uri: searchUrl }}
                    style={styles.map}
                    startInLoadingState={true}
                />
            </View>
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
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.bgMain,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginTop: 2,
    },
    mapContainer: {
        flex: 1,
        overflow: 'hidden',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    map: {
        flex: 1,
    },
});
