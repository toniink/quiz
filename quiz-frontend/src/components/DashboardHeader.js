import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Switch } from 'react-native';
import { SIZING, FONTS } from '../constants/theme';

export default function DashboardHeader({ 
  user, 
  navigation, 
  searchText, 
  setSearchText, 
  setCurrentPage, 
  colors, 
  isDarkMode,
  toggleTheme,
  setMenuVisible,
  logout
}) {
  const displayName = user?.username ? user.username.split(' ')[0] : 'Estudante';

  return (
    <View>
      {/* 1. BARRA SUPERIOR COM HAMBURGUER E TÍTULO */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            testID="btn-hamburger" 
            onPress={() => setMenuVisible(true)} 
            style={styles.hamburgerButton}
          >
              <Text style={{fontSize: 28, color: colors.text, fontWeight: 'bold'}}>☰</Text>
          </TouchableOpacity>
          
          <Text style={[styles.pageTitle, { color: colors.text }]}>Página Inicial</Text>
          
          <View style={{width: 40}} /> 
      </View>

      {/* 2. SAUDAÇÃO E TEMA */}
      <View style={styles.greetingContainer}>
          <View>
            <Text style={[styles.greetingText, { color: colors.text }]}>
                Olá, {displayName}!
            </Text>
            <Text style={{ color: colors.subText, fontSize: 14 }}>O que vamos estudar hoje?</Text>
          </View>
      </View>

      {/* 3. AÇÕES PRINCIPAIS */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
            testID="btn-create-quiz"
            style={[styles.bigCreateButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateEditQuiz')}
            activeOpacity={0.8}
        >
            <Text style={styles.bigButtonIcon}>+</Text>
            <Text style={styles.bigButtonText}>CRIAR NOVO QUIZ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            testID="btn-manage-folders"
            style={[styles.foldersButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('FoldersList')}
        >
            <Text style={[styles.foldersButtonText, { color: colors.subText }]}>📂 Gerenciar Pastas</Text>
        </TouchableOpacity>
      </View>

      {/* 4. BARRA DE PESQUISA BONITA */}
      <View style={styles.listHeaderContainer}>
         <Text style={[styles.sectionTitle, { color: colors.text }]}>Todos os Quizzes</Text>
         
         {/* Wrapper da Pesquisa estilizado */}
         <View style={[
             styles.searchWrapper, 
             { backgroundColor: colors.inputBg || '#fff', borderColor: colors.border }
         ]}>
            <Text style={{marginRight: 8, fontSize: 18}}>🔍</Text>
            <TextInput 
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Pesquisar quiz..."
                placeholderTextColor={colors.subText}
                value={searchText}
                onChangeText={(t) => { setSearchText(t); setCurrentPage(1); }}
            />
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
      paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1 
  },
  hamburgerButton: { padding: 5 },
  pageTitle: { fontSize: 18, fontWeight: 'bold' },

  greetingContainer: { 
      padding: SIZING.padding, paddingBottom: 10, paddingTop: 20,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
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

  listHeaderContainer: { 
      paddingHorizontal: SIZING.padding, paddingBottom: 15, 
      flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' 
  },
  sectionTitle: { ...FONTS.h2, marginRight: 15, marginBottom: 10 },
  
  // ESTILO DA BARRA DE PESQUISA
  searchWrapper: { 
      flexDirection: 'row', 
      borderWidth: 1, 
      borderRadius: 12, // Mais arredondado
      paddingHorizontal: 15, 
      alignItems: 'center', 
      flex: 1, 
      minWidth: 200, 
      height: 50, // Altura fixa confortável
      marginTop: 5
  },
  searchInput: { 
      flex: 1, 
      height: '100%', 
      fontSize: 16,
      outlineStyle: 'none' 
  },
});