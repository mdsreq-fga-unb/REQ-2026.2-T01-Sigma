import type { FichasMatricula, NovaMatriculaPayload } from "@/types";

type Registro = Record<string, unknown>;

function registro(valor: unknown): Registro | null {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor)
    ? (valor as Registro)
    : null;
}

function texto(valor: unknown): valor is string {
  return typeof valor === "string";
}

export function obterPayloadMatricula(valor: unknown): NovaMatriculaPayload | null {
  const raiz = registro(valor);
  const aluno = registro(raiz?.aluno);
  const fichas = registro(raiz?.fichas);
  const socioeconomica = registro(fichas?.socioeconomica);
  const imagem = registro(fichas?.imagem);
  const saida = registro(fichas?.saida);
  const compromisso = registro(fichas?.compromisso);
  const requerimento = registro(fichas?.requerimento);

  if (
    !aluno ||
    !socioeconomica ||
    !imagem ||
    !saida ||
    !compromisso ||
    !requerimento ||
    !texto(aluno.nome) ||
    !texto(aluno.cpf) ||
    !texto(aluno.numeroMatricula) ||
    !texto(aluno.dataNascimento) ||
    !texto(aluno.nomeResponsavel) ||
    !texto(aluno.telefoneResponsavel) ||
    !texto(socioeconomica.rendaFamiliar) ||
    !texto(socioeconomica.pessoasNaResidencia) ||
    !texto(socioeconomica.situacaoMoradia) ||
    !texto(socioeconomica.beneficioSocial) ||
    (imagem.autorizada !== null && typeof imagem.autorizada !== "boolean") ||
    !texto(imagem.responsavel) ||
    (saida.autorizadaSemResponsavel !== null && typeof saida.autorizadaSemResponsavel !== "boolean") ||
    !texto(saida.responsavel) ||
    !texto(saida.pessoasAutorizadas) ||
    typeof compromisso.aceito !== "boolean" ||
    !texto(compromisso.responsavel) ||
    !texto(requerimento.anoLetivo) ||
    !texto(requerimento.turmaPretendida) ||
    !texto(requerimento.responsavel)
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
    },
    fichas: {
      socioeconomica: {
        rendaFamiliar: socioeconomica.rendaFamiliar.trim(),
        pessoasNaResidencia: socioeconomica.pessoasNaResidencia.trim(),
        situacaoMoradia: socioeconomica.situacaoMoradia.trim(),
        beneficioSocial: socioeconomica.beneficioSocial.trim(),
      },
      imagem: { autorizada: imagem.autorizada, responsavel: imagem.responsavel.trim() },
      saida: {
        autorizadaSemResponsavel: saida.autorizadaSemResponsavel,
        responsavel: saida.responsavel.trim(),
        pessoasAutorizadas: saida.pessoasAutorizadas.trim(),
      },
      compromisso: { aceito: compromisso.aceito, responsavel: compromisso.responsavel.trim() },
      requerimento: {
        anoLetivo: requerimento.anoLetivo.trim(),
        turmaPretendida: requerimento.turmaPretendida.trim(),
        responsavel: requerimento.responsavel.trim(),
      },
    },
  };
}

export function fichasCompletas(fichas: FichasMatricula): boolean {
  const textosObrigatorios = [
    fichas.socioeconomica.rendaFamiliar,
    fichas.socioeconomica.pessoasNaResidencia,
    fichas.socioeconomica.situacaoMoradia,
    fichas.socioeconomica.beneficioSocial,
    fichas.imagem.responsavel,
    fichas.saida.responsavel,
    fichas.saida.pessoasAutorizadas,
    fichas.compromisso.responsavel,
    fichas.requerimento.anoLetivo,
    fichas.requerimento.turmaPretendida,
    fichas.requerimento.responsavel,
  ];

  return (
    textosObrigatorios.every((campo) => campo.trim().length > 0) &&
    Number.isInteger(Number(fichas.socioeconomica.pessoasNaResidencia)) &&
    Number(fichas.socioeconomica.pessoasNaResidencia) > 0 &&
    /^\d{4}$/.test(fichas.requerimento.anoLetivo) &&
    fichas.imagem.autorizada !== null &&
    fichas.saida.autorizadaSemResponsavel !== null &&
    fichas.compromisso.aceito
  );
}

export function dadosAlunoCompletos(aluno: NovaMatriculaPayload["aluno"]): boolean {
  return [
    aluno.nome,
    aluno.numeroMatricula,
    aluno.dataNascimento,
    aluno.nomeResponsavel,
    aluno.telefoneResponsavel,
  ].every((campo) => campo.trim().length > 0);
}

export function cpfValido(cpf: string): boolean {
  return /^\d{11}$/.test(cpf);
}

export function alteracoesMatricula(
  anterior: NovaMatriculaPayload,
  atual: NovaMatriculaPayload,
): string[] {
  const nomes: Record<string, string> = {
    nome: "Nome do aluno",
    cpf: "CPF",
    numeroMatricula: "Número de matrícula",
    dataNascimento: "Data de nascimento",
    nomeResponsavel: "Responsável",
    telefoneResponsavel: "Telefone do responsável",
    rendaFamiliar: "Renda familiar",
    pessoasNaResidencia: "Pessoas na residência",
    situacaoMoradia: "Situação da moradia",
    beneficioSocial: "Benefício social",
    autorizada: "Autorização de imagem",
    autorizadaSemResponsavel: "Autorização de saída",
    responsavel: "Responsável pela ficha",
    pessoasAutorizadas: "Pessoas autorizadas para retirada",
    aceito: "Termo de compromisso escolar",
    anoLetivo: "Ano letivo",
    turmaPretendida: "Turma pretendida",
  };
  const alteracoes: string[] = [];

  function comparar<T extends object>(grupo: string, a: T, b: T) {
    const camposAlterados = (Object.keys(b) as Array<keyof T>).filter((campo) => a[campo] !== b[campo]);
    if (camposAlterados.length > 0) {
      alteracoes.push(
        `${grupo}: ${camposAlterados.map((campo) => nomes[String(campo)] ?? String(campo)).join(", ")}`,
      );
    }
  }

  comparar("Dados do aluno", anterior.aluno, atual.aluno);
  comparar("Ficha socioeconômica", anterior.fichas.socioeconomica, atual.fichas.socioeconomica);
  comparar("Autorização de imagem", anterior.fichas.imagem, atual.fichas.imagem);
  comparar("Autorização de saída", anterior.fichas.saida, atual.fichas.saida);
  comparar("Compromisso escolar", anterior.fichas.compromisso, atual.fichas.compromisso);
  comparar("Requerimento de matrícula", anterior.fichas.requerimento, atual.fichas.requerimento);

  return alteracoes;
}
