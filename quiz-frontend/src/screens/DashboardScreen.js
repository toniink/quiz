import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, Platform, 
  TouchableOpacity, TextInput, ActivityIndicator, ScrollView 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../services/api';
import { COLORS, SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';

// --- COMPONENTE HEADER SEPARADO (CORREÇÃO DO BUG DE FOCO) ---
// Definido FORA do componente principal para não ser recriado a cada renderização
const DashboardHeader = ({ 
  logout, 
  navigation, 
  searchText, 
  setSearchText, 
  setCurrentPage 
}) => {
  return (
    <View>
      {/* HEADER SUPERIOR */}
      <View style={styles.topHeader}>
        <Text style={styles.greetingText}>Olá, Estudante!</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* AÇÕES PRINCIPAIS */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
            style={styles.bigCreateButton}
            onPress={() => navigation.navigate('CreateEditQuiz')}
            activeOpacity={0.8}
        >
            <Text style={styles.bigButtonIcon}>+</Text>
            <Text style={styles.bigButtonText}>CRIAR NOVO QUIZ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.foldersButton}
            onPress={() => navigation.navigate('FoldersList')}
        >
            <Text style={styles.foldersButtonText}>📂 Gerenciar Pastas</Text>
        </TouchableOpacity>
      </View>

      {/* BARRA DE PESQUISA */}
      <View style={styles.listHeaderContainer}>
         <Text style={styles.sectionTitle}>Todos os Quizzes</Text>
         <View style={styles.searchWrapper}>
            <Text style={{marginRight: 5}}>🔍</Text>
            <TextInput 
                style={styles.searchInput}
                placeholder="Pesquisar quiz..."
                value={searchText}
                // Ao digitar, atualizamos o texto e voltamos para a página 1
                onChangeText={(t) => { setSearchText(t); setCurrentPage(1); }}
            />
         </View>
      </View>
    </View>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function DashboardScreen({ navigation }) {
  const { logout } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardData();
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error("Erro dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  // Filtro (Case & Accent Insensitive)
  const normalizeText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filteredQuizzes = quizzes.filter(q => 
    normalizeText(q.title).includes(normalizeText(searchText))
  );

  // Paginação
  const totalPages = Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE);
  
  useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(1);
      }
  }, [totalPages]);

  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const changePage = (direction) => {
    if (direction === 'next' && currentPage < totalPages) setCurrentPage(c => c + 1);
    if (direction === 'prev' && currentPage > 1) setCurrentPage(c => c - 1);
  };

  const renderFooter = () => {
      if (totalPages <= 1) return <View style={{height: 50}} />;

      return (
          <View style={styles.paginationContainer}>
              <TouchableOpacity 
                onPress={() => changePage('prev')} 
                disabled={currentPage === 1}
                style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              >
                  <Text style={styles.pageButtonText}>{"<"}</Text>
              </TouchableOpacity>
              
              <Text style={styles.pageInfo}>Página {currentPage} de {totalPages}</Text>
              
              <TouchableOpacity 
                onPress={() => changePage('next')} 
                disabled={currentPage === totalPages}
                style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
              >
                  <Text style={styles.pageButtonText}>{">"}</Text>
              </TouchableOpacity>
          </View>
      );
  };

  const renderQuizItem = ({ item }) => (
    <View style={styles.quizCard}>
      <View style={styles.quizInfo}>
          <Text style={styles.quizTitle}>{item.title}</Text>
          <Text style={styles.quizSub}>
              {item.timePerQuestion > 0 ? `⏱️ ${item.timePerQuestion}s` : 'Sem tempo limite'}
          </Text>
      </View>
      
      <View style={styles.buttonRow}>
        <StyledButton 
            title="Jogar" 
            onPress={() => navigation.navigate('PlayQuiz', { quizId: item.id })} 
            style={{marginRight: 10}}
        />
        <StyledButton 
            title="Editar" 
            color="secondary" 
            onPress={() => navigation.navigate('CreateEditQuiz', { quizId: item.id })} 
        />
      </View>
    </View>
  );

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  return (
    <Container style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
             <ActivityIndicator size="large" color={COLORS.primary} />
             <Text>Carregando dados...</Text>
        </View>
      ) : (
        <FlatList
            data={paginatedQuizzes}
            renderItem={renderQuizItem}
            keyExtractor={(item) => item.id.toString()}
            // Passamos o componente Header aqui como um Elemento React (<... />)
            ListHeaderComponent={
              <DashboardHeader 
                logout={logout}
                navigation={navigation}
                searchText={searchText}
                setSearchText={setSearchText}
                setCurrentPage={setCurrentPage}
              />
            }
            ListFooterComponent={renderFooter}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nenhum quiz encontrado.</Text>
                </View>
            }
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: '#f4f6f8',
  },
  loadingContainer: {
      flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  topHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: SIZING.padding,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8'
  },
  greetingText: { ...FONTS.h2, color: '#333' },
  logoutButton: { 
      backgroundColor: '#ffebee', 
      paddingVertical: 6, 
      paddingHorizontal: 12, 
      borderRadius: 20 
  },
  logoutText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 12 },
  actionsContainer: { 
      padding: SIZING.padding,
  },
  bigCreateButton: {
      backgroundColor: COLORS.primary,
      padding: SIZING.padding * 2,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
      ...Platform.select({
          web: { boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' },
          default: { elevation: 8, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 5 }
      })
  },
  bigButtonIcon: {
      color: 'white', fontSize: 32, lineHeight: 32, marginBottom: 5
  },
  bigButtonText: { 
      color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 
  },
  foldersButton: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#cfd8dc',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      ...Platform.select({
          web: { boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
          default: { elevation: 2 }
      })
  },
  foldersButtonText: { 
      color: '#455a64', fontWeight: '600', fontSize: 16 
  },
  listHeaderContainer: { 
      paddingHorizontal: SIZING.padding,
      paddingBottom: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center', 
      justifyContent: 'space-between',
  },
  sectionTitle: { ...FONTS.h2, color: '#37474f', marginRight: 15 },
  searchWrapper: {
      flexDirection: 'row',
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#cfd8dc',
      borderRadius: 25,
      paddingHorizontal: 15,
      alignItems: 'center',
      flex: 1,
      minWidth: 200,
      height: 45,
      marginTop: 5
  },
  searchInput: {
      flex: 1,
      height: '100%',
      outlineStyle: 'none'
  },
  quizCard: {
      backgroundColor: 'white', 
      borderRadius: 12, 
      padding: 15, 
      marginHorizontal: SIZING.padding,
      marginBottom: 10,
      borderLeftWidth: 5, 
      borderLeftColor: COLORS.primary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...Platform.select({ 
          web: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, 
          default: { elevation: 3 } 
      })
  },
  quizInfo: { flex: 1 },
  quizTitle: { fontSize: 16, fontWeight: 'bold', color: '#263238', marginBottom: 4 },
  quizSub: { fontSize: 12, color: '#78909c' },
  buttonRow: { flexDirection: 'row', alignItems: 'center' },
  paginationContainer: { 
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
      paddingVertical: 20,
      paddingBottom: 40
  },
  pageButton: { 
      backgroundColor: 'white', 
      width: 40, height: 40, borderRadius: 20, 
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: '#cfd8dc'
  },
  pageButtonDisabled: { opacity: 0.3, backgroundColor: '#eceff1' },
  pageButtonText: { fontSize: 18, fontWeight: 'bold', color: '#455a64' },
  pageInfo: { marginHorizontal: 15, fontWeight: '600', color: '#455a64' },
  emptyContainer: { alignItems: 'center', marginTop: 30 },
  emptyText: { color: '#90a4ae', fontSize: 16 }
});