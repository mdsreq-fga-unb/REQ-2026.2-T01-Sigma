import { NextResponse, type NextRequest } from "next/server";
import { emailValido, senhaNoPadrao } from "@/lib/validacao";
import {
  erro,
  esperar,
  mockHabilitado,
  naoEncontrado,
  novoId,
  store,
  usuarioBackend,
  usuarioDaSessao,
} from "@/mocks/store";

const TAMANHO_PADRAO = 20;
const TAMANHO_MAXIMO = 100;

export async function GET(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;

  // Mesmo formato paginado do backend: GET /usuarios?pagina=&tamanho=
  const params = request.nextUrl.searchParams;
  const tamanho = Math.min(Math.max(Number(params.get("tamanho")) || TAMANHO_PADRAO, 1), TAMANHO_MAXIMO);
  const pagina = Math.max(Math.trunc(Number(params.get("pagina")) || 1), 1);
  const inicio = (pagina - 1) * tamanho;
  return NextResponse.json({
    itens: store.usuarios.slice(inicio, inicio + tamanho).map(usuarioBackend),
    total: store.usuarios.length,
    pagina,
    tamanho,
  });
}

export async function POST(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;
  if (autor.perfil !== "ADMINISTRADOR") return erro(403, "SEM_PERMISSAO");

  const body = await request.json().catch(() => null);
  const nome = String(body?.nome ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const senha = String(body?.senha ?? "");
  const administrador = body?.administrador;

  if (!nome || !emailValido(email) || typeof administrador !== "boolean") {
    return erro(422, "DADOS_INVALIDOS");
  }
  if (!senhaNoPadrao(senha)) return erro(422, "SENHA_FORA_PADRAO"); // RN20
  if (store.usuarios.some((u) => u.email === email)) return erro(409, "EMAIL_EM_USO"); // RN19

  const novo = {
    id: novoId(),
    nome,
    email,
    perfil: administrador ? ("ADMINISTRADOR" as const) : ("USUARIO" as const),
    ativo: true,
    criadoEm: new Date().toISOString(),
    criadoPor: autor.nome,
    senha,
  };
  store.usuarios.push(novo);
  return NextResponse.json(usuarioBackend(novo), { status: 201 });
}
