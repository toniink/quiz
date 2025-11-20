import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, Alert, 
  Platform, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFolderDetails, deleteQuiz, removeQuizzesFromFolder } from '../services/api';
import { COLORS, SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';
import ConfirmationModal from '../components/ConfirmationModal';

export default function FolderScreen({ route }) {
  const { folderId } = route.params;
  const navigation = useNavigation();

  const [folder, setFolder] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Seleção (Bulk Action)
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedQuizIds, setSelectedQuizIds] = useState([]);

  // Estados de Modal (Deleção Individual)
  const [modalVisible, setModalVisible] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null); 

  // Configura o Header com botão "Gerenciar"
  useEffect(() => {
    if (folder) {
      navigation.setOptions({ 
        title: folder.name,
        headerRight: () => (
          <TouchableOpacity onPress={toggleSelectionMode} style={{ marginRight: 15 }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 16 }}>
              {selectionMode ? "Cancelar" : "Gerenciar"}
            </Text>
          </TouchableOpacity>
        )
      });
    }
  }, [folder, navigation, selectionMode]);

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

  // --- LÓGICA DE SELEÇÃO MÚLTIPLA ---
  
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedQuizIds([]); // Limpa seleção ao sair/entrar
  };

  const toggleQuizSelection = (id) => {
    if (selectedQuizIds.includes(id)) {
      setSelectedQuizIds(prev => prev.filter(qId => qId !== id));
    } else {
      setSelectedQuizIds(prev => [...prev, id]);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedQuizIds.length === 0) return;

    Alert.alert(
      "Remover da Pasta",
      `Deseja remover ${selectedQuizIds.length} quizzes desta pasta? \n\nEles NÃO serão apagados do sistema, apenas desta pasta.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Chama a API para remover a associação
              await removeQuizzesFromFolder(folderId, selectedQuizIds);
              
              setSelectionMode(false);
              setSelectedQuizIds([]);
              fetchData(); // Recarrega a lista
              Alert.alert("Sucesso", "Quizzes removidos da pasta.");
            } catch (error) {
              Alert.alert("Erro", "Falha ao remover quizzes.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // --- LÓGICA NORMAL (Play All, Deletar Unitário) ---

  const handlePlayAll = () => {
      if (quizzes.length === 0) {
          Alert.alert("Vazio", "Não há quizzes para jogar.");
          return;
      }
      const quizIds = quizzes.map(q => q.id);
      navigation.navigate('PlayQuiz', { quizIds: quizIds });
  };

  const openDeleteModal = (quiz) => {
    setQuizToDelete(quiz);
    setModalVisible(true);
  };
  const closeDeleteModal = () => {
    setModalVisible(false);
    setQuizToDelete(null);
  };
  
  // Deleta o quiz do sistema (Ação Destrutiva)
  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    try {
      await deleteQuiz(quizToDelete.id);
      closeDeleteModal();
      fetchData(); 
    } catch (error) {
      Alert.alert("Erro", "Não foi possível deletar o quiz.");
      closeDeleteModal();
    }
  };

  const renderQuizItem = ({ item }) => {
    const isSelected = selectedQuizIds.includes(item.id);

    return (
      <TouchableOpacity 
        style={[
          styles.card, 
          isSelected && styles.cardSelected
        ]}
        onPress={() => {
          if (selectionMode) {
            toggleQuizSelection(item.id);
          } else {
             // Se não estiver em modo seleção, clique no card não faz nada (ou poderia abrir detalhes)
          }
        }}
        activeOpacity={selectionMode ? 0.7 : 1}
      >
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            
            {/* CHECKBOX VISUAL (Só aparece no modo seleção) */}
            {selectionMode && (
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={{color: 'white', fontWeight: 'bold'}}>✓</Text>}
                </View>
            )}
        </View>

        {/* Botões só aparecem se NÃO estiver selecionando */}
        {!selectionMode && (
          <View style={styles.buttonRow}>
            <StyledButton title="Jogar" onPress={() => navigation.navigate('PlayQuiz', { quizId: item.id })} />
            <StyledButton title="Editar" color="secondary" onPress={() => navigation.navigate('CreateEditQuiz', { quizId: item.id })} />
            <StyledButton title="Deletar" color="danger" onPress={() => openDeleteModal(item)} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <Container style={styles.container}>
      {loading && <ActivityIndicator size="large" color={COLORS.primary} />}
      
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Esta pasta está vazia.</Text>}
        ListHeaderComponent={
            <View style={styles.headerContainer}>
                <Text style={styles.title}>
                    {selectionMode 
                        ? `${selectedQuizIds.length} selecionado(s)` 
                        : `Conteúdo da Pasta`
                    }
                </Text>
                
                {/* Esconde o botão Jogar Todos durante a seleção */}
                {!selectionMode && quizzes.length > 0 && (
                    <StyledButton 
                        title="▶ Jogar Todos em Sequência" 
                        color="success"
                        onPress={handlePlayAll} 
                    />
                )}
                
                {selectionMode && (
                    <Text style={styles.helpText}>Toque nos itens para selecionar</Text>
                )}
            </View>
        }
      />

      {/* BARRA INFERIOR (Bulk Action) */}
      {selectionMode && selectedQuizIds.length > 0 && (
          <View style={styles.bottomBar}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>
                  {selectedQuizIds.length} itens
              </Text>
              <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={handleBulkRemove}
              >
                  <Text style={{color: 'white', fontWeight: 'bold'}}>Remover da Pasta</Text>
              </TouchableOpacity>
          </View>
      )}

      {/* Modal de Deleção Unitária (Apagar do Sistema) */}
      {quizToDelete && (
        <ConfirmationModal
          visible={modalVisible}
          title="Confirmar Deleção"
          message={`Tem certeza que deseja deletar "${quizToDelete.title}" permanentemente do sistema?`}
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
  headerContainer: {
      marginBottom: SIZING.margin
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
    marginBottom: 5,
  },
  helpText: {
      fontSize: 14,
      color: COLORS.secondary,
      fontStyle: 'italic',
      marginBottom: 10
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius,
    padding: SIZING.padding,
    marginBottom: SIZING.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
        web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
        default: { elevation: 3 }
    })
  },
  cardSelected: {
      borderColor: COLORS.primary, 
      borderWidth: 2, 
      backgroundColor: '#f0f8ff'
  },
  cardTitle: {
    ...FONTS.h2,
    marginBottom: SIZING.margin,
    flex: 1
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
  },
  checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: COLORS.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10
  },
  checkboxSelected: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary
  },
  bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#333',
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#ccc'
  },
  removeButton: {
      backgroundColor: COLORS.danger,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 5
  }
});