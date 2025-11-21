import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const palette = {
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  white: '#FFFFFF',
  black: '#000000',
  
  // Escala de Cinzas
  gray100: '#f8f9fa',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray800: '#343a40',
  gray900: '#212529',
};

export const THEME = {
  light: {
    background: '#f4f6f8',
    card: '#FFFFFF',
    text: '#212529',
    subText: '#6c757d',
    border: '#dee2e6',
    inputBg: '#FFFFFF',
    primary: palette.primary,
    tint: palette.primary,
    ...palette
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#E0E0E0',
    subText: '#A0A0A0',
    border: '#333333',
    inputBg: '#2C2C2C',
    primary: '#4dabf7', 
    tint: '#ffffff',
    ...palette
  }
};

// --- CORREÇÃO CRÍTICA: Exportar COLORS como a paleta Light por defeito ---
// Isto impede que ficheiros antigos que importam { COLORS } quebrem.
export const COLORS = THEME.light;

export const SIZING = {
  base: 8,
  font: 14,
  padding: 16,
  margin: 16,
  radius: 12,
};

export const FONTS = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 18, fontWeight: 'bold' },
  body: { fontSize: 16 },
  small: { fontSize: 12 },
};

export const SIZES = { width, height };