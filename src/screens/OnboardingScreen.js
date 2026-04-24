import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Animated, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useUser } from '../store/UserContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        titleKey: 'onboarding1Title',
        descKey: 'onboarding1Desc',
        image: 'https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fa%2Faf%2FAll_Gizah_Pyramids.jpg%2F800px-All_Gizah_Pyramids.jpg&default=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fa%2Faf%2FAll_Gizah_Pyramids.jpg%2F800px-All_Gizah_Pyramids.jpg',
    },
    {
        id: '2',
        titleKey: 'onboarding2Title',
        descKey: 'onboarding2Desc',
        image: 'https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F6%2F6d%2FLuxor_Temple_Egypt1.jpg%2F800px-Luxor_Temple_Egypt1.jpg&default=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F6%2F6d%2FLuxor_Temple_Egypt1.jpg%2F800px-Luxor_Temple_Egypt1.jpg',
    },
    {
        id: '3',
        titleKey: 'onboarding3Title',
        descKey: 'onboarding3Desc',
        image: 'https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fc%2Fcd%2FRas_Mohammed_National_Park.jpg%2F800px-Ras_Mohammed_National_Park.jpg&default=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fc%2Fcd%2FRas_Mohammed_National_Park.jpg%2F800px-Ras_Mohammed_National_Park.jpg',
    }
];

export default function OnboardingScreen({ navigation }) {
    const { t, settings, updateSettings } = useUser();
    const isRTL = settings?.language === 'ar';
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleFinish = () => {
        updateSettings({ hasSeenOnboarding: true });
        navigation.replace('MainTabs');
    };

    const nextSlide = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleFinish();
        }
    };

    const handleLanguageSelect = (lang) => {
        updateSettings({ language: lang });
    };

    const currentData = ONBOARDING_DATA[currentIndex];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* Background Image */}
            <Image 
                key={currentData.id}
                source={{ 
                    uri: currentData.image,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                }} 
                style={styles.backgroundImage} 
            />
            <View style={styles.darkOverlay} />

            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.topBar, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={styles.langPill}>
                        <TouchableOpacity 
                            style={[styles.langBtn, settings?.language === 'en' && styles.langBtnActive]}
                            onPress={() => handleLanguageSelect('en')}
                        >
                            <Text style={[styles.langText, settings?.language === 'en' && styles.langTextActive]}>EN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.langBtn, settings?.language === 'ar' && styles.langBtnActive]}
                            onPress={() => handleLanguageSelect('ar')}
                        >
                            <Text style={[styles.langText, settings?.language === 'ar' && styles.langTextActive]}>AR</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.centerContent}>
                    <View style={styles.contentBox}>
                        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {t(currentData.titleKey)}
                        </Text>
                        <View style={[styles.divider, isRTL && { alignSelf: 'flex-end' }]} />
                        <Text style={[styles.description, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {t(currentData.descKey)}
                        </Text>
                    </View>
                </View>

                <View style={[styles.bottomBar, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={styles.indicatorRow}>
                        {ONBOARDING_DATA.map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, { 
                                    width: currentIndex === i ? 24 : 8, 
                                    backgroundColor: currentIndex === i ? '#CC9933' : 'rgba(255,255,255,0.5)' 
                                }]}
                            />
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: currentIndex === ONBOARDING_DATA.length - 1 ? '#CC9933' : '#333' }]} 
                        onPress={nextSlide}
                    >
                        <Text style={[styles.actionBtnText, { color: currentIndex === ONBOARDING_DATA.length - 1 ? '#000' : '#fff' }]}>
                            {currentIndex === ONBOARDING_DATA.length - 1 ? t('getStarted') : t('next')}
                        </Text>
                        <Ionicons 
                            name={isRTL ? "arrow-back" : "arrow-forward"} 
                            size={20} 
                            color={currentIndex === ONBOARDING_DATA.length - 1 ? '#000' : '#fff'} 
                            style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }} 
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SPACING.md,
    },
    langPill: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'hidden',
    },
    langBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    langBtnActive: {
        backgroundColor: '#CC9933',
    },
    langText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    langTextActive: {
        color: '#000',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    contentBox: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: SPACING.xl,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: '#fff',
    },
    title: {
        fontFamily: FONTS.heavy,
        color: '#fff',
        fontSize: 36,
        fontWeight: '900',
        textTransform: 'uppercase',
        lineHeight: 40,
        letterSpacing: -1,
    },
    divider: {
        width: 60,
        height: 6,
        backgroundColor: '#CC9933',
        marginVertical: SPACING.lg,
    },
    description: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '600',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 20,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: '#fff',
        marginBottom: SPACING.xl,
    },
    indicatorRow: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    actionBtn: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
});
