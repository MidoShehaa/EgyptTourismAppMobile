import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, StatusBar, Platform } from 'react-native';
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
        updateSettings({ hasSeenOnboarding: false });
        navigation.replace('Onboarding');
    };

    const renderSettingItem = (icon, label, value, onPress = null) => (
        <TouchableOpacity style={[styles.row, { borderBottomColor: C.borderGold }]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
            <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
                <View style={[styles.iconBox, { backgroundColor: C.bgMain, borderColor: C.borderGold }]}>
                    <Ionicons name={icon} size={20} color={C.textMain} />
                </View>
                <Text style={[styles.rowLabel, { color: C.textMain }]}>{t(label)}</Text>
            </View>
            {value}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.bgMain} />
            
            <View style={[styles.headerBlock, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.titleLine, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'ملفي' : 'PROFILE'}
                </Text>
                <Text style={[styles.titleLine, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'الشخصي' : 'SETTINGS'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: C.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('settings')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.section, { backgroundColor: C.bgCard, borderColor: C.borderGold }]}>
                    <Text style={[styles.sectionTitle, { color: C.textMuted }, isRTL && styles.textRTL]}>{t('settings')}</Text>

                    {renderSettingItem('language', 'language',
                        <TouchableOpacity onPress={toggleLanguage} style={styles.valueBox}>
                            <Text style={[styles.valueText, { color: C.textMain }]}>{settings.language === 'en' ? 'English' : 'العربية'}</Text>
                            <Ionicons name="swap-horizontal" size={20} color={C.textMain} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                        , toggleLanguage)}

                    {renderSettingItem('moon', 'darkMode',
                        <Switch
                            trackColor={{ false: C.borderSubtle, true: C.primary }}
                            thumbColor={'#fff'}
                            onValueChange={toggleDarkMode}
                            value={settings.darkMode === true}
                        />
                    )}

                    {renderSettingItem('notifications', 'notifications',
                        <Switch
                            trackColor={{ false: C.borderSubtle, true: C.primary }}
                            thumbColor={'#fff'}
                            onValueChange={() => { }}
                            value={true}
                        />
                    )}
                </View>

                <View style={[styles.section, { backgroundColor: C.bgCard, borderColor: C.borderGold }]}>
                    <Text style={[styles.sectionTitle, { color: C.textMuted }, isRTL && styles.textRTL]}>
                        {isRTL ? 'عن التطبيق' : 'ABOUT'}
                    </Text>
                    {renderSettingItem('shield-checkmark', 'privacyPolicy', <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color={C.textMain} />, () => { })}
                    {renderSettingItem('document-text', 'termsOfService', <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color={C.textMain} />, () => { })}
                </View>

                <TouchableOpacity 
                    style={[styles.logoutButton, { backgroundColor: C.bgCard, borderColor: COLORS.error || '#EF4444' }]}
                    onPress={handleLogout}
                >
                    <Text style={[styles.logoutText, { color: COLORS.error || '#EF4444' }]}>{t('logout')}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.versionText, { color: C.textMuted }]}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBlock: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
    },
    titleLine: {
        fontFamily: fontFamilyHeavy,
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -1.5,
        lineHeight: 52,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontFamily: fontFamilyMedium,
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: SPACING.sm,
    },
    content: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    section: {
        marginBottom: SPACING.xl,
        borderWidth: 2,
        borderRadius: 24,
        padding: SPACING.sm,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontFamily: fontFamilyHeavy,
        fontSize: 16,
        fontWeight: '900',
        marginBottom: SPACING.md,
        marginLeft: SPACING.md,
        marginTop: SPACING.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    textRTL: {
        textAlign: 'right',
        marginRight: SPACING.md,
        marginLeft: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowLeftRTL: {
        flexDirection: 'row-reverse',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rowLabel: {
        fontFamily: fontFamilyMedium,
        fontSize: 16,
        fontWeight: '700',
    },
    valueBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        fontFamily: fontFamilyHeavy,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 30,
        borderWidth: 2,
        marginBottom: SPACING.xl,
    },
    logoutText: {
        fontFamily: fontFamilyHeavy,
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    versionText: {
        fontFamily: fontFamilyMedium,
        fontSize: 14,
        fontWeight: '700',
    },
});
