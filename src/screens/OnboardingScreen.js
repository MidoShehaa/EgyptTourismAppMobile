import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import SafeImage from '../components/SafeImage';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { useSettings } from '../store/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        titleKey: 'onboarding1Title',
        descKey: 'onboarding1Desc',
        imageUri: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?w=1200&q=80',
        fallbackColors: ['#1a0a00', '#3d1f00'],
    },
    {
        id: '2',
        titleKey: 'onboarding2Title',
        descKey: 'onboarding2Desc',
        imageUri: 'https://images.unsplash.com/photo-1568322445389-f64e0de96218?w=1200&q=80',
        fallbackColors: ['#0d0d1a', '#1a1a3e'],
    },
    {
        id: '3',
        titleKey: 'onboarding3Title',
        descKey: 'onboarding3Desc',
        imageUri: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&q=80',
        fallbackColors: ['#001a1a', '#003d3d'],
    }
];

export default function OnboardingScreen({ navigation }) {
    const { t, settings, updateSettings } = useSettings();
    const isRTL = settings?.language === 'ar';
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imgErrors, setImgErrors] = useState({});

    const handleFinish = () => {
        updateSettings({ hasSeenOnboarding: true });
        navigation.replace('MainTabs');
    };

    const flatListRef = useRef(null);

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

    const nextSlide = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
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
            
            <View style={{ flex: 1 }}>
                <FlashList
                    ref={flatListRef}
                    data={ONBOARDING_DATA}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    keyExtractor={item => item.id}
                    estimatedItemSize={width}
                    renderItem={({ item }) => (
                        <View style={{ width, height: '100%' }}>
                            <LinearGradient colors={item.fallbackColors} style={styles.backgroundImage} />
                            <SafeImage 
                                uri={item.imageUri}
                                style={styles.backgroundImage} 
                                resizeMode="cover"
                            />
                            <View style={styles.darkOverlay} />
                            <SafeAreaView style={styles.safeArea}>
                                <View style={{ height: 60 }} />
                                <View style={styles.centerContent}>
                                    <View style={styles.contentBox}>
                                        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t(item.titleKey)}
                                        </Text>
                                        <View style={[styles.divider, isRTL && { alignSelf: 'flex-end' }]} />
                                        <Text style={[styles.description, { textAlign: isRTL ? 'right' : 'left' }]}>
                                            {t(item.descKey)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ height: 100 }} />
                            </SafeAreaView>
                        </View>
                    )}
                />
            </View>

            <View style={[styles.absoluteTop, isRTL && { flexDirection: 'row-reverse' }]}>
                <SafeAreaView edges={['top']}>
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
                </SafeAreaView>
            </View>

            <View style={[styles.absoluteBottom, isRTL && { flexDirection: 'row-reverse' }]}>
                <SafeAreaView edges={['bottom']}>
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
    absoluteTop: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight + SPACING.md : SPACING.xl,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.lg,
    },
    absoluteBottom: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? SPACING.xl : SPACING.xxl,
        left: 0,
        right: 0,
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
