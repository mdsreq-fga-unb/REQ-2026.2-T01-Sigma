import { NextResponse, type NextRequest } from "next/server";
import {
  erro,
  esperar,
  mockHabilitado,
  naoEncontrado,
  publico,
  store,
  usuarioDaSessao,
} from "@/mocks/store";

// Reativar usuário inativo (RN21). Ação restrita a administradores.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;
  if (autor.perfil !== "ADMINISTRADOR") return erro(403, "SEM_PERMISSAO");

  const { id } = await params;
  const alvo = store.usuarios.find((u) => u.id === id);
  if (!alvo) return erro(404, "NAO_ENCONTRADO");
  if (alvo.ativo) return erro(409, "STATUS_INVALIDO", "A conta já está ativa.");

  alvo.ativo = true;
  return NextResponse.json(publico(alvo));
}
