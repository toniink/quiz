import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, 
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { registerUser } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { SIZING } from '../constants/theme';
import StyledButton from '../components/StyledButton';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs para navegação via teclado (Enter muda de campo)
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }
    
    setLoading(true);
    try {
      await registerUser({ username, email, password });
      
      // Feedback visual melhorado
      if (Platform.OS === 'web') {
          // No web, o alert pode não bloquear a execução, então usamos setTimeout ou alert nativo
          // mas a navegação é o mais importante
          setTimeout(() => {
             Alert.alert('Sucesso', 'Utilizador registado. Faça o login.', [
                 { text: 'OK', onPress: () => navigation.goBack() }
             ]);
             // Fallback de navegação caso o utilizador feche o alerta
             navigation.goBack();
          }, 100);
      } else {
          Alert.alert('Sucesso', 'Utilizador registado. Faça o login.', [
              { text: 'OK', onPress: () => navigation.goBack() }
          ]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao registar';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Estilo dinâmico para inputs
  const inputStyle = [
      styles.input, 
      { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Crie a sua conta</Text>
                <Text style={[styles.subtitle, { color: colors.subText }]}>É rápido e gratuito.</Text>
            </View>

            {/* CAMPO NOME */}
            <Text style={[styles.label, { color: colors.text }]}>Nome de Utilizador</Text>
            <TextInput
                testID="reg-username"
                style={inputStyle}
                placeholder="Ex: João Silva"
                placeholderTextColor={colors.subText}
                value={username}
                onChangeText={setUsername}
                returnKeyType="next" // Botão "Próximo" no teclado
                onSubmitEditing={() => emailRef.current.focus()} // Pula para o email
                blurOnSubmit={false}
            />
            
            {/* CAMPO EMAIL */}
            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <TextInput
                ref={emailRef}
                testID="reg-email"
                style={inputStyle}
                placeholder="seu@email.com"
                placeholderTextColor={colors.subText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()} // Pula para a senha
                blurOnSubmit={false}
            />
            
            {/* CAMPO SENHA */}
            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
            <TextInput
                ref={passwordRef}
                testID="reg-password"
                style={inputStyle}
                placeholder="Escolha uma senha forte"
                placeholderTextColor={colors.subText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done" // Botão "Concluído" ou "Ir"
                onSubmitEditing={handleRegister} // Submete o formulário
            />

            {/* BOTÃO DE AÇÃO */}
            {/* O testID é passado aqui e o StyledButton atualizado irá aplicá-lo */}
            <StyledButton 
                testID="btn-submit-register" 
                title={loading ? "A registar..." : "REGISTAR"} 
                onPress={handleRegister} 
                loading={loading}
                style={{ marginTop: 10 }}
            />

            <View style={styles.footer}>
                <Text style={{ color: colors.subText }}>Já tem conta? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Fazer Login</Text>
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
      maxWidth: 450,
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
      ...Platform.select({
          web: { boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
          default: { elevation: 5 }
      })
  },
  header: { marginBottom: 25, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 5 },
  subtitle: { fontSize: 14 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 2 },
  input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      fontSize: 16
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
  }
});