import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SYMBOLS = ['𓋹', '𓅓', '𓆣', '𓁧', '𓀭', '𓃻', '𓂀', '☥', '𓆗', '𓃭', '𓅃', '𓆣', '𓁿', '𓂋', '𓃀', '𓃟', '𓃠', '𓅂'];

export default function Watermark() {
    const { settings } = useUser();
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    // Generate a long repeating string of symbols
    const patternText = useMemo(() => {
        let text = '';
        for (let i = 0; i < 500; i++) {
            text += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] + '   ';
        }
        return text;
    }, []);

    return (
        <View style={styles.container} pointerEvents="none">
            <Text style={[styles.pattern, { color: C.textMain }]}>
                {patternText}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: -1, // Keep it behind everything
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.15, // Increased visibility
    },
    pattern: {
        fontSize: 32, // Larger symbols
        lineHeight: 60,
        textAlign: 'justify',
        width: width * 1.5,
        fontWeight: 'bold', // Thicker lines
        color: '#8B7355', // Dark brownish-gold tone to match the sand
    }
});
