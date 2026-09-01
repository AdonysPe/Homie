/**
 * Lleva al usuario a una sección y deja el foco ahí,
 * para que el teclado siga la misma ruta que el scroll.
 */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const focusable = target.querySelector<HTMLElement>('[data-autofocus], input, button, [tabindex]');
  window.setTimeout(() => focusable?.focus({ preventScroll: true }), 520);
}
