// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, ScrollView, Alert, TouchableOpacity} from 'react-native';
import { SafeAreaView} from 'react-native-safe-area-context';
import { useAuth} from '../context/AuthContext';
import { getDashboardData, deleteQuiz, createFolder } from '../services/api';
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

  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

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

    const handleCreateFolder = () => {
    // Alert.prompt NÃO funciona bem no Android/Web.
    // Vamos usar um prompt simples por enquanto, mas o ideal é um modal.
    // Esta é uma limitação do React Native.
    const name = prompt('Digite o nome da nova pasta:'); 
    
    if (name) {
      createFolder(name)
        .then(() => {
          Alert.alert("Sucesso", `Pasta "${name}" criada.`);
          fetchData(); // Recarrega o dashboard
        })
        .catch(() => Alert.alert("Erro", "Não foi possível criar a pasta."));
    }
  };

  const openFolderDeleteModal = (folder) => {
    setFolderToDelete(folder);
    setFolderModalVisible(true);
  };

  const closeFolderDeleteModal = () => {
    setFolderModalVisible(false);
    setFolderToDelete(null);
  };

  const handleFolderDeleteConfirm = async () => {
    if (!folderToDelete) return;
    try {
      await deleteFolder(folderToDelete.id); // Chama a nova API
      Alert.alert("Sucesso!", `Pasta "${folderToDelete.name}" deletada.`);
      closeFolderDeleteModal();
      fetchData(); // Recarrega o dashboard
    } catch (error) {
      Alert.alert("Erro", "Não foi possível deletar a pasta.");
      closeFolderDeleteModal();
    }
  };

    // 3. RENDERIZA UMA PASTA CLICÁVEL
  const renderFolderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate('Folder', { folderId: item.id })}>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </TouchableOpacity>
      <View style={styles.buttonRow}>
        <StyledButton 
          title="Deletar" 
          color="danger" 
          onPress={() => openFolderDeleteModal(item)} 
        />
        {/* Você pode adicionar "Renomear" aqui no futuro */}
      </View>
    </View>
  );

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

      <StyledButton 
        title="Criar Nova Pasta"
        color="secondary"
        onPress={handleCreateFolder}
      />
      
      <Text style={styles.sectionTitle}>Pastas</Text>
      <FlatList 
        data={data.folders}
        renderItem={renderFolderItem} // 5. Use o novo renderFolderItem
        keyExtractor={(item) => item.id.toString()}
      />
      
      <Text style={styles.sectionTitle}>Pastas</Text>
      <FlatList 
        data={data.folders}
        renderItem={renderFolderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* MUDE O TEXTO AQUI: De "Quizzes (Sem Pasta)" para "Todos os Quizzes" */}
      <Text style={styles.sectionTitle}>Todos os Quizzes</Text>
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

      {/* NOVO MODAL PARA DELETAR PASTAS */}
      {folderToDelete && (
        <ConfirmationModal
          visible={folderModalVisible}
          title="Confirmar Deleção de Pasta"
          message={`Tem certeza que deseja deletar a pasta "${folderToDelete.name}"? 

Os quizzes DENTRO dela NÃO serão apagados. Eles apenas deixarão de pertencer a esta pasta.`}
          onCancel={closeFolderDeleteModal}
          onConfirm={handleFolderDeleteConfirm}
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