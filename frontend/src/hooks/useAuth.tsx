"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { isApiError } from "@/services/api";
import * as authService from "@/services/auth.service";
import { TEMPO_INATIVIDADE_MS } from "@/lib/sessao";
import type { Usuario } from "@/types";
import { useInactivityLogout } from "./useInactivityLogout";

type EstadoSessao =
  | { status: "carregando" }
  | { status: "autenticado"; usuario: Usuario }
  | { status: "erro" };

interface AuthContextValue {
  usuario: Usuario;
  isAdmin: boolean;
  logout: (motivo?: "inatividade") => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  carregando: ReactNode;
  erro: (tentarNovamente: () => void) => ReactNode;
}

/**
 * Carrega a sessão atual (GET /auth/me) e só renderiza a área interna quando há usuário
 * autenticado (RNF02). Um 401 é tratado pelo interceptor do Axios (redireciona ao login).
 */
export function AuthProvider({ children, carregando, erro }: AuthProviderProps) {
  const [estado, setEstado] = useState<EstadoSessao>({ status: "carregando" });

  const carregar = useCallback(async () => {
    setEstado({ status: "carregando" });
    try {
      const usuario = await authService.sessaoAtual();
      setEstado({ status: "autenticado", usuario });
    } catch (error) {
      // 401 já redirecionou para /login; mantém o carregamento para não exibir nada interno.
      if (isApiError(error) && error.status === 401) return;
      setEstado({ status: "erro" });
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // Página restaurada do bfcache (botão "voltar"): recarrega para revalidar a sessão.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const logout = useCallback(async (motivo?: "inatividade") => {
    try {
      await authService.logout();
    } catch {
      // Mesmo sem resposta da API, a sessão local é descartada.
    }
    // replace: a página interna não fica no histórico do navegador.
    window.location.replace(motivo ? `/login?motivo=${motivo}` : "/login");
  }, []);

  useInactivityLogout(() => void logout("inatividade"), TEMPO_INATIVIDADE_MS, estado.status === "autenticado");

  if (estado.status === "carregando") return <>{carregando}</>;
  if (estado.status === "erro") return <>{erro(() => void carregar())}</>;

  const value: AuthContextValue = {
    usuario: estado.usuario,
    isAdmin: estado.usuario.perfil === "ADMINISTRADOR",
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
