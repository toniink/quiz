// src/components/StyledInput.js
import React from 'react';
import { TextInput, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZING, FONTS } from '../constants/theme';

export default function StyledInput({ label, value, onChangeText, ...props }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={COLORS.secondary}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZING.margin / 2,
  },
  label: {
    ...FONTS.body,
    color: COLORS.text,
    marginBottom: SIZING.base,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZING.radius,
    padding: SIZING.padding / 1.5,
    ...FONTS.body,
    color: COLORS.text,
  },
});