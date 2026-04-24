import { Platform } from 'react-native';

// App Theme Constants - Brutalist Editorial Dribbble Edition
export const COLORS = {
    // Primary Colors
    primary: '#000000',      // Pure Black for all main CTAs
    primaryHover: '#333333',
    primaryGlow: 'rgba(0, 0, 0, 0.2)',

    // Secondary
    secondary: '#EBE3D5',    // Soft Sand/Cream
    secondaryGlow: 'rgba(235, 227, 213, 0.5)',

    // Accent Colors
    accent: '#000000',       // Keep it stark
    accentLight: '#666666',

    // Background Colors
    bgMain: '#E4D5B7',       // Temple Sandstone/Beige
    bgCard: '#FFFFFF',       // Pure white for pills and cards
    bgElevated: '#F2E8D3',
    glassBg: 'rgba(242, 239, 233, 0.9)',

    // Text Colors
    textMain: '#000000',     // Pitch Black text
    textMuted: '#555555',    // Deep Grey for secondary
    textGold: '#8B7355',
    textLight: '#FFFFFF',    // Text on pure black

    // Solid colors
    gold: '#CC9933',         // Pharaonic Gold
    goldHover: '#B3862C',

    // Border Colors
    borderSubtle: 'rgba(0, 0, 0, 0.1)',
    borderGold: 'rgba(0, 0, 0, 1)', // Solid black borders for brutalist

    // Status Colors
    success: '#000000',
    error: '#FF3333',
    warning: '#FF9900',
};

// Dark Mode Colors
export const DARK_COLORS = {
    primary: '#FFFFFF',
    primaryHover: '#CCCCCC',
    primaryGlow: 'rgba(255, 255, 255, 0.2)',

    secondary: '#1A1A1A',
    secondaryGlow: 'rgba(26, 26, 26, 0.5)',

    accent: '#FFFFFF',
    accentLight: '#999999',

    bgMain: '#1A1410',       // Deep Dark Temple Stone
    bgCard: '#241E18',
    bgElevated: '#332A22',
    glassBg: 'rgba(13, 13, 13, 0.9)',

    textMain: '#F2EFE9',     // Cream text on dark bg
    textMuted: '#A3A3A3',
    textGold: '#D3A350',
    textLight: '#000000',

    // Solid colors
    gold: '#D3A350',
    goldHover: '#B88B42',

    borderSubtle: 'rgba(255, 255, 255, 0.1)',
    borderGold: 'rgba(255, 255, 255, 1)',

    success: '#FFFFFF',
    error: '#FF3333',
    warning: '#FF9900',
};

export const FONTS = {
    heavy: Platform.OS === 'ios' ? 'Futura' : 'sans-serif-black',
    medium: Platform.OS === 'ios' ? 'San Francisco' : 'sans-serif-medium',
    heading: 'System',
    body: 'System',
};

export const COMMON_STYLES = {
    brutalistCard: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 16,
    },
    brutalistPill: {
        borderWidth: 1.5,
        borderColor: '#000',
        borderRadius: 30,
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
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,      // For highly rounded modern cards
    full: 9999,
};


