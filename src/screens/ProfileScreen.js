import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useUser } from '../store/UserContext';

export default function ProfileScreen({ navigation }) {
    const { settings, updateSettings, t } = useUser();
    const isRTL = settings.language === 'ar';

    const toggleLanguage = () => {
        const newLang = settings.language === 'en' ? 'ar' : 'en';
        updateSettings({ language: newLang });
    };

    const renderSettingItem = (icon, label, value, onPress = null) => (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
            <View style={[styles.rowLeft, isRTL && styles.rowLeftRTL]}>
                <View style={styles.iconBox}>
                    <Ionicons name={icon} size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.rowLabel}>{t(label)}</Text>
            </View>
            {value}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, isRTL && styles.headerRTL]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={COLORS.textMain} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('settings')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('settings')}</Text>

                    {renderSettingItem('language', 'language',
                        <TouchableOpacity onPress={toggleLanguage} style={styles.valueBox}>
                            <Text style={styles.valueText}>{settings.language === 'en' ? 'English' : 'العربية'}</Text>
                            <Ionicons name="swap-horizontal" size={16} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                        , toggleLanguage)}

                    {renderSettingItem('moon', 'darkMode',
                        <Switch
                            trackColor={{ false: COLORS.borderSubtle, true: COLORS.primary }}
                            thumbColor={'#fff'}
                            onValueChange={() => { }}
                            value={false}
                        />
                    )}

                    {renderSettingItem('notifications', 'notifications',
                        <Switch
                            trackColor={{ false: COLORS.borderSubtle, true: COLORS.primary }}
                            thumbColor={'#fff'}
                            onValueChange={() => { }}
                            value={true}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('about')}</Text>
                    {renderSettingItem('shield-checkmark', 'privacyPolicy', <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={COLORS.textMuted} />, () => { })}
                    {renderSettingItem('document-text', 'termsOfService', <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={COLORS.textMuted} />, () => { })}
                </View>

                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgMain,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderSubtle,
    },
    headerRTL: {
        flexDirection: 'row-reverse',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    content: {
        padding: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textMuted,
        marginBottom: SPACING.sm,
        marginLeft: SPACING.sm,
        marginTop: SPACING.sm,
        textTransform: 'uppercase',
    },
    textRTL: {
        textAlign: 'right',
        marginRight: SPACING.sm,
        marginLeft: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderSubtle,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowLeftRTL: {
        flexDirection: 'row-reverse',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.bgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rowLabel: {
        fontSize: 16,
        color: COLORS.textMain,
        marginLeft: 0,
    },
    valueBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#FEE2E2',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    versionText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
});
