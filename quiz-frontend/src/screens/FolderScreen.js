import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFolderDetails, deleteQuiz } from '../services/api';
import { COLORS, SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';
import ConfirmationModal from '../components/ConfirmationModal';

export default function FolderScreen({ route }) {
  const { folderId } = route.params;
  const navigation = useNavigation();

  const [folder, setFolder] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do Modal de Deleção
  const [modalVisible, setModalVisible] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // Define o título da tela dinamicamente
  useEffect(() => {
    if (folder) {
      navigation.setOptions({ title: folder.name });
    }
  }, [folder, navigation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFolderDetails(folderId);
      setFolder(response.data.folder);
      setQuizzes(response.data.quizzes);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar a pasta.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [folderId]);

  // Funções do Modal (copiadas do Dashboard)
  const openDeleteModal = (quiz) => {
    setQuizToDelete(quiz);
    setModalVisible(true);
  };
  const closeDeleteModal = () => {
    setModalVisible(false);
    setQuizToDelete(null);
  };
  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    try {
      await deleteQuiz(quizToDelete.id);
      closeDeleteModal();
      fetchData(); // Recarrega os quizzes
    } catch (error) {
      Alert.alert("Erro", "Não foi possível deletar o quiz.");
      closeDeleteModal();
    }
  };

  // Renderiza um item de quiz (copiado do Dashboard)
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

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <Container style={styles.container}>
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Esta pasta está vazia.</Text>}
        ListHeaderComponent={
          <Text style={styles.title}>Quizzes em "{folder?.name}"</Text>
        }
      />

      {/* Modal de Deleção */}
      {quizToDelete && (
        <ConfirmationModal
          visible={modalVisible}
          title="Confirmar Deleção"
          message={`Tem certeza que deseja deletar "${quizToDelete.title}"?`}
          onCancel={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          confirmText="Deletar"
          confirmColor="danger"
        />
      )}
    </Container>
  );
}

// Estilos (similares aos do Dashboard)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: SIZING.padding,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
    marginBottom: SIZING.margin,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius,
    padding: SIZING.padding,
    marginBottom: SIZING.margin,
    // ... (estilos de sombra)
  },
  cardTitle: {
    ...FONTS.h2,
    marginBottom: SIZING.margin,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZING.base,
  },
  emptyText: {
    ...FONTS.body,
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.secondary,
  }
});