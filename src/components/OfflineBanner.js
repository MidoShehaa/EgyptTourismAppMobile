import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSettings } from '../store/SettingsContext';
import { COLORS, FONTS, getFontFamily } from '../constants/theme';

export default function OfflineBanner() {
    const [isConnected, setIsConnected] = useState(true);
    const { settings, t } = useSettings();
    const isRTL = settings?.language === 'ar';

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected !== false);
        });
        return () => unsubscribe();
    }, []);

    if (isConnected) return null;

    return (
        <Animated.View 
            entering={FadeInDown.duration(400)} 
            exiting={FadeOutUp.duration(400)}
            style={styles.banner}
        >
            <View style={[styles.content, isRTL && { flexDirection: 'row-reverse' }]}>
                <Ionicons name="cloud-offline" size={18} color="#fff" style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }} />
                <Text style={[styles.text, { fontFamily: getFontFamily(isRTL, 'bold') }]}>
                    {isRTL ? 'لا يوجد اتصال بالإنترنت' : 'No Internet Connection'}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#EF4444',
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight : 45,
        left: 20,
        right: 20,
        borderRadius: 12,
        zIndex: 9999,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    }
});
