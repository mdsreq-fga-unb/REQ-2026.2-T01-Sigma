import type { Matricula, NovaMatriculaPayload } from "@/types";
import { api } from "./api";

export async function listarMatriculas(): Promise<Matricula[]> {
  const { data } = await api.get<Matricula[]>("/matriculas");
  return data;
}

export async function criarMatricula(payload: NovaMatriculaPayload): Promise<Matricula> {
  const { data } = await api.post<Matricula>("/matriculas", payload);
  return data;
}

export async function editarMatricula(id: string, payload: NovaMatriculaPayload): Promise<Matricula> {
  const { data } = await api.put<Matricula>(`/matriculas/${encodeURIComponent(id)}`, payload);
  return data;
}

export async function inativarMatricula(id: string): Promise<Matricula> {
  const { data } = await api.patch<Matricula>(`/matriculas/${encodeURIComponent(id)}/inativar`);
  return data;
}

export async function reativarMatricula(id: string): Promise<Matricula> {
  const { data } = await api.patch<Matricula>(`/matriculas/${encodeURIComponent(id)}/reativar`);
  return data;
}
