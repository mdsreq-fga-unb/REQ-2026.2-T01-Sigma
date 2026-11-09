import axios, { AxiosError } from "axios";
import type { ApiError, ApiErrorCode } from "@/types";
import { definirTokenSessao, obterTokenSessao, removerTokenSessao } from "@/lib/sessao";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/** RNF05: o login deve responder em menos de 2 s; acima disso aciona o FE03 do UC01. */
export const LOGIN_TIMEOUT_MS = 2000;

// Rotas em que um 401 é uma resposta esperada e não deve redirecionar para o login.
const ROTAS_SEM_REDIRECT_401 = ["/auth/login"];

api.interceptors.request.use((config) => {
  const token = obterTokenSessao();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function paraApiError(
  error: AxiosError<{ detail?: string | { code?: ApiErrorCode; message?: string } }>,
): ApiError {
  // Timeout, servidor fora do ar, CORS etc.: não há resposta HTTP.
  if (!error.response) {
    return { status: null, code: "FALHA_CONEXAO" };
  }

  const { status, data, config } = error.response;
  const detail = data?.detail;

  if (detail && typeof detail === "object" && !Array.isArray(detail) && detail.code) {
    return { status, code: detail.code, message: detail.message };
  }
  const message = typeof detail === "string" ? detail : undefined;
  const url = config?.url ?? "";

  if (status === 401) {
    const code: ApiErrorCode = url.includes("/auth/login") ? "CREDENCIAIS_INVALIDAS" : "NAO_AUTENTICADO";
    return { status, code, message };
  }
  if (status === 423) return { status, code: "CONTA_BLOQUEADA", message };
  if (status === 403) {
    const code: ApiErrorCode = url.includes("/auth/login") ? "CONTA_INATIVA" : "SEM_PERMISSAO";
    return { status, code, message };
  }
  if (status >= 500) return { status, code: "FALHA_CONEXAO", message };
  return { status, code: "ERRO_DESCONHECIDO", message };
}

api.interceptors.response.use(
  (res) => {
    const renewed = res.headers["x-renewed-token"] as string | undefined;
    if (renewed) definirTokenSessao(renewed);
    return res;
  },
  (error: AxiosError) => {
    const apiError = paraApiError(error as AxiosError<never>);

    // FE02 / RNF02: sessão ausente ou expirada → volta para o login.
    const url = error.config?.url ?? "";
    if (
      apiError.status === 401 &&
      typeof window !== "undefined" &&
      !ROTAS_SEM_REDIRECT_401.some((rota) => url.endsWith(rota)) &&
      window.location.pathname !== "/login"
    ) {
      removerTokenSessao();
      window.location.replace("/login");
    }

    return Promise.reject(apiError);
  },
);

export function isApiError(value: unknown): value is ApiError {
  return typeof value === "object" && value !== null && "code" in value && "status" in value;
}
