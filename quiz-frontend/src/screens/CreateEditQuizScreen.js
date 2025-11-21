import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, 
  ScrollView, Alert, Switch, Platform, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZING, FONTS } from '../constants/theme';
import { getQuizDetails, createQuiz, updateQuiz, getAllFolders } from '../services/api';

const newQuestionTemplate = () => ({
  questionText: '',
  options: [
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]
});

export default function CreateEditQuizScreen({ route, navigation }) {
  const { colors } = useTheme(); 
  const { quizId } = route.params || {};
  const isEditMode = !!quizId;

  const [title, setTitle] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState('0');
  const [questions, setQuestions] = useState([newQuestionTemplate()]);
  const [loading, setLoading] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  
  // NOVO ESTADO: Texto da pesquisa de pastas
  const [folderSearch, setFolderSearch] = useState('');

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
          
          setQuestions(quiz.questions.map(q => ({
            ...q,
            options: q.options.map(o => ({ ...o, isCorrect: !!o.isCorrect }))
          })));
          
          setSelectedFolderIds(quiz.folderIds || []); 
        })
        .catch(err => Alert.alert("Erro", "Não foi possível carregar."))
        .finally(() => setLoading(false));
    }
  }, [quizId, isEditMode]);

  // Filtra as pastas baseado na pesquisa (Case Insensitive)
  const filteredFolders = allFolders.filter(f => 
    f.name.toLowerCase().includes(folderSearch.toLowerCase())
  );

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

  const removeQuestion = (index) => {
      if (questions.length === 1) return;
      const newQ = [...questions];
      newQ.splice(index, 1);
      setQuestions(newQ);
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
    
    const quizData = {
      title,
      timePerQuestion: parseInt(timePerQuestion) || 0,
      folderIds: selectedFolderIds, 
      questions: questions.map(q => ({
        ...q,
        options: q.options.map(o => ({ ...o, isCorrect: o.isCorrect ? 1 : 0 }))
      }))
    };

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

  if (loading && isEditMode) {
      return (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{color: colors.text, marginTop: 10}}>Carregando Quiz...</Text>
          </View>
      );
  }

  const cardStyle = [styles.card, { backgroundColor: colors.card, borderColor: colors.border }];
  const labelStyle = [styles.label, { color: colors.text, marginBottom: 0 }]; // Removi margem inferior pois ajustarei no layout
  const subLabelStyle = [styles.label, { color: colors.subText, fontSize: 14 }];
  
  const inputStyle = [
      styles.input, 
      { 
          backgroundColor: colors.inputBg, 
          color: colors.text, 
          borderColor: colors.border 
      }
  ];

  const folderBoxStyle = {
      backgroundColor: colors.inputBg,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      maxHeight: 150,
      padding: 5,
      marginTop: 10
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- DADOS GERAIS --- */}
          <View style={cardStyle}>
              <Text style={[labelStyle, {marginBottom: 8}]}>Título do Quiz</Text>
              <TextInput 
                testID="quiz-title" 
                style={inputStyle} 
                value={title} 
                onChangeText={setTitle} 
                placeholder="Ex: Matemática Básica"
                placeholderTextColor={colors.subText}
              />

              <Text style={[labelStyle, {marginBottom: 8}]}>Tempo por Pergunta (s)</Text>
              <TextInput  
                testID="quiz-time" 
                style={inputStyle} 
                value={timePerQuestion} 
                onChangeText={setTimePerQuestion} 
                keyboardType="numeric" 
                placeholder="0 = Sem tempo"
                placeholderTextColor={colors.subText}
              />
          </View>

          {/* --- SELEÇÃO DE PASTAS (COM PESQUISA) --- */}
          <View style={cardStyle}>
              {/* HEADER DA SECÇÃO COM PESQUISA LADO A LADO */}
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={labelStyle}>Adicionar às Pastas:</Text>
                  
                  {/* Input de Pesquisa Pequeno */}
                  <TextInput 
                    style={[
                        inputStyle, 
                        { 
                            width: '45%', 
                            marginBottom: 0, 
                            paddingVertical: 4, 
                            paddingHorizontal: 10,
                            fontSize: 14,
                            height: 35
                        }
                    ]}
                    placeholder="🔍 Buscar pasta..."
                    placeholderTextColor={colors.subText}
                    value={folderSearch}
                    onChangeText={setFolderSearch}
                  />
              </View>
              
              {allFolders.length === 0 ? (
                 <Text style={{color: colors.subText, padding: 10, fontStyle: 'italic', marginTop: 10}}>
                    Nenhuma pasta criada.
                 </Text>
              ) : (
                <View style={folderBoxStyle}> 
                  <ScrollView 
                    nestedScrollEnabled={true}
                    persistentScrollbar={true}
                    showsVerticalScrollIndicator={true}
                    indicatorStyle={colors.text === '#ffffff' ? 'white' : 'black'}
                  >
                    {filteredFolders.length === 0 ? (
                        <Text style={{color: colors.subText, padding: 10, fontSize: 12}}>Nenhuma pasta encontrada.</Text>
                    ) : (
                        filteredFolders.map(folder => (
                            <View key={folder.id} style={styles.optionRow}>
                            <Text style={{flex: 1, ...FONTS.body, color: colors.text, paddingLeft: 5}}>{folder.name}</Text>
                            <Switch
                                value={selectedFolderIds.includes(folder.id)}
                                onValueChange={() => toggleFolderSelection(folder.id)}
                                trackColor={{ false: "#767577", true: colors.primary }}
                                thumbColor={"#f4f3f4"}
                            />
                            </View>
                        ))
                    )}
                  </ScrollView>
                </View>
              )}
          </View>

          {/* --- PERGUNTAS --- */}
          {questions.map((q, qIndex) => (
            <View key={qIndex} style={[cardStyle, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
              
              <View style={styles.questionHeader}>
                  <Text style={labelStyle}>Pergunta {qIndex + 1}</Text>
                  {questions.length > 1 && (
                      <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                          <Text style={{color: colors.danger, fontWeight: 'bold'}}>Excluir</Text>
                      </TouchableOpacity>
                  )}
              </View>

              <TextInput
                style={inputStyle}
                placeholder="Enunciado da pergunta..."
                placeholderTextColor={colors.subText}
                value={q.questionText}
                onChangeText={(text) => handleQuestionChange(text, qIndex)}
                multiline
              />
        
              <Text style={[subLabelStyle, {marginTop: 10, marginBottom: 5}]}>Alternativas (Marque a correta):</Text>
              
              {q.options.map((o, oIndex) => (
                <View key={oIndex} style={styles.optionRow}>
                  <Switch
                    value={o.isCorrect}
                    onValueChange={() => handleSetCorrect(qIndex, oIndex)}
                    trackColor={{ false: "#767577", true: colors.success }}
                  />
                  <TextInput
                    style={[inputStyle, {flex: 1, marginLeft: 10, marginBottom: 0}]}
                    placeholder={`Opção ${oIndex + 1}`}
                    placeholderTextColor={colors.subText}
                    value={o.optionText}
                    onChangeText={(text) => handleOptionChange(text, qIndex, oIndex)}
                  />
                </View>
              ))}

              <TouchableOpacity 
                  style={{marginTop: 15, alignSelf: 'flex-start'}} 
                  onPress={() => addOption(qIndex)}
              >
                  <Text style={{color: colors.primary, fontWeight: 'bold'}}>+ Adicionar Alternativa</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
              onPress={addQuestion} 
              style={[styles.dashedButton, { borderColor: colors.primary }]}
          >
             <Text style={{color: colors.primary, fontWeight: 'bold', fontSize: 16}}>+ NOVA PERGUNTA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            style={[
                styles.saveButton, 
                { backgroundColor: (!isFormValid() || loading) ? colors.subText : colors.primary }
            ]}
            disabled={!isFormValid() || loading}
          >
             {loading ? (
               <ActivityIndicator color="#fff" />
             ) : (
               <Text style={styles.saveButtonText}>
                 {isEditMode ? "ATUALIZAR QUIZ" : "SALVAR QUIZ"}
               </Text>
             )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    ...Platform.select({
      web: { height: '100vh' }
    })
  },
  loadingContainer: {
      flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: SIZING.padding, 
    paddingBottom: 100,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    ...Platform.select({
        web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        default: { elevation: 2 }
    })
  },
  label: { 
      fontSize: 16, fontWeight: 'bold'
  },
  input: { 
      borderWidth: 1, 
      borderRadius: 8, 
      padding: 12, 
      marginBottom: 15, 
      fontSize: 16 
  },
  questionHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
  },
  optionRow: { 
      flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingVertical: 2
  },
  dashedButton: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      backgroundColor: 'transparent'
  },
  saveButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 50,
    ...Platform.select({
        web: { cursor: 'pointer' }
    })
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1
  }
});