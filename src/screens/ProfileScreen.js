import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, StatusBar, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, DARK_COLORS, SPACING, BORDER_RADIUS, getFontFamily } from '../constants/theme';
import { useSettings } from '../store/SettingsContext';
import { usePlanner } from '../store/PlannerContext';
import { useAuth } from '../store/AuthContext';
import DynamicBackground from '../components/DynamicBackground';

export default function ProfileScreen({ navigation }) {
    const { settings, updateSettings, t } = useSettings();
    const { clearItinerary } = usePlanner();
    const { user, logout } = useAuth();
    const isRTL = settings.language === 'ar';
    const isDark = settings.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const toggleLanguage = () => {
        const newLang = settings.language === 'en' ? 'ar' : 'en';
        updateSettings({ language: newLang });
    };



    const handleReset = () => {
        Alert.alert(
            t('resetApp') || 'Reset App',
            t('resetAppMsg') || 'This will clear your local plans.',
            [
                { text: t('cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('reset') || 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        clearItinerary();
                        updateSettings({ hasSeenOnboarding: false });
                        navigation.replace('Onboarding');
                    },
                },
            ]
        );
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    };

    const handlePrivacyPolicy = () => {
        Alert.alert(
            t('privacyPolicy'),
            t('privacyPolicyContent'),
            [{ text: 'OK' }]
        );
    };

    const handleTerms = () => {
        Alert.alert(
            t('termsOfService'),
            t('termsContent'),
            [{ text: 'OK' }]
        );
    };

    const renderSettingItem = (icon, label, value, onPress = null) => {
        const displayLabel = t(label) !== label ? t(label) : label;
        return (
            <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
                <View style={[styles.rowLeft, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={styles.iconBox}>
                        <Ionicons name={icon} size={22} color={C.primary} />
                    </View>
                    <Text style={[styles.rowLabel, { color: '#fff', fontFamily: getFontFamily(isRTL, 'bold') }]}>{displayLabel}</Text>
                </View>
                {value}
            </TouchableOpacity>
        );
    };


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top', 'left', 'right']}>
            <DynamicBackground city="Cairo" />
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bgMain} />
            
            <View style={[styles.headerBlock, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.titleLine, { color: '#fff', fontFamily: getFontFamily(isRTL, 'bold') }]}>
                    {t('settings')}
                </Text>
                <Text style={[styles.headerSubtitle, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'medium') }]}>
                    {t('settingsSubtitle')}
                </Text>
            </View>


            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.section}>
                    {renderSettingItem(
                        'language-outline', 
                        'language',
                        (
                            <View style={styles.valueBox}>
                                <Text style={[styles.valueText, { color: C.primary, fontFamily: getFontFamily(isRTL, 'bold') }]}>{settings.language === 'en' ? 'English' : 'العربية'}</Text>
                            </View>
                        ), 
                        toggleLanguage
                    )}
                    <View style={styles.divider} />
                    {renderSettingItem(
                        isDark ? 'moon' : 'sunny', 
                        'darkMode',
                        (
                            <Switch 
                                value={isDark} 
                                onValueChange={(val) => updateSettings({ darkMode: val })}
                                trackColor={{ false: '#767577', true: C.primary }}
                                thumbColor={isDark ? '#fff' : '#f4f3f4'}
                            />
                        ), 
                        () => updateSettings({ darkMode: !isDark })
                    )}
                </Animated.View>

                {/* Account Section */}
                <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.section}>
                    {user ? (
                        <>
                            {renderSettingItem('person-circle-outline', 'Account', <Text style={{ color: '#fff', fontFamily: getFontFamily(isRTL, 'medium') }}>{user.email}</Text>, null)}
                            <View style={styles.divider} />
                            {renderSettingItem('log-out-outline', 'Logout', <Ionicons name="chevron-forward" size={20} color="#555" />, handleLogout)}
                        </>
                    ) : (
                        <>
                            {renderSettingItem('log-in-outline', 'Login', <Ionicons name="chevron-forward" size={20} color="#555" />, () => navigation.navigate('Login'))}
                            <View style={styles.divider} />
                            {renderSettingItem('person-add-outline', 'Register', <Ionicons name="chevron-forward" size={20} color="#555" />, () => navigation.navigate('Register'))}
                        </>
                    )}
                </Animated.View>

                {/* Offline Status */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={[styles.section, { backgroundColor: '#0D3D1A', paddingVertical: 16 }]}>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#10B98120', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="cloud-offline-outline" size={22} color="#10B981" />
                        </View>
                        <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                            <Text style={{ color: '#10B981', fontSize: 15, fontFamily: getFontFamily(isRTL, 'bold') }}>
                                {t('worksOffline')}
                            </Text>
                            <Text style={{ color: '#10B98180', fontSize: 12, fontFamily: getFontFamily(isRTL, 'medium'), marginTop: 2 }}>
                                {t('worksOfflineDesc')}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.section}>
                    {renderSettingItem(
                        'stats-chart-outline',
                        t('myTripStats'),
                        <Ionicons name="chevron-forward" size={20} color="#555" />,
                        () => navigation.navigate('TripStats')
                    )}
                    <View style={styles.divider} />
                    {renderSettingItem(
                        'book-outline',
                        t('arabicPhrasebook'),
                        <Ionicons name="chevron-forward" size={20} color="#555" />,
                        () => navigation.navigate('Phrasebook')
                    )}
                    <View style={styles.divider} />

                    {renderSettingItem(
                        'cash-outline',
                        t('currencyConverter'),
                        <Ionicons name="chevron-forward" size={20} color="#555" />,
                        () => navigation.navigate('CurrencyConverter')
                    )}
                    <View style={styles.divider} />
                    {renderSettingItem(
                        'shield-checkmark-outline',
                        t('emergencyPractical'),
                        <Ionicons name="chevron-forward" size={20} color="#555" />,
                        () => navigation.navigate('Emergency')
                    )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
                    {renderSettingItem('shield-checkmark-outline', 'privacyPolicy', <Ionicons name="chevron-forward" size={20} color="#555" />, handlePrivacyPolicy)}
                    <View style={styles.divider} />
                    {renderSettingItem('document-text-outline', 'termsOfService', <Ionicons name="chevron-forward" size={20} color="#555" />, handleTerms)}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(350).duration(500)} style={styles.section}>
                    <TouchableOpacity 
                        style={[styles.resetBtn, { backgroundColor: '#1A1A1A', borderColor: '#CC9933', borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12 }]} 
                        onPress={() => navigation.navigate('AdminAuth')}
                    >
                        <Ionicons name="shield-half-outline" size={20} color="#CC9933" />
                        <Text style={[styles.resetBtnText, { color: '#CC9933', fontFamily: getFontFamily(isRTL, 'bold'), marginLeft: 8 }]}>
                            {isRTL ? 'لوحة التحكم للمدير' : 'Admin Panel'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                    <TouchableOpacity 
                        style={styles.logoutButton}
                        onPress={handleReset}
                    >
                        <Ionicons name="trash-outline" size={22} color="#FF4444" />
                        <Text style={[styles.logoutText, { fontFamily: getFontFamily(isRTL, 'bold') }]}>{t('resetApp') || 'Reset App'}</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.footer}>
                    <Text style={[styles.versionText, { color: C.textMuted, fontFamily: getFontFamily(isRTL, 'medium') }]}>Version 1.0.0</Text>
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

