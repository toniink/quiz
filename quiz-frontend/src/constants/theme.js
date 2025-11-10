// src/constants/theme.js
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#007bff', // Azul
  secondary: '#6c757d', // Cinza
  success: '#28a745', // Verde
  danger: '#dc3545', // Vermelho
  warning: '#ffc107', // Amarelo
  
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#f8f9fa',
  darkGray: '#343a40',
  text: '#212529',
  border: '#dee2e6',
};

export const SIZING = {
  base: 8,
  font: 14,
  padding: 16,
  margin: 16,
  radius: 5,
};

export const FONTS = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16 },
};

export const SIZES = {
  width,
  height,
};

// Objeto 'theme' para facilitar a importação
const theme = { COLORS, SIZING, FONTS, SIZES };
export default theme;