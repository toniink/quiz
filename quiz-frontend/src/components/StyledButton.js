// src/components/StyledButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZING, FONTS } from '../constants/theme';

export default function StyledButton({ title, onPress, color = 'primary', disabled }) {
  const buttonStyle = [
    styles.button,
    { backgroundColor: COLORS[color] || COLORS.primary },
    disabled && styles.disabled,
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: SIZING.padding * 0.75,
    borderRadius: SIZING.radius,
    alignItems: 'center',
    marginVertical: SIZING.margin / 2,
  },
  text: {
    color: COLORS.white,
    ...FONTS.body,
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: COLORS.secondary,
    opacity: 0.7,
  },
});