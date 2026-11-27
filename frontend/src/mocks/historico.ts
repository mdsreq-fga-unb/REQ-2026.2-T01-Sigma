import { OPCOES_AUTORIZACAO_IMAGEM, OPCOES_FORMA_SAIDA, isoParaData, mascaraCpf } from "@/lib/alunos";
import type { FichaHistorico, TermoCompromisso, TermoSaida, TermoUsoImagem } from "@/types";
import type { Alteracao } from "./alunos";

/*
 * Comparação campo a campo dos termos salvos no mock, para gerar uma linha de histórico
 * por campo alterado (RF17). Os nomes são os rótulos legíveis exibidos na aba Histórico.
 */

interface CampoHistorico<T> {
  campo: string;
  valor: (termo: T) => string;
  sensivel?: boolean;
}

const simNao = (valor: boolean) => (valor ? "Sim" : "Não");
const data = (iso: string) => isoParaData(iso) || iso;

const CAMPOS_USO_IMAGEM: CampoHistorico<TermoUsoImagem>[] = [
  { campo: "Responsável legal", valor: (t) => t.responsavel.nome },
  { campo: "Nacionalidade", valor: (t) => t.responsavel.nacionalidade },
  { campo: "Estado civil", valor: (t) => t.responsavel.estadoCivil },
  { campo: "RG do responsável", valor: (t) => t.responsavel.rg, sensivel: true },
  { campo: "CPF do responsável", valor: (t) => mascaraCpf(t.responsavel.cpf), sensivel: true },
  { campo: "Residente em", valor: (t) => t.responsavel.endereco },
  {
    campo: "Autoriza uso da imagem",
    valor: (t) =>
      t.autoriza === null ? "" : (OPCOES_AUTORIZACAO_IMAGEM.find((o) => o.valor === (t.autoriza ? "SIM" : "NAO"))?.rotulo ?? ""),
  },
  { campo: "Local", valor: (t) => t.local },
  { campo: "Data", valor: (t) => data(t.data) },
];

const CAMPOS_SAIDA: CampoHistorico<TermoSaida>[] = [
  { campo: "Responsável legal", valor: (t) => t.nomeResponsavel },
  { campo: "Forma de saída", valor: (t) => OPCOES_FORMA_SAIDA.find((o) => o.valor === t.formaSaida)?.rotulo ?? "" },
  { campo: "Descrição da forma de saída", valor: (t) => t.descricaoOutros ?? "" },
  {
    campo: "Pessoas autorizadas",
    valor: (t) => t.pessoasAutorizadas.map((p) => (p.parentesco ? `${p.nome} (${p.parentesco})` : p.nome)).join("; "),
  },
  { campo: "Local", valor: (t) => t.local },
  { campo: "Data", valor: (t) => data(t.data) },
];

const CAMPOS_COMPROMISSO: CampoHistorico<TermoCompromisso>[] = [
  { campo: "Responsável", valor: (t) => t.nomeResponsavel },
  { campo: "CPF do responsável", valor: (t) => mascaraCpf(t.cpfResponsavel), sensivel: true },
  { campo: "Modalidade", valor: (t) => t.modalidade },
  { campo: "Regime", valor: (t) => t.regime },
  { campo: "Leu e assinou o termo", valor: (t) => simNao(t.ciente) },
  { campo: "Data de assinatura", valor: (t) => data(t.dataAssinatura) },
];

function diferencas<T>(ficha: FichaHistorico, campos: CampoHistorico<T>[], anterior: T | null, novo: T): Alteracao[] {
  return campos.map(({ campo, valor, sensivel }) => ({
    ficha,
    campo,
    anterior: anterior ? valor(anterior) : null,
    novo: valor(novo),
    sensivel,
  }));
}

export function alteracoesUsoImagem(anterior: TermoUsoImagem | null, novo: TermoUsoImagem): Alteracao[] {
  return diferencas("USO_IMAGEM", CAMPOS_USO_IMAGEM, anterior, novo);
}

export function alteracoesSaida(anterior: TermoSaida | null, novo: TermoSaida): Alteracao[] {
  return diferencas("SAIDA", CAMPOS_SAIDA, anterior, novo);
}

export function alteracoesCompromisso(anterior: TermoCompromisso | null, novo: TermoCompromisso): Alteracao[] {
  return diferencas("COMPROMISSO", CAMPOS_COMPROMISSO, anterior, novo);
}
