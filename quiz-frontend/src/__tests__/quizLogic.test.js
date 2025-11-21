import { checkAnswer, shuffleArray } from '../utils/quizLogic';

describe('Testes Unitários - Lógica do Jogo (Gameplay)', () => {

  describe('Função: checkAnswer', () => {
    const perguntaMock = {
      id: 1,
      options: [
        { id: 101, isCorrect: false },
        { id: 102, isCorrect: true } // Correta
      ]
    };

    it('Deve retornar TRUE quando o usuário seleciona a opção correta (pelo ID)', () => {
      // Na lógica atual, você pode estar passando o ID ou o objeto. 
      // Ajuste conforme sua implementação do quizLogic.js. 
      // Supondo que quizLogic.js espera (pergunta, idSelecionado):
      const resultado = checkAnswer(perguntaMock, 102);
      expect(resultado).toBe(true);
    });

    it('Deve retornar FALSE quando o usuário seleciona a opção errada', () => {
      const resultado = checkAnswer(perguntaMock, 101);
      expect(resultado).toBe(false);
    });

    it('Deve retornar FALSE se os dados forem inválidos', () => {
      expect(checkAnswer(null, 102)).toBe(false);
      expect(checkAnswer(perguntaMock, null)).toBe(false);
    });
  });

  describe('Função: shuffleArray (Randomização)', () => {
    it('Deve manter todos os elementos originais após embaralhar', () => {
      const arrayOriginal = [1, 2, 3, 4, 5];
      const arrayEmbaralhado = shuffleArray(arrayOriginal);
      
      expect(arrayEmbaralhado).toHaveLength(5);
      // Verifica se cada número original está presente no novo array
      arrayOriginal.forEach(num => {
        expect(arrayEmbaralhado).toContain(num);
      });
    });

    it('Não deve modificar o array original (Imutabilidade)', () => {
      const arrayOriginal = [1, 2, 3];
      const copiaAntes = [...arrayOriginal];
      
      shuffleArray(arrayOriginal);
      
      // O original deve permanecer [1, 2, 3] na mesma ordem
      expect(arrayOriginal).toEqual(copiaAntes);
    });
  });

});