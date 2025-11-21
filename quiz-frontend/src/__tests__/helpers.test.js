import { normalizeText, toggleIdInList, calculatePercentage, getFeedbackMessage } from '../utils/helpers';

describe('Testes Unitários - Funções Auxiliares (Helpers)', () => {

  describe('Função: normalizeText (Pesquisa)', () => {
    it('Deve remover acentos e converter para minúsculas', () => {
      const entrada = "Matemática Básica";
      const esperado = "matematica basica";
      expect(normalizeText(entrada)).toBe(esperado);
    });

    it('Deve lidar com strings vazias', () => {
      expect(normalizeText("")).toBe("");
      expect(normalizeText(null)).toBe("");
    });

    it('Deve manter números e caracteres especiais não acentuados', () => {
      const entrada = "Quiz 100% Prático!";
      const esperado = "quiz 100% pratico!";
      expect(normalizeText(entrada)).toBe(esperado);
    });
  });

  describe('Função: toggleIdInList (Seleção Múltipla)', () => {
    it('Deve ADICIONAR um ID se ele não estiver na lista', () => {
      const listaAtual = [1, 2];
      const idParaAdicionar = 3;
      const novaLista = toggleIdInList(listaAtual, idParaAdicionar);
      
      expect(novaLista).toHaveLength(3);
      expect(novaLista).toContain(3);
    });

    it('Deve REMOVER um ID se ele já estiver na lista', () => {
      const listaAtual = [1, 2, 3];
      const idParaRemover = 2;
      const novaLista = toggleIdInList(listaAtual, idParaRemover);
      
      expect(novaLista).toHaveLength(2);
      expect(novaLista).not.toContain(2);
      expect(novaLista).toEqual([1, 3]); // Verifica ordem e integridade
    });
  });

  describe('Função: Lógica de Resultados', () => {
    it('Deve calcular a porcentagem corretamente', () => {
      expect(calculatePercentage(5, 10)).toBe(50);
      expect(calculatePercentage(3, 4)).toBe(75);
      expect(calculatePercentage(0, 10)).toBe(0);
    });

    it('Deve retornar mensagem de sucesso para notas altas', () => {
      expect(getFeedbackMessage(90)).toContain("Excelente");
      expect(getFeedbackMessage(80)).toContain("Excelente");
    });

    it('Deve retornar mensagem de incentivo para notas baixas', () => {
      expect(getFeedbackMessage(40)).toContain("Continue a estudar");
    });
  });

});