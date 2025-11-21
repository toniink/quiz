import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, Alert, 
  Platform, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFolderDetails, deleteQuiz, removeQuizzesFromFolder } from '../services/api';
import { useTheme } from '../context/ThemeContext'; // Hook do Tema
import { SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';
import ConfirmationModal from '../components/ConfirmationModal';

export default function FolderScreen({ route }) {
  const { colors } = useTheme(); // Hook do Tema
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
          <TouchableOpacity 
            testID="btn-folder-manage" // ID para Selenium
            onPress={toggleSelectionMode} 
            style={{ marginRight: 15 }}
          >
            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
              {selectionMode ? "Cancelar" : "Gerenciar"}
            </Text>
          </TouchableOpacity>
        )
      });
    }
  }, [folder, navigation, selectionMode, colors]);

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

    // Lógica para Web e Mobile
    const executeRemove = async () => {
        try {
            setLoading(true);
            await removeQuizzesFromFolder(folderId, selectedQuizIds);
            setSelectionMode(false);
            setSelectedQuizIds([]);
            fetchData();
            setTimeout(() => Alert.alert("Sucesso", "Quizzes removidos da pasta."), 100);
        } catch (error) {
            Alert.alert("Erro", "Falha ao remover quizzes.");
        } finally {
            setLoading(false);
        }
    };

    if (Platform.OS === 'web') {
        if (window.confirm(`Remover ${selectedQuizIds.length} quizzes desta pasta?`)) executeRemove();
    } else {
        Alert.alert("Remover da Pasta", `Remover ${selectedQuizIds.length} quizzes?`, [
            { text: "Cancelar", style: "cancel" },
            { text: "Remover", style: 'destructive', onPress: executeRemove }
        ]);
    }
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
        testID={`quiz-item-${item.id}`} // ID para Selenium (pode usar ID ou Título)
        style={[
          styles.card, 
          { backgroundColor: colors.card, borderColor: colors.border },
          isSelected && { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.inputBg }
        ]}
        onPress={() => {
          // Se estiver em modo de seleção, clica para marcar. Senão, não faz nada no card inteiro.
          if (selectionMode) toggleQuizSelection(item.id);
        }}
        activeOpacity={selectionMode ? 0.7 : 1}
      >
        <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            
            {/* CHECKBOX VISUAL */}
            {selectionMode && (
                <View style={[
                    styles.checkbox, 
                    { borderColor: colors.subText },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}>
                    {isSelected && <Text style={{color: 'white', fontWeight: 'bold'}}>✓</Text>}
                </View>
            )}
        </View>

        {/* SUBTITULO / INFO DO QUIZ */}
        <View style={{marginBottom: 10}}>
             <Text style={{color: colors.subText, fontSize: 12}}>
                {item.timePerQuestion > 0 ? `⏱️ ${item.timePerQuestion}s` : 'Sem tempo limite'}
             </Text>
        </View>

        {/* Botões só aparecem se NÃO estiver selecionando */}
        {!selectionMode && (
          <View style={styles.buttonRow}>
            <StyledButton title="Jogar" onPress={() => navigation.navigate('PlayQuiz', { quizId: item.id })} color="primary"/>
            <StyledButton title="Editar" color="secondary" onPress={() => navigation.navigate('CreateEditQuiz', { quizId: item.id })} />
            <StyledButton title="Deletar" color="danger" onPress={() => openDeleteModal(item)} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <Container style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && <ActivityIndicator size="large" color={colors.primary} />}
      
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
            <Text style={[styles.emptyText, {color: colors.subText}]}>Esta pasta está vazia.</Text>
        }
        ListHeaderComponent={
            <View style={styles.headerContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {selectionMode 
                        ? `${selectedQuizIds.length} selecionados` 
                        : `Conteúdo da Pasta`
                    }
                </Text>
                
                {/* BOTÃO JOGAR TODOS (Só aparece se não estiver em seleção e tiver quizzes) */}
                {!selectionMode && quizzes.length > 0 && (
                    <StyledButton 
                        testID="btn-play-all" // ID para Selenium
                        title="▶ Jogar Todos em Sequência" 
                        color="success"
                        onPress={handlePlayAll} 
                        style={{marginBottom: 10}}
                    />
                )}
                
                {selectionMode && (
                    <Text style={[styles.helpText, {color: colors.subText}]}>Toque nos itens para selecionar</Text>
                )}
            </View>
        }
      />

      {/* BARRA INFERIOR (Bulk Action) */}
      {selectionMode && selectedQuizIds.length > 0 && (
          <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
              <Text style={{color: colors.text, fontWeight: 'bold'}}>
                  {selectedQuizIds.length} itens selecionados
              </Text>
              <TouchableOpacity 
                  testID="btn-remove-from-folder" // ID para Selenium
                  style={[styles.removeButton, {backgroundColor: colors.danger}]}
                  onPress={handleBulkRemove}
              >
                  <Text style={{color: 'white', fontWeight: 'bold'}}>Remover da Pasta</Text>
              </TouchableOpacity>
          </View>
      )}

      {/* Modal de Deleção Unitária */}
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
    padding: SIZING.padding,
  },
  headerContainer: {
      marginBottom: SIZING.margin
  },
  title: {
    ...FONTS.h2,
    marginBottom: 10,
  },
  helpText: {
      fontSize: 14,
      fontStyle: 'italic',
      marginBottom: 10
  },
  card: {
    borderRadius: SIZING.radius,
    padding: SIZING.padding,
    marginBottom: SIZING.margin,
    borderWidth: 1,
    ...Platform.select({
        web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        default: { elevation: 2 }
    })
  },
  cardContent: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      marginBottom: 5
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZING.base,
    marginTop: 5
  },
  emptyText: {
    ...FONTS.body,
    textAlign: 'center',
    marginTop: 50,
  },
  checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10
  },
  bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      ...Platform.select({
        web: { boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' },
        default: { elevation: 10 }
      })
  },
  removeButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8
  }
});