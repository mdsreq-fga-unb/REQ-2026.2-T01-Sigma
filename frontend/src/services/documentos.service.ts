import type { DocumentosAluno, TipoDocumento } from "@/types";
import { api, baixarArquivo, usandoBackendReal } from "./api";

/*
 * UC05 – Documentos digitais do card (RF14, RF15, RF16).
 * Contrato proposto ao backend (ainda sem rotas; ver "Dependências de backend" da issue):
 * - `GET  /alunos/{id}/documentos`                        → DocumentosAluno
 * - `POST /alunos/{id}/documentos`  (multipart: arquivo, tipo) → DocumentosAluno
 * - `PUT  /alunos/{id}/documentos/{documentoId}` (multipart: arquivo) → DocumentosAluno
 * - `GET  /alunos/{id}/documentos/{documentoId}/arquivo`  → PDF (Content-Disposition com o nome original)
 */

/** O axios só envia FormData como multipart se o Content-Type padrão (JSON) for trocado. */
const MULTIPART = { headers: { "Content-Type": "multipart/form-data" } };

/** Upload pode demorar mais que o timeout padrão de 10 s em conexões lentas. */
const TIMEOUT_UPLOAD_MS = 60_000;

function indisponivelNoBackend(): never {
  throw {
    status: 501,
    code: "ERRO_DESCONHECIDO",
    message: "Os documentos digitais ainda não estão disponíveis no backend.",
  };
}

const rota = (idAluno: string) => `/alunos/${encodeURIComponent(idAluno)}/documentos`;

export async function listarDocumentos(idAluno: string): Promise<DocumentosAluno> {
  if (usandoBackendReal) indisponivelNoBackend();
  const { data } = await api.get<DocumentosAluno>(rota(idAluno));
  return data;
}

/** RF14 – anexa um PDF de um tipo que ainda não tem arquivo. */
export async function anexarDocumento(idAluno: string, tipo: TipoDocumento, arquivo: File): Promise<DocumentosAluno> {
  if (usandoBackendReal) indisponivelNoBackend();
  const form = new FormData();
  form.append("tipo", tipo);
  form.append("arquivo", arquivo, arquivo.name);
  const { data } = await api.post<DocumentosAluno>(rota(idAluno), form, { ...MULTIPART, timeout: TIMEOUT_UPLOAD_MS });
  return data;
}

/** RF15 – troca o PDF anexado; o arquivo anterior é removido. */
export async function substituirDocumento(idAluno: string, documentoId: string, arquivo: File): Promise<DocumentosAluno> {
  if (usandoBackendReal) indisponivelNoBackend();
  const form = new FormData();
  form.append("arquivo", arquivo, arquivo.name);
  const { data } = await api.put<DocumentosAluno>(`${rota(idAluno)}/${encodeURIComponent(documentoId)}`, form, {
    ...MULTIPART,
    timeout: TIMEOUT_UPLOAD_MS,
  });
  return data;
}

/** RF16 – baixa o PDF com o nome original do arquivo. */
export async function baixarDocumento(idAluno: string, documentoId: string, nomeArquivo: string): Promise<void> {
  if (usandoBackendReal) indisponivelNoBackend();
  const resposta = await api.get<Blob>(`${rota(idAluno)}/${encodeURIComponent(documentoId)}/arquivo`, {
    responseType: "blob",
    timeout: TIMEOUT_UPLOAD_MS,
  });
  await baixarArquivo(resposta, nomeArquivo);
}
