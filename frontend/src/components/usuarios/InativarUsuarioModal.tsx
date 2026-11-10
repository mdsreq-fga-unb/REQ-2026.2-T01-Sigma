"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MSG } from "@/lib/mensagens";
import { isApiError } from "@/services/api";
import { inativarUsuario } from "@/services/usuarios.service";
import type { Usuario } from "@/types";
import styles from "./UsuarioModais.module.css";

interface InativarUsuarioModalProps {
  usuario: Usuario;
  onClose: () => void;
  onInativado: (usuario: Usuario) => void;
}

// UC02 – Inativar usuário (RN21: não há exclusão, apenas inativação)
export function InativarUsuarioModal({ usuario, onClose, onInativado }: InativarUsuarioModalProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    setErro(null);
    setEnviando(true);
    try {
      onInativado(await inativarUsuario(usuario.id));
    } catch (error) {
      const code = isApiError(error) ? error.code : "ERRO_DESCONHECIDO";
      setErro(
        code === "FALHA_CONEXAO" ? MSG.falhaConexao : code === "SEM_PERMISSAO" ? MSG.semPermissao : MSG.erroInesperado,
      );
      setEnviando(false);
    }
  }

  return (
    <Modal
      title="Inativar usuário"
      description={`Inativar a conta de ${usuario.nome}? Essa pessoa não conseguirá mais entrar no SIGMA.`}
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
        <Button variant="danger" onClick={confirmar} loading={enviando}>
          {enviando ? "Inativando..." : "Inativar"}
        </Button>
      </div>
    </Modal>
  );
}
