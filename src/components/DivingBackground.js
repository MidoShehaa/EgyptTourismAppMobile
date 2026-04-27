import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, Pattern, Rect, G, Circle } from 'react-native-svg';
import { useUser } from '../store/UserContext';

const { width, height } = Dimensions.get('window');

export default function DivingBackground() {
    const { settings } = useUser();
    const isDark = settings?.darkMode === true;
    const opacity = 0.15;
    const strokeColor = 'rgba(255, 255, 255, 0.3)';

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Svg width={width} height={height}>
                <Defs>
                    <Pattern id="divingPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <G stroke={strokeColor} strokeWidth="1.5" fill="none" opacity={opacity}>
                            {/* Bubbles */}
                            <Circle cx="20" cy="80" r="3" />
                            <Circle cx="25" cy="70" r="5" />
                            <Circle cx="15" cy="60" r="2" />
                            <Circle cx="80" cy="30" r="4" />
                            <Circle cx="85" cy="20" r="6" />
                            
                            {/* Fish */}
                            <Path d="M 50 40 Q 60 30 70 40 Q 60 50 50 40" />
                            <Path d="M 70 40 L 80 35 L 75 40 L 80 45 Z" />
                            
                            {/* Starfish */}
                            <Path d="M 40 80 L 43 85 L 48 85 L 44 88 L 45 93 L 40 90 L 35 93 L 36 88 L 32 85 L 37 85 Z" />
                            
                            {/* Coral / Seaweed */}
                            <Path d="M 90 100 Q 85 90 95 80 T 85 60" />
                            <Path d="M 95 100 Q 100 90 90 85 T 100 70" />
                        </G>
                    </Pattern>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#divingPattern)" />
            </Svg>
        </View>
    );
}
