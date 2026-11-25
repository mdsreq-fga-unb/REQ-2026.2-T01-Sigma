/** Move o foco para o primeiro campo inválido dentro do formulário. */
export function focarPrimeiroErro(form: HTMLFormElement | null, seletorPreferido?: string): void {
  if (!form) return;
  if (seletorPreferido) {
    const preferido = form.querySelector<HTMLElement>(seletorPreferido);
    if (preferido) {
      preferido.focus();
      preferido.scrollIntoView?.({ block: "center" });
      return;
    }
  }
  const invalido = form.querySelector<HTMLElement>(
    '[aria-invalid="true"], [data-erro="true"], input:invalid, select:invalid, textarea:invalid',
  );
  if (invalido) {
    invalido.focus();
    invalido.scrollIntoView?.({ block: "center" });
  }
}