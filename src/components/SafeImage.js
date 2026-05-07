import React, { useState, memo } from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/**
 * SafeImage: A drop-in replacement for React Native's <Image> that:
 * 1. Shows a loading spinner while the image loads
 * 2. Shows a beautiful placeholder icon if the image URL fails or is empty
 * 3. Adds proper headers to bypass hotlink protection on external sites
 * 4. Caches images efficiently
 *
 * Usage:
 *   <SafeImage uri={imageUrl} style={styles.cardImage} icon="image-outline" />
 */

const FALLBACK_ICONS = {
    place: 'earth-outline',
    hotel: 'business-outline',
    restaurant: 'restaurant-outline',
    cruise: 'boat-outline',
    default: 'image-outline',
};

const GRADIENT_COLORS = [
    ['#1a1a2e', '#16213e'],
    ['#0f3460', '#16213e'],
    ['#1b1b2f', '#1f4068'],
    ['#2c003e', '#512b58'],
    ['#0a3d62', '#1e3799'],
];

const SafeImage = memo(({
    uri,
    style,
    icon = 'default',
    iconSize = 48,
    iconColor = 'rgba(255,255,255,0.3)',
    placeholderBg = '#1a1a2e',
    resizeMode = 'cover',
    children,
}) => {
    const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);

    const iconName = FALLBACK_ICONS[icon] || FALLBACK_ICONS.default;

    // Pick a consistent gradient color based on the URI string
    const colorIdx = uri ? uri.length % GRADIENT_COLORS.length : 0;
    const bgColor = GRADIENT_COLORS[colorIdx][0];

    // If there's no URI or it's clearly invalid, skip trying to load
    const isValidUri = uri && typeof uri === 'string' && uri.startsWith('http');

    if (!isValidUri || errored) {
        return (
            <View style={[style, styles.placeholder, { backgroundColor: bgColor }]}>
                <Ionicons name={iconName} size={iconSize} color={iconColor} />
                {children}
            </View>
        );
    }

    return (
        <View style={[style, { overflow: 'hidden' }]}>
            {loading && (
                <View style={[StyleSheet.absoluteFill, styles.placeholder, { backgroundColor: bgColor }]}>
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
                </View>
            )}
            <Image
                source={{
                    uri,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    },
                    cache: 'force-cache',
                }}
                style={[StyleSheet.absoluteFill, { resizeMode }]}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setErrored(true);
                }}
            />
            {children}
        </View>
    );
});

const styles = StyleSheet.create({
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SafeImage;
