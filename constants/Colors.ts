// constants/Colors.ts

const tintColorLight = '#6366F1'; // Vibrant Indigo
const tintColorDark = '#818CF8';  // Soft Indigo

export const Colors = {
  light: {
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9', // Slate 100
    tint: tintColorLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    primary: '#6366F1',
    primaryGradient: ['#6366F1', '#4F46E5'] as const, // Indigo Gradient
    secondary: '#EC4899', // Pink 500
    success: '#10B981', // Emerald 500
    danger: '#F43F5E', // Rose 500
    warning: '#F59E0B', // Amber 500
    info: '#3B82F6', // Blue 500
    border: '#E2E8F0', // Slate 200
  },
  dark: {
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    surfaceSecondary: '#334155', // Slate 700
    tint: tintColorDark,
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
    primary: '#818CF8',
    primaryGradient: ['#818CF8', '#6366F1'] as const,
    secondary: '#F472B6', // Pink 400
    success: '#34D399', // Emerald 400
    danger: '#FB7185', // Rose 400
    warning: '#FBBF24', // Amber 400
    info: '#60A5FA', // Blue 400
    border: '#334155', // Slate 700
  },
};