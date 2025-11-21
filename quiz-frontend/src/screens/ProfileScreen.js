import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, ScrollView 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateProfile, deleteAccount } from '../services/api';
import { SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ProfileScreen({ navigation }) {
  const { user, updateUserLocal, logout } = useAuth();
  const { colors } = useTheme();

  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal de Exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleUpdate = async () => {
      if (!username.trim()) {
          Alert.alert("Erro", "O nome de utilizador não pode estar vazio.");
          return;
      }
      setLoading(true);
      try {
          // Envia senha apenas se o utilizador digitou algo
          await updateProfile({ 
              username, 
              password: password.length > 0 ? password : undefined 
          });
          
          await updateUserLocal(username);
          Alert.alert("Sucesso", "Perfil atualizado!");
          setPassword(''); // Limpa o campo de senha
      } catch (error) {
          Alert.alert("Erro", "Falha ao atualizar perfil.");
      } finally {
          setLoading(false);
      }
  };

  const handleDeleteAccount = async () => {
      try {
          await deleteAccount();
          // Logout força a ida para a tela de Login
          await logout(); 
          Alert.alert("Conta Excluída", "Sua conta e dados foram apagados.");
      } catch (error) {
          Alert.alert("Erro", "Não foi possível excluir a conta.");
      }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.subText }]}>E-mail (Não alterável)</Text>
            <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.subText, borderColor: colors.border }]}
                value={user?.email}
                editable={false}
            />

            <Text style={[styles.label, { color: colors.text }]}>Nome de Utilizador</Text>
            <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                value={username}
                onChangeText={setUsername}
            />

            <Text style={[styles.label, { color: colors.text }]}>Nova Senha (Opcional)</Text>
            <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Deixe em branco para manter a atual"
                placeholderTextColor={colors.subText}
                secureTextEntry
            />

            <StyledButton 
                title="Atualizar Perfil" 
                onPress={handleUpdate} 
                loading={loading}
                style={{ marginTop: 10 }}
            />
        </View>

        <View style={{ marginTop: 30, borderTopWidth: 1, borderColor: colors.border, paddingTop: 20 }}>
            <Text style={[styles.dangerTitle, { color: colors.text }]}>Zona de Perigo</Text>
            <Text style={{ color: colors.subText, marginBottom: 15 }}>
                A exclusão da conta é irreversível. Todos os seus quizzes e pastas serão apagados.
            </Text>
            
            <StyledButton 
                title="EXCLUIR MINHA CONTA" 
                color="danger"
                onPress={() => setDeleteModalVisible(true)}
            />
        </View>

        <ConfirmationModal
            visible={deleteModalVisible}
            title="Excluir Conta?"
            message="Tem certeza absoluta? Esta ação não pode ser desfeita e você perderá todos os seus quizzes."
            confirmText="Sim, Excluir"
            confirmColor="danger"
            onCancel={() => setDeleteModalVisible(false)}
            onConfirm={handleDeleteAccount}
        />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: SIZING.padding },
    card: {
        borderRadius: 12, padding: 20, borderWidth: 1
    },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
    dangerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 }
});