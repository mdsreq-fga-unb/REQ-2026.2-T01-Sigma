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

export function focarPrimeiroErroApi(form: HTMLFormElement | null, erro: unknown): void {
  if (!form) return;

  const detalhe = typeof erro === "object" && erro !== null && "detail" in erro
    ? (erro as { detail?: unknown }).detail
    : null;
  const itens = Array.isArray(detalhe) ? detalhe : [];
  const campos = itens.flatMap((item) => {
    if (typeof item !== "object" || item === null || !("ctx" in item)) return [];
    const faltantes = (item as { ctx?: { campos?: unknown } }).ctx?.campos;
    return Array.isArray(faltantes) ? faltantes.filter((campo): campo is string => typeof campo === "string") : [];
  });
  const primeiroCampo = campos[0];

  if (primeiroCampo) {
    const parteFinal = primeiroCampo.split(/\s*[–—-]\s*/).pop()?.trim() ?? primeiroCampo;
    const normalizar = (valor: string) =>
      valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
    const textoNormalizado = normalizar(parteFinal);
    const termo = textoNormalizado === "estado"
      ? "uf"
      : textoNormalizado.includes("resposta")
        ? "possui outras propriedades"
        : textoNormalizado.includes("quem cedeu")
          ? "cedido por"
        : textoNormalizado.includes("pelo menos um membro")
          ? "adicionar membro"
          : textoNormalizado;
    const primeiraPalavra = termo.split(/\s+/)[0];
    const rotulos = Array.from(form.querySelectorAll<HTMLLabelElement>("label"));
    const rotulo = rotulos.find((item) => normalizar(item.textContent ?? "").includes(termo))
      ?? rotulos.find((item) => normalizar(item.textContent ?? "").includes(primeiraPalavra));

    if (rotulo?.control instanceof HTMLElement) {
      rotulo.control.focus();
      rotulo.control.scrollIntoView?.({ block: "center" });
      return;
    }

    if (termo === "adicionar membro") {
      const botao = Array.from(form.querySelectorAll<HTMLButtonElement>("button"))
        .find((item) => normalizar(item.textContent ?? "").includes(termo));
      if (botao) {
        botao.focus();
        botao.scrollIntoView?.({ block: "center" });
        return;
      }
    }
  }

  const camposComNome = Array.from(form.querySelectorAll<HTMLElement>("[name]"));
  const erros = typeof erro === "object" && erro !== null && "campos" in erro
    ? (erro as { campos?: Record<string, string> }).campos
    : undefined;
  const nome = erros ? Object.keys(erros)[0] : undefined;
  const campo = nome ? camposComNome.find((item) => item.getAttribute("name") === nome) : undefined;
  if (campo) {
    campo.focus();
    campo.scrollIntoView?.({ block: "center" });
    return;
  }

  focarPrimeiroErro(form);
}
