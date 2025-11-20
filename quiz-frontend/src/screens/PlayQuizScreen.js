import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { getQuizDetails } from '../services/api';
import { checkAnswer, shuffleArray } from '../utils/quizLogic';
import { COLORS, SIZING, FONTS } from '../constants/theme';

export default function PlayQuizScreen({ route, navigation }) {
  // Aceita um ID único (modo antigo) OU uma lista de IDs (modo "Jogar Todos")
  // Também aceita score acumulado de quizzes anteriores
  const { quizId, quizIds, currentIndex = 0, accumulatedScore = 0, accumulatedTotal = 0 } = route.params;

  // Determina qual é o ID atual a ser jogado
  const activeQuizId = quizIds ? quizIds[currentIndex] : quizId;

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0); 
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const response = await getQuizDetails(activeQuizId);
        const loadedQuiz = response.data;
        
        // Randomização
        loadedQuiz.questions = shuffleArray(loadedQuiz.questions.map(q => ({
          ...q,
          options: shuffleArray(q.options)
        })));
        
        setQuiz(loadedQuiz);
        setTimer(loadedQuiz.timePerQuestion || 0);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar o quiz.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [activeQuizId]);

  // Timer Logic
  useEffect(() => {
    if (!quiz || quiz.timePerQuestion === 0 || isAnswerConfirmed) return;
    
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      handleConfirmAnswer();
    }
  }, [timer, quiz, isAnswerConfirmed]);

  const handleSelectOption = (optionId) => {
    if (isAnswerConfirmed) return; 
    setSelectedOption(optionId);
  };

  const handleConfirmAnswer = () => {
    if (isAnswerConfirmed) return;
    setIsAnswerConfirmed(true);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    // checkAnswer espera o objeto da pergunta e o ID da opção selecionada
    const isCorrect = checkAnswer(currentQuestion, selectedOption); 
    
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < quiz.questions.length) {
      // Próxima pergunta do MESMO quiz
      setIsAnswerConfirmed(false);
      setSelectedOption(null);
      setCurrentQuestionIndex(nextIndex);
      setTimer(quiz.timePerQuestion || 0);
    } else {
      // --- FIM DESTE QUIZ ---
      finishCurrentQuiz();
    }
  };

  const finishCurrentQuiz = () => {
    const currentQuizScore = score;
    const currentQuizTotal = quiz.questions.length;

    // Se estivermos no modo "Jogar Todos" (quizIds existe)
    if (quizIds && currentIndex < quizIds.length - 1) {
        // Ainda tem quizzes na fila!
        // Navega para a MESMA tela, mas com o próximo índice e score acumulado
        navigation.replace('PlayQuiz', {
            quizIds: quizIds,
            currentIndex: currentIndex + 1,
            accumulatedScore: accumulatedScore + currentQuizScore,
            accumulatedTotal: accumulatedTotal + currentQuizTotal
        });
    } else {
        // Acabou tudo (ou era só um quiz). Vai para Resultados.
        navigation.replace('Results', { 
            score: accumulatedScore + currentQuizScore, 
            total: accumulatedTotal + currentQuizTotal 
        });
    }
  };

  // --- RENDERIZAÇÃO ---

  const getOptionStyle = (option) => {
    const { id, isCorrect } = option;
    if (!isAnswerConfirmed) {
      return selectedOption === id ? styles.optionSelected : styles.option;
    }
    if (isCorrect) return [styles.option, styles.optionCorrect];
    if (selectedOption === id && !isCorrect) return [styles.option, styles.optionIncorrect];
    return styles.option;
  };

  if (loading) {
    return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{marginTop: 10}}>Carregando Quiz...</Text>
        </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  // Calcula progresso geral se estiver em playlist
  const headerText = quizIds 
    ? `Quiz ${currentIndex + 1} de ${quizIds.length}: ${quiz.title}`
    : quiz.title;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.quizTitle}>{headerText}</Text>
      
      <View style={styles.infoRow}>
         <Text style={styles.questionCount}>
            Pergunta {currentQuestionIndex + 1}/{quiz.questions.length}
         </Text>
         <Text style={styles.timerText}>
            {quiz.timePerQuestion > 0 ? `⏱️ ${timer}s` : ''}
         </Text>
      </View>
      
      <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
      
      {currentQuestion.options.map(option => (
        <TouchableOpacity
          key={option.id}
          style={getOptionStyle(option)}
          onPress={() => handleSelectOption(option.id)}
          disabled={isAnswerConfirmed}
        >
          <Text style={styles.optionText}>{option.optionText}</Text>
        </TouchableOpacity>
      ))}
      
      <View style={styles.footer}>
        {isAnswerConfirmed ? (
            <TouchableOpacity style={styles.button} onPress={handleNextQuestion}>
                <Text style={styles.buttonText}>
                    {/* Muda texto do botão dependendo se é o fim do quiz ou da playlist */}
                    {currentQuestionIndex < quiz.questions.length - 1 
                        ? "Próxima Pergunta" 
                        : (quizIds && currentIndex < quizIds.length - 1 ? "Próximo Quiz >>" : "Ver Resultados")}
                </Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity 
                style={[styles.button, !selectedOption && styles.buttonDisabled]} 
                onPress={handleConfirmAnswer}
                disabled={!selectedOption}
            >
                <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: SIZING.padding, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  quizTitle: { ...FONTS.h2, textAlign: 'center', marginBottom: 10, color: COLORS.primary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  questionCount: { ...FONTS.body, color: '#666' },
  timerText: { ...FONTS.body, fontWeight: 'bold', color: 'red' },
  questionText: { ...FONTS.h2, marginBottom: 20, textAlign: 'center' },
  option: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  optionText: { ...FONTS.body },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: '#e7f1ff' },
  optionCorrect: { backgroundColor: '#d4edda', borderColor: '#c3e6cb' },
  optionIncorrect: { backgroundColor: '#f8d7da', borderColor: '#f5c6cb' },
  footer: { marginTop: 30 },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});