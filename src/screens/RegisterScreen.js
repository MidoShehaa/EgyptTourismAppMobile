import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { useSettings } from '../store/SettingsContext';
import { COLORS, DARK_COLORS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import DynamicBackground from '../components/DynamicBackground';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const { settings, t } = useSettings();
    const isDark = settings?.darkMode;
    const C = isDark ? DARK_COLORS : COLORS;
    const isRTL = settings?.language === 'ar';

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert(t('error'), isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert(t('error'), isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert(t('error'), isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            await register(email, password);
        } catch (error) {
            const msg = error.code === 'auth/email-already-in-use'
                ? (isRTL ? 'هذا البريد الإلكتروني مُسجّل بالفعل' : 'This email is already registered')
                : error.message;
            Alert.alert(t('error'), msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]}>
            <DynamicBackground city="Luxor" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
                
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color={C.textMain} />
                </TouchableOpacity>

                <View style={styles.logoArea}>
                    <Text style={styles.logoEmoji}>✨</Text>
                    <Text style={[styles.title, { color: C.textMain, textAlign: 'center' }]}>
                        {isRTL ? 'إنشاء حساب جديد' : 'Create Account'}
                    </Text>
                    <Text style={[styles.subtitle, { color: C.textMuted, textAlign: 'center' }]}>
                        {isRTL ? 'ابدأ رحلتك في استكشاف مصر' : 'Start your journey exploring Egypt'}
                    </Text>
                </View>
                
                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, { backgroundColor: C.bgElevated }]}>
                        <Ionicons name="mail-outline" size={20} color={C.textMuted} />
                        <TextInput
                            style={[styles.input, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}
                            placeholder={isRTL ? 'البريد الإلكتروني' : 'Email'}
                            placeholderTextColor={C.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={[styles.inputWrapper, { backgroundColor: C.bgElevated }]}>
                        <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} />
                        <TextInput
                            style={[styles.input, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}
                            placeholder={isRTL ? 'كلمة المرور' : 'Password'}
                            placeholderTextColor={C.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={C.textMuted} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.inputWrapper, { backgroundColor: C.bgElevated }]}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={C.textMuted} />
                        <TextInput
                            style={[styles.input, { color: C.textMain, textAlign: isRTL ? 'right' : 'left' }]}
                            placeholder={isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                            placeholderTextColor={C.textMuted}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: C.primary, opacity: isLoading ? 0.7 : 1 }]} 
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.buttonText}>{isRTL ? 'إنشاء حساب' : 'Create Account'}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
                    <Text style={[styles.linkText, { color: C.textMuted }]}>
                        {isRTL ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                        <Text style={{ color: C.primary, fontWeight: '900' }}>
                            {isRTL ? 'سجّل دخول' : 'Sign In'}
                        </Text>
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    backBtn: { position: 'absolute', top: 16, left: 8, padding: 8, zIndex: 10 },
    logoArea: { alignItems: 'center', marginBottom: 36 },
    logoEmoji: { fontSize: 60, marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
    subtitle: { fontSize: 15, fontWeight: '600', opacity: 0.7, lineHeight: 22 },
    inputContainer: { gap: 16, marginBottom: 28 },
    inputWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        height: 56, 
        borderRadius: 16, 
        paddingHorizontal: 16, 
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    input: { flex: 1, fontSize: 16, fontWeight: '600' },
    button: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#000', fontSize: 18, fontWeight: '900' },
    linkContainer: { marginTop: 24, alignItems: 'center' },
    linkText: { fontSize: 15, fontWeight: '600' }
});
