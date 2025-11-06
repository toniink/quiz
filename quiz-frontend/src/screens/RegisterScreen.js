// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { registerUser } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }
    try {
      await registerUser({ username, email, password });
      Alert.alert('Sucesso!', 'Usuário cadastrado. Faça o login.');
      navigation.goBack(); // Volta para a tela de Login
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao cadastrar';
      Alert.alert('Erro no Cadastro', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome de Usuário"
        value={username}
        onChangeText={setUsername}
      />
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
      <Button title="Cadastrar" onPress={handleRegister} />
      <Button
        title="Já tenho conta (Login)"
        onPress={() => navigation.goBack()}
        color="#888"
      />
    </View>
  );
}

// Reutilizando os estilos (idealmente, importe de um arquivo global)
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 10, borderRadius: 5 },
});