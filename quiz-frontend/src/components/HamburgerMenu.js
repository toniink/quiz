import React from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  Switch, Platform, Dimensions 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function HamburgerMenu({ visible, onClose, navigation, logout }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();

  return (
    <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent={true} // Garante que o menu cobre a barra de status no Android
    >
        {/* Fundo escuro que fecha o menu ao clicar */}
        <TouchableOpacity 
            style={styles.menuOverlay} 
            activeOpacity={1} 
            onPress={onClose}
        >
            {/* O Menu Lateral */}
            <TouchableOpacity 
                activeOpacity={1} 
                style={[styles.menuContainer, { backgroundColor: colors.card }]} 
                onPress={(e) => e.stopPropagation()}
            >
                <View style={styles.menuHeader}>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>Menu</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={{fontSize: 24, color: colors.subText}}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.menuDivider} />

                {/* 1. Perfil */}
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => { onClose(); navigation.navigate('Profile'); }}
                >
                    <Text style={{fontSize: 20, marginRight: 10}}>👤</Text>
                    <Text style={[styles.menuItemText, { color: colors.text }]}>Meu Perfil</Text>
                </TouchableOpacity>

                {/* 2. Tema */}
                <View style={styles.menuItem}>
                    <Text style={{fontSize: 20, marginRight: 10}}>{isDarkMode ? '🌙' : '☀️'}</Text>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={[styles.menuItemText, { color: colors.text }]}>
                            {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                        </Text>
                        <Switch 
                            value={isDarkMode} 
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#767577", true: colors.primary }}
                            thumbColor={"#f4f3f4"}
                        />
                    </View>
                </View>

                {/* 3. Ajuda */}
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => { onClose(); navigation.navigate('Help'); }}
                >
                    <Text style={{fontSize: 20, marginRight: 10}}>❓</Text>
                    <Text style={[styles.menuItemText, { color: colors.text }]}>Ajuda</Text>
                </TouchableOpacity>

                <View style={[styles.menuDivider, { marginTop: 'auto' }]} />

                {/* 4. Sair */}
                <TouchableOpacity 
                    style={[styles.menuItem, { marginBottom: Platform.OS === 'android' ? 40 : 20 }]}
                    onPress={() => { onClose(); logout(); }}
                >
                    <Text style={{fontSize: 20, marginRight: 10}}>🚪</Text>
                    <Text style={[styles.menuItemText, { color: colors.danger, fontWeight: 'bold' }]}>Sair</Text>
                </TouchableOpacity>
                
            </TouchableOpacity>
        </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-start',
  },
  menuContainer: { 
      width: '75%', 
      maxWidth: 300, 
      height: '100%', 
      padding: 25, 
      paddingTop: Platform.OS === 'android' ? 50 : 60,
      ...Platform.select({ 
          web: { boxShadow: '4px 0 15px rgba(0,0,0,0.2)', height: '100vh' }, 
          default: { elevation: 10 } 
      }) 
  },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  menuTitle: { fontSize: 24, fontWeight: 'bold' },
  menuDivider: { height: 1, backgroundColor: 'rgba(150,150,150,0.2)', marginVertical: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  menuItemText: { fontSize: 16, fontWeight: '600' }
});