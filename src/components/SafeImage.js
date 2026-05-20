import React, { useState, memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * SafeImage: A drop-in replacement for React Native's <Image> that:
 * 1. Shows a beautiful premium shimmer effect while the image loads
 * 2. Shows a placeholder icon if the image URL fails or is empty
 * 3. Adds proper headers to bypass hotlink protection on external sites
 * 4. Caches images efficiently using expo-image
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

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const ShimmerLoading = ({ bgColor }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (width > 0) {
            Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [width]);

    return (
        <View 
            style={[StyleSheet.absoluteFill, { backgroundColor: bgColor, overflow: 'hidden' }]}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        >
            {width > 0 && (
                <AnimatedGradient
                    colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            transform: [{
                                translateX: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-width, width]
                                })
                            }]
                        }
                    ]}
                />
            )}
        </View>
    );
};

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

    // Pick a consistent gradient color based on the URI string or number
    const colorIdx = (uri && typeof uri === 'string' ? uri.length : (typeof uri === 'number' ? uri : 0)) % GRADIENT_COLORS.length;
    const bgColor = GRADIENT_COLORS[colorIdx][0];

    // If there's no URI or it's clearly invalid, skip trying to load
    const isLocalAsset = typeof uri === 'number';
    const isRemoteAsset = typeof uri === 'string' && uri.startsWith('http');
    const isValidUri = isLocalAsset || isRemoteAsset;

    if (!isValidUri || errored) {
        return (
            <View style={[style, styles.placeholder, { backgroundColor: bgColor }]}>
                <Ionicons name={iconName} size={iconSize} color={iconColor} />
                {children}
            </View>
        );
    }

    const imageSource = isLocalAsset ? uri : {
        uri,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        },
    };

    return (
        <View style={[style, { overflow: 'hidden' }]}>
            {loading && <ShimmerLoading bgColor={bgColor} />}
            <Image
                source={imageSource}
                style={[StyleSheet.absoluteFill]}
                contentFit={resizeMode === 'cover' ? 'cover' : 'contain'}
                transition={300}
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
        overflow: 'hidden',
    },
});

export default SafeImage;
