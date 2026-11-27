import { MSG } from "@/lib/mensagens";
import { isApiError } from "@/services/api";

/** Converte falhas da API do card do aluno em mensagens dos fluxos de exceção do UC04/UC08. */
export function mensagemErroAluno(error: unknown, contexto: "salvar" | "carregar" = "salvar"): string {
  if (!isApiError(error)) return MSG.erroInesperado;
  if (error.status === 503) return "Não foi possível salvar. Tente novamente.";
  switch (error.code) {
    case "FALHA_CONEXAO":
      return contexto === "salvar" ? MSG.falhaSalvar : MSG.falhaConexao;
    case "CPF_EM_USO":
      return MSG.cpfEmUso;
    case "NIS_EM_USO":
      return error.message ?? "Este NIS já está cadastrado para outro aluno.";
    case "MATRICULA_INATIVA":
      return MSG.matriculaInativa;
    case "FICHAS_INCOMPLETAS":
      return MSG.fichaIncompleta;
    case "DADOS_INVALIDOS":
      return error.status === 422 ? error.message ?? MSG.fichaIncompleta : error.message ?? MSG.erroInesperado;
    case "TURMA_INATIVA":
      return MSG.turmaIndisponivel;
    case "ETAPA_INATIVA":
      return MSG.vinculoInativo;
    case "NAO_ENCONTRADO":
      return error.message ?? MSG.alunoNaoEncontrado;
    default:
      return error.message ?? MSG.erroInesperado;
  }
}