import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, Pattern, Rect, G, Circle, Polygon } from 'react-native-svg';
import { useUser } from '../store/UserContext';

const { width, height } = Dimensions.get('window');

export default function IslamicBackground() {
    const { settings } = useUser();
    const isDark = settings?.darkMode === true;
    const opacity = isDark ? 0.05 : 0.03;
    const strokeColor = isDark ? '#FFFFFF' : '#000000';

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Svg width={width} height={height}>
                <Defs>
                    <Pattern id="islamicPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <G stroke={strokeColor} strokeWidth="1" fill="none" opacity={opacity}>
                            {/* 8-point star */}
                            <Polygon points="50,20 55,45 80,50 55,55 50,80 45,55 20,50 45,45" />
                            <Polygon points="28,28 47,47 72,28 53,47 72,72 53,53 28,72 47,53" />
                            
                            {/* Crescent */}
                            <Path d="M 15 15 A 10 10 0 1 1 25 25 A 12 12 0 1 0 15 15" fill={strokeColor} />
                            
                            {/* Lantern (Fanoos) */}
                            <Path d="M 85 80 L 90 85 L 90 95 L 80 95 L 80 85 Z M 82 80 L 85 75 L 88 80 M 85 75 L 85 70" />
                        </G>
                    </Pattern>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#islamicPattern)" />
            </Svg>
        </View>
    );
}
