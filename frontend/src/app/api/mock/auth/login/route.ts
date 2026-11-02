import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessao";
import {
  contaBloqueada,
  criarSessao,
  erro,
  esperar,
  mockHabilitado,
  naoEncontrado,
  publico,
  registrarFalhaLogin,
  store,
} from "@/mocks/store";

export async function POST(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const senha = String(body?.senha ?? "");

  if (contaBloqueada(email)) return erro(423, "CONTA_BLOQUEADA");

  const usuario = store.usuarios.find((u) => u.email === email);
  if (!usuario || usuario.senha !== senha) {
    registrarFalhaLogin(email);
    if (contaBloqueada(email)) return erro(423, "CONTA_BLOQUEADA");
    return erro(401, "CREDENCIAIS_INVALIDAS");
  }

  if (!usuario.ativo) return erro(403, "CONTA_INATIVA");

  store.tentativas.delete(email);
  const resposta = NextResponse.json(publico(usuario));
  resposta.cookies.set(SESSION_COOKIE, criarSessao(usuario.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return resposta;
}
