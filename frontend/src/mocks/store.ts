import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessao";
import type { ApiErrorCode, Matricula, StatusEstrutura, Usuario } from "@/types";

/*
 * Mock em memória da API do SIGMA, usado enquanto o backend FastAPI não expõe
 * os endpoints de autenticação e usuários. Reproduz o contrato esperado
 * (rotas, status HTTP e códigos de erro) para exercitar os fluxos do UC01/UC02.
 * Os dados são perdidos ao reiniciar o servidor de desenvolvimento.
 */

interface UsuarioRegistro extends Usuario {
  senha: string;
}

interface Tentativas {
  falhas: number;
  bloqueadoAte: number | null;
}

export interface EtapaRegistro {
  id: string;
  nome: string;
  status: StatusEstrutura;
}

export interface TurmaRegistro {
  id: string;
  nome: string;
  etapaId: string;
  quantidadeAlunos: number;
  status: StatusEstrutura;
}

interface MockStore {
  usuarios: UsuarioRegistro[];
  matriculas: Matricula[];
  etapas: EtapaRegistro[];
  turmas: TurmaRegistro[];
  sessoes: Map<string, string>; // token → id do usuário
  tentativas: Map<string, Tentativas>; // e-mail → tentativas de login
}

export const SENHA_PADRAO_MOCK = "Sigma@2026";
const MAX_TENTATIVAS = 5; // RN16
const BLOQUEIO_MS = 15 * 60 * 1000;
const LATENCIA_MS = 400;

function seed(): MockStore {
  const usuarios: UsuarioRegistro[] = [
    {
      id: "u1",
      nome: "Secretaria",
      email: "secretaria@exemplo.com",
      perfil: "ADMINISTRADOR",
      ativo: true,
      criadoEm: "2026-02-02T12:00:00Z",
      criadoPor: null,
      senha: SENHA_PADRAO_MOCK,
    },
    {
      id: "u2",
      nome: "Secretária 2",
      email: "secretaria2@exemplo.com",
      perfil: "USUARIO",
      ativo: true,
      criadoEm: "2026-02-02T12:00:00Z",
      criadoPor: "Secretaria",
      senha: SENHA_PADRAO_MOCK,
    },
    {
      id: "u3",
      nome: "Coordenação",
      email: "coordenacao@exemplo.com",
      perfil: "ADMINISTRADOR",
      ativo: true,
      criadoEm: "2026-03-10T12:00:00Z",
      criadoPor: "Secretaria",
      senha: SENHA_PADRAO_MOCK,
    },
    {
      id: "u4",
      nome: "Ex-colaboradora",
      email: "inativa@exemplo.com",
      perfil: "USUARIO",
      ativo: false,
      criadoEm: "2026-03-15T12:00:00Z",
      criadoPor: "Coordenação",
      senha: SENHA_PADRAO_MOCK,
    },
  ];
  return {
    usuarios,
    matriculas: [],
    etapas: seedEtapas(),
    turmas: seedTurmas(),
    sessoes: new Map(),
    tentativas: new Map(),
  };
}

// Dados de exemplo do protótipo (UC06 – Turmas e etapas).
function seedEtapas(): EtapaRegistro[] {
  return [
    { id: "e1", nome: "Berçário", status: "ATIVO" },
    { id: "e2", nome: "Maternal I", status: "ATIVO" },
    { id: "e3", nome: "Maternal II", status: "ATIVO" },
    { id: "e4", nome: "Pré-escola I", status: "INATIVO" },
  ];
}

function seedTurmas(): TurmaRegistro[] {
  return [
    { id: "t1", nome: "Turma A", etapaId: "e1", quantidadeAlunos: 18, status: "ATIVO" },
    { id: "t2", nome: "Turma B", etapaId: "e2", quantidadeAlunos: 22, status: "ATIVO" },
    { id: "t3", nome: "Turma C", etapaId: "e3", quantidadeAlunos: 20, status: "ATIVO" },
    { id: "t4", nome: "Turma D (2025)", etapaId: "e2", quantidadeAlunos: 0, status: "INATIVO" },
  ];
}

// globalThis mantém o estado entre recarregamentos de módulo do `next dev`.
const globalMock = globalThis as typeof globalThis & { __sigmaMock?: MockStore };
export const store: MockStore = (globalMock.__sigmaMock ??= seed());
store.matriculas ??= [];
store.etapas ??= seedEtapas();
store.turmas ??= seedTurmas();

export function mockHabilitado(): boolean {
  return process.env.SIGMA_API_MOCK === "true";
}

export function esperar(ms = LATENCIA_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function publico({ senha: _senha, ...usuario }: UsuarioRegistro): Usuario {
  return usuario;
}

export function erro(status: number, code: ApiErrorCode, message?: string) {
  return NextResponse.json({ detail: { code, message } }, { status });
}

export function naoEncontrado() {
  return new NextResponse(null, { status: 404 });
}

/** Retorna o usuário da sessão ou uma resposta 401 que também limpa o cookie inválido. */
export function usuarioDaSessao(
  request: NextRequest,
): { usuario: UsuarioRegistro; resposta?: never } | { usuario?: never; resposta: NextResponse } {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const id = token ? store.sessoes.get(token) : undefined;
  const usuario = id ? store.usuarios.find((u) => u.id === id && u.ativo) : undefined;

  if (!usuario) {
    const resposta = erro(401, "NAO_AUTENTICADO");
    resposta.cookies.delete(SESSION_COOKIE);
    return { resposta };
  }
  return { usuario };
}

export function registrarFalhaLogin(email: string): void {
  const atual = store.tentativas.get(email) ?? { falhas: 0, bloqueadoAte: null };
  const falhas = atual.falhas + 1;
  store.tentativas.set(email, {
    falhas,
    bloqueadoAte: falhas >= MAX_TENTATIVAS ? Date.now() + BLOQUEIO_MS : null,
  });
}

export function contaBloqueada(email: string): boolean {
  const atual = store.tentativas.get(email);
  if (!atual?.bloqueadoAte) return false;
  if (Date.now() >= atual.bloqueadoAte) {
    store.tentativas.delete(email);
    return false;
  }
  return true;
}

export function criarSessao(usuarioId: string): string {
  const token = randomUUID();
  store.sessoes.set(token, usuarioId);
  return token;
}

export function novoId(): string {
  return randomUUID();
}
