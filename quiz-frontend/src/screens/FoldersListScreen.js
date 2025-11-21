import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, Platform, 
  TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, 
  KeyboardAvoidingView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllFolders, deleteFoldersBulk, createFolder, getFolderDetails } from '../services/api';
import { useTheme } from '../context/ThemeContext'; // Hook do Tema
import { SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';

export default function FoldersListScreen({ navigation }) {
  const { colors } = useTheme(); // Cores dinâmicas (Dark/Light)
  
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Seleção (Bulk Action)
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Estados do Modal de Criação
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

  // --- LÓGICA DE CRIAÇÃO (MODAL) ---
  const handleCreatePress = () => {
    setNewFolderName(''); 
    setCreateModalVisible(true);
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

  // --- LÓGICA DE SELEÇÃO ---
  const toggleSelection = (id) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const toggleMode = () => {
      setSelectionMode(!selectionMode);
      setSelectedIds([]);
  };

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

      if (Platform.OS === 'web') {
          if (window.confirm(confirmText)) execute();
      } else {
          Alert.alert("Confirmar Exclusão", confirmText, [
              { text: "Cancelar", style: "cancel" }, 
              { text: "Apagar", style: 'destructive', onPress: execute }
          ]);
      }
  };

  // --- LÓGICA DE JOGAR PASTA ---
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

  // --- RENDERIZAÇÃO DO ITEM ---
  const renderItem = ({ item }) => {
      const isSelected = selectedIds.includes(item.id);

      return (
          <TouchableOpacity 
            testID={`folder-${item.name}`} // ID para o Selenium
            style={[
                styles.card, 
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { backgroundColor: colors.inputBg, borderColor: colors.primary, borderWidth: 1 }
            ]}
            onPress={() => {
                if (selectionMode) toggleSelection(item.id);
                else navigation.navigate('Folder', { folderId: item.id });
            }}
            activeOpacity={0.7}
          >
              <View style={styles.cardContent}>
                  {/* Checkbox Visual */}
                  {selectionMode && (
                    <View style={[
                        styles.checkbox, 
                        { borderColor: colors.subText }, 
                        isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}>
                        {isSelected && <Text style={{color:'white', fontWeight: 'bold'}}>✓</Text>}
                    </View>
                  )}
                  
                  <Text style={[styles.folderName, { color: colors.text }]}>📂 {item.name}</Text>
              </View>

              {/* Botão Jogar (Só se não estiver selecionando) */}
              {!selectionMode && (
                  <TouchableOpacity 
                    style={[styles.playButton, { backgroundColor: colors.inputBg }]}
                    onPress={() => handlePlayFolder(item.id)}
                  >
                      <Text style={[styles.playButtonText, { color: colors.primary }]}>▶ Jogar</Text>
                  </TouchableOpacity>
              )}
          </TouchableOpacity>
      );
  };

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <Container style={[styles.container, { backgroundColor: colors.background }]}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
            <StyledButton 
                testID="btn-new-folder" // ID para Selenium
                title="+ Nova Pasta" 
                onPress={handleCreatePress} 
                color="primary" 
            />
            <TouchableOpacity 
                testID="btn-manage-folders-toggle"
                onPress={toggleMode}
            >
                <Text style={[styles.manageText, { color: colors.primary }]}>
                    {selectionMode ? "Cancelar" : "Selecionar Vários"}
                </Text>
            </TouchableOpacity>
        </View>

        {/* BARRA DE AÇÃO EM MASSA */}
        {selectionMode && (
            <View style={[styles.bulkHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{color: colors.text}}>{selectedIds.length} selecionados</Text>
                {selectedIds.length > 0 && (
                    <TouchableOpacity onPress={handleBulkDelete}>
                        <Text style={{color: colors.danger, fontWeight: 'bold'}}>APAGAR SELECIONADOS</Text>
                    </TouchableOpacity>
                )}
            </View>
        )}

        {loading && <ActivityIndicator size="large" color={colors.primary} />}

        <FlatList 
            data={folders}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{paddingBottom: 20}}
            ListEmptyComponent={
                <Text style={[styles.empty, { color: colors.subText }]}>Nenhuma pasta criada.</Text>
            }
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
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Nova Pasta</Text>
                    
                    <TextInput 
                        testID="input-folder-name" // ID para Selenium
                        style={[
                            styles.modalInput, 
                            { 
                                backgroundColor: colors.inputBg, 
                                color: colors.text, 
                                borderColor: colors.border 
                            }
                        ]}
                        placeholder="Nome da pasta (ex: História)"
                        placeholderTextColor={colors.subText}
                        value={newFolderName}
                        onChangeText={setNewFolderName}
                        autoFocus={true}
                    />
                    
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={[styles.modalButton, {backgroundColor: colors.subText}]}
                            onPress={() => setCreateModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            testID="btn-confirm-create-folder" // ID para Selenium
                            style={[styles.modalButton, {backgroundColor: colors.primary}]}
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
    container: { flex: 1, padding: SIZING.padding },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    manageText: { fontWeight: 'bold', fontSize: 16 },
    
    bulkHeader: { 
        padding: 10, borderRadius: 8, marginBottom: 10, 
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1 
    },

    card: {
        padding: 20, borderRadius: 10, marginBottom: 10,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1,
        ...Platform.select({ web: { boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }, default: { elevation: 2 } })
    },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    folderName: { fontSize: 18, fontWeight: '600', marginLeft: 10 },
    
    checkbox: {
        width: 20, height: 20, borderRadius: 4, borderWidth: 2, marginRight: 10,
        alignItems: 'center', justifyContent: 'center'
    },

    playButton: {
        paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20
    },
    playButtonText: { fontWeight: 'bold', fontSize: 12 },
    
    empty: { textAlign: 'center', marginTop: 50, fontSize: 16 },

    // Modal Styles
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
    },
    modalContent: {
        padding: 25, borderRadius: 15, width: '85%', maxWidth: 400,
        elevation: 5,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalInput: {
        borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    modalButton: {
        flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center'
    },
    modalButtonText: { fontWeight: 'bold', fontSize: 16 }
});