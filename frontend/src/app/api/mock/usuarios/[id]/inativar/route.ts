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

// RN21: usuários não são excluídos, apenas inativados.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!mockHabilitado()) return naoEncontrado();
  await esperar();

  const { usuario: autor, resposta } = usuarioDaSessao(request);
  if (resposta) return resposta;
  if (autor.perfil !== "ADMINISTRADOR") return erro(403, "SEM_PERMISSAO");

  const { id } = await params;
  const alvo = store.usuarios.find((u) => u.id === id);
  if (!alvo) return erro(404, "NAO_ENCONTRADO");
  if (alvo.id === autor.id) return erro(422, "DADOS_INVALIDOS", "Não é possível inativar a própria conta.");

  alvo.ativo = false;
  for (const [token, usuarioId] of store.sessoes) {
    if (usuarioId === alvo.id) store.sessoes.delete(token);
  }
  return NextResponse.json(publico(alvo));
}
