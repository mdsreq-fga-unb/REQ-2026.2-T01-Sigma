import { MSG } from "@/lib/mensagens";
import { isApiError } from "@/services/api";

/** Converte falhas da API do card do aluno em mensagens dos fluxos de exceção do UC04/UC08. */
export function mensagemErroAluno(error: unknown, contexto: "salvar" | "carregar" = "salvar"): string {
  if (!isApiError(error)) return MSG.erroInesperado;
  switch (error.code) {
    case "FALHA_CONEXAO":
      return contexto === "salvar" ? MSG.falhaSalvar : MSG.falhaConexao;
    case "CPF_EM_USO":
      return MSG.cpfEmUso;
    case "MATRICULA_INATIVA":
      return MSG.matriculaInativa;
    case "FICHAS_INCOMPLETAS":
    case "DADOS_INVALIDOS":
      return MSG.fichaIncompleta;
    case "TURMA_INATIVA":
      return MSG.turmaIndisponivel;
    case "ETAPA_INATIVA":
      return MSG.vinculoInativo;
    case "NAO_ENCONTRADO":
      return MSG.alunoNaoEncontrado;
    default:
      return MSG.erroInesperado;
  }
}
