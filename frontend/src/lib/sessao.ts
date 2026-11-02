/**
 * Nome do cookie httpOnly de sessão emitido pela API no login.
 * O proxy.ts só verifica a presença do cookie (checagem otimista);
 * a validação real acontece na API, que responde 401 quando a sessão é inválida.
 */
export const SESSION_COOKIE = "sigma_session";

/** RN17: logout automático após 30 minutos sem interação. */
export const TEMPO_INATIVIDADE_MS = 30 * 60 * 1000;

/** Rota inicial após o login (primeiro item do menu). */
export const ROTA_INICIAL = "/alunos";

/** Aceita apenas caminhos internos para evitar open redirect via ?next=. */
export function destinoSeguro(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return ROTA_INICIAL;
}
