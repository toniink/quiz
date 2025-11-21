// src/utils/helpers.js

/**
 * Remove acentos e transforma em minúsculas para pesquisa.
 * Ex: "Matemática" -> "matematica"
 */
export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

/**
 * Lógica de Seleção Múltipla (Toggle).
 * Se o ID já existe no array, remove. Se não existe, adiciona.
 * Retorna um NOVO array (imutabilidade).
 */
export const toggleIdInList = (currentList, id) => {
  if (currentList.includes(id)) {
    // Remove o ID
    return currentList.filter(item => item !== id);
  } else {
    // Adiciona o ID
    return [...currentList, id];
  }
};

/**
 * Calcula a porcentagem de acertos.
 */
export const calculatePercentage = (score, total) => {
  if (!total || total === 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Define a mensagem de feedback baseada na nota.
 */
export const getFeedbackMessage = (percentage) => {
  if (percentage >= 80) return "Excelente! 🎉";
  if (percentage >= 50) return "Bom trabalho! 👍";
  return "Continue a estudar! 📚";
};