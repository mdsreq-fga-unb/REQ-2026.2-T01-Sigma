/**
 * Cookie em que o token JWT de sessão fica guardado no navegador.
 * O backend real emite o token no corpo do login (não grava cookie httpOnly), então o
 * frontend o salva aqui para que o proxy.ts (checagem otimista) e o Axios (Bearer) o leiam.
 * A validação real acontece na API, que responde 401 quando o token é inválido.
 */
export const SESSION_COOKIE = "sigma_token";

/** RN17: logout automático após 30 minutos sem interação. */
export const TEMPO_INATIVIDADE_MS = 30 * 60 * 1000;

/** Rota inicial após o login (primeiro item do menu). */
export const ROTA_INICIAL = "/alunos";

export function obterTokenSessao(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function definirTokenSessao(token: string, maxAgeSegundos = 60 * 60 * 8): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSegundos}; SameSite=Lax`;
}

export function removerTokenSessao(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/** Aceita apenas caminhos internos para evitar open redirect via ?next=. */
export function destinoSeguro(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return ROTA_INICIAL;
}
