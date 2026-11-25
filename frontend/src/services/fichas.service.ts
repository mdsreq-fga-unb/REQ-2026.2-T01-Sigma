import { api, baixarArquivo, isApiError, usandoBackendReal } from "@/services/api";
import type {
  BackendRequerimentoMatricula,
  BackendSocioeconomica,
  BackendTermoImagem,
  BackendTermoSaida,
  BackendTextoTermoUsoImagem,
} from "@/types";

export { usandoBackendReal };

export async function obterSocioeconomica(matriculaId: string): Promise<BackendSocioeconomica> {
  const { data } = await api.get<BackendSocioeconomica>(`/matriculas/${encodeURIComponent(matriculaId)}/socioeconomica`);
  return data;
}

export async function salvarSocioeconomica(
  matriculaId: string,
  payload: unknown,
): Promise<BackendSocioeconomica> {
  const { data } = await api.put<BackendSocioeconomica>(`/matriculas/${encodeURIComponent(matriculaId)}/socioeconomica`, payload);
  return data;
}

export async function baixarPdfSocioeconomica(matriculaId: string): Promise<void> {
  const resposta = await api.get<Blob>(`/matriculas/${encodeURIComponent(matriculaId)}/socioeconomica/pdf`, { responseType: "blob" });
  await baixarArquivo(resposta, `socioeconomica-${matriculaId}.pdf`);
}

export async function obterRequerimento(matriculaId: string): Promise<BackendRequerimentoMatricula> {
  const { data } = await api.get<BackendRequerimentoMatricula>(`/matriculas/${encodeURIComponent(matriculaId)}/requerimento`);
  return data;
}

export async function salvarRequerimento(
  matriculaId: string,
  payload: unknown,
): Promise<BackendRequerimentoMatricula> {
  const { data } = await api.put<BackendRequerimentoMatricula>(`/matriculas/${encodeURIComponent(matriculaId)}/requerimento`, payload);
  return data;
}

export async function baixarPdfRequerimento(matriculaId: string): Promise<void> {
  const resposta = await api.get<Blob>(`/matriculas/${encodeURIComponent(matriculaId)}/requerimento/pdf`, { responseType: "blob" });
  await baixarArquivo(resposta, `requerimento-${matriculaId}.pdf`);
}

export async function obterTermoImagem(matriculaId: string): Promise<BackendTermoImagem> {
  const { data } = await api.get<BackendTermoImagem>(`/matriculas/${encodeURIComponent(matriculaId)}/termo-imagem`);
  return data;
}

export async function salvarTermoImagem(matriculaId: string, payload: unknown): Promise<BackendTermoImagem> {
  const { data } = await api.put<BackendTermoImagem>(`/matriculas/${encodeURIComponent(matriculaId)}/termo-imagem`, payload);
  return data;
}

export async function baixarPdfTermoImagem(matriculaId: string): Promise<void> {
  const resposta = await api.get<Blob>(`/matriculas/${encodeURIComponent(matriculaId)}/termo-imagem/pdf`, { responseType: "blob" });
  await baixarArquivo(resposta, `termo-uso-imagem-${matriculaId}.pdf`);
}

export async function obterTermoSaida(matriculaId: string): Promise<BackendTermoSaida> {
  const { data } = await api.get<BackendTermoSaida>(`/matriculas/${encodeURIComponent(matriculaId)}/termo-saida`);
  return data;
}

export async function salvarTermoSaida(matriculaId: string, payload: unknown): Promise<BackendTermoSaida> {
  const { data } = await api.put<BackendTermoSaida>(`/matriculas/${encodeURIComponent(matriculaId)}/termo-saida`, payload);
  return data;
}

export async function baixarPdfTermoSaida(matriculaId: string): Promise<void> {
  const resposta = await api.get<Blob>(`/matriculas/${encodeURIComponent(matriculaId)}/termo-saida/pdf`, { responseType: "blob" });
  await baixarArquivo(resposta, `termo-saida-${matriculaId}.pdf`);
}

export async function obterTextoTermoUsoImagem(): Promise<BackendTextoTermoUsoImagem> {
  const { data } = await api.get<BackendTextoTermoUsoImagem>("/termos/uso-imagem/texto");
  return data;
}

export function naoEncontradoFicha(erro: unknown): boolean {
  return isApiError(erro) && (erro.status === 404 || erro.code === "NAO_ENCONTRADO");
}
