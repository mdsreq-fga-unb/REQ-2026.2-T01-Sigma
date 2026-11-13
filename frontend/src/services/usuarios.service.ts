import type { NovoUsuarioPayload, Usuario } from "@/types";
import { api } from "./api";

interface UsuarioBackend {
  id: number | string;
  nome: string;
  email: string;
  is_Admin: boolean;
  ativo: boolean;
  created_at?: string;
}

interface PaginaUsuariosBackend {
  itens: UsuarioBackend[];
  total: number;
  pagina: number;
  tamanho: number;
}

function normalizarUsuario(usuario: UsuarioBackend): Usuario {
  return {
    id: String(usuario.id),
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.is_Admin ? "ADMINISTRADOR" : "USUARIO",
    ativo: usuario.ativo,
    criadoEm: usuario.created_at ?? new Date().toISOString(),
    criadoPor: null,
  };
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const usuarios: Usuario[] = [];
  let pagina = 1;
  let total = 0;

  do {
    const { data } = await api.get<PaginaUsuariosBackend>("/usuarios", {
      params: { pagina, tamanho: 100 },
    });
    usuarios.push(...data.itens.map(normalizarUsuario));
    total = data.total;
    pagina += 1;
  } while (usuarios.length < total);

  return usuarios;
}

export async function criarUsuario(payload: NovoUsuarioPayload): Promise<Usuario> {
  const { data } = await api.post<UsuarioBackend>("/usuarios", payload);
  return normalizarUsuario(data);
}

export async function inativarUsuario(id: string): Promise<Usuario> {
  const { data } = await api.patch<UsuarioBackend>(`/usuarios/${encodeURIComponent(id)}/inativar`);
  return normalizarUsuario(data);
}

export async function reativarUsuario(id: string): Promise<Usuario> {
  const { data } = await api.patch<UsuarioBackend>(`/usuarios/${encodeURIComponent(id)}/reativar`);
  return normalizarUsuario(data);
}
