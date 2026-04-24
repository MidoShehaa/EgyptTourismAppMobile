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

    // Generate a very dense pattern of symbols
    const patternText = useMemo(() => {
        let text = '';
        for (let i = 0; i < 2000; i++) {
            text += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] + ' ';
            if (i % 20 === 0) text += '\n';
        }
        return text;
    }, []);

    return (
        <View style={styles.container} pointerEvents="none">
            <Text style={[styles.pattern, { color: isDark ? '#4A3B2B' : '#D2C4B0' }]}>
                {patternText}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: -1, 
        opacity: 0.1, // Very subtle
    },
    pattern: {
        fontSize: 14, // Much smaller symbols for 'engraving' look
        lineHeight: 22,
        letterSpacing: 4,
        textAlign: 'center',
        width: width * 2,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'serif',
    }
});
