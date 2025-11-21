import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  Alert, ScrollView, Platform 
} from 'react-native';
import { getQuizDetails } from '../services/api';
import { checkAnswer, shuffleArray } from '../utils/quizLogic';
import { useTheme } from '../context/ThemeContext';
import { SIZING, FONTS } from '../constants/theme';

export default function PlayQuizScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { quizId, quizIds, currentIndex = 0, accumulatedScore = 0, accumulatedTotal = 0 } = route.params;
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
    const isCorrect = checkAnswer(currentQuestion, selectedOption); 
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quiz.questions.length) {
      setIsAnswerConfirmed(false);
      setSelectedOption(null);
      setCurrentQuestionIndex(nextIndex);
      setTimer(quiz.timePerQuestion || 0);
    } else {
      finishCurrentQuiz();
    }
  };

  const finishCurrentQuiz = () => {
    const currentQuizScore = score;
    const currentQuizTotal = quiz.questions.length;

    if (quizIds && currentIndex < quizIds.length - 1) {
        navigation.replace('PlayQuiz', {
            quizIds: quizIds,
            currentIndex: currentIndex + 1,
            accumulatedScore: accumulatedScore + currentQuizScore,
            accumulatedTotal: accumulatedTotal + currentQuizTotal
        });
    } else {
        navigation.replace('Results', { 
            score: accumulatedScore + currentQuizScore, 
            total: accumulatedTotal + currentQuizTotal 
        });
    }
  };

  const getOptionStyle = (option) => {
    const { id, isCorrect } = option;
    const baseStyle = [styles.option, { backgroundColor: colors.card, borderColor: colors.border }];
    if (!isAnswerConfirmed) {
      return selectedOption === id 
        ? [baseStyle, { borderColor: colors.primary, backgroundColor: colors.inputBg, borderWidth: 2 }] 
        : baseStyle;
    }
    if (isCorrect) return [baseStyle, { backgroundColor: 'rgba(40, 167, 69, 0.15)', borderColor: colors.success }];
    if (selectedOption === id && !isCorrect) return [baseStyle, { backgroundColor: 'rgba(220, 53, 69, 0.15)', borderColor: colors.danger }];
    return baseStyle;
  };

  if (loading) return <View style={[styles.center, {backgroundColor: colors.background}]}><ActivityIndicator size="large" color={colors.primary}/></View>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const headerText = quizIds ? `Quiz ${currentIndex + 1} de ${quizIds.length}` : quiz.title;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.quizTitle, { color: colors.text }]}>{headerText}</Text>
      
      <View style={styles.infoRow}>
         <Text style={[styles.infoText, { color: colors.subText }]}>Questão {currentQuestionIndex + 1}/{quiz.questions.length}</Text>
         <Text style={[styles.infoText, { color: colors.danger }]}>{quiz.timePerQuestion > 0 ? `⏱️ ${timer}s` : ''}</Text>
      </View>
      
      <View style={[styles.questionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.questionText}</Text>
      </View>
      
      {currentQuestion.options.map((option, index) => (
        <TouchableOpacity
          key={option.id}
          testID={`option-${index}`} // ID para facilitar seleção da opção
          style={getOptionStyle(option)}
          onPress={() => handleSelectOption(option.id)}
          disabled={isAnswerConfirmed}
        >
          <Text style={{ color: colors.text, fontSize: 16 }}>{option.optionText}</Text>
        </TouchableOpacity>
      ))}
      
      <View style={styles.footer}>
        {isAnswerConfirmed ? (
            <TouchableOpacity 
                testID="btn-next" // <--- ID CRÍTICO AQUI
                style={[styles.button, { backgroundColor: colors.primary }]} 
                onPress={handleNextQuestion}
            >
                <Text style={styles.btnText}>
                    {currentQuestionIndex < quiz.questions.length - 1 
                        ? "Próxima Pergunta" 
                        : (quizIds && currentIndex < quizIds.length - 1 ? "Próximo Quiz >>" : "Ver Resultados")}
                </Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity 
                testID="btn-confirm" // <--- ID CRÍTICO AQUI
                style={[styles.button, { backgroundColor: selectedOption ? colors.primary : colors.subText }]} 
                onPress={handleConfirmAnswer}
                disabled={!selectedOption}
            >
                <Text style={styles.btnText}>Confirmar Resposta</Text>
            </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: SIZING.padding },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  quizTitle: { ...FONTS.h2, textAlign: 'center', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  infoText: { fontWeight: 'bold', fontSize: 16 },
  questionCard: { padding: 25, borderRadius: 16, marginBottom: 25, alignItems: 'center', elevation: 3 },
  questionText: { ...FONTS.h2, textAlign: 'center' },
  option: { padding: 18, marginVertical: 6, borderRadius: 12, borderWidth: 1 },
  footer: { marginTop: 30, marginBottom: 50 },
  button: { padding: 18, borderRadius: 14, alignItems: 'center', ...Platform.select({web: {cursor: 'pointer'}}) },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});