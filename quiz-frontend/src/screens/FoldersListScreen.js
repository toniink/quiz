import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, Platform, 
  TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput,
  KeyboardAvoidingView // Importante para o teclado não cobrir o modal no Android
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllFolders, deleteFoldersBulk, createFolder, getFolderDetails } from '../services/api';
import { COLORS, SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';

export default function FoldersListScreen({ navigation }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Seleção Múltipla
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal de Criação (Universal)
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await getAllFolders();
      setFolders(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchFolders);
    return unsubscribe;
  }, [navigation]);

  // --- CRIAÇÃO DE PASTA (MODAL PARA TODOS) ---
  const handleCreatePress = () => {
    setNewFolderName(''); 
    setCreateModalVisible(true); // Abre o modal no Android e Web
  };

  const confirmCreateFolder = async () => {
      if (!newFolderName.trim()) {
          Alert.alert("Atenção", "O nome da pasta não pode ser vazio.");
          return;
      }
      
      try {
          await createFolder(newFolderName);
          setCreateModalVisible(false);
          fetchFolders(); 
      } catch (error) {
          Alert.alert("Erro", "Falha ao criar pasta");
      }
  };

  // --- SELEÇÃO ---
  const toggleSelection = (id) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const toggleMode = () => {
      setSelectionMode(!selectionMode);
      setSelectedIds([]);
  };

  // --- DELEÇÃO EM MASSA ---
  const handleBulkDelete = () => {
      if (selectedIds.length === 0) return;
      
      const confirmText = `Apagar ${selectedIds.length} pastas? \nOs quizzes dentro delas NÃO serão apagados do sistema.`;
      
      const execute = async () => {
          try {
              setLoading(true);
              await deleteFoldersBulk(selectedIds);
              setSelectionMode(false);
              setSelectedIds([]);
              fetchFolders();
          } catch (error) {
              Alert.alert("Erro", "Falha ao deletar pastas");
          } finally {
              setLoading(false);
          }
      };

      // Lógica específica para confirmação (Alert nativo vs Window.confirm)
      if (Platform.OS === 'web') {
          if (window.confirm(confirmText)) execute();
      } else {
          Alert.alert("Confirmar Exclusão", confirmText, [
              { text: "Cancelar", style: "cancel" }, 
              { text: "Apagar", style: 'destructive', onPress: execute }
          ]);
      }
  };

  // --- JOGAR PASTA DIRETO ---
  const handlePlayFolder = async (folderId) => {
      try {
          setLoading(true);
          const response = await getFolderDetails(folderId);
          const quizzes = response.data.quizzes;
          
          if (quizzes.length === 0) {
              Alert.alert("Vazia", "Esta pasta não tem quizzes.");
              return;
          }
          const quizIds = quizzes.map(q => q.id);
          navigation.navigate('PlayQuiz', { quizIds });
      } catch (error) {
          Alert.alert("Erro", "Não foi possível abrir a pasta.");
      } finally {
          setLoading(false);
      }
  };

  const renderItem = ({ item }) => {
      const isSelected = selectedIds.includes(item.id);

      return (
          <TouchableOpacity 
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => {
                if (selectionMode) toggleSelection(item.id);
                else navigation.navigate('Folder', { folderId: item.id });
            }}
            activeOpacity={0.7}
          >
              <View style={styles.cardContent}>
                  {selectionMode && (
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Text style={{color:'white', fontWeight: 'bold'}}>✓</Text>}
                    </View>
                  )}
                  <Text style={styles.folderName}>📂 {item.name}</Text>
              </View>

              {!selectionMode && (
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={() => handlePlayFolder(item.id)}
                  >
                      <Text style={styles.playButtonText}>▶ Jogar</Text>
                  </TouchableOpacity>
              )}
          </TouchableOpacity>
      );
  };

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <Container style={styles.container}>
        <View style={styles.header}>
            <StyledButton title="+ Nova Pasta" onPress={handleCreatePress} />
            <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.manageText}>{selectionMode ? "Cancelar" : "Selecionar Vários"}</Text>
            </TouchableOpacity>
        </View>

        {selectionMode && (
            <View style={styles.bulkHeader}>
                <Text style={{color: 'white'}}>{selectedIds.length} selecionados</Text>
                {selectedIds.length > 0 && (
                    <TouchableOpacity onPress={handleBulkDelete}>
                        <Text style={{color: '#ff6b6b', fontWeight: 'bold'}}>APAGAR SELECIONADOS</Text>
                    </TouchableOpacity>
                )}
            </View>
        )}

        {loading && <ActivityIndicator size="large" color={COLORS.primary} />}

        <FlatList 
            data={folders}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{paddingBottom: 20}}
            ListEmptyComponent={<Text style={styles.empty}>Nenhuma pasta criada.</Text>}
        />

        {/* --- MODAL DE CRIAR PASTA (UNIVERSAL) --- */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={createModalVisible}
            onRequestClose={() => setCreateModalVisible(false)}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Nova Pasta</Text>
                    
                    <TextInput 
                        style={styles.modalInput}
                        placeholder="Nome da pasta (ex: História)"
                        value={newFolderName}
                        onChangeText={setNewFolderName}
                        autoFocus={true} // Foca automaticamente ao abrir
                    />
                    
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={[styles.modalButton, {backgroundColor: '#ccc'}]}
                            onPress={() => setCreateModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.modalButton, {backgroundColor: COLORS.primary}]}
                            onPress={confirmCreateFolder}
                        >
                            <Text style={[styles.modalButtonText, {color: 'white'}]}>Criar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>

    </Container>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.lightGray, padding: SIZING.padding },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    manageText: { color: COLORS.primary, fontWeight: 'bold' },
    
    bulkHeader: { 
        backgroundColor: '#333', padding: 10, borderRadius: 8, marginBottom: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },

    card: {
        backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 10,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        ...Platform.select({ 
            web: { boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
            default: { elevation: 2 }
        })
    },
    cardSelected: {
        backgroundColor: '#e3f2fd', borderColor: COLORS.primary, borderWidth: 1
    },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    folderName: { fontSize: 18, fontWeight: '600', color: '#333', marginLeft: 10 },
    
    checkbox: {
        width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ccc', marginRight: 10,
        alignItems: 'center', justifyContent: 'center'
    },
    checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

    playButton: {
        backgroundColor: '#e9ecef', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20
    },
    playButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },
    
    empty: { textAlign: 'center', color: '#999', marginTop: 50 },

    // --- ESTILOS DO MODAL ---
    modalOverlay: {
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white', 
        padding: 25, 
        borderRadius: 15, 
        width: '85%', 
        maxWidth: 400,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
    modalInput: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    modalButton: {
        flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center'
    },
    modalButtonText: { fontWeight: 'bold', fontSize: 16 }
});