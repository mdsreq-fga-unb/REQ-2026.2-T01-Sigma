export type Perfil = "ADMINISTRADOR" | "USUARIO";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  criadoEm: string; // ISO 8601
  criadoPor: string | null; // nome de quem criou a conta
}

export interface Credenciais {
  email: string;
  senha: string;
}

export interface NovoUsuarioPayload {
  nome: string;
  email: string;
  administrador: boolean;
  senha: string;
}

/**
 * Códigos de erro do contrato com o backend. A API responde no formato do FastAPI:
 * `{ "detail": { "code": "<CODIGO>", "message": "..." } }`.
 */
export type ApiErrorCode =
  | "CREDENCIAIS_INVALIDAS" // UC01 FE01
  | "CONTA_BLOQUEADA" // UC01 FE04 (RN16)
  | "CONTA_INATIVA" // UC01 FE05 (RN18)
  | "NAO_AUTENTICADO" // UC01 FE02
  | "SEM_PERMISSAO" // UC02 – ação restrita a administradores
  | "EMAIL_EM_USO" // UC02 FE01 (RN19)
  | "SENHA_FORA_PADRAO" // UC02 FE04 (RN20)
  | "DADOS_INVALIDOS"
  | "NAO_ENCONTRADO"
  | "FALHA_CONEXAO" // UC01 FE03 / UC02 FE03 (gerado no cliente)
  | "ERRO_DESCONHECIDO";

export interface ApiError {
  status: number | null;
  code: ApiErrorCode;
  message?: string;
}
