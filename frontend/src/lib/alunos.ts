import type {
  CorRaca,
  FichaAluno,
  FormaSaida,
  NovoAlunoPayload,
  Sexo,
  SituacaoFicha,
  StatusAluno,
  TermoCompromisso,
  TermoSaida,
  TermoUsoImagem,
} from "@/types";

/*
 * Regras e utilitários do UC04 (card do aluno) e do UC08 FP01 (busca de alunos),
 * compartilhados entre os formulários e o mock da API.
 */

/** Erros de validação por campo (chave = nome do campo no formulário). */
export type ErrosCampos = Record<string, string>;

export const MAX_PESSOAS_AUTORIZADAS = 4;
export const LOCAL_PADRAO = "Águas Lindas de Goiás";

// ---------- Opções dos formulários ----------

export const OPCOES_SEXO: { valor: Sexo; rotulo: string }[] = [
  { valor: "MASCULINO", rotulo: "Masculino" },
  { valor: "FEMININO", rotulo: "Feminino" },
];

export const OPCOES_COR_RACA: { valor: CorRaca; rotulo: string }[] = [
  { valor: "BRANCA", rotulo: "Branca" },
  { valor: "PRETA", rotulo: "Preta" },
  { valor: "PARDA", rotulo: "Parda" },
  { valor: "AMARELA", rotulo: "Amarela" },
  { valor: "INDIGENA", rotulo: "Indígena" },
  { valor: "NAO_DECLARADA", rotulo: "Não declarada" },
];

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const OPCOES_FORMA_SAIDA: { valor: FormaSaida; rotulo: string }[] = [
  { valor: "RESPONSAVEIS", rotulo: "Responsáveis (pai/mãe)" },
  { valor: "TRANSPORTE_ESCOLAR", rotulo: "Transporte escolar" },
  { valor: "OUTROS", rotulo: "Outros" },
];

export const OPCOES_PARENTESCO: { valor: string; rotulo: string }[] = [
  { valor: "Mãe", rotulo: "Mãe" },
  { valor: "Pai", rotulo: "Pai" },
  { valor: "Avô/Avó", rotulo: "Avô/Avó" },
  { valor: "Tio/Tia", rotulo: "Tio/Tia" },
  { valor: "Irmão/Irmã", rotulo: "Irmão/Irmã" },
  { valor: "Padrasto/Madrasta", rotulo: "Padrasto/Madrasta" },
  { valor: "Responsável legal", rotulo: "Responsável legal" },
  { valor: "Motorista escolar", rotulo: "Motorista escolar" },
  { valor: "Outro", rotulo: "Outro" },
];

export type AutorizacaoImagem = "SIM" | "NAO";

export const OPCOES_AUTORIZACAO_IMAGEM: { valor: AutorizacaoImagem; rotulo: string }[] = [
  { valor: "SIM", rotulo: "Sim, autoriza" },
  { valor: "NAO", rotulo: "Não autoriza" },
];

export const OPCOES_ESTADO_CIVIL: { valor: string; rotulo: string }[] = [
  { valor: "Solteira", rotulo: "Solteira" },
  { valor: "Solteiro", rotulo: "Solteiro" },
  { valor: "Casada", rotulo: "Casada" },
  { valor: "Casado", rotulo: "Casado" },
  { valor: "União estável", rotulo: "União estável" },
  { valor: "Separada", rotulo: "Separada" },
  { valor: "Separado", rotulo: "Separado" },
  { valor: "Divorciada", rotulo: "Divorciada" },
  { valor: "Divorciado", rotulo: "Divorciado" },
  { valor: "Viúva", rotulo: "Viúva" },
  { valor: "Viúvo", rotulo: "Viúvo" },
];

/** Regime sugerido no termo de compromisso: o texto oficial fala em "tempo integral". */
export const REGIME_PADRAO = "Tempo integral";

export const OPCOES_MODALIDADE: { valor: string; rotulo: string }[] = [
  { valor: "Creche", rotulo: "Creche" },
  { valor: "Pré-escola", rotulo: "Pré-escola" },
];

export const OPCOES_REGIME: { valor: string; rotulo: string }[] = [
  { valor: "Tempo integral", rotulo: "Tempo integral" },
  { valor: "Parcial - matutino", rotulo: "Parcial - matutino" },
  { valor: "Parcial - vespertino", rotulo: "Parcial - vespertino" },
];

export const NOMES_FICHAS: Record<FichaAluno, string> = {
  requerimento: "Requerimento de matrícula",
  socioeconomica: "Ficha socioeconômica",
  usoImagem: "Termo de autorização de uso de imagem",
  saida: "Termo de autorização de saída do aluno",
  compromisso: "Termo de compromisso escolar",
};

/** Segmento da URL de cada aba do card (`/alunos/{id}/{aba}`). */
export const ABA_DA_FICHA: Record<FichaAluno, string> = {
  requerimento: "requerimento",
  socioeconomica: "socioeconomica",
  usoImagem: "uso-imagem",
  saida: "saida",
  compromisso: "compromisso",
};

export const DOCUMENTOS_EXIGIDOS = [
  "Certidão de nascimento",
  "Comprovante de residência",
  "2 fotos 3×4",
  "Cartão de vacina",
  "Histórico escolar",
];

export type StatusExibicaoAluno = "ATIVO" | "PENDENTE" | "INATIVO";

export function statusExibicaoAluno(card: {
  status: StatusAluno;
  turma: { id: string; nome: string } | null;
  fichas: Record<FichaAluno, SituacaoFicha>;
}): StatusExibicaoAluno {
  if (card.status === "INATIVO") return "INATIVO";
  const fichasCompletas = Object.values(card.fichas).every((situacao) => situacao === "PREENCHIDA");
  return fichasCompletas && card.turma ? "ATIVO" : "PENDENTE";
}

// ---------- Busca (RF21) ----------

/** RF21 / UC08 FA03: a busca de alunos ignora maiúsculas, minúsculas e acentos. */
export function normalizarBusca(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR").trim();
}

// ---------- Máscaras e datas ----------

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** 00000000000 → 000.000.000-00 (aplicada enquanto o usuário digita). */
export function mascaraCpf(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

/** 01022026 → 01/02/2026 (aplicada enquanto o usuário digita). */
export function mascaraData(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** AAAA-MM-DD é uma data de calendário existente? */
export function dataIsoValida(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}

/** dd/mm/aaaa → AAAA-MM-DD, ou "" quando incompleta/inválida. */
export function dataParaIso(data: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data.trim());
  if (!m) return "";
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  return dataIsoValida(iso) ? iso : "";
}

/**
 * Data digitada (dd/mm/aaaa) → AAAA-MM-DD para envio. Datas incompletas ou inexistentes são
 * mantidas como digitadas, para que a validação aponte "Data inválida" e não "Informe a data".
 */
export function dataDigitadaParaIso(data: string): string {
  const texto = data.trim();
  return texto ? dataParaIso(texto) || texto : "";
}

/** AAAA-MM-DD → dd/mm/aaaa ("" quando vazio). */
export function isoParaData(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

/** Data de hoje (fuso de Brasília) em AAAA-MM-DD. */
export function hojeIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

/** ISO 8601 com horário → "10/10/2026, 14:32". */
export function formatarDataHora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

// ---------- Validações (RN06, RN07) ----------

const vazio = (valor: string | null | undefined) => !valor || valor.trim().length === 0;

export function cpfValido(cpf: string): boolean {
  return /^\d{11}$/.test(somenteDigitos(cpf));
}

function validarData(erros: ErrosCampos, campo: string, iso: string, opcoes: { futuraPermitida?: boolean } = {}) {
  if (vazio(iso)) {
    erros[campo] = "Informe a data.";
  } else if (!dataIsoValida(iso)) {
    erros[campo] = "Data inválida. Use o formato dd/mm/aaaa.";
  } else if (!opcoes.futuraPermitida && iso > hojeIso()) {
    erros[campo] = "A data não pode estar no futuro.";
  }
}

function validarCpf(erros: ErrosCampos, campo: string, cpf: string, obrigatorio: boolean) {
  if (vazio(cpf)) {
    if (obrigatorio) erros[campo] = "Informe o CPF.";
  } else if (!cpfValido(cpf)) {
    erros[campo] = "O CPF deve ter 11 dígitos.";
  }
}

/** RF08 – dados mínimos para criar o card (campos com * no protótipo). */
export function validarNovoAluno({ aluno, matricula }: NovoAlunoPayload): ErrosCampos {
  const erros: ErrosCampos = {};
  if (vazio(aluno.nome)) erros.nome = "Informe o nome do aluno.";
  validarData(erros, "dataNascimento", aluno.dataNascimento);
  if (!aluno.sexo) erros.sexo = "Selecione o sexo.";
  validarCpf(erros, "cpf", aluno.cpf, false);
  if (!/^\d{4}$/.test(matricula.anoLetivo.trim())) erros.anoLetivo = "Informe o ano letivo com 4 dígitos.";
  validarData(erros, "dataMatricula", matricula.dataMatricula, { futuraPermitida: true });
  return erros;
}

export function validarTermoUsoImagem(termo: TermoUsoImagem): ErrosCampos {
  const erros: ErrosCampos = {};
  const r = termo.responsavel;
  if (vazio(r.nome)) erros.nome = "Informe o nome do responsável legal.";
  if (vazio(r.nacionalidade)) erros.nacionalidade = "Informe a nacionalidade.";
  if (vazio(r.estadoCivil)) erros.estadoCivil = "Informe o estado civil.";
  if (vazio(r.rg)) erros.rg = "Informe o RG.";
  validarCpf(erros, "cpf", r.cpf, true);
  if (vazio(r.endereco)) erros.endereco = "Informe o endereço.";
  if (termo.autoriza === null) erros.autoriza = "Informe se o responsável autoriza o uso da imagem.";
  if (vazio(termo.local)) erros.local = "Informe o local.";
  validarData(erros, "data", termo.data);
  return erros;
}

/** A lista de pessoas autorizadas é obrigatória quando a saída é por transporte escolar ou "Outros". */
export function exigePessoasAutorizadas(forma: FormaSaida | null): boolean {
  return forma === "TRANSPORTE_ESCOLAR" || forma === "OUTROS";
}

export function validarTermoSaida(termo: TermoSaida): ErrosCampos {
  const erros: ErrosCampos = {};
  if (vazio(termo.nomeResponsavel)) erros.nomeResponsavel = "Informe o nome do responsável legal.";
  if (!termo.formaSaida) erros.formaSaida = "Informe como o aluno sai da escola.";
  if (termo.pessoasAutorizadas.length > MAX_PESSOAS_AUTORIZADAS) {
    erros.pessoasAutorizadas = `Informe no máximo ${MAX_PESSOAS_AUTORIZADAS} pessoas.`;
  } else if (termo.pessoasAutorizadas.some((p) => vazio(p.nome) || vazio(p.parentesco))) {
    erros.pessoasAutorizadas = "Informe o nome e o parentesco de cada pessoa autorizada.";
  } else if (exigePessoasAutorizadas(termo.formaSaida) && termo.pessoasAutorizadas.length === 0) {
    erros.pessoasAutorizadas = "Adicione ao menos uma pessoa autorizada a buscar o aluno.";
  }
  if (vazio(termo.local)) erros.local = "Informe o local.";
  validarData(erros, "data", termo.data);
  return erros;
}

export function validarTermoCompromisso(termo: TermoCompromisso): ErrosCampos {
  const erros: ErrosCampos = {};
  if (vazio(termo.nomeResponsavel)) erros.nomeResponsavel = "Informe o nome do responsável.";
  validarCpf(erros, "cpfResponsavel", termo.cpfResponsavel, true);
  if (vazio(termo.modalidade)) erros.modalidade = "Selecione a modalidade.";
  if (vazio(termo.regime)) erros.regime = "Selecione o regime.";
  if (!termo.ciente) erros.ciente = "Confirme que o responsável leu e assinou o termo.";
  validarData(erros, "dataAssinatura", termo.dataAssinatura);
  return erros;
}

export function temErros(erros: ErrosCampos): boolean {
  return Object.keys(erros).length > 0;
}
