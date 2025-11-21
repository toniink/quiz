import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZING, FONTS } from '../constants/theme';
import StyledButton from '../components/StyledButton';

export default function ResultsScreen({ route, navigation }) {
  const { colors } = useTheme(); // Hook para cores dinâmicas
  const { score, total } = route.params;
  
  // Calcula a percentagem (evita divisão por zero)
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Lógica de Feedback (Texto e Cor) baseada na nota
  let feedbackMessage = "";
  let feedbackColor = colors.text;

  if (percentage >= 80) {
      feedbackMessage = "Excelente! 🎉";
      feedbackColor = colors.success;
  } else if (percentage >= 50) {
      feedbackMessage = "Bom trabalho! 👍";
      feedbackColor = colors.primary;
  } else {
      feedbackMessage = "Continue a estudar! 📚";
      feedbackColor = colors.danger;
  }

  return (
    <ScrollView 
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* CARD DE RESULTADO */}
      <View style={[styles.resultCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          
          {/* ID IMPORTANTE PARA O TESTE SELENIUM: IDENTIFICA FIM DO JOGO */}
          <Text 
            testID="text-quiz-finished" 
            style={[styles.title, { color: colors.text }]}
          >
            Quiz Finalizado
          </Text>
          
          {/* Círculo ou Destaque da Nota */}
          <View style={[styles.scoreContainer, { borderColor: feedbackColor }]}>
              <Text style={[styles.percentageText, { color: feedbackColor }]}>
                  {percentage}%
              </Text>
          </View>

          <Text style={[styles.scoreText, { color: colors.subText }]}>
             Você acertou {score} de {total} questões
          </Text>

          <Text style={[styles.feedbackText, { color: feedbackColor }]}>
              {feedbackMessage}
          </Text>
      </View>

      {/* ÁREA DE BOTÕES */}
      <View style={styles.buttonContainer}>
          {/* ID IMPORTANTE PARA O TESTE SELENIUM: BOTÃO DE VOLTAR */}
          <StyledButton 
            testID="btn-back-dashboard"
            title="Voltar ao Dashboard" 
            onPress={() => navigation.popToTop()} // Volta para o início da pilha (Dashboard)
            color="primary"
            style={styles.button}
          />
          
          {/* Opcional: Se quiser implementar lógica de "Tentar Novamente" no futuro */}
          {/* <StyledButton 
            title="Tentar Novamente" 
            onPress={() => navigation.goBack()} 
            color="secondary"
            style={styles.button}
          /> 
          */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZING.padding * 2, // Mais espaçamento lateral
  },
  resultCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    // Sombra consistente com o resto do app
    ...Platform.select({
        web: { boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
        default: { elevation: 10, shadowOpacity: 0.2, shadowRadius: 10 }
    })
  },
  title: {
    ...FONTS.h1,
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    width: 120,
    height: 120,
    borderRadius: 60, // Círculo perfeito
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '900',
  },
  scoreText: {
    ...FONTS.h2,
    fontSize: 18,
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center'
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400, // Limite para web
    alignSelf: 'center'
  },
  button: {
      marginBottom: 15,
      height: 55 // Botões um pouco mais altos para destaque
  }
});