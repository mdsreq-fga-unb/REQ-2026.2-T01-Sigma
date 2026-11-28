import type { DocumentoAnexado, ResumoDocumento, TipoDocumento } from "@/types";

/*
 * Regras e utilitários do UC05 (documentos digitais), compartilhados entre a aba
 * Documentos, a Visão geral e o mock da API.
 */

export const TIPOS_DOCUMENTO_FAMILIA: TipoDocumento[] = [
  "CERTIDAO_NASCIMENTO",
  "COMPROVANTE_RESIDENCIA",
  "FOTO_3X4",
  "CARTAO_VACINA",
  "HISTORICO_ESCOLAR",
];

export const TIPOS_FICHA_ASSINADA: TipoDocumento[] = [
  "REQUERIMENTO_ASSINADO",
  "SOCIOECONOMICA_ASSINADA",
  "USO_IMAGEM_ASSINADO",
  "SAIDA_ASSINADO",
  "COMPROMISSO_ASSINADO",
];

export const NOMES_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
  CERTIDAO_NASCIMENTO: "Certidão de nascimento",
  COMPROVANTE_RESIDENCIA: "Comprovante de residência",
  FOTO_3X4: "2 fotos 3×4",
  CARTAO_VACINA: "Cartão de vacina",
  HISTORICO_ESCOLAR: "Histórico escolar",
  REQUERIMENTO_ASSINADO: "Requerimento de matrícula (assinado)",
  SOCIOECONOMICA_ASSINADA: "Ficha socioeconômica (assinada)",
  USO_IMAGEM_ASSINADO: "Uso de imagem (assinado)",
  SAIDA_ASSINADO: "Saída do aluno (assinado)",
  COMPROMISSO_ASSINADO: "Compromisso escolar (assinado)",
};

/** Grupos do select "Tipo de documento". */
export const GRUPOS_TIPO_DOCUMENTO: { rotulo: string; tipos: TipoDocumento[] }[] = [
  { rotulo: "Documentos da família", tipos: TIPOS_DOCUMENTO_FAMILIA },
  { rotulo: "Fichas assinadas", tipos: TIPOS_FICHA_ASSINADA },
];

/** Documentos que o responsável se compromete a entregar no termo de compromisso. */
export const TIPOS_DOCUMENTO_EXIGIDOS: TipoDocumento[] = TIPOS_DOCUMENTO_FAMILIA;

/** Ordem da tabela "Documentos anexados": documentos da família e depois fichas assinadas. */
const ORDEM_TIPO = [...TIPOS_DOCUMENTO_FAMILIA, ...TIPOS_FICHA_ASSINADA];

export const PRAZO_ENTREGA_DIAS = 30;

/** Tamanho máximo sugerido; o limite final é do backend. */
export const TAMANHO_MAXIMO_MB = 10;
export const TAMANHO_MAXIMO_BYTES = TAMANHO_MAXIMO_MB * 1024 * 1024;

export const MSG_DOCUMENTOS = {
  formatoInvalido: "Formato de arquivo inválido. Envie um arquivo PDF.", // FE01 (RN05)
  arquivoGrande: `O arquivo tem mais de ${TAMANHO_MAXIMO_MB} MB e pode ser recusado pelo servidor.`,
  anexado: "Documento anexado com sucesso.", // FP01 (RF14)
  substituido: "Documento substituído com sucesso.", // FA01 (RF15)
  inativo: "Card inativo: os documentos podem ser baixados, mas não é possível anexar nem substituir.",
} as const;

export function ehTipoDocumento(valor: unknown): valor is TipoDocumento {
  return typeof valor === "string" && valor in NOMES_TIPO_DOCUMENTO;
}

/** RN05: só PDF. Confere a extensão e o MIME type (o backend valida de novo). */
export function arquivoEhPdf(arquivo: { name: string; type: string }): boolean {
  const extensaoPdf = /\.pdf$/i.test(arquivo.name.trim());
  // Alguns sistemas não informam o MIME type; nesse caso vale a extensão.
  const mimePdf = arquivo.type === "" || arquivo.type === "application/pdf";
  return extensaoPdf && mimePdf;
}

/** Ordena os anexos na ordem dos tipos do select. */
export function ordenarDocumentos(itens: DocumentoAnexado[]): DocumentoAnexado[] {
  return [...itens].sort((a, b) => ORDEM_TIPO.indexOf(a.tipo) - ORDEM_TIPO.indexOf(b.tipo));
}

/** Situação dos documentos exigidos a partir dos anexos (Visão geral e pendências). */
export function resumoDocumentos(itens: Pick<DocumentoAnexado, "tipo">[]): ResumoDocumento[] {
  const anexados = new Set(itens.map((d) => d.tipo));
  return TIPOS_DOCUMENTO_EXIGIDOS.map((tipo) => ({
    tipo,
    nome: NOMES_TIPO_DOCUMENTO[tipo],
    situacao: anexados.has(tipo) ? "ENTREGUE" : "PENDENTE",
  }));
}

/** Prazo de entrega dos documentos: data do aceite do termo + 30 dias (AAAA-MM-DD). */
export function prazoEntregaDocumentos(dataAceiteIso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dataAceiteIso);
  if (!m) return "";
  const data = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  data.setUTCDate(data.getUTCDate() + PRAZO_ENTREGA_DIAS);
  return data.toISOString().slice(0, 10);
}
