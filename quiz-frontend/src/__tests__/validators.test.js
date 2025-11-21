import { validateQuizForm } from '../utils/validators';

describe('Testes Unitários - Validação de Formulário de Quiz', () => {

  // Mock de uma pergunta válida
  const validQuestion = {
    questionText: "Quanto é 2+2?",
    options: [
      { optionText: "3", isCorrect: false },
      { optionText: "4", isCorrect: true }
    ]
  };

  it('Deve aprovar um formulário válido', () => {
    const resultado = validateQuizForm("Meu Quiz", [validQuestion]);
    expect(resultado.isValid).toBe(true);
  });

  it('Deve reprovar se o título estiver vazio', () => {
    const resultado = validateQuizForm("", [validQuestion]);
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toContain("título");
  });

  it('Deve reprovar se não houver perguntas', () => {
    const resultado = validateQuizForm("Título", []);
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toContain("pelo menos uma pergunta");
  });

  it('Deve reprovar se uma pergunta não tiver texto', () => {
    const badQuestion = { ...validQuestion, questionText: "" };
    const resultado = validateQuizForm("Título", [badQuestion]);
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toContain("sem texto");
  });

  it('Deve reprovar se nenhuma alternativa for marcada como correta', () => {
    const noCorrectOption = {
      questionText: "Texto",
      options: [
        { optionText: "A", isCorrect: false },
        { optionText: "B", isCorrect: false }
      ]
    };
    const resultado = validateQuizForm("Título", [noCorrectOption]);
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toContain("Marque a resposta correta");
  });

});