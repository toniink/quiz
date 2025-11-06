// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import api from '../services/api'; // O Axios (precisará de modificação)

// --- ATUALIZAÇÃO NECESSÁRIA no api.js ---
/* Seu 'src/services/api.js' precisa ser atualizado para
  enviar o Token de autenticação em todas as requisições.
  Use "Axios Interceptors" para isso.
*/

export default function DashboardScreen({ navigation }) {
  const [dashboardData, setDashboardData] = useState({ folders: [], quizzes: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // O 'api.js' (com interceptor) vai adicionar o token
      const response = await api.get('/dashboard'); 
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Busca os dados quando a tela é focada
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return <View style={styles.container}><Text>Carregando...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Button 
        title="Criar Novo Quiz"
        onPress={() => navigation.navigate('CreateEditQuiz')} // Teste E2E (Fluxo de Criação)
      />
      
      <Text style={styles.header}>Pastas</Text>
      <FlatList
        data={dashboardData.folders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
          </View>
        )}
      />

      <Text style={styles.header}>Quizzes (Sem Pasta)</Text>
      <FlatList
        data={dashboardData.quizzes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.title}</Text>
            {/* Aqui iriam os botões de Jogar, Editar e Deletar */}
            <Button title="Jogar" onPress={() => navigation.navigate('PlayQuiz', { quizId: item.id })} />
            <Button title="Editar" onPress={() => navigation.navigate('CreateEditQuiz', { quizId: item.id })} />
            {/* "Funcionalidade de Deleção" (Modal seria ideal) */}
            <Button title="Deletar" onPress={() => { /* Chamar API de delete */ }} color="red" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  item: { padding: 10, marginVertical: 5, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd' }
});