"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MSG } from "@/lib/mensagens";
import { isApiError } from "@/services/api";
import { reativarUsuario } from "@/services/usuarios.service";
import type { Usuario } from "@/types";
import styles from "./UsuarioModais.module.css";

interface ReativarUsuarioModalProps {
  usuario: Usuario;
  onClose: () => void;
  onReativado: (usuario: Usuario) => void;
}

// UC02 – Reativar usuário inativo (somente administradores)
export function ReativarUsuarioModal({ usuario, onClose, onReativado }: ReativarUsuarioModalProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    setErro(null);
    setEnviando(true);
    try {
      onReativado(await reativarUsuario(usuario.id));
    } catch (error) {
      const code = isApiError(error) ? error.code : "ERRO_DESCONHECIDO";
      setErro(
        code === "FALHA_CONEXAO"
          ? MSG.falhaConexao
          : code === "SEM_PERMISSAO"
            ? MSG.semPermissao
            : code === "NAO_ENCONTRADO"
              ? "A conta não foi encontrada. Atualize a listagem."
              : MSG.erroInesperado,
      );
      setEnviando(false);
    }
  }

  return (
    <Modal
      title="Reativar usuário"
      description={`Reativar a conta de ${usuario.nome}? Essa pessoa voltará a conseguir entrar no SIGMA com a senha que já possui.`}
      onClose={onClose}
      dismissible={!enviando}
      size="sm"
    >
      {erro && (
        <div className={styles.alertSpacing}>
          <Alert>{erro}</Alert>
        </div>
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button onClick={confirmar} loading={enviando}>
          {enviando ? "Reativando..." : "Reativar"}
        </Button>
      </div>
    </Modal>
  );
}
