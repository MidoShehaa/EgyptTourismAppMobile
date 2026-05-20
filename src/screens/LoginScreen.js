import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { useSettings } from '../store/SettingsContext';
import { COLORS, DARK_COLORS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import DynamicBackground from '../components/DynamicBackground';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { settings, t, showToast } = useSettings();
    const isDark = settings?.darkMode;
    const C = isDark ? DARK_COLORS : COLORS;
    const isRTL = settings?.language === 'ar';

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('error'), isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
            return;
        }
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            const msg = error.code === 'auth/invalid-credential' 
                ? (isRTL ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
                : error.message;
            Alert.alert(t('error'), msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert(
                isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
                isRTL ? 'اكتب بريدك الإلكتروني أولاً ثم اضغط "نسيت كلمة المرور"' : 'Type your email in the field above, then tap "Forgot Password"'
            );
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert(
                '✅ ' + (isRTL ? 'تم الإرسال' : 'Email Sent'),
                isRTL ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}` : `Password reset link sent to ${email}`
            );
        } catch (error) {
            Alert.alert(t('error'), error.message);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: C.bgMain }]}>
            <DynamicBackground city="Cairo" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
                
                {/* Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color={C.textMain} />
                </TouchableOpacity>

                {/* Logo Area */}
                <View style={styles.logoArea}>
                    <Text style={styles.logoEmoji}>🇪🇬</Text>
                    <Text style={[styles.title, { color: C.textMain, textAlign: 'center' }]}>
                        {isRTL ? 'مرحباً بعودتك' : 'Welcome Back'}
                    </Text>
                    <Text style={[styles.subtitle, { color: C.textMuted, textAlign: 'center' }]}>
                        {isRTL ? 'سجّل دخولك لحفظ رحلاتك ومفضلاتك' : 'Sign in to save your trips & favorites'}
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
                </View>

                {/* Forgot Password */}
                <TouchableOpacity onPress={handleForgotPassword} style={[styles.forgotContainer, isRTL && { alignItems: 'flex-start' }]}>
                    <Text style={[styles.forgotText, { color: C.primary }]}>
                        {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: C.primary, opacity: isLoading ? 0.7 : 1 }]} 
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.buttonText}>{isRTL ? 'تسجيل الدخول' : 'Sign In'}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
                    <Text style={[styles.linkText, { color: C.textMuted }]}>
                        {isRTL ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
                        <Text style={{ color: C.primary, fontWeight: '900' }}>
                            {isRTL ? 'سجّل الآن' : 'Register'}
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
    logoArea: { alignItems: 'center', marginBottom: 40 },
    logoEmoji: { fontSize: 60, marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
    subtitle: { fontSize: 15, fontWeight: '600', opacity: 0.7, lineHeight: 22 },
    inputContainer: { gap: 16, marginBottom: 12 },
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
    forgotContainer: { alignItems: 'flex-end', marginBottom: 24 },
    forgotText: { fontSize: 14, fontWeight: '700' },
    button: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#000', fontSize: 18, fontWeight: '900' },
    linkContainer: { marginTop: 24, alignItems: 'center' },
    linkText: { fontSize: 15, fontWeight: '600' }
});
