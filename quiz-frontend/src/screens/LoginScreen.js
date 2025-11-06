// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
// Importe do NOVO local (isso quebra o ciclo)
import { useAuth } from '../context/AuthContext'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Pega a função de login do Contexto
  const { login } = useAuth(); // Esta linha (11) agora vai funcionar

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha e-mail e senha.');
      return;
    }
    try {
      // Chama a função 'login' do contexto
      await login(email, password);
      
      // O App.js vai trocar a tela sozinho
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      Alert.alert('Erro no Login', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Entrar" onPress={handleLogin} />
      <Button
        title="Não tem conta? Cadastre-se"
        onPress={() => navigation.navigate('Register')}
        color="#888"
      />
    </View>
  );
}

// Seus estilos
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 10, borderRadius: 5 },
});