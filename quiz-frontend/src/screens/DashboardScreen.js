// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView} from 'react-native-safe-area-context';
import { useAuth} from '../context/AuthContext';
import { getDashboardData, deleteQuiz } from '../services/api';
import theme, { COLORS, SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';
import ConfirmationModal from '../components/ConfirmationModal';

// --- ATUALIZAÇÃO NECESSÁRIA no api.js ---
/* Seu 'src/services/api.js' precisa ser atualizado para
  enviar o Token de autenticação em todas as requisições.
  Use "Axios Interceptors" para isso.
*/

export default function DashboardScreen({ navigation }) {
  const { logout } = useAuth(); //Pega o logout
  const [data, setData] = useState({ folders: [], quizzes: [] });
  const [loading, setLoading] = useState(false);

  //estados para controlar o modal
  const [modalVisible, setModalVIsible] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);


  const fetchData = async () => {
    try {
      setLoading(true);
    
      const response = await getDashboardData(); 
      setData(response.data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os quizzes.");
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

  //funções para controlar o fluxo de deleção
    const openDeleteModal = (quiz) => {
      setQuizToDelete(quiz);
      setModalVIsible(true);
    };

    const closeDeleteModal = () => {
      setModalVIsible(false);
      setQuizToDelete(null);
    };

    const handleDeleteConfirm = async () => {
      if (!quizToDelete) return;

      try{
        await deleteQuiz(quizToDelete.id);
        Alert.alert("Sucesso!", `"${quizToDelete.title}" foi deletado.`);
        closeDeleteModal();
        fetchData();
      } catch (error){
        Alert.alert("Erro", "Não foi possível deletar o quiz.");
        closeDeleteModal();
      }
    };

  const renderQuizItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.buttonRow}>
        <StyledButton title="Jogar" onPress={() => navigation.navigate('PlayQuiz', { quizId: item.id })} />
        <StyledButton 
          title="Editar" 
          color="secondary" 
          onPress={() => navigation.navigate('CreateEditQuiz', { quizId: item.id })} 
        />
        <StyledButton 
          title="Deletar" 
          color="danger" 
          onPress={() => openDeleteModal(item)} 
        />
      </View>
    </View>
  );

  //agora permite scrollar a tela
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;


  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Quizzes</Text>
        <StyledButton title="Sair" color="danger" onPress={logout} />
      </View>

      <StyledButton 
        title="Criar Novo Quiz"
        onPress={() => navigation.navigate('CreateEditQuiz')}
      />
      
      <Text style={styles.sectionTitle}>Pastas</Text>
      <FlatList 
        data={data.folders}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      <Text style={styles.sectionTitle}>Quizzes (Sem Pasta)</Text>
      <FlatList
        data={data.quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {quizToDelete && ( // Só renderiza se houver um quiz selecionado
        <ConfirmationModal
          visible={modalVisible}
          title="Confirmar Deleção"
          message={`Tem certeza que deseja deletar o quiz "${quizToDelete.title}"? Esta ação não pode ser desfeita.`}
          onCancel={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          confirmText="Deletar"
          confirmColor="danger"
        />
      )}

    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: SIZING.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZING.margin,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
  },
  sectionTitle: {
    ...FONTS.h2,
    color: COLORS.darkGray,
    marginTop: SIZING.margin,
    marginBottom: SIZING.base,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius,
    padding: SIZING.padding,
    marginBottom: SIZING.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Sombra (leve)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    ...FONTS.h2,
    marginBottom: SIZING.margin,
  },
  buttonRow: {
    // Isso é responsivo! 'wrap' quebra a linha se não couber
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZING.base, // 'gap' é ótimo para espaçamento
  },
});