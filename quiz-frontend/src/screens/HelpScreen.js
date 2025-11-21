import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Platform, LayoutAnimation, UIManager 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZING, FONTS } from '../constants/theme';

// Habilita animações de layout no Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Dados da Ajuda
const HELP_DATA = [
  {
    id: 1,
    title: "Como criar um Quiz?",
    content: "Na tela inicial (Dashboard), toque no botão gigante '+ CRIAR NOVO QUIZ'. Preencha o título, defina o tempo por pergunta (opcional) e adicione quantas perguntas desejar. Não se esqueça de marcar a alternativa correta em cada pergunta!"
  },
  {
    id: 2,
    title: "Como organizar em Pastas?",
    content: "Acesse a '📂 Gerenciar Pastas'. Toque em '+ Nova Pasta' para criar uma categoria (ex: História, Matemática). Ao criar ou editar um Quiz, verá uma lista de pastas onde pode associá-lo."
  },
  {
    id: 3,
    title: "Como funcionam as Pastas?",
    content: "Dentro de uma pasta, pode ver apenas os quizzes relacionados. Pode também usar o botão '▶ Jogar Todos em Sequência' para criar uma playlist de estudo contínua com todos os testes daquela pasta."
  },
  {
    id: 4,
    title: "Como apagar vários itens?",
    content: "Na tela de Pastas, toque em 'Gerenciar' no canto superior direito. Selecione os itens que deseja remover e toque na barra inferior 'Remover'. Nota: Remover um quiz de uma pasta não o apaga do sistema, apenas desfaz a associação."
  },
  {
    id: 5,
    title: "Como alterar os meus dados?",
    content: "Abra o Menu Lateral (☰) e toque em '👤 Meu Perfil'. Lá pode alterar o seu nome de usuário e a senha. Também encontra a opção de excluir a conta permanentemente."
  }
];

const AccordionItem = ({ item, isOpen, onPress, colors }) => {
  return (
    <View style={[styles.itemContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.itemHeader} 
        onPress={onPress} 
        activeOpacity={0.7}
      >
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={{ fontSize: 18, color: colors.primary, fontWeight: 'bold' }}>
          {isOpen ? "−" : "+"}
        </Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={[styles.itemContent, { borderTopColor: colors.border }]}>
          <Text style={[styles.itemText, { color: colors.subText }]}>{item.content}</Text>
        </View>
      )}
    </View>
  );
};

export default function HelpScreen() {
  const { colors } = useTheme();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    // Animação suave ao abrir/fechar
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id); // Fecha se já estiver aberto, senão abre
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Central de Ajuda</Text>
        <Text style={[styles.headerSub, { color: colors.subText }]}>
          Tire as suas dúvidas sobre como usar o QuizApp.
        </Text>

        {HELP_DATA.map((item) => (
          <AccordionItem 
            key={item.id}
            item={item}
            isOpen={expandedId === item.id}
            onPress={() => toggleExpand(item.id)}
            colors={colors}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SIZING.padding },
  headerTitle: { ...FONTS.h1, marginBottom: 5 },
  headerSub: { ...FONTS.body, marginBottom: 20 },
  
  // Estilos do Acordeão
  itemContainer: {
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden', // Importante para a animação ficar bonita
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1, // Para o texto não empurrar o ícone para fora
  },
  itemContent: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  itemText: {
    fontSize: 15,
    lineHeight: 22,
  }
});