/** Leva o foco ao primeiro campo marcado como inválido dentro do formulário (FE01). */
export function focarPrimeiroErro(form: HTMLElement | null): void {
  // Espera o React aplicar `aria-invalid` antes de procurar o campo.
  requestAnimationFrame(() => {
    const invalido = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!invalido) return;
    const alvo = invalido.matches("fieldset")
      ? invalido.querySelector<HTMLElement>("input:not([disabled]), select, button")
      : invalido;
    alvo?.focus();
  });
}
