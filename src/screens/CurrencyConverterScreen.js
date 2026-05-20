import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { COLORS, DARK_COLORS, SPACING, getFontFamily } from '../constants/theme';
import { useSettings } from '../store/SettingsContext';
import DynamicBackground from '../components/DynamicBackground';

// Mock Exchange Rates (Base: USD)
// In a real app, you would fetch this from an API like exchangeratesapi.io
const RATES = {
    USD: 1,
    EGP: 48.50,
    EUR: 0.92,
    GBP: 0.79,
    SAR: 3.75,
    AED: 3.67,
    KWD: 0.31,
};

const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', nameAr: 'دولار أمريكي', flag: '🇺🇸' },
    { code: 'EGP', name: 'Egyptian Pound', nameAr: 'جنيه مصري', flag: '🇪🇬' },
    { code: 'EUR', name: 'Euro', nameAr: 'يورو', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', nameAr: 'جنيه إسترليني', flag: '🇬🇧' },
    { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', flag: '🇸🇦' },
    { code: 'AED', name: 'UAE Dirham', nameAr: 'درهم إماراتي', flag: '🇦🇪' },
];

export default function CurrencyConverterScreen({ navigation }) {
    const { settings, t } = useSettings();
    const isRTL = settings?.language === 'ar';
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EGP');
    const [result, setResult] = useState(0);

    useEffect(() => {
        calculateConversion();
    }, [amount, fromCurrency, toCurrency]);

    const calculateConversion = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            setResult(0);
            return;
        }

        // Convert From -> USD -> To
        const amountInUSD = numAmount / RATES[fromCurrency];
        const converted = amountInUSD * RATES[toCurrency];
        setResult(converted.toFixed(2));
    };

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const renderCurrencySelector = (selectedCode, onSelect) => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={isRTL && { flexDirection: 'row-reverse' }}>
            {CURRENCIES.map(cur => (
                <TouchableOpacity
                    key={cur.code}
                    style={[
                        styles.currencyChip,
                        { borderColor: C.borderSoft || '#e0e0e0' },
                        selectedCode === cur.code && { backgroundColor: C.primary, borderColor: C.primary }
                    ]}
                    onPress={() => onSelect(cur.code)}
                >
                    <Text style={styles.flag}>{cur.flag}</Text>
                    <Text style={[styles.currencyCode, { color: selectedCode === cur.code ? '#000' : C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>
                        {cur.code}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <DynamicBackground city="Cairo" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color={C.textMain} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: C.textMain, fontFamily: getFontFamily(isRTL, 'bold') }]}>{t('currencyConverterTitle')}</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
                
                <Animated.View entering={ZoomIn.delay(100).duration(500)} style={[styles.card, { backgroundColor: C.bgCard }]}>
                    
                    {/* FROM */}
                    <Text style={[styles.label, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'bold') }, isRTL && { textAlign: 'right' }]}>{isRTL ? 'من' : 'From'}</Text>
                    <View style={styles.selectorWrapper}>
                        {renderCurrencySelector(fromCurrency, setFromCurrency)}
                    </View>
                    <TextInput
                        style={[styles.input, { color: C.textMain, backgroundColor: C.bgElevated, fontFamily: getFontFamily(isRTL, 'bold') }, isRTL && { textAlign: 'right' }]}
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor={C.textMuted}
                    />

                    {/* SWAP BUTTON */}
                    <View style={styles.swapWrapper}>
                        <TouchableOpacity style={[styles.swapBtn, { backgroundColor: C.primary }]} onPress={handleSwap}>
                            <Ionicons name="swap-vertical" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* TO */}
                    <Text style={[styles.label, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'bold') }, isRTL && { textAlign: 'right' }]}>{isRTL ? 'إلى' : 'To'}</Text>
                    <View style={styles.selectorWrapper}>
                        {renderCurrencySelector(toCurrency, setToCurrency)}
                    </View>
                    <View style={[styles.resultBox, { backgroundColor: C.bgElevated }]}>
                        <Text style={[styles.resultAmount, { color: C.primary, fontFamily: getFontFamily(isRTL, 'bold') }]}>{result}</Text>
                        <Text style={[styles.resultCurrency, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'bold') }]}>{toCurrency}</Text>
                    </View>

                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.infoBox, { backgroundColor: C.bgCard }]}>
                    <Ionicons name="information-circle-outline" size={24} color={C.textMuted} />
                    <Text style={[styles.infoText, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'medium') }, isRTL && { textAlign: 'right' }]}>
                        {isRTL 
                            ? 'الأسعار المعروضة هي أسعار استرشادية وقد تختلف قليلاً في البنوك أو مكاتب الصرافة الرسمية.' 
                            : 'Rates shown are indicative and may vary slightly at official banks or exchange offices.'}
                    </Text>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backBtn: {
        marginRight: SPACING.md,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    card: {
        borderRadius: 24,
        padding: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
    },
    selectorWrapper: {
        marginBottom: SPACING.md,
        height: 50,
    },
    currencyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 10,
        height: 40,
    },
    flag: {
        fontSize: 18,
        marginRight: 6,
    },
    currencyCode: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        height: 60,
        borderRadius: 16,
        paddingHorizontal: SPACING.lg,
        fontSize: 24,
        fontWeight: '900',
        marginBottom: SPACING.lg,
    },
    swapWrapper: {
        alignItems: 'center',
        marginVertical: -10,
        zIndex: 10,
    },
    swapBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    resultBox: {
        height: 80,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    resultAmount: {
        fontSize: 36,
        fontWeight: '900',
        marginRight: 8,
    },
    resultCurrency: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    infoBox: {
        flexDirection: 'row',
        marginTop: SPACING.xl,
        padding: SPACING.lg,
        borderRadius: 16,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: 14,
        lineHeight: 20,
    }
});
