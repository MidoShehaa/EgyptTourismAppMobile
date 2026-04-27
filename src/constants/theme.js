import { Platform } from 'react-native';

// App Theme Constants - Cyber Travel Premium Edition (Inspired by Dribbble)
export const COLORS = {
    primary: '#4CD8D0',      // Electric Cyan
    secondary: '#2BBDB4',    // Muted Cyan
    bgMain: '#000000',       // Deep Black
    bgCard: '#121212',       // Dark Charcoal
    bgElevated: '#1E1E1E',   // Lighter Gray
    glassBg: 'rgba(0, 0, 0, 0.7)',
    textMain: '#FFFFFF',     // Crisp White
    textMuted: '#A0A0A0',    // Soft Gray
    textGold: '#4CD8D0',     // Overriding gold with Cyan for consistency
    textLight: '#FFFFFF',
    gold: '#4CD8D0',
    borderSubtle: 'rgba(255, 255, 255, 0.1)',
    borderGold: '#4CD8D0',
    success: '#00C853',
    error: '#FF5252',
    warning: '#FFD600',
};

// Keeping Dark Mode same as COLORS for now as the design is naturally Dark
export const DARK_COLORS = { ...COLORS };

export const FONTS = {
    heavy: Platform.OS === 'ios' ? 'Inter-Black' : 'sans-serif-black',
    medium: Platform.OS === 'ios' ? 'Inter-Medium' : 'sans-serif-medium',
    heading: 'System',
    body: 'System',
};

export const COMMON_STYLES = {
    premiumCard: {
        backgroundColor: '#121212',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
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


