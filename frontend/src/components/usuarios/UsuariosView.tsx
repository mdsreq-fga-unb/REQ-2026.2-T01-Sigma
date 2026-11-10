"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { MSG } from "@/lib/mensagens";
import { isApiError } from "@/services/api";
import { listarUsuarios } from "@/services/usuarios.service";
import type { Usuario } from "@/types";
import { InativarUsuarioModal } from "./InativarUsuarioModal";
import { NovoUsuarioModal } from "./NovoUsuarioModal";
import { ReativarUsuarioModal } from "./ReativarUsuarioModal";
import { UsuariosTable, UsuariosTableSkeleton } from "./UsuariosTable";
import styles from "./UsuariosView.module.css";

type Listagem =
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "ok"; usuarios: Usuario[] };

// UC02 – Gerenciar Usuários Administrativos (RF05, RN19, RN20, RN21)
export function UsuariosView() {
  const { usuario: logado, isAdmin } = useAuth();
  const toast = useToast();
  const [listagem, setListagem] = useState<Listagem>({ status: "carregando" });
  const [novoAberto, setNovoAberto] = useState(false);
  const [paraInativar, setParaInativar] = useState<Usuario | null>(null);
  const [paraReativar, setParaReativar] = useState<Usuario | null>(null);

  const carregar = useCallback(async () => {
    setListagem({ status: "carregando" });
    try {
      setListagem({ status: "ok", usuarios: await listarUsuarios() });
    } catch (error) {
      const conexao = isApiError(error) && error.code === "FALHA_CONEXAO";
      setListagem({ status: "erro", mensagem: conexao ? MSG.falhaConexao : MSG.erroInesperado });
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function atualizarLista(alterar: (usuarios: Usuario[]) => Usuario[]) {
    setListagem((atual) => (atual.status === "ok" ? { status: "ok", usuarios: alterar(atual.usuarios) } : atual));
  }

  function onCriado(criado: Usuario) {
    atualizarLista((usuarios) => [...usuarios, criado]);
    setNovoAberto(false);
    toast("Conta criada com sucesso");
  }

  function onInativado(inativado: Usuario) {
    atualizarLista((usuarios) => usuarios.map((u) => (u.id === inativado.id ? inativado : u)));
    setParaInativar(null);
    toast(`Conta de ${inativado.nome} inativada`);
  }

  function onReativado(reativado: Usuario) {
    atualizarLista((usuarios) => usuarios.map((u) => (u.id === reativado.id ? reativado : u)));
    setParaReativar(null);
    toast(`Conta de ${reativado.nome} reativada`);
  }

  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle="Pessoas com acesso ao SIGMA e o perfil de cada conta: administrador ou usuário (secretaria)."
        action={isAdmin && <Button onClick={() => setNovoAberto(true)}>+ Novo usuário</Button>}
      />

      {listagem.status === "carregando" && <UsuariosTableSkeleton isAdmin={isAdmin} />}

      {listagem.status === "erro" && (
        <div className={styles.estado}>
          <Alert>{listagem.mensagem}</Alert>
          <Button variant="secondary" onClick={carregar}>
            Tentar novamente
          </Button>
        </div>
      )}

      {listagem.status === "ok" &&
        (listagem.usuarios.length === 0 ? (
          <div className={styles.vazio}>Nenhum usuário cadastrado.</div>
        ) : (
          <UsuariosTable
            usuarios={listagem.usuarios}
            usuarioLogadoId={logado.id}
            isAdmin={isAdmin}
            onInativar={setParaInativar}
            onReativar={setParaReativar}
          />
        ))}

      <p className={styles.nota}>Somente administradores podem criar novas contas.</p>

      {isAdmin && novoAberto && <NovoUsuarioModal onClose={() => setNovoAberto(false)} onCriado={onCriado} />}
      {isAdmin && paraInativar && (
        <InativarUsuarioModal
          usuario={paraInativar}
          onClose={() => setParaInativar(null)}
          onInativado={onInativado}
        />
      )}
      {isAdmin && paraReativar && (
        <ReativarUsuarioModal
          usuario={paraReativar}
          onClose={() => setParaReativar(null)}
          onReativado={onReativado}
        />
      )}
    </>
  );
}
