// src/utils/validators.js

/**
 * Valida se o formulário de Quiz está pronto para salvar.
 * Regras:
 * 1. Título não pode ser vazio.
 * 2. Deve ter perguntas.
 * 3. Cada pergunta deve ter texto.
 * 4. Cada pergunta deve ter pelo menos 2 opções.
 * 5. Pelo menos uma opção deve ser a correta.
 * 6. As opções não podem estar vazias.
 */
export const validateQuizForm = (title, questions) => {
  // 1. Título
  if (!title || !title.trim()) return { isValid: false, error: "O título é obrigatório." };

  // 2. Perguntas existem
  if (!questions || questions.length === 0) return { isValid: false, error: "Adicione pelo menos uma pergunta." };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // 3. Texto da pergunta
    if (!q.questionText || !q.questionText.trim()) {
      return { isValid: false, error: `A pergunta ${i + 1} está sem texto.` };
    }

    // 4. Mínimo de opções
    if (!q.options || q.options.length < 2) {
      return { isValid: false, error: `A pergunta ${i + 1} precisa de pelo menos 2 alternativas.` };
    }

    // 5. Alternativa Correta
    const hasCorrect = q.options.some(o => o.isCorrect);
    if (!hasCorrect) {
      return { isValid: false, error: `Marque a resposta correta na pergunta ${i + 1}.` };
    }

    // 6. Texto das opções
    const emptyOption = q.options.some(o => !o.optionText || !o.optionText.trim());
    if (emptyOption) {
      return { isValid: false, error: `Preencha todas as alternativas na pergunta ${i + 1}.` };
    }
  }

  return { isValid: true };
};