import axios, { AxiosError, isAxiosError, type AxiosResponse } from "axios";
import type { ApiError, ApiErrorCode } from "@/types";
import { definirTokenSessao, obterTokenSessao, removerTokenSessao } from "@/lib/sessao";

export const usandoApiMock = (process.env.NEXT_PUBLIC_API_URL || "/api/mock").includes("/api/mock");
export const usandoBackendReal = !usandoApiMock;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/mock",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/** RNF05: o login deve responder em menos de 2 s; acima disso aciona o FE03 do UC01. */
export const LOGIN_TIMEOUT_MS = 10000;

// Rotas em que um 401 Ã© uma resposta esperada e nÃ£o deve redirecionar para o login.
const ROTAS_SEM_REDIRECT_401 = ["/auth/login"];

// Injeta o token Bearer em requisiÃ§Ãµes autenticadas.
api.interceptors.request.use((config) => {
  const token = obterTokenSessao();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type CorpoErro = {
  detail?: unknown;
  code?: ApiErrorCode;
  message?: string;
};

function extrair422(detail: unknown): { message: string; campos?: Record<string, string> } {
  if (typeof detail === "string" && detail.trim()) return { message: detail.trim() };
  if (!Array.isArray(detail)) return { message: "Os dados informados sÃ£o invÃ¡lidos." };

  const campos: Record<string, string> = {};
  const faltantes = new Set<string>();
  const mensagens: string[] = [];

  for (const item of detail) {
    if (!item || typeof item !== "object") continue;
    const it = item as { msg?: string; loc?: unknown[]; ctx?: { campos?: unknown } };
    const msg = typeof it.msg === "string" ? it.msg : "";

    if (Array.isArray(it.ctx?.campos)) {
      for (const c of it.ctx.campos) if (typeof c === "string" && c) faltantes.add(c);
    }

    const loc = Array.isArray(it.loc) ? it.loc.filter((p) => p !== "body" && p !== "query" && p !== "path").map(String) : [];
    const campo = loc[loc.length - 1];
    if (campo && msg && !campos[campo]) campos[campo] = msg;
    if (msg && !faltantes.size) mensagens.push(msg);
  }

  if (faltantes.size) {
    return {
      message: `Campos obrigatÃ³rios nÃ£o preenchidos: ${[...faltantes].sort().join(", ")}.`,
      campos: Object.keys(campos).length ? campos : undefined,
    };
  }
  if (mensagens.length) return { message: mensagens[0], campos: Object.keys(campos).length ? campos : undefined };
  if (Object.keys(campos).length) return { message: Object.values(campos)[0], campos };
  return { message: "Os dados informados sÃ£o invÃ¡lidos." };
}

async function parseBlobErro(blob: Blob): Promise<unknown> {
  try {
    const text = await blob.text();
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text || null;
    }
  } catch {
    return null;
  }
}

function nomeArquivoDoHeader(contentDisposition?: string | null): string | null {
  if (!contentDisposition) return null;
  const utf = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf?.[1]) {
    try {
      return decodeURIComponent(utf[1]);
    } catch {
      return utf[1];
    }
  }
  const simples = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return simples?.[1] ?? null;
}

export async function baixarArquivo(resposta: AxiosResponse<Blob>, nomeFallback: string): Promise<void> {
  if (typeof window === "undefined") return;
  const nome = nomeArquivoDoHeader(resposta.headers["content-disposition"] as string | undefined) || nomeFallback;
  const blob = resposta.data instanceof Blob ? resposta.data : new Blob([resposta.data as unknown as BlobPart]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

function paraApiError(error: AxiosError<CorpoErro>): ApiError {
  // Timeout, servidor fora do ar, CORS etc.: nÃ£o hÃ¡ resposta HTTP.
  if (!error.response) {
    return { status: null, code: "FALHA_CONEXAO", message: "NÃ£o foi possÃ­vel conectar ao servidor. Verifique sua conexÃ£o e tente novamente." };
  }

  const { status, data, config } = error.response;
  const detail = data?.detail;

  // Formato estruturado { code, message } (mock ou extensÃµes futuras do backend).
  if (detail && typeof detail === "object" && !Array.isArray(detail) && (detail as { code?: unknown }).code) {
    const d = detail as { code?: ApiErrorCode; message?: string };
    if (d.code) return { status, code: d.code, message: d.message, detail };
  }

  // FastAPI padrÃ£o: `detail` Ã© uma string (ou lista de erros de validaÃ§Ã£o no 422).
  const detailString = typeof detail === "string" ? detail : undefined;
  const ehLogin = (config?.url ?? "").includes("/auth/login");

  if (status === 401) return { status, code: ehLogin ? "CREDENCIAIS_INVALIDAS" : "NAO_AUTENTICADO", message: detailString };
  if (status === 423) return { status, code: "CONTA_BLOQUEADA", message: detailString };
  if (status === 403) return { status, code: ehLogin ? "CONTA_INATIVA" : "SEM_PERMISSAO", message: detailString };
  if (status === 404) return { status, code: "NAO_ENCONTRADO", message: detailString ?? "Registro nÃ£o encontrado." };
  if (status === 409) {
    if (/e-?mail/i.test(detailString ?? "")) return { status, code: "EMAIL_EM_USO", message: detailString };
    if (/nis/i.test(detailString ?? "")) return { status, code: "NIS_EM_USO", message: detailString };
    if (/cpf/i.test(detailString ?? "")) return { status, code: "CPF_EM_USO", message: detailString };
    if (/inativ/i.test(detailString ?? "")) return { status, code: "MATRICULA_INATIVA", message: detailString };
    return { status, code: "DADOS_INVALIDOS", message: detailString ?? "NÃ£o foi possÃ­vel concluir a operaÃ§Ã£o por conflito de dados." };
  }
  if (status === 422) {
    const detalheTexto = JSON.stringify(detail ?? "").toLowerCase();
    const info = extrair422(detail ?? data);
    return {
      status,
      code: detalheTexto.includes("senha") ? "SENHA_FORA_PADRAO" : "DADOS_INVALIDOS",
      message: info.message || detailString,
      campos: info.campos,
      detail,
    };
  }
  if (status === 503) {
    return {
      status,
      code: "FALHA_CONEXAO",
      message: detailString ?? "NÃ£o foi possÃ­vel salvar. Tente novamente.",
      detail,
    };
  }
  if (status >= 500) return { status, code: "FALHA_CONEXAO", message: detailString ?? "Erro interno. Tente novamente.", detail };
  return { status, code: "ERRO_DESCONHECIDO", message: detailString, detail };
}

api.interceptors.response.use(
  (res) => {
    // RN17: o backend envia um token renovado a cada requisiÃ§Ã£o autenticada vÃ¡lida.
    const renovado = res.headers["x-renewed-token"] as string | undefined;
    if (renovado) definirTokenSessao(renovado);
    return res;
  },
  async (error: AxiosError<CorpoErro>) => {
    // Quando o PDF/arquivo falha, o corpo do erro pode vir como Blob.
    if (isAxiosError(error) && error.response?.data instanceof Blob && error.config?.responseType === "blob") {
      try {
        (error.response as { data: unknown }).data = await parseBlobErro(error.response.data as Blob);
      } catch {
        // mantÃ©m o blob original
      }
    }

    const apiError = paraApiError(error as AxiosError<CorpoErro>);

    // FE02 / RNF02: sessÃ£o ausente ou expirada â†’ volta para o login.
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