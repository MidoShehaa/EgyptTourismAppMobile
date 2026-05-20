import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS } from '../constants/theme';
import storage from '../utils/storage';
import { TRANSLATIONS } from '../constants/translations';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({ language: 'en' });
    const [isHydrated, setIsHydrated] = useState(false);

    // ── Toast ────────────────────────────────────────────────────
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success', icon: 'checkmark-circle' });
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(-50)).current;
    const toastTimer = useRef(null);

    const showToast = useCallback((message, type = 'success', icon = 'checkmark-circle') => {
        if (toastTimer.current) clearTimeout(toastTimer.current);

        setToast({ visible: true, message, type, icon });
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(translateYAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
        
        toastTimer.current = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(translateYAnim, { toValue: -50, duration: 400, useNativeDriver: true }),
            ]).start(() => setToast(prev => ({ ...prev, visible: false })));
        }, 3000);
    }, [fadeAnim, translateYAnim]);

    // ── Translation Helper ───────────────────────────────────────
    const t = useCallback((key, params = {}) => {
        const lang = settings.language || 'en';
        const keys = key.split('.');
        let value = TRANSLATIONS[lang];
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }
        if (typeof value !== 'string') return key;
        Object.keys(params).forEach(p => {
            value = value.replace(new RegExp(`{{${p}}}`, 'g'), params[p]);
        });
        return value;
    }, [settings.language]);

    // ── Load settings on mount ───────────────────────────────────
    // NOTE: isHydrated is shared — we mark it true here, and other
    // contexts can rely on SettingsContext being hydrated first.
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await storage.load(storage.keys.SETTINGS);
                if (savedSettings) setSettings(savedSettings);
            } catch (error) {
                console.warn('Settings load failed, using defaults:', error);
            } finally {
                setIsHydrated(true);
            }
        };
        loadSettings();
    }, []);

    // ── Settings ─────────────────────────────────────────────────
    const updateSettings = useCallback((newSettings) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            storage.save(storage.keys.SETTINGS, updated);
            return updated;
        });
    }, []);

    // ── Context value ────────────────────────────────────────────
    const value = useMemo(() => ({
        settings,
        updateSettings,
        isHydrated,
        t,
        showToast,
    }), [settings, updateSettings, isHydrated, t, showToast]);

    const C = settings?.darkMode ? DARK_COLORS : COLORS;

    return (
        <SettingsContext.Provider value={value}>
            {children}
            {toast.visible && (
                <SafeAreaView style={styles.toastSafeArea} pointerEvents="none">
                    <Animated.View style={[
                        styles.toastContainer,
                        { backgroundColor: C.bgCard, borderColor: C.borderSubtle },
                        { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] },
                    ]}>
                        <View style={[styles.iconBox, { backgroundColor: toast.type === 'success' ? '#10B98120' : '#EF444420' }]}>
                            <Ionicons name={toast.icon} size={24} color={toast.type === 'success' ? '#10B981' : '#EF4444'} />
                        </View>
                        <Text style={[styles.toastText, { color: C.textMain }]} numberOfLines={2}>
                            {toast.message}
                        </Text>
                    </Animated.View>
                </SafeAreaView>
            )}
        </SettingsContext.Provider>
    );
};

const styles = StyleSheet.create({
    toastSafeArea: {
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 9999, alignItems: 'center',
    },
    toastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        borderRadius: 24,
        backgroundColor: 'rgba(18, 18, 18, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        width: '90%',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    toastText: { 
        flex: 1, 
        fontSize: 15, 
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
};

export default SettingsContext;
