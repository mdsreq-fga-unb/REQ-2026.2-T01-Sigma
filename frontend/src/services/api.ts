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

// Injeta o token Bearer em requisições autenticadas.
api.interceptors.request.use((config) => {
  const token = obterTokenSessao();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type CorpoErro = { detail?: string | { code?: ApiErrorCode; message?: string } };

function paraApiError(error: AxiosError<CorpoErro>): ApiError {
  // Timeout, servidor fora do ar, CORS etc.: não há resposta HTTP.
  if (!error.response) {
    return { status: null, code: "FALHA_CONEXAO" };
  }

  const { status, data, config } = error.response;
  const detail = data?.detail;

  // Formato estruturado { code, message } (mock ou extensões futuras do backend).
  if (detail && typeof detail === "object" && !Array.isArray(detail) && detail.code) {
    return { status, code: detail.code, message: detail.message };
  }

  // FastAPI padrão: `detail` é uma string (ou lista de erros de validação no 422).
  const message = typeof detail === "string" ? detail : undefined;
  const ehLogin = (config?.url ?? "").includes("/auth/login");

  if (status === 401) return { status, code: ehLogin ? "CREDENCIAIS_INVALIDAS" : "NAO_AUTENTICADO", message };
  if (status === 423) return { status, code: "CONTA_BLOQUEADA", message };
  if (status === 403) return { status, code: ehLogin ? "CONTA_INATIVA" : "SEM_PERMISSAO", message };
  if (status === 404) return { status, code: "NAO_ENCONTRADO", message };
  if (status >= 500) return { status, code: "FALHA_CONEXAO", message };
  return { status, code: "ERRO_DESCONHECIDO", message };
}

api.interceptors.response.use(
  (res) => {
    // RN17: o backend envia um token renovado a cada requisição autenticada válida.
    const renovado = res.headers["x-renewed-token"] as string | undefined;
    if (renovado) definirTokenSessao(renovado);
    return res;
  },
  (error: AxiosError) => {
    const apiError = paraApiError(error as AxiosError<CorpoErro>);

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
