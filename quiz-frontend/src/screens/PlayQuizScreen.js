// src/screens/PlayQuizScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getQuizDetails } from '../services/api';
// Importa as funções puras de lógica (do plano de testes)
import { checkAnswer, shuffleArray } from '../utils/quizLogic'; // (Você precisa criar esse arquivo)

export default function PlayQuizScreen({ route, navigation }) {
  const { quizId } = route.params;

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0); // Teste "Contador de Acertos"
  const [selectedOption, setSelectedOption] = useState(null); // { id, isCorrect }
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  
  // Teste "Timer"
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await getQuizDetails(quizId);
        const loadedQuiz = response.data;
        // Embaralha as perguntas e opções ao carregar (Teste "Randomização")
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
  }, [quizId]);

  // Efeito para o Timer (Teste "Tempo para Resposta")
  useEffect(() => {
    if (!quiz || quiz.timePerQuestion === 0 || isAnswerConfirmed) {
      return; // Não inicia o timer
    }
    
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Tempo Esgotado
      handleConfirmAnswer();
    }
  }, [timer, quiz, isAnswerConfirmed]);


  const handleSelectOption = (option) => {
    if (isAnswerConfirmed) return; 
    setSelectedOption(option.id); // Salva o ID
  };

  const handleConfirmAnswer = () => {
    if (isAnswerConfirmed) return;
    setIsAnswerConfirmed(true);

    const currentQuestion = quiz.questions[currentQuestionIndex];

    // Alinhado com o Teste Unitário
    const isCorrect = checkAnswer(currentQuestion, selectedOption); 

    if (isCorrect) {
        setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswerConfirmed(false);
    setSelectedOption(null);
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quiz.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimer(quiz.timePerQuestion || 0); // Reseta o timer
    } else {
      // Fim do Quiz (Teste E2E: "Placar final")
      navigation.replace('Results', { 
        score: score, 
        total: quiz.questions.length 
      });
    }
  };

  // --- Funções de Renderização ---

  const getOptionStyle = (option) => {
    const { id, isCorrect } = option;
    if (!isAnswerConfirmed) {
      // Compara o ID da opção com o ID salvo no estado
      return selectedOption === id ? styles.optionSelected : styles.option;
    }
  
    if (isCorrect) {
      return [styles.option, styles.optionCorrect]; 
    }
    // Compara o ID da opção com o ID salvo no estado
    if (selectedOption === id && !isCorrect) {
      return [styles.option, styles.optionIncorrect]; 
    }
    return styles.option;
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>
        {quiz.timePerQuestion > 0 ? `Tempo: ${timer}s` : ''}
      </Text>
      
      <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
      
      {currentQuestion.options.map(option => (
        <TouchableOpacity
          testID={`option-${index}`}
          key={option.id}
          style={getOptionStyle(option)}
          onPress={() => handleSelectOption(option)}
          disabled={isAnswerConfirmed}
        >
          <Text>{option.optionText}</Text>
        </TouchableOpacity>
      ))}
      
      {isAnswerConfirmed ? (
        <Button title="Próxima Pergunta" onPress={handleNextQuestion} />
      ) : (
        <Button 
          title="Confirmar Resposta" 
          onPress={handleConfirmAnswer}
          disabled={!selectedOption} // Só pode confirmar se selecionou algo
        />
      )}
      
      <Text style={styles.scoreText}>Pontuação: {score}</Text>
    </View>
  );
}

// (Você precisa criar esse arquivo 'src/utils/quizLogic.js' com as funções)
// function checkAnswer(question, selectedOption) {
//   return selectedOption.isCorrect;
// }
// function shuffleArray(array) { 
//   /* ... lógica de embaralhar ... */ 
// }

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  timerText: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginBottom: 10 },
  questionText: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  option: {
    backgroundColor: '#eee',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#eee',
  },
  optionSelected: {
    borderColor: '#007bff', // Azul (selecionada)
  },
  optionCorrect: {
    backgroundColor: '#d4edda', // Verde (correta)
    borderColor: '#c3e6cb',
  },
  optionIncorrect: {
    backgroundColor: '#f8d7da', // Vermelho (incorreta)
    borderColor: '#f5c6cb',
  },
  scoreText: { fontSize: 18, textAlign: 'center', marginTop: 20 },
});