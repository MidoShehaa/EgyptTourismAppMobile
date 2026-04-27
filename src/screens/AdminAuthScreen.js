import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator,
    Animated, StatusBar, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../store/UserContext';
import { COLORS, DARK_COLORS, SPACING } from '../constants/theme';
import {
    isAdminSetup,
    setupAdminCredentials,
    verifyAdminLogin,
} from '../utils/adminAuth';

export default function AdminAuthScreen({ navigation }) {
    const { settings, showToast } = useUser();
    const isDark = settings?.darkMode === true;
    const C = isDark ? DARK_COLORS : COLORS;

    const [isSetupMode, setIsSetupMode] = useState(false); // true = first-time setup
    const [isLoading, setIsLoading] = useState(true);      // checking if setup done

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Shake animation for wrong password
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    // Check if admin has been set up before
    useEffect(() => {
        const check = async () => {
            const setup = await isAdminSetup();
            setIsSetupMode(!setup);
            setIsLoading(false);
        };
        check();
    }, []);

    const handleLogin = async () => {
        setError('');
        if (!username.trim() || !password) {
            setError('Please enter your username and password.');
            shake();
            return;
        }
        setSubmitting(true);
        const result = await verifyAdminLogin(username, password);
        setSubmitting(false);
        if (result.ok) {
            showToast('Welcome, Admin!', 'success', 'shield-checkmark');
            navigation.replace('AdminPanel');
        } else {
            setError(result.error || 'Login failed.');
            shake();
        }
    };

    const handleSetup = async () => {
        setError('');
        if (!username.trim() || username.trim().length < 3) {
            setError('Username must be at least 3 characters.');
            shake();
            return;
        }
        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters.');
            shake();
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            shake();
            return;
        }
        setSubmitting(true);
        const result = await setupAdminCredentials(username, password);
        setSubmitting(false);
        if (result.ok) {
            showToast('Admin account created!', 'success', 'shield-checkmark');
            navigation.replace('AdminPanel');
        } else {
            setError(result.error || 'Setup failed.');
            shake();
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: C.bgMain }]}>
                <ActivityIndicator size="large" color="#CC9933" />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Back button */}
            <TouchableOpacity
                style={[styles.backBtn, { borderColor: '#000', backgroundColor: C.bgCard }]}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={22} color={C.textMain} />
            </TouchableOpacity>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                    {/* Shield Icon */}
                    <View style={[styles.iconCircle, { backgroundColor: '#CC9933', borderColor: '#000' }]}>
                        <Ionicons name="shield-checkmark" size={44} color="#000" />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: C.textMain }]}>
                        {isSetupMode ? 'SETUP ADMIN' : 'ADMIN LOGIN'}
                    </Text>
                    <Text style={[styles.subtitle, { color: C.textMuted }]}>
                        {isSetupMode
                            ? 'Create your admin credentials to protect the panel.'
                            : 'Enter your credentials to access the admin panel.'}
                    </Text>

                    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>

                        {/* Username */}
                        <Text style={[styles.label, { color: C.textMuted }]}>USERNAME</Text>
                        <View style={[styles.inputWrap, { borderColor: '#000', backgroundColor: C.bgCard }]}>
                            <Ionicons name="person-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: C.textMain }]}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="admin"
                                placeholderTextColor={C.textMuted}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password */}
                        <Text style={[styles.label, { color: C.textMuted }]}>PASSWORD</Text>
                        <View style={[styles.inputWrap, { borderColor: '#000', backgroundColor: C.bgCard }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: C.textMain }]}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor={C.textMuted}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password (setup only) */}
                        {isSetupMode && (
                            <>
                                <Text style={[styles.label, { color: C.textMuted }]}>CONFIRM PASSWORD</Text>
                                <View style={[styles.inputWrap, { borderColor: '#000', backgroundColor: C.bgCard }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: C.textMain }]}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="••••••••"
                                        placeholderTextColor={C.textMuted}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                            </>
                        )}

                        {/* Error */}
                        {!!error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: '#CC9933', borderColor: '#000' }]}
                            onPress={isSetupMode ? handleSetup : handleLogin}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={isSetupMode ? 'checkmark-circle' : 'log-in'}
                                        size={20}
                                        color="#000"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.submitBtnText}>
                                        {isSetupMode ? 'CREATE ACCOUNT' : 'LOGIN'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Security notice */}
                        <View style={[styles.noticeBox, { backgroundColor: C.bgCard, borderColor: isDark ? '#333' : '#e0e0e0' }]}>
                            <Ionicons name="information-circle-outline" size={16} color={C.textMuted} />
                            <Text style={[styles.noticeText, { color: C.textMuted }]}>
                                {isSetupMode
                                    ? 'These credentials are stored securely on this device only.'
                                    : 'This panel is restricted to authorized administrators only.'}
                            </Text>
                        </View>

                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    backBtn: {
        marginTop: SPACING.md,
        marginLeft: SPACING.md,
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: SPACING.lg,
        alignItems: 'stretch',
        paddingBottom: 60,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: -1,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 16,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 56,
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    eyeBtn: { padding: 4 },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
        gap: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    submitBtn: {
        flexDirection: 'row',
        height: 58,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#000',
    },
    noticeBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginTop: 20,
        gap: 8,
    },
    noticeText: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
        lineHeight: 18,
    },
});
