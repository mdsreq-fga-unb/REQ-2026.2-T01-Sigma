"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MSG } from "@/lib/mensagens";
import { isApiError } from "@/services/api";
import { inativarTurma, reativarTurma } from "@/services/turmas.service";
import type { Turma } from "@/types";
import { mensagemDeErro } from "./useTurmasEtapas";
import styles from "./TurmaModais.module.css";

export type AcaoStatusTurma = "INATIVAR" | "REATIVAR";

interface AlterarStatusTurmaModalProps {
  turma: Turma;
  acao: AcaoStatusTurma;
  onClose: () => void;
  onAlterada: (turma: Turma, acao: AcaoStatusTurma) => void;
}

const TEXTOS: Record<AcaoStatusTurma, { titulo: string; descricao: string; botao: string; enviando: string }> = {
  INATIVAR: {
    titulo: "Inativar a",
    descricao: "Os alunos continuam vinculados e a turma segue aparecendo na busca, marcada como inativa.",
    botao: "Inativar turma",
    enviando: "Inativando...",
  },
  REATIVAR: {
    titulo: "Reativar a",
    descricao: "A turma volta a ficar ativa e pode receber novos alunos.",
    botao: "Reativar turma",
    enviando: "Reativando...",
  },
};

// UC06 FP04 – Inativar turma (RF19, RN12) e reativação da turma, ambas com confirmação.
export function AlterarStatusTurmaModal({ turma, acao, onClose, onAlterada }: AlterarStatusTurmaModalProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const textos = TEXTOS[acao];

  async function confirmar() {
    setErro(null);
    setEnviando(true);
    try {
      const atualizada = acao === "INATIVAR" ? await inativarTurma(turma.id) : await reativarTurma(turma.id);
      onAlterada(atualizada, acao);
    } catch (error) {
      const code = isApiError(error) ? error.code : null;
      setErro(
        code === "ETAPA_INATIVA"
          ? `${MSG.vinculoInativo} Reative a etapa ${turma.etapa.nome} antes de reativar a turma.`
          : code === "NAO_ENCONTRADO"
            ? "A turma não foi encontrada. Atualize a listagem."
            : mensagemDeErro(error),
      );
      setEnviando(false);
    }
  }

  return (
    <Modal
      title={`${textos.titulo} ${turma.nome}?`}
      description={textos.descricao}
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
        <Button variant={acao === "INATIVAR" ? "danger" : "primary"} onClick={confirmar} loading={enviando}>
          {enviando ? textos.enviando : textos.botao}
        </Button>
      </div>
    </Modal>
  );
}
