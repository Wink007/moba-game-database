/**
 * Глобальний LIFO-стек обробників Android back button.
 * Коли відкривається overlay — він pushує свій close-handler.
 * Коли закривається — автоматично видаляється через useBackHandler.
 * index.tsx викликає callTopBackHandler() перед стандартною навігацією.
 */
const stack: Array<() => void> = [];

export function pushBackHandler(handler: () => void): void {
  stack.push(handler);
}

export function popBackHandler(handler: () => void): void {
  const idx = stack.lastIndexOf(handler);
  if (idx !== -1) stack.splice(idx, 1);
}

/** Повертає true і викликає верхній handler якщо стек непустий */
export function callTopBackHandler(): boolean {
  if (stack.length === 0) return false;
  const handler = stack[stack.length - 1];
  handler();
  return true;
}
