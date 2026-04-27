import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, Pattern, Rect, G } from 'react-native-svg';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function PharaonicBackground() {
    const { settings } = useUser();
    const isDark = settings?.darkMode === true;
    const opacity = 0.15;
    const strokeColor = 'rgba(255, 255, 255, 0.3)';

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Svg width={width} height={height}>
                <Defs>
                    <Pattern id="pharaonicPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <G stroke={strokeColor} strokeWidth="1.5" fill="none" opacity={opacity}>
                            {/* Ankh */}
                            <Path d="M 30 50 L 30 70 M 20 50 L 40 50 M 30 50 C 20 50 20 30 30 30 C 40 30 40 50 30 50" />
                            {/* Eye of Horus (Simplified) */}
                            <Path d="M 60 40 Q 75 30 90 40 Q 75 50 60 40 M 75 35 A 5 5 0 1 0 75.1 35 M 75 45 L 75 60 M 75 45 Q 65 55 60 65" />
                            {/* Pyramid */}
                            <Path d="M 10 90 L 30 60 L 50 90 Z M 20 90 L 30 75" />
                            {/* Lotus (Simplified) */}
                            <Path d="M 80 90 C 70 80 70 60 80 70 C 90 60 90 80 80 90" />
                        </G>
                    </Pattern>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#pharaonicPattern)" />
            </Svg>
        </View>
    );
}
