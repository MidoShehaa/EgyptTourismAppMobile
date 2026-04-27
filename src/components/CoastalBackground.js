import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, Pattern, Rect, G, Circle } from 'react-native-svg';
import { useUser } from '../store/UserContext';

const { width, height } = Dimensions.get('window');

export default function CoastalBackground() {
    const { settings } = useUser();
    const isDark = settings?.darkMode === true;
    const opacity = isDark ? 0.05 : 0.03;
    const strokeColor = isDark ? '#FFFFFF' : '#000000';

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Svg width={width} height={height}>
                <Defs>
                    <Pattern id="coastalPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <G stroke={strokeColor} strokeWidth="1.5" fill="none" opacity={opacity}>
                            {/* Waves */}
                            <Path d="M 10 80 Q 20 70 30 80 T 50 80 T 70 80 T 90 80" />
                            <Path d="M 0 90 Q 15 80 30 90 T 60 90 T 90 90 T 120 90" />
                            
                            {/* Sun */}
                            <Circle cx="80" cy="20" r="10" />
                            <Path d="M 80 5 L 80 0 M 80 35 L 80 40 M 65 20 L 60 20 M 100 20 L 105 20" />
                            <Path d="M 69 9 L 66 6 M 91 31 L 94 34 M 91 9 L 94 6 M 69 31 L 66 34" />
                            
                            {/* Simple Palm Tree Silhouette */}
                            <Path d="M 25 70 Q 20 50 25 30" />
                            <Path d="M 25 30 Q 10 35 15 45 M 25 30 Q 40 35 35 45 M 25 30 Q 15 20 5 25 M 25 30 Q 35 20 45 25 M 25 30 Q 25 15 25 10" />
                        </G>
                    </Pattern>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#coastalPattern)" />
            </Svg>
        </View>
    );
}
