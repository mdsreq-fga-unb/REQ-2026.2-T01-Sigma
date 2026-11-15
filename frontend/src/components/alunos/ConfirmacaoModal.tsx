"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { mensagemErroAluno } from "./erros";
import styles from "./Alunos.module.css";

interface ConfirmacaoModalProps {
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  rotuloEnviando: string;
  variante?: "primary" | "danger";
  /** Executa a operação; se lançar erro, a mensagem aparece no modal e nada é aplicado. */
  onConfirmar: () => Promise<void>;
  onClose: () => void;
}

/**
 * RF23 / RN15 – confirmação explícita antes de salvar, inativar ou reativar.
 * Cancelar fecha sem alterar nada (FA05).
 */
export function ConfirmacaoModal({
  titulo,
  descricao,
  rotuloConfirmar,
  rotuloEnviando,
  variante = "primary",
  onConfirmar,
  onClose,
}: ConfirmacaoModalProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    setErro(null);
    setEnviando(true);
    try {
      await onConfirmar();
    } catch (error) {
      setErro(mensagemErroAluno(error));
      setEnviando(false);
    }
  }

  return (
    <Modal title={titulo} description={descricao} onClose={onClose} dismissible={!enviando} size="sm">
      {erro && (
        <div className={styles.modalAlerta}>
          <Alert>{erro}</Alert>
        </div>
      )}
      <div className={styles.modalAcoes}>
        <Button variant="secondary" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button variant={variante} onClick={confirmar} loading={enviando}>
          {enviando ? rotuloEnviando : rotuloConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
