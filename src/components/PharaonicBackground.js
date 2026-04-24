import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS } from '../constants/theme';

const HIEROGLYPHS = "𓁹 𓆣 𓋹 𓇳 𓅓 𓃻 𓆗 𓇋 𓈖 𓉐 𓊽 𓋴 𓌂 𓈎 𓉔 𓆑 𓃀 𓄿 𓅱";

export default function PharaonicBackground() {
    const { settings } = useUser();
    const isDark = settings?.darkMode === true;
    const rows = Array(15).fill(HIEROGLYPHS);

    return (
        <View style={[StyleSheet.absoluteFillObject, styles.container]} pointerEvents="none">
            {rows.map((row, index) => (
                <Text 
                    key={index} 
                    style={[
                        styles.text, 
                        { color: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)' },
                        index % 2 === 0 && { transform: [{ translateX: -40 }] }
                    ]}
                    numberOfLines={1}
                >
                    {row} {row} {row}
                </Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        justifyContent: 'space-evenly',
        zIndex: 0,
    },
    text: {
        fontSize: 48,
        letterSpacing: 16,
    }
});
