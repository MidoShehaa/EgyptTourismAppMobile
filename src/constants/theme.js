import { Platform } from 'react-native';

// Light Theme (Clean & Bright)
export const COLORS = {
    primary: '#009688',      // Deep Teal for good contrast on white
    secondary: '#4CD8D0',    // Electric Cyan accent
    bgMain: '#F5F7FA',       // Very light gray/blue background
    bgCard: '#FFFFFF',       // Solid White Card
    bgElevated: '#FFFFFF',   // Elevated White
    glassBg: 'rgba(255, 255, 255, 0.8)',
    textMain: '#1A1A1A',     // Almost Black text
    textMuted: '#666666',    // Medium Gray text
    textGold: '#D4AF37',     // Real Gold for light mode
    textLight: '#FFFFFF',
    gold: '#D4AF37',
    borderSubtle: 'rgba(0, 0, 0, 0.05)',
    borderSoft: 'rgba(0, 0, 0, 0.1)',
    borderGold: '#D4AF37',
    success: '#00C853',
    error: '#FF5252',
    warning: '#FFD600',
};

// Dark Theme - Cyber Travel Premium Edition (Current Design)
export const DARK_COLORS = {
    primary: '#4CD8D0',      // Electric Cyan
    secondary: '#2BBDB4',    // Muted Cyan
    bgMain: '#000000',       // Deep Black
    bgCard: 'rgba(18, 18, 18, 0.6)',       // Dark Charcoal Glass
    bgElevated: 'rgba(30, 30, 30, 0.7)',   // Lighter Gray Glass
    glassBg: 'rgba(0, 0, 0, 0.7)',
    textMain: '#FFFFFF',     // Crisp White
    textMuted: '#A0A0A0',    // Soft Gray
    textGold: '#4CD8D0',     // Overriding gold with Cyan for consistency
    textLight: '#FFFFFF',
    gold: '#4CD8D0',
    borderSubtle: 'rgba(255, 255, 255, 0.1)',
    borderSoft: 'rgba(255, 255, 255, 0.08)',
    borderGold: '#4CD8D0',
    success: '#00C853',
    error: '#FF5252',
    warning: '#FFD600',
};

export const FONTS = {
    enRegular: 'Outfit_400Regular',
    enMedium: 'Outfit_500Medium',
    enSemiBold: 'Outfit_600SemiBold',
    enBold: 'Outfit_700Bold',
    arRegular: 'Cairo_400Regular',
    arSemiBold: 'Cairo_600SemiBold',
    arBold: 'Cairo_700Bold',
};

export const getFontFamily = (isRTL, weight = 'regular') => {
    if (isRTL) {
        if (weight === 'bold') return FONTS.arBold;
        if (weight === 'semibold') return FONTS.arSemiBold;
        return FONTS.arRegular;
    } else {
        if (weight === 'bold') return FONTS.enBold;
        if (weight === 'semibold') return FONTS.enSemiBold;
        if (weight === 'medium') return FONTS.enMedium;
        return FONTS.enRegular;
    }
};

export const COMMON_STYLES = {
    premiumCard: {
        backgroundColor: 'rgba(18, 18, 18, 0.6)',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pillButton: {
        backgroundColor: '#4CD8D0',
        borderRadius: 9999,
        paddingVertical: 12,
        paddingHorizontal: 24,
    }
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    full: 9999,
};


