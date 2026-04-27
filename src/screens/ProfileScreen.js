import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, StatusBar, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useUser } from '../store/UserContext';

const fontFamilyHeavy = Platform.OS === 'ios' ? 'Futura' : 'sans-serif-black';
const fontFamilyMedium = Platform.OS === 'ios' ? 'San Francisco' : 'sans-serif-medium';

export default function ProfileScreen({ navigation }) {
    const { settings, updateSettings, clearItinerary, t } = useUser();
    const isRTL = settings.language === 'ar';
    const isDark = settings.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const toggleLanguage = () => {
        const newLang = settings.language === 'en' ? 'ar' : 'en';
        updateSettings({ language: newLang });
    };

    const toggleDarkMode = () => {
        updateSettings({ darkMode: !settings.darkMode });
    };

    const handleLogout = () => {
        Alert.alert(
            isRTL ? 'إعادة ضبط التطبيق' : 'Reset App',
            isRTL 
                ? 'سيتم مسح خطتك وإعادة عرض شاشة التعريف. هل أنت متأكد?'
                : 'This will clear your itinerary and restart the onboarding. Are you sure?',
            [
                { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
                {
                    text: isRTL ? 'إعادة ضبط' : 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        updateSettings({ hasSeenOnboarding: false });
                        navigation.replace('Onboarding');
                    },
                },
            ]
        );
    };

    const handlePrivacyPolicy = () => {
        Alert.alert(
            isRTL ? 'سياسة الخصوصية' : 'Privacy Policy',
            isRTL 
                ? 'هذا التطبيق لا يجمع أي بيانات شخصية. جميع البيانات مخزنة محلياً على جهازك فقط.'
                : 'This app does not collect any personal data. All data is stored locally on your device only.',
            [{ text: 'OK' }]
        );
    };

    const handleTerms = () => {
        Alert.alert(
            isRTL ? 'شروط الاستخدام' : 'Terms of Service',
            isRTL 
                ? 'باستخدام هذا التطبيق، تقر بأن جميع المعلومات المقدمة للأغراض الإرشادية فقط. الأسعار والمواعيد قد تتغير.'
                : 'By using this app, you acknowledge that all information is for guidance only. Prices and schedules may vary.',
            [{ text: 'OK' }]
        );
    };

    const renderSettingItem = (icon, label, value, onPress = null) => (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
            <View style={[styles.rowLeft, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={styles.iconBox}>
                    <Ionicons name={icon} size={22} color={C.primary} />
                </View>
                <Text style={[styles.rowLabel, { color: '#fff' }]}>{t(label)}</Text>
            </View>
            {value}
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bgMain} />
            
            <View style={[styles.headerBlock, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.titleLine, { color: '#fff' }]}>
                    {isRTL ? 'الإعدادات' : 'Settings'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: C.textMuted }]}>
                    {isRTL ? 'تخصيص تجربتك في مصر' : 'Personalize your Egypt experience'}
                </Text>
            </View>


            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    {renderSettingItem(
                        'language-outline', 
                        'language',
                        (
                            <View style={styles.valueBox}>
                                <Text style={[styles.valueText, { color: C.primary }]}>{settings.language === 'en' ? 'English' : 'العربية'}</Text>
                            </View>
                        ), 
                        toggleLanguage
                    )}

                    <View style={styles.divider} />

                    {renderSettingItem(
                        'moon-outline', 
                        'darkMode',
                        (
                            <Switch
                                trackColor={{ false: '#333', true: C.primary }}
                                thumbColor={'#fff'}
                                onValueChange={toggleDarkMode}
                                value={settings.darkMode === true}
                            />
                        )
                    )}
                </View>


                <View style={styles.section}>
                    {renderSettingItem('shield-checkmark-outline', 'privacyPolicy', <Ionicons name="chevron-forward" size={20} color="#555" />, handlePrivacyPolicy)}
                    <View style={styles.divider} />
                    {renderSettingItem('document-text-outline', 'termsOfService', <Ionicons name="chevron-forward" size={20} color="#555" />, handleTerms)}
                </View>

                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={22} color="#FF4444" />
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>


                <View style={styles.footer}>
                    <Text style={[styles.versionText, { color: C.textMuted }]}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBlock: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },
    titleLine: { fontSize: 32, fontWeight: '900' },
    headerSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 8, opacity: 0.6 },
    content: { padding: 24, paddingBottom: 100 },
    section: { marginBottom: 24, borderRadius: 32, backgroundColor: '#1A1A1A', padding: 12 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 12 },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    rowLabel: { fontSize: 16, fontWeight: '700' },
    valueBox: { flexDirection: 'row', alignItems: 'center' },
    valueText: { fontSize: 14, fontWeight: '900' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 12 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 64, borderRadius: 24, backgroundColor: '#1A1A1A', marginTop: 8, gap: 12 },
    logoutText: { fontSize: 16, fontWeight: '900', color: '#FF4444' },
    footer: { alignItems: 'center', marginTop: 24 },
    versionText: { fontSize: 12, fontWeight: '600', opacity: 0.3 },
});

