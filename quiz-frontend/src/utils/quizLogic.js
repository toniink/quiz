// src/utils/quizLogic.js

/**
 * Teste Unitário 1.1: Verificação de Respostas
 *
 * Função: checkAnswer(question, selectedOptionId)
 * Esta função recebe um objeto de pergunta (que contém a lista de alternativas)
 * e o ID da alternativa selecionada pelo usuário. Ela deve encontrar a alternativa
 * correta dentro da pergunta e comparar com a seleção.
 * * @param {object} question - O objeto da pergunta, ex: 
 * { id: 1, questionText: "...", options: [ { id: 10, isCorrect: 0 }, { id: 11, isCorrect: 1 } ] }
 * @param {number} selectedOptionId - O ID da alternativa que o usuário clicou.
 * @returns {boolean} - True se a resposta estiver correta, false caso contrário.
 */
export const checkAnswer = (question, selectedOptionId) => {
    // Caso de Teste 1.3: Lidar com entradas nulas ou indefinidas
    if (!question || !question.options || selectedOptionId === null || selectedOptionId === undefined) {
      return false;
    }
  
    // Encontra a alternativa que o usuário selecionou
    const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
  
    // Se o usuário selecionou algo que não existe (não deve acontecer, mas é bom verificar)
    if (!selectedOption) {
      return false;
    }
  
    // Caso de Teste 1.1 e 1.2:
    // Retorna true se a alternativa selecionada tiver 'isCorrect' == 1 (ou true)
    // No nosso banco, usamos 1 (true) e 0 (false).
    return !!selectedOption.isCorrect; 
  };
  
  
  /**
   * Teste Unitário 1.2: Randomização da Ordem
   *
   * Função: shuffleArray(array)
   * Esta função implementa o algoritmo Fisher-Yates (ou Knuth Shuffle)
   * para embaralhar um array "in-place" (modificando o original)
   * e também retorna uma nova cópia embaralhada.
   *
   * @param {Array<any>} array - O array a ser embaralhado.
   * @returns {Array<any>} - Um novo array com os mesmos elementos em ordem aleatória.
   */
  export const shuffleArray = (array) => {
    // Caso de Teste 2.1 e 2.2: Retorna um array com o mesmo número de elementos
    // e os mesmos elementos.
    
    // Criamos uma cópia para não modificar o array original (boa prática)
    const newArray = [...array];
    
    let currentIndex = newArray.length;
    let randomIndex;
  
    // Enquanto ainda houver elementos para embaralhar
    while (currentIndex !== 0) {
      // Pega um elemento restante
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // E troca com o elemento atual
      [newArray[currentIndex], newArray[randomIndex]] = [
        newArray[randomIndex], newArray[currentIndex]
      ];
    }
  
    return newArray;
  };
  
