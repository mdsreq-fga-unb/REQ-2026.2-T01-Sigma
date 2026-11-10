import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessao";
import { esperar, mockHabilitado, naoEncontrado, store } from "@/mocks/store";

export async function POST(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar(150);

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) store.sessoes.delete(token);

  const resposta = new NextResponse(null, { status: 204 });
  resposta.cookies.delete(SESSION_COOKIE);
  return resposta;
}
