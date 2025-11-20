import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, Button, StyleSheet, 
  ScrollView, Alert, Switch, Platform, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { COLORS, SIZING, FONTS} from '../constants/theme';
import { getQuizDetails, createQuiz, updateQuiz, getAllFolders } from '../services/api';

const newQuestionTemplate = () => ({
  questionText: '',
  options: [
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]
});

export default function CreateEditQuizScreen({ route, navigation }) {
  const { quizId } = route.params || {};
  const isEditMode = !!quizId;

  const [title, setTitle] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState('0');
  const [questions, setQuestions] = useState([newQuestionTemplate()]);
  const [loading, setLoading] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);

  useEffect(() => {
    getAllFolders()
      .then(response => setAllFolders(response.data))
      .catch(err => console.error("Erro pastas", err));

    if (isEditMode) {
      setLoading(true);
      getQuizDetails(quizId)
        .then(response => {
          const quiz = response.data;
          setTitle(quiz.title);
          setTimePerQuestion(quiz.timePerQuestion.toString());
          
          // Carrega as perguntas e converte isCorrect (0/1) para boolean
          setQuestions(quiz.questions.map(q => ({
            ...q,
            options: q.options.map(o => ({ ...o, isCorrect: !!o.isCorrect }))
          })));
          
          // Carrega as pastas já selecionadas
          setSelectedFolderIds(quiz.folderIds || []); 
        })
        .catch(err => Alert.alert("Erro", "Não foi possível carregar."))
        .finally(() => setLoading(false));
    }
  }, [quizId, isEditMode]);

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

  const handleSetCorrect = (qIndex, oIndex) => {
    const newQuestions = [...questions];
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

  const toggleFolderSelection = (folderId) => {
    setSelectedFolderIds(prevIds => {
      if (prevIds.includes(folderId)) return prevIds.filter(id => id !== folderId);
      return [...prevIds, folderId];
    });
  };

  const isFormValid = () => {
    if (!title.trim()) return false;
    if (questions.length === 0) return false;
    for (const q of questions) {
      if (!q.questionText.trim()) return false;
      if (q.options.length < 2) return false;
      if (!q.options.some(o => o.isCorrect)) return false;
      for (const o of q.options) {
        if (!o.optionText.trim()) return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      Alert.alert("Inválido", "Preencha todos os campos e marque as respostas corretas.");
      return;
    }
    
    setLoading(true);
    
    // === CORREÇÃO AQUI ===
    const quizData = {
      title,
      timePerQuestion: parseInt(timePerQuestion) || 0,
      // folderIds DEVE estar na raiz do objeto, não dentro de questions
      folderIds: selectedFolderIds, 
      questions: questions.map(q => ({
        ...q,
        options: q.options.map(o => ({ ...o, isCorrect: o.isCorrect ? 1 : 0 }))
      }))
    };
    // =====================

    try {
      if (isEditMode) {
        await updateQuiz(quizId, quizData);
      } else {
        await createQuiz(quizData);
      }
      Alert.alert("Sucesso!", "Quiz salvo com sucesso.");
      navigation.goBack(); 
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <View><Text>Carregando...</Text></View>;

  return (
    <View style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.label}>Título do Quiz</Text>
        <TextInput 
          testID="quiz-title" 
          style={styles.input} 
          value={title} 
          onChangeText={setTitle} 
        />

        <Text style={styles.label}>Tempo por Pergunta (s)</Text>
        <TextInput  
          testID="quiz-time" 
          style={styles.input} 
          value={timePerQuestion} 
          onChangeText={setTimePerQuestion} 
          keyboardType="numeric" 
        />

        <Text style={styles.label}>Adicionar às Pastas:</Text>
        <View style={styles.folderContainer}>
          {allFolders.length === 0 ? (
             <Text style={{color: '#888', padding: 10}}>Nenhuma pasta criada. Crie pastas no Dashboard.</Text>
          ) : (
            allFolders.map(folder => (
                <View key={folder.id} style={styles.optionContainer}>
                  <Text style={{flex: 1, ...FONTS.body}}>{folder.name}</Text>
                  <Switch
                    value={selectedFolderIds.includes(folder.id)}
                    onValueChange={() => toggleFolderSelection(folder.id)}
                    // Cores para facilitar visualização
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={selectedFolderIds.includes(folder.id) ? "#007bff" : "#f4f3f4"}
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
                <Text style={{marginRight: 5}}>Correta?</Text>
                <Switch
                  value={o.isCorrect}
                  onValueChange={() => handleSetCorrect(qIndex, oIndex)}
                />
              </View>
            ))}
            <Button title="Adicionar Alternativa" onPress={() => addOption(qIndex)} />
          </View>
        ))}
        
        <View style={{marginBottom: 10}}>
           <Button title="Adicionar Pergunta" onPress={addQuestion} />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, (!isFormValid() || loading) && styles.disabledButton]}
          disabled={!isFormValid() || loading}
        >
           {loading ? (
             <ActivityIndicator color="#fff" />
           ) : (
             <Text style={styles.saveButtonText}>
               {isEditMode ? "Atualizar Quiz" : "Salvar Quiz"}
             </Text>
           )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    ...Platform.select({
      web: { height: '100vh' }
    })
  },
  scrollContent: {
    padding: SIZING.padding, 
    paddingBottom: 100,
  },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5, marginBottom: 10 },
  questionBox: { borderWidth: 1, borderColor: '#007bff', padding: 10, borderRadius: 5, marginVertical: 10 },
  optionContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  optionInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 5, marginRight: 10 },
  folderContainer: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: COLORS.primary || '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    cursor: 'pointer'
  },
  disabledButton: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});