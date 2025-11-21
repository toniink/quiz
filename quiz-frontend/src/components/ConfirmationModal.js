import React from 'react';
import { Modal, View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Importa o hook do tema
import { SIZING, FONTS } from '../constants/theme';
import StyledButton from './StyledButton';

export default function ConfirmationModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  cancelText = "Cancelar",
  confirmText = "Confirmar",
  confirmColor = "primary",
}) {
  const { colors } = useTheme(); // Obtém as cores dinâmicas (Dark/Light)

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Fundo Escuro (Overlay) */}
      <View style={styles.centeredView}>
        
        {/* Caixa do Modal (Estilizada dinamicamente) */}
        <View style={[
            styles.modalView, 
            { 
              backgroundColor: colors.card, 
              shadowColor: colors.border 
            }
        ]}>
          
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {title}
          </Text>
          
          <Text style={[styles.modalMessage, { color: colors.subText }]}>
            {message}
          </Text>

          <View style={styles.buttonRow}>
            <StyledButton
              title={cancelText}
              color="secondary"
              onPress={onCancel}
              style={{flex: 1, marginRight: 10}}
            />
            <StyledButton
              title={confirmText}
              color={confirmColor}
              onPress={onConfirm}
              style={{flex: 1}}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Overlay mais escuro para contraste
  },
  modalView: {
    margin: SIZING.margin,
    borderRadius: SIZING.radius * 1.5, // Bordas mais arredondadas
    padding: 25,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    // Sombra adaptativa
    ...Platform.select({
        web: { boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
        default: { elevation: 10 }
    })
  },
  modalTitle: {
    ...FONTS.h2,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20
  },
  modalMessage: {
    ...FONTS.body,
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});