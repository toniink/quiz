// src/screens/CreateEditQuizScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Switch, Platform } from 'react-native';
import { COLORS, SIZING, FONTS} from '../constants/theme';
import { getQuizDetails, createQuiz, updateQuiz, getAllFolders } from '../services/api';

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

  const [allFolders, setAllFolders] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);

  // Teste de Componente: "Preenchimento para Edição"
useEffect(() => {
    // 1. Busca TODAS as pastas do usuário para exibir a lista
    getAllFolders()
      .then(response => {
        setAllFolders(response.data);
      })
      .catch(err => {
        console.error("Não foi possível carregar a lista de pastas", err);
      });

    // 2. Se estiver editando, carrega os dados do quiz
    if (isEditMode) {
      setLoading(true);
      getQuizDetails(quizId)
        .then(response => {
          const quiz = response.data;
          setTitle(quiz.title);
          setTimePerQuestion(quiz.timePerQuestion.toString());
          // ... (lógica de formattedQuestions) ...
          setQuestions(formattedQuestions);
          
          // NOVA LÓGICA: Define as pastas que já estão selecionadas
          setSelectedFolderIds(quiz.folderIds || []); 
        })
        .catch(err => Alert.alert("Erro", "Não foi possível carregar o quiz."))
        .finally(() => setLoading(false));
    }
  }, [quizId, isEditMode]); // Adicione isEditMode ao array de dependência

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

// NOVA FUNÇÃO: Adiciona ou remove um ID da lista de selecionados
  const toggleFolderSelection = (folderId) => {
    setSelectedFolderIds(prevIds => {
      if (prevIds.includes(folderId)) {
        // Se já está, remove
        return prevIds.filter(id => id !== folderId);
      } else {
        // Se não está, adiciona
        return [...prevIds, folderId];
      }
    });
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
        options: q.options.map(o => ({ ...o, isCorrect: o.isCorrect ? 1 : 0 })),
        folderIds: selectedFolderIds
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
    <View style={styles.safeArea}>
      
      <ScrollView style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      
      >
        <Text style={styles.label}>Título do Quiz</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        <Text style={styles.label}>Tempo por Pergunta (em segundos, 0 = sem tempo)</Text>
        <TextInput style={styles.input} value={timePerQuestion} onChangeText={setTimePerQuestion} keyboardType="numeric" />
        <Text style={styles.label}>Adicionar às Pastas:</Text>
        <View style={styles.folderContainer}>
          {loading ? (
            <Text>Carregando pastas...</Text>
          ) : allFolders.length === 0 ? (
            <Text style={styles.emptyText}>Você ainda não criou nenhuma pasta.</Text>
          ) : (
            allFolders.map(folder => (
              <View key={folder.id} style={styles.optionContainer}>
                <Text style={{flex: 1, ...FONTS.body}}>{folder.name}</Text>
                <Switch
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                  value={selectedFolderIds.includes(folder.id)}
                  onValueChange={() => toggleFolderSelection(folder.id)}
                />
              </View>
            ))
          )}
        </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scrollView: {
    flex:1,
    ...Platform.select({
    web: {
      maxHeight: '100vh'
    }
  })
  },
  scrollContent: {
    padding: SIZING.padding, 
    paddingBottom: 90,
  },
  container: {
    flex: 1,
    padding: 10
  },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5, marginBottom: 10 },
  questionBox: { borderWidth: 1, borderColor: '#007bff', padding: 10, borderRadius: 5, marginVertical: 10 },
  optionContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  optionInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 5, marginRight: 10 },
  folderContainer: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZING.radius,
    padding: SIZING.padding / 2,
    marginBottom: SIZING.margin,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.secondary,
    textAlign: 'center',
    padding: SIZING.padding,
  },
});