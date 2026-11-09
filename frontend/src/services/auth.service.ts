import type { Credenciais, Perfil, Usuario } from "@/types";
import { api, LOGIN_TIMEOUT_MS } from "./api";
import { definirTokenSessao, removerTokenSessao } from "@/lib/sessao";

interface BackendLoginResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}

interface BackendUserResponse {
  id: number | string;
  nome: string;
  email: string;
  is_Admin?: boolean;
  perfil?: Perfil;
  ativo: boolean;
  criadoEm?: string;
  criadoPor?: string | null;
}

type LoginResponse = BackendLoginResponse &
  Partial<Omit<Usuario, "id">> & { id?: number | string; is_Admin?: boolean };

function normalizarUsuario(data: BackendUserResponse): Usuario {
  return {
    id: String(data.id),
    nome: data.nome,
    email: data.email,
    perfil: data.perfil ?? (data.is_Admin ? "ADMINISTRADOR" : "USUARIO"),
    ativo: data.ativo,
    criadoEm: data.criadoEm ?? new Date().toISOString(),
    criadoPor: data.criadoPor ?? null,
  };
}

function ehUsuario(data: LoginResponse): data is BackendUserResponse {
  return (
    (typeof data.id === "string" || typeof data.id === "number") &&
    typeof data.nome === "string" &&
    typeof data.email === "string" &&
    typeof data.ativo === "boolean"
  );
}

export async function login(credenciais: Credenciais): Promise<Usuario> {
  const { data } = await api.post<LoginResponse>("/auth/login", credenciais, { timeout: LOGIN_TIMEOUT_MS });

  if (data.access_token) {
    definirTokenSessao(data.access_token);
    return await sessaoAtual();
  }

  if (!ehUsuario(data)) {
    throw new Error("Resposta de login inválida.");
  }
  return normalizarUsuario(data);
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    removerTokenSessao();
  }
}

export async function sessaoAtual(): Promise<Usuario> {
  const { data } = await api.get<BackendUserResponse>("/auth/me");
  return normalizarUsuario(data);
}
