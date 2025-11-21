import React, { useState, useEffect } from 'react';
import { 
  View, FlatList, StyleSheet, SafeAreaView, Platform, 
  TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Switch, StatusBar, Text 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getDashboardData } from '../services/api';
import { SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';
import HamburgerMenu from '../components/HamburgerMenu';

// --- COMPONENTE HEADER ---
const DashboardHeader = ({ 
  user, navigation, searchText, setSearchText, setCurrentPage, 
  colors, setMenuVisible 
}) => {
  const displayName = user?.username ? user.username.split(' ')[0] : 'Estudante';

  return (
    <View>
      {/* HEADER SUPERIOR */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            testID="btn-hamburger" // ID PARA SELENIUM
            onPress={() => setMenuVisible(true)} 
            style={styles.hamburgerButton}
          >
              <Text style={{fontSize: 28, color: colors.text, fontWeight: 'bold'}}>☰</Text>
          </TouchableOpacity>
          
          <Text style={[styles.pageTitle, { color: colors.text }]}>Página Inicial</Text>
          
          <View style={{width: 40}} /> 
      </View>

      {/* SAUDAÇÃO */}
      <View style={styles.greetingContainer}>
          <Text style={[styles.greetingText, { color: colors.text }]}>
            Olá, {displayName}!
          </Text>
          <Text style={{ color: colors.subText, fontSize: 14 }}>O que vamos estudar hoje?</Text>
      </View>

      {/* AÇÕES PRINCIPAIS */}
      <View style={styles.actionsContainer}>
        {/* BOTÃO CRIAR QUIZ */}
        <TouchableOpacity 
            testID="btn-create-quiz" // ID CRÍTICO PARA O TESTE
            style={[styles.bigCreateButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateEditQuiz')}
            activeOpacity={0.8}
        >
            <Text style={styles.bigButtonIcon}>+</Text>
            <Text style={styles.bigButtonText}>CRIAR NOVO QUIZ</Text>
        </TouchableOpacity>

        {/* BOTÃO GERENCIAR PASTAS */}
        <TouchableOpacity 
            testID="btn-manage-folders" // ID CRÍTICO PARA O TESTE
            style={[styles.foldersButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('FoldersList')}
        >
            <Text style={[styles.foldersButtonText, { color: colors.subText }]}>📂 Gerenciar Pastas</Text>
        </TouchableOpacity>
      </View>

      {/* BARRA DE PESQUISA COMPACTA AO LADO DO TÍTULO */}
      <View style={styles.listHeaderContainer}>
         <Text style={[styles.sectionTitle, { color: colors.text }]}>Todos os Quizzes</Text>
         
         <View style={[styles.searchWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput 
                testID="input-search-dashboard"
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Pesquisar..."
                placeholderTextColor={colors.subText}
                value={searchText}
                onChangeText={(t) => { setSearchText(t); setCurrentPage(1); }}
            />
            <Text style={{marginLeft: 5, fontSize: 12}}>🔍</Text>
         </View>
      </View>
    </View>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function DashboardScreen({ navigation }) {
  const { logout, user } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
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

  const normalizeText = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const filteredQuizzes = quizzes.filter(q => normalizeText(q.title).includes(normalizeText(searchText)));
  const totalPages = Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE);
  
  useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [totalPages]);

  const paginatedQuizzes = filteredQuizzes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (dir) => {
    if (dir === 'next' && currentPage < totalPages) setCurrentPage(c => c + 1);
    if (dir === 'prev' && currentPage > 1) setCurrentPage(c => c - 1);
  };

  const renderFooter = () => {
      if (totalPages <= 1) return <View style={{height: 50}} />;
      return (
          <View style={styles.paginationContainer}>
              <TouchableOpacity 
                onPress={() => changePage('prev')} disabled={currentPage === 1}
                style={[styles.pageButton, { backgroundColor: colors.card, borderColor: colors.border }, currentPage === 1 && styles.pageButtonDisabled]}
              >
                  <Text style={[styles.pageButtonText, { color: colors.text }]}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={[styles.pageInfo, { color: colors.text }]}>{currentPage} / {totalPages}</Text>
              <TouchableOpacity 
                onPress={() => changePage('next')} disabled={currentPage === totalPages}
                style={[styles.pageButton, { backgroundColor: colors.card, borderColor: colors.border }, currentPage === totalPages && styles.pageButtonDisabled]}
              >
                  <Text style={[styles.pageButtonText, { color: colors.text }]}>{">"}</Text>
              </TouchableOpacity>
          </View>
      );
  };

  const renderQuizItem = ({ item }) => (
    <View style={[styles.quizCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
      <View style={styles.quizInfo}>
          <Text style={[styles.quizTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.quizSub, { color: colors.subText }]}>
              {item.timePerQuestion > 0 ? `⏱️ ${item.timePerQuestion}s` : 'Sem tempo limite'}
          </Text>
      </View>
      <View style={styles.buttonRow}>
        <StyledButton 
            testID={`btn-play-${item.id}`} // Adicionei ID por precaução
            title="Jogar" 
            onPress={() => navigation.navigate('PlayQuiz', { quizId: item.id })} 
            style={{marginRight: 10}} 
            color="primary"
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
  const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ height: paddingTop, backgroundColor: colors.card }} />

        <Container style={styles.container} contentContainerStyle={{flexGrow: 1}}>
            {loading && !quizzes.length ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={paginatedQuizzes}
                    renderItem={renderQuizItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={
                        <DashboardHeader 
                            user={user} 
                            navigation={navigation}
                            searchText={searchText} 
                            setSearchText={setSearchText} 
                            setCurrentPage={setCurrentPage}
                            setMenuVisible={setMenuVisible}
                            colors={colors}
                        />
                    }
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, {color: colors.subText}]}>Nenhum quiz encontrado.</Text>
                        </View>
                    }
                />
            )}
        </Container>

        <HamburgerMenu 
            visible={menuVisible} 
            onClose={() => setMenuVisible(false)} 
            navigation={navigation}
            logout={logout}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  
  // Header
  topBar: { 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
      paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1 
  },
  hamburgerButton: { padding: 5 },
  pageTitle: { fontSize: 18, fontWeight: 'bold' },

  // Greeting e Ações
  greetingContainer: { padding: SIZING.padding, paddingBottom: 10, paddingTop: 20 },
  greetingText: { ...FONTS.h2, fontSize: 22 },
  actionsContainer: { padding: SIZING.padding },
  
  bigCreateButton: { 
      padding: SIZING.padding * 2, borderRadius: 16, 
      alignItems: 'center', justifyContent: 'center', marginBottom: 15, 
      ...Platform.select({ web: { boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }, default: { elevation: 5 } }) 
  },
  bigButtonIcon: { color: 'white', fontSize: 32, lineHeight: 32, marginBottom: 5 },
  bigButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  
  foldersButton: { borderWidth: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  foldersButtonText: { fontWeight: '600', fontSize: 16 },

  // --- BARRA DE PESQUISA ---
  listHeaderContainer: { 
      paddingHorizontal: SIZING.padding, paddingBottom: 10, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
  },
  sectionTitle: { 
      ...FONTS.h2, 
      marginRight: 10,
      flexShrink: 1 
  },
  searchWrapper: { 
      flexDirection: 'row', 
      borderWidth: 1, 
      borderRadius: 20, // Mais arredondado (pílula)
      paddingHorizontal: 12, 
      alignItems: 'center', 
      width: 160, // Largura fixa pequena mas funcional
      height: 38, // Altura compacta
      justifyContent: 'space-between'
  },
  searchInput: { 
      flex: 1, 
      height: '100%', 
      fontSize: 14,
      padding: 0, // Remove padding padrão do Android
      outlineStyle: 'none' 
  },

  // Cards
  quizCard: { borderRadius: 12, padding: 15, marginHorizontal: SIZING.padding, marginBottom: 10, borderLeftWidth: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  quizInfo: { flex: 1 },
  quizTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  quizSub: { fontSize: 12 },
  buttonRow: { flexDirection: 'row', alignItems: 'center' },
  
  // Paginação
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, paddingBottom: 40 },
  pageButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  pageButtonDisabled: { opacity: 0.3 },
  pageButtonText: { fontSize: 18, fontWeight: 'bold' },
  pageInfo: { marginHorizontal: 15, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 30 },
  emptyText: { fontSize: 16 },
});