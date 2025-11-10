// src/components/ConfirmationModal.js
import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZING, FONTS } from '../constants/theme';
import StyledButton from './StyledButton';

export default function ConfirmationModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  cancelText = "Cancelar",
  confirmText = "Confirmar",
  confirmColor = "primary", // Pode ser 'primary' ou 'danger'
}) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel} // Permite fechar com o botão "voltar" no Android
    >
      {/* Fundo Escuro (Overlay) */}
      <View style={styles.centeredView}>
        {/* Caixa Branca do Modal */}
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <View style={styles.buttonRow}>
            {/* Botão Cancelar */}
            <StyledButton
              title={cancelText}
              color="secondary"
              onPress={onCancel}
            />
            {/* Botão Confirmar */}
            <StyledButton
              title={confirmText}
              color={confirmColor}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay semi-transparente
  },
  modalView: {
    margin: SIZING.margin,
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius * 2,
    padding: SIZING.padding * 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Responsivo
    maxWidth: 400, // Limite para web
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZING.margin,
    textAlign: 'center',
  },
  modalMessage: {
    ...FONTS.body,
    color: COLORS.secondary,
    marginBottom: SIZING.margin * 1.5,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Espaça os botões
    width: '100%',
  },
});