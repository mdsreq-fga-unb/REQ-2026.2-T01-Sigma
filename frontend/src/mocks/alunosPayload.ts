import { somenteDigitos } from "@/lib/alunos";
import type {
  CorRaca,
  FormaSaida,
  NovoAlunoPayload,
  Sexo,
  TermoCompromisso,
  TermoSaida,
  TermoUsoImagem,
} from "@/types";

/*
 * Leitura defensiva dos corpos JSON recebidos pelo mock: confere tipos e normaliza
 * espaços e máscaras. Retorna `null` quando o formato não corresponde ao contrato (422).
 */

type Registro = Record<string, unknown>;

function obj(valor: unknown): Registro | null {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor) ? (valor as Registro) : null;
}

function txt(valor: unknown): string | null {
  return typeof valor === "string" ? valor.trim() : null;
}

function opcao<T extends string>(valor: unknown, validos: readonly T[]): T | null | undefined {
  if (valor === null) return null;
  return validos.includes(valor as T) ? (valor as T) : undefined; // undefined = formato inválido
}

const SEXOS: Sexo[] = ["MASCULINO", "FEMININO"];
const CORES: CorRaca[] = ["BRANCA", "PRETA", "PARDA", "AMARELA", "INDIGENA", "NAO_DECLARADA"];
const FORMAS: FormaSaida[] = ["RESPONSAVEIS", "TRANSPORTE_ESCOLAR", "OUTROS"];

export function lerNovoAluno(valor: unknown): NovoAlunoPayload | null {
  const raiz = obj(valor);
  const a = obj(raiz?.aluno);
  const m = obj(raiz?.matricula);
  if (!a || !m) return null;

  const campos = {
    nome: txt(a.nome),
    dataNascimento: txt(a.dataNascimento),
    nis: txt(a.nis),
    rg: txt(a.rg),
    cpf: txt(a.cpf),
    naturalidade: txt(a.naturalidade),
    uf: txt(a.uf),
    nacionalidade: txt(a.nacionalidade),
    anoLetivo: txt(m.anoLetivo),
    dataMatricula: txt(m.dataMatricula),
  };
  const sexo = opcao(a.sexo, SEXOS);
  const corRaca = opcao(a.corRaca, CORES);
  const etapaId = m.etapaId === null ? null : txt(m.etapaId);
  if (Object.values(campos).some((v) => v === null) || sexo === undefined || corRaca === undefined || etapaId === undefined) {
    return null;
  }
  const c = campos as Record<keyof typeof campos, string>;

  return {
    aluno: {
      nome: c.nome,
      dataNascimento: c.dataNascimento,
      sexo,
      nis: c.nis,
      rg: c.rg,
      cpf: somenteDigitos(c.cpf),
      naturalidade: c.naturalidade,
      uf: c.uf,
      nacionalidade: c.nacionalidade,
      corRaca,
    },
    matricula: { etapaId: etapaId || null, anoLetivo: c.anoLetivo, dataMatricula: c.dataMatricula },
  };
}

export function lerTermoUsoImagem(valor: unknown): TermoUsoImagem | null {
  const raiz = obj(valor);
  const r = obj(raiz?.responsavel);
  if (!raiz || !r) return null;
  const campos = [r.nome, r.nacionalidade, r.estadoCivil, r.rg, r.cpf, r.endereco, raiz.local, raiz.data].map(txt);
  if (campos.some((v) => v === null)) return null;
  if (typeof raiz.autoriza !== "boolean") return null;
  const [nome, nacionalidade, estadoCivil, rg, cpf, endereco, local, data] = campos as string[];
  return {
    responsavel: { nome, nacionalidade, estadoCivil, rg, cpf: somenteDigitos(cpf), endereco },
    autoriza: raiz.autoriza,
    local,
    data,
  };
}

export function lerTermoSaida(valor: unknown): TermoSaida | null {
  const raiz = obj(valor);
  if (!raiz || !Array.isArray(raiz.pessoasAutorizadas)) return null;
  const nomeResponsavel = txt(raiz.nomeResponsavel);
  const local = txt(raiz.local);
  const data = txt(raiz.data);
  const formaSaida = opcao(raiz.formaSaida, FORMAS);
  const pessoas = raiz.pessoasAutorizadas.map((p) => {
    const pessoa = obj(p);
    const nome = txt(pessoa?.nome);
    const parentesco = txt(pessoa?.parentesco);
    return nome === null || parentesco === null ? null : { nome, parentesco };
  });
  if (nomeResponsavel === null || local === null || data === null || formaSaida === undefined || pessoas.includes(null)) {
    return null;
  }
  return {
    nomeResponsavel,
    formaSaida,
    pessoasAutorizadas: pessoas as TermoSaida["pessoasAutorizadas"],
    local,
    data,
  };
}

export function lerTermoCompromisso(valor: unknown): TermoCompromisso | null {
  const raiz = obj(valor);
  if (!raiz) return null;
  const nomeResponsavel = txt(raiz.nomeResponsavel);
  const cpfResponsavel = txt(raiz.cpfResponsavel);
  const dataAssinatura = txt(raiz.dataAssinatura);
  const modalidade = txt(raiz.modalidade);
  const regime = txt(raiz.regime);
  if (
    nomeResponsavel === null ||
    cpfResponsavel === null ||
    dataAssinatura === null ||
    modalidade === null ||
    regime === null ||
    typeof raiz.ciente !== "boolean"
  ) {
    return null;
  }
  return {
    nomeResponsavel,
    cpfResponsavel: somenteDigitos(cpfResponsavel),
    modalidade,
    regime,
    ciente: raiz.ciente,
    dataAssinatura,
  };
}
