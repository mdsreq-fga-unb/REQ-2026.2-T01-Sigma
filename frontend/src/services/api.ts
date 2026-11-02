import axios, { AxiosError } from "axios";
import type { ApiError, ApiErrorCode } from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // sessão em cookie httpOnly
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/** RNF05: o login deve responder em menos de 2 s; acima disso aciona o FE03 do UC01. */
export const LOGIN_TIMEOUT_MS = 2000;

// Rotas em que um 401 é uma resposta esperada e não deve redirecionar para o login.
const ROTAS_SEM_REDIRECT_401 = ["/auth/login"];

function paraApiError(error: AxiosError<{ detail?: { code?: ApiErrorCode; message?: string } }>): ApiError {
  // Timeout, servidor fora do ar, CORS etc.: não há resposta HTTP.
  if (!error.response) {
    return { status: null, code: "FALHA_CONEXAO" };
  }

  const { status, data } = error.response;
  const detail = data?.detail;

  if (detail && typeof detail === "object" && detail.code) {
    return { status, code: detail.code, message: detail.message };
  }
  if (status >= 500) return { status, code: "FALHA_CONEXAO" };
  if (status === 401) return { status, code: "NAO_AUTENTICADO" };
  if (status === 403) return { status, code: "SEM_PERMISSAO" };
  return { status, code: "ERRO_DESCONHECIDO" };
}

api.interceptors.response.use(
  (res) => res,
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
      window.location.replace("/login");
    }

    return Promise.reject(apiError);
  },
);

export function isApiError(value: unknown): value is ApiError {
  return typeof value === "object" && value !== null && "code" in value && "status" in value;
}
