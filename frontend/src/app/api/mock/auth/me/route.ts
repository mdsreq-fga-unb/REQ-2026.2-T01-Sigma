import { NextResponse, type NextRequest } from "next/server";
import { esperar, mockHabilitado, naoEncontrado, publico, usuarioDaSessao } from "@/mocks/store";

export async function GET(request: NextRequest) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar(150);

  const { usuario, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;
  return NextResponse.json(publico(usuario));
}
