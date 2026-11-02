import { NextResponse, type NextRequest } from "next/server";
import { emailValido, senhaNoPadrao } from "@/lib/validacao";
import {
  erro,
  esperar,
  mockHabilitado,
  naoEncontrado,
  novoId,
  publico,
  store,
  usuarioDaSessao,
} from "@/mocks/store";

export async function GET(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;
  return NextResponse.json(store.usuarios.map(publico));
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
  return NextResponse.json(publico(novo), { status: 201 });
}
