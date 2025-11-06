// src/screens/CreateEditQuizScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { getQuizDetails, createQuiz, updateQuiz } from '../services/api';

// Estado inicial para uma nova pergunta
const newQuestionTemplate = () => ({
  questionText: '',
  options: [
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]
});

export default function CreateEditQuizScreen({ route, navigation }) {
  // Pega o ID da rota. Se existir, estamos editando.
  const { quizId } = route.params || {};
  const isEditMode = !!quizId;

  const [title, setTitle] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState('0');
  const [questions, setQuestions] = useState([newQuestionTemplate()]);
  const [loading, setLoading] = useState(false);

  // Teste de Componente: "Preenchimento para Edição"
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getQuizDetails(quizId)
        .then(response => {
          const quiz = response.data;
          setTitle(quiz.title);
          setTimePerQuestion(quiz.timePerQuestion.toString());
          // Converte 'isCorrect' de 1/0 para true/false
          const formattedQuestions = quiz.questions.map(q => ({
            ...q,
            options: q.options.map(o => ({ ...o, isCorrect: !!o.isCorrect }))
          }));
          setQuestions(formattedQuestions);
        })
        .catch(err => Alert.alert("Erro", "Não foi possível carregar o quiz."))
        .finally(() => setLoading(false));
    }
  }, [quizId]);

  // --- Funções de Manipulação do Formulário ---

  const handleQuestionChange = (text, qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].questionText = text;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (text, qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].optionText = text;
    setQuestions(newQuestions);
  };

  // Teste de Componente: "Seleção de Alternativa Correta" (Radio Button)
  const handleSetCorrect = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    // Zera todos os outros...
    newQuestions[qIndex].options.forEach((opt, index) => {
      opt.isCorrect = (index === oIndex);
    });
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, newQuestionTemplate()]);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ optionText: '', isCorrect: false });
    setQuestions(newQuestions);
  };

  // --- Validação e Salvamento ---

  // Teste de Componente: "Validação" e "Estado do Botão"
  const isFormValid = () => {
    if (!title.trim()) return false;
    if (questions.length === 0) return false;

    for (const q of questions) {
      if (!q.questionText.trim()) return false;
      if (q.options.length < 2) return false;
      if (!q.options.some(o => o.isCorrect)) return false; // Pelo menos uma correta
      for (const o of q.options) {
        if (!o.optionText.trim()) return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      Alert.alert("Formulário Inválido", "Verifique todos os campos. Cada pergunta deve ter um texto, pelo menos 2 alternativas (com texto) e 1 alternativa correta marcada.");
      return;
    }
    
    setLoading(true);
    const quizData = {
      title,
      timePerQuestion: parseInt(timePerQuestion) || 0,
      questions: questions.map(q => ({
        ...q,
        options: q.options.map(o => ({ ...o, isCorrect: o.isCorrect ? 1 : 0 }))
      }))
    };

    try {
      if (isEditMode) {
        await updateQuiz(quizId, quizData); // Teste E2E: Edição
      } else {
        await createQuiz(quizData); // Teste E2E: Criação
      }
      Alert.alert("Sucesso!", `Quiz ${isEditMode ? 'atualizado' : 'criado'} com sucesso.`);
      navigation.goBack(); // Volta pro Dashboard
    } catch (error) {
      Alert.alert("Erro ao Salvar", error.response?.data?.error || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <View><Text>Carregando Quiz...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Título do Quiz</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Tempo por Pergunta (em segundos, 0 = sem tempo)</Text>
      <TextInput style={styles.input} value={timePerQuestion} onChangeText={setTimePerQuestion} keyboardType="numeric" />

      {questions.map((q, qIndex) => (
        <View key={qIndex} style={styles.questionBox}>
          <Text style={styles.label}>Pergunta {qIndex + 1}</Text>
          <TextInput
            style={styles.input}
            placeholder="Texto da pergunta"
            value={q.questionText}
            onChangeText={(text) => handleQuestionChange(text, qIndex)}
          />
          
          <Text style={styles.label}>Alternativas:</Text>
          {q.options.map((o, oIndex) => (
            <View key={oIndex} style={styles.optionContainer}>
              <TextInput
                style={styles.optionInput}
                placeholder={`Alternativa ${oIndex + 1}`}
                value={o.optionText}
                onChangeText={(text) => handleOptionChange(text, qIndex, oIndex)}
              />
              {/* Teste "Seleção de Alternativa Correta" (Switch) */}
              <Text>Correta?</Text>
              <Switch
                value={o.isCorrect}
                onValueChange={() => handleSetCorrect(qIndex, oIndex)}
              />
            </View>
          ))}
          <Button title="Adicionar Alternativa" onPress={() => addOption(qIndex)} />
        </View>
      ))}

      <Button title="Adicionar Pergunta" onPress={addQuestion} />

      <Button
        title={loading ? "Salvando..." : (isEditMode ? "Atualizar Quiz" : "Salvar Quiz")}
        onPress={handleSave}
        disabled={!isFormValid() || loading} // Teste "Estado do Botão"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5, marginBottom: 10 },
  questionBox: { borderWidth: 1, borderColor: '#007bff', padding: 10, borderRadius: 5, marginVertical: 10 },
  optionContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  optionInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 5, marginRight: 10 },
});