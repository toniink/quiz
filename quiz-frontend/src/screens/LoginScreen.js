// src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { loginUser } from '../services/api';
import { useAuth } from '../../App'; //

// 'navigation' é injetado pelo React Navigation
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setToken } = useAuth();
  const { login } = useAuth(); // Pega a função de login do Contexto

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha e-mail e senha.');
      return;
    }
    try {
        const response = await loginUser({ email, password });
        await login(response.data.token); // Chama a função do contexto
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
        onPress={() => navigation.navigate('Register')} // Navega para a tela de Registro
        color="#888"
      />
    </View>
  );
}

// Estilos básicos (você pode mover para src/styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});