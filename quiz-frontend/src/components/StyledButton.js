import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZING, FONTS } from '../constants/theme';

// Adicionei '...props' no final para capturar o testID
export default function StyledButton({ title, onPress, color = 'primary', disabled, style, loading, ...props }) {
  const { colors } = useTheme();

  const backgroundColor = colors[color] || colors.primary;

  const buttonStyle = [
    styles.button,
    { backgroundColor: disabled ? colors.subText : backgroundColor },
    Platform.select({
        web: { boxShadow: disabled ? 'none' : '0 2px 5px rgba(0,0,0,0.2)' },
        default: { elevation: disabled ? 0 : 3 }
    }),
    style,
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props} // <--- ISTO É O SEGREDO: Repassa o testID para o elemento real
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.text, { color: colors.white }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: SIZING.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  text: {
    ...FONTS.body,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5
  },
});