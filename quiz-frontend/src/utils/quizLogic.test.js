import { checkAnswer, shuffleArray } from './quizLogic';

// Teste 1: Verificação de Respostas
describe('Verifiicacao de respostas', () => {
  const mockQuestion = {
    id: 1,
    questionText: 'Qual a cor do céu?',
    options: [
      { id: 10, optionText: 'Vermelho', isCorrect: 0 },
      { id: 11, optionText: 'Azul', isCorrect: 1 },
      { id: 12, optionText: 'Verde', isCorrect: 0 },
    ]
  };

  // Caso de Teste 1.1: Deve retornar true se o selectedOptionId for correto
  it('Deve retornar true se a opção for correta', () => {
    // Passamos o ID da opção (11), que é 'Azul' e 'isCorrect: 1'
    expect(checkAnswer(mockQuestion, 11)).toBe(true);
  });

  // Caso de Teste 1.2: Deve retornar false se o selectedOptionId for incorreto
  it('Deve retornar false para a resposta incorreta', () => {
    expect(checkAnswer(mockQuestion, 10)).toBe(false);
  });

  // Caso de Teste 1.3: Deve lidar com entradas nulas ou indefinidas
  it('Deve retornar false para respostas null ou indefinidas', () => {
    expect(checkAnswer(null, 11)).toBe(false);
    expect(checkAnswer(mockQuestion, null)).toBe(false);
    expect(checkAnswer(mockQuestion, undefined)).toBe(false);
  });
});

// Teste 2: shuffleArray (Randomização)
describe('Randomização', () => {
  const originalArray = [1, 2, 3, 4, 5];

  // Caso de Teste 2.1: Deve retornar um array com o mesmo número de elementos
  it('Deve retornar um array com o mesmo número de elementos', () => {
    const shuffled = shuffleArray(originalArray);
    expect(shuffled.length).toBe(originalArray.length);
  });

  // Caso de Teste 2.2: Deve conter os mesmos elementos do original
  it('Deve conter os mesmo elementos do original', () => {
    const shuffled = shuffleArray(originalArray);
    // Verifica se todos os elementos originais estão no novo array
    originalArray.forEach(item => {
      expect(shuffled).toContain(item);
    });
    // Verifica se todos os elementos do novo array estavam no original
    shuffled.forEach(item => {
      expect(originalArray).toContain(item);
    });
  });

  // Teste extra: Não deve modificar o array original
  it('Nao deve modificar o array original', () => {
    const originalCopy = [...originalArray];
    shuffleArray(originalArray);
    expect(originalArray).toEqual(originalCopy); // O original deve estar intacto
  });
});