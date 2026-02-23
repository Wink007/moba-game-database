/**
 * Підсвічує числові показники у тексті: 30%, +65, 2s, 5 seconds, тощо.
 * Обгортає їх у <span class="stat-highlight"> для стилізації.
 */
export const highlightValues = (text: string): string => {
  return text.replace(
    /(\+?\d+(?:\.\d+)?\s*%|\+\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*(?:seconds?|секунд[иа]?|сек\.?|HP|hp|MP|mp|s\b))/g,
    '<span class="stat-highlight">$1</span>'
  );
};
