import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, 
  KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext';
import { SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth(); 

  // Refs para controlar o foco ao dar Enter
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha e-mail e senha.');
      return;
    }
    try {
      await login(email, password);
      // O App.js troca a tela automaticamente
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Verifique suas credenciais.';
      Alert.alert('Erro no Login', errorMessage);
    }
  };

  // Estilos Dinâmicos
  const inputStyle = [
      styles.input, 
      { 
          backgroundColor: colors.inputBg, 
          color: colors.text, 
          borderColor: colors.border 
      }
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Bem-vindo!</Text>
                <Text style={[styles.subtitle, { color: colors.subText }]}>Entre para continuar seus estudos.</Text>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <TextInput
                testID="input-email"
                style={inputStyle}
                placeholder="seu@email.com"
                placeholderTextColor={colors.subText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next" // Muda o botão do teclado para "Próximo"
                onSubmitEditing={() => passwordRef.current.focus()} // Pula para senha
                blurOnSubmit={false}
            />

            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
            <TextInput
                ref={passwordRef}
                testID="input-password"
                style={inputStyle}
                placeholder="Sua senha secreta"
                placeholderTextColor={colors.subText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="go" // Muda o botão do teclado para "Ir"
                onSubmitEditing={handleLogin} // Submete ao dar Enter
            />

            <StyledButton 
                testID="btn-submit-login"
                title={isLoading ? "A entrar..." : "ENTRAR"} 
                onPress={handleLogin} 
                loading={isLoading}
                style={{ marginTop: 10 }}
            />

            <View style={styles.footer}>
                <Text style={{ color: colors.subText }}>Não tem conta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Cadastre-se</Text>
                </TouchableOpacity>
            </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { 
      flexGrow: 1, 
      justifyContent: 'center', 
      padding: SIZING.padding 
  },
  card: {
      borderRadius: 16,
      padding: 30,
      width: '100%',
      maxWidth: 450, // Limite de largura para Web
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
      // Sombra
      ...Platform.select({
          web: { boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
          default: { elevation: 5 }
      })
  },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 5 },
  subtitle: { fontSize: 14 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 2 },
  input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      fontSize: 16
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
  }
});