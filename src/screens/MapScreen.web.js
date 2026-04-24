import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';
import { useUser } from '../store/UserContext';

export default function MapScreen() {
    const { settings } = useUser();
    const isRTL = settings?.language === 'ar';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>{isRTL ? 'خريطة مصر' : 'Egypt Map'}</Text>
                <Text style={styles.subtitle}>{isRTL ? 'اكتشف الأماكن القريبة' : 'Discover places nearby'}</Text>
            </View>

            <View style={styles.placeholderContainer}>
                <Ionicons name="map-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.placeholderText}>
                    {isRTL 
                        ? 'عذراً، الخريطة غير مدعومة على متصفح الويب. الرجاء تجربة التطبيق على الهاتف.' 
                        : 'Sorry, the map is not supported on the web browser. Please test on a mobile device.'}
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgMain,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.bgMain,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginTop: 2,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    placeholderText: {
        fontSize: 16,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: SPACING.md,
        lineHeight: 24,
    }
});
