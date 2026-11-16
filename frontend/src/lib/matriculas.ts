import type {
  DadosAluno,
  DadosFiliacao,
  DocumentoCivil,
  FichaRequerimento,
  FichaSocioeconomica,
  FichasMatricula,
  MembroFamiliar,
  NovaMatriculaPayload,
  RenovacaoMatricula,
} from "@/types";

type Registro = Record<string, unknown>;

function registro(valor: unknown): valor is Registro {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function texto(valor: unknown): valor is string {
  return typeof valor === "string";
}

function camposTexto<T extends string>(valor: unknown, campos: readonly T[]): valor is Registro & Record<T, string> {
  return registro(valor) && campos.every((campo) => texto(valor[campo]));
}

function listaTexto(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every(texto);
}

function ehDadosFiliacao(valor: unknown): valor is DadosFiliacao {
  return camposTexto(valor, ["nome", "escolaridade", "localTrabalho", "telefoneTrabalho"]);
}

function ehDocumentoCivil(valor: unknown): valor is DocumentoCivil {
  return (
    camposTexto(valor, [
      "rg", "orgaoEmissor", "ufEmissor", "dataExpedicao", "numeroTermo",
      "folha", "livro", "dataEmissao", "nomeCartorio", "ufCartorio", "documentoEstrangeiro",
    ]) &&
    (valor.tipoCertidao === "NASCIMENTO" || valor.tipoCertidao === "CASAMENTO")
  );
}

function ehMembroFamiliar(valor: unknown): valor is MembroFamiliar {
  return camposTexto(valor, ["componente", "profissao", "idade", "estadoCivil", "escolaridade", "rendaMensal"]);
}

function ehRenovacao(valor: unknown): valor is RenovacaoMatricula {
  return camposTexto(valor, ["data", "ano", "responsavel"]);
}

function ehFichaRequerimento(valor: unknown): valor is FichaRequerimento {
  if (
    !registro(valor) ||
    !camposTexto(valor, [
      "anoEscolaridade", "anoLetivo", "dataMatricula", "endereco", "telefone",
    ]) ||
    !ehDocumentoCivil(valor.documentacaoCivil) ||
    !registro(valor.filiacao) ||
    !ehDadosFiliacao(valor.filiacao.pai) ||
    !ehDadosFiliacao(valor.filiacao.mae) ||
    !registro(valor.saude) ||
    !listaTexto(valor.saude.problemas) ||
    !texto(valor.saude.observacoesProblemas) ||
    !listaTexto(valor.saude.acompanhamentos) ||
    !texto(valor.saude.observacoesAcompanhamento) ||
    !registro(valor.compromissoDocumentos) ||
    !texto(valor.compromissoDocumentos.responsavel) ||
    !listaTexto(valor.compromissoDocumentos.documentosEntregues) ||
    !Array.isArray(valor.renovacoes) ||
    !valor.renovacoes.every(ehRenovacao) ||
    !camposTexto(valor.transferencia, ["dataPedido", "dataEntrega", "responsavel"])
  ) {
    return false;
  }
  return true;
}

function ehFichaSocioeconomica(valor: unknown): valor is FichaSocioeconomica {
  return (
    registro(valor) &&
    camposTexto(valor.endereco, [
      "logradouro", "numero", "bairro", "cidade", "estado", "cep", "telefone", "celular", "email",
    ]) &&
    camposTexto(valor.moradia, ["tipo", "valorMensal", "cedidoPor"]) &&
    texto(valor.transporte) &&
    Array.isArray(valor.nucleoFamiliar) &&
    valor.nucleoFamiliar.every(ehMembroFamiliar) &&
    texto(valor.observacoes) &&
    registro(valor.outrasPropriedades) &&
    typeof valor.outrasPropriedades.possui === "boolean" &&
    texto(valor.outrasPropriedades.descricao) &&
    camposTexto(valor.declaracao, ["responsavel", "local", "data"])
  );
}

function ehFichas(valor: unknown): valor is FichasMatricula {
  if (!registro(valor) || !ehFichaSocioeconomica(valor.socioeconomica) || !ehFichaRequerimento(valor.requerimento)) {
    return false;
  }
  const imagem = valor.imagem;
  const saida = valor.saida;
  const compromisso = valor.compromisso;
  return (
    registro(imagem) &&
    (imagem.autorizada === null || typeof imagem.autorizada === "boolean") &&
    texto(imagem.responsavel) &&
    registro(saida) &&
    (saida.autorizadaSemResponsavel === null || typeof saida.autorizadaSemResponsavel === "boolean") &&
    texto(saida.responsavel) &&
    texto(saida.pessoasAutorizadas) &&
    registro(compromisso) &&
    typeof compromisso.aceito === "boolean" &&
    texto(compromisso.responsavel)
  );
}

export function novoPayloadMatricula(): NovaMatriculaPayload {
  const agora = new Date();
  const dataLocal = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  return {
    aluno: {
      nome: "",
      cpf: "",
      numeroMatricula: "",
      dataNascimento: "",
      nomeResponsavel: "",
      telefoneResponsavel: "",
      sexo: "",
      nis: "",
      identidade: "",
      naturalidade: "",
      ufNaturalidade: "",
      nacionalidade: "Brasileira",
      corRaca: "NAO_DECLARADA",
    },
    fichas: {
      socioeconomica: {
        endereco: {
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          telefone: "",
          celular: "",
          email: "",
        },
        moradia: { tipo: "", valorMensal: "", cedidoPor: "" },
        transporte: "",
        nucleoFamiliar: [{ componente: "", profissao: "", idade: "", estadoCivil: "", escolaridade: "", rendaMensal: "" }],
        observacoes: "",
        outrasPropriedades: { possui: false, descricao: "" },
        declaracao: { responsavel: "", local: "", data: "" },
      },
      imagem: { autorizada: null, responsavel: "" },
      saida: { autorizadaSemResponsavel: null, responsavel: "", pessoasAutorizadas: "" },
      compromisso: { aceito: false, responsavel: "" },
      requerimento: {
        anoEscolaridade: "",
        anoLetivo: String(agora.getFullYear()),
        dataMatricula: dataLocal,
        documentacaoCivil: {
          rg: "",
          orgaoEmissor: "",
          ufEmissor: "",
          dataExpedicao: "",
          tipoCertidao: "NASCIMENTO",
          numeroTermo: "",
          folha: "",
          livro: "",
          dataEmissao: "",
          nomeCartorio: "",
          ufCartorio: "",
          documentoEstrangeiro: "",
        },
        filiacao: {
          pai: { nome: "", escolaridade: "", localTrabalho: "", telefoneTrabalho: "" },
          mae: { nome: "", escolaridade: "", localTrabalho: "", telefoneTrabalho: "" },
        },
        endereco: "",
        telefone: "",
        saude: {
          problemas: [],
          observacoesProblemas: "",
          acompanhamentos: [],
          observacoesAcompanhamento: "",
        },
        compromissoDocumentos: { responsavel: "", documentosEntregues: [] },
        renovacoes: [],
        transferencia: { dataPedido: "", dataEntrega: "", responsavel: "" },
      },
    },
  };
}

export function obterPayloadMatricula(valor: unknown): NovaMatriculaPayload | null {
  if (!registro(valor)) return null;
  const aluno = valor.aluno;
  const fichas = valor.fichas;
  if (
    !camposTexto(aluno, [
      "nome", "cpf", "numeroMatricula", "dataNascimento", "nomeResponsavel", "telefoneResponsavel",
      "sexo", "nis", "identidade", "naturalidade", "ufNaturalidade", "nacionalidade", "corRaca",
    ]) ||
    !ehFichas(fichas)
  ) {
    return null;
  }

  return {
    aluno: {
      nome: aluno.nome.trim(),
      cpf: aluno.cpf.replace(/\D/g, ""),
      numeroMatricula: aluno.numeroMatricula.trim(),
      dataNascimento: aluno.dataNascimento,
      nomeResponsavel: aluno.nomeResponsavel.trim(),
      telefoneResponsavel: aluno.telefoneResponsavel.trim(),
      sexo: aluno.sexo,
      nis: aluno.nis.trim(),
      identidade: aluno.identidade.trim(),
      naturalidade: aluno.naturalidade.trim(),
      ufNaturalidade: aluno.ufNaturalidade,
      nacionalidade: aluno.nacionalidade.trim(),
      corRaca: aluno.corRaca,
    } satisfies DadosAluno,
    fichas,
  };
}

export function fichasCompletas(fichas: FichasMatricula): boolean {
  const requerimento = fichas.requerimento;
  const socioeconomica = fichas.socioeconomica;
  const moradia = socioeconomica.moradia;
  const moradiaCompleta =
    moradia.tipo === "CEDIDO"
      ? moradia.cedidoPor.trim().length > 0
      : ["FINANCIADO", "ALUGADO"].includes(moradia.tipo)
        ? moradia.valorMensal.trim().length > 0 &&
          Number.isFinite(Number(moradia.valorMensal)) &&
          Number(moradia.valorMensal) >= 0
        : moradia.tipo.length > 0;
  const propriedadesCompletas =
    !socioeconomica.outrasPropriedades.possui || socioeconomica.outrasPropriedades.descricao.trim().length > 0;
  const textosObrigatorios = [
    requerimento.anoEscolaridade,
    requerimento.anoLetivo,
    socioeconomica.transporte,
    socioeconomica.declaracao.responsavel,
    socioeconomica.declaracao.local,
    socioeconomica.declaracao.data,
  ];

  return (
    textosObrigatorios.every((campo) => campo.trim().length > 0) &&
    moradiaCompleta &&
    propriedadesCompletas &&
    /^\d{4}$/.test(requerimento.anoLetivo) &&
    socioeconomica.nucleoFamiliar.some((membro) => membro.componente.trim().length > 0) &&
    fichas.imagem.autorizada !== null &&
    fichas.saida.autorizadaSemResponsavel !== null &&
    fichas.imagem.responsavel.trim().length > 0 &&
    fichas.saida.responsavel.trim().length > 0 &&
    fichas.saida.pessoasAutorizadas.trim().length > 0 &&
    fichas.compromisso.aceito &&
    fichas.compromisso.responsavel.trim().length > 0
  );
}

export function dadosAlunoCompletos(aluno: NovaMatriculaPayload["aluno"]): boolean {
  return [
    aluno.nome,
    aluno.sexo,
    aluno.dataNascimento,
  ].every((campo) => campo.trim().length > 0);
}

export function dadosMatriculaInicialCompletos(payload: NovaMatriculaPayload): boolean {
  const { anoEscolaridade, anoLetivo, dataMatricula } = payload.fichas.requerimento;
  return (
    anoEscolaridade.trim().length > 0 &&
    /^\d{4}$/.test(anoLetivo) &&
    dataMatricula.trim().length > 0
  );
}

export function cpfValido(cpf: string): boolean {
  return /^\d{11}$/.test(cpf);
}

const NOMES_CAMPOS: Record<string, string> = {
  nome: "Nome",
  cpf: "CPF",
  numeroMatricula: "Número de matrícula",
  dataNascimento: "Data de nascimento",
  nomeResponsavel: "Responsável",
  telefoneResponsavel: "Telefone do responsável",
  anoEscolaridade: "Ano de escolaridade",
  anoLetivo: "Ano letivo",
  dataMatricula: "Data da matrícula",
  sexo: "Sexo",
  nis: "NIS",
  identidade: "ID",
  naturalidade: "Naturalidade",
  ufNaturalidade: "UF de naturalidade",
  nacionalidade: "Nacionalidade",
  corRaca: "Cor/raça",
  rg: "RG",
  orgaoEmissor: "Órgão emissor",
  ufEmissor: "UF do documento",
  dataExpedicao: "Data de expedição",
  tipoCertidao: "Tipo de certidão",
  numeroTermo: "Número do termo",
  folha: "Folha",
  livro: "Livro",
  dataEmissao: "Data de emissão",
  nomeCartorio: "Cartório",
  ufCartorio: "UF do cartório",
  documentoEstrangeiro: "Documento estrangeiro",
  pai: "Pai",
  mae: "Mãe",
  escolaridade: "Escolaridade",
  localTrabalho: "Local de trabalho",
  telefoneTrabalho: "Telefone do trabalho",
  endereco: "Endereço",
  telefone: "Telefone",
  problemas: "Problemas de saúde",
  observacoesProblemas: "Observações de saúde",
  acompanhamentos: "Acompanhamentos médicos",
  observacoesAcompanhamento: "Observações de acompanhamento",
  responsavel: "Responsável",
  documentosEntregues: "Documentos entregues",
  renovacoes: "Renovações",
  data: "Data",
  ano: "Ano",
  dataPedido: "Data do pedido",
  dataEntrega: "Data da entrega",
  logradouro: "Endereço",
  numero: "Número",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  cep: "CEP",
  celular: "Celular",
  email: "E-mail",
  moradia: "Moradia",
  tipo: "Tipo",
  valorMensal: "Valor mensal",
  cedidoPor: "Imóvel cedido por",
  transporte: "Transporte",
  nucleoFamiliar: "Núcleo familiar",
  componente: "Componente",
  profissao: "Profissão/função",
  idade: "Idade",
  estadoCivil: "Estado civil",
  rendaMensal: "Renda mensal",
  outrasPropriedades: "Outras propriedades",
  possui: "Possui propriedades",
  descricao: "Descrição",
  local: "Local",
  autorizada: "Autorização de imagem",
  autorizadaSemResponsavel: "Autorização de saída",
  aceito: "Termo de compromisso escolar",
};

function nomesAlterados(anterior: unknown, atual: unknown, caminho: string[] = []): string[] {
  if (JSON.stringify(anterior) === JSON.stringify(atual)) return [];
  if (registro(anterior) && registro(atual)) {
    return Array.from(new Set([...Object.keys(anterior), ...Object.keys(atual)]))
      .flatMap((campo) => nomesAlterados(anterior[campo], atual[campo], [...caminho, campo]));
  }
  if (caminho.length === 0) return [];
  const chave = caminho[caminho.length - 1];
  return [NOMES_CAMPOS[chave] ?? chave];
}

export function alteracoesMatricula(
  anterior: NovaMatriculaPayload,
  atual: NovaMatriculaPayload,
): string[] {
  const grupos: Array<[string, unknown, unknown]> = [
    ["Dados do aluno", anterior.aluno, atual.aluno],
    ["Ficha socioeconômica", anterior.fichas.socioeconomica, atual.fichas.socioeconomica],
    ["Autorização de imagem", anterior.fichas.imagem, atual.fichas.imagem],
    ["Autorização de saída", anterior.fichas.saida, atual.fichas.saida],
    ["Compromisso escolar", anterior.fichas.compromisso, atual.fichas.compromisso],
    ["Requerimento de matrícula", anterior.fichas.requerimento, atual.fichas.requerimento],
  ];

  return grupos.flatMap(([nome, anteriorGrupo, atualGrupo]) => {
    const campos = Array.from(new Set(nomesAlterados(anteriorGrupo, atualGrupo)));
    return campos.length ? [`${nome}: ${campos.join(", ")}`] : [];
  });
}
