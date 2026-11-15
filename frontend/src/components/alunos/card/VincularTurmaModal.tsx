"use client";

import { useEffect, useId, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { IconSearch } from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Modal";
import { MSG } from "@/lib/mensagens";
import { vincularTurma } from "@/services/alunos.service";
import { listarTurmas } from "@/services/turmas.service";
import type { AlunoCard, Turma } from "@/types";
import { mensagemErroAluno } from "../erros";
import shared from "../Alunos.module.css";
import styles from "./AlunoCard.module.css";

const ATRASO_BUSCA_MS = 300;

interface VincularTurmaModalProps {
  card: AlunoCard;
  onClose: () => void;
  onVinculado: (card: AlunoCard) => void;
}

type Lista = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "ok"; turmas: Turma[] };

/**
 * UC04 – "Vincular à turma" (RF13, RF22): busca pelo nome da turma; só turmas ativas
 * aparecem (RN11). A etapa do aluno passa a ser a etapa da turma escolhida.
 */
export function VincularTurmaModal({ card, onClose, onVinculado }: VincularTurmaModalProps) {
  const buscaId = useId();
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<Lista>({ status: "carregando" });
  const [selecionada, setSelecionada] = useState<string | null>(card.turma?.id ?? null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    const timer = setTimeout(
      () => {
        setLista({ status: "carregando" });
        listarTurmas({ busca, status: "ATIVO" }).then(
          (turmas) => !cancelado && setLista({ status: "ok", turmas: turmas.filter((t) => t.status === "ATIVO") }),
          (error) => !cancelado && setLista({ status: "erro", mensagem: mensagemErroAluno(error, "carregar") }),
        );
      },
      busca ? ATRASO_BUSCA_MS : 0,
    );
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [busca]);

  async function vincular() {
    if (!selecionada) return;
    setErro(null);
    setEnviando(true);
    try {
      onVinculado(await vincularTurma(card.id, selecionada));
    } catch (error) {
      setErro(mensagemErroAluno(error));
      setEnviando(false);
    }
  }

  return (
    <Modal
      title={`Vincular ${card.aluno.nome} a uma turma`}
      description="Busque pelo nome da turma. Só aparecem turmas ativas."
      onClose={onClose}
      dismissible={!enviando}
    >
      <div className={styles.buscaTurma}>
        <label htmlFor={buscaId} className="sr-only">
          Buscar turma
        </label>
        <IconSearch size={18} className={styles.buscaTurmaIcone} />
        <input
          id={buscaId}
          type="search"
          placeholder="Buscar turma..."
          autoComplete="off"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className={styles.listaTurmas} aria-busy={lista.status === "carregando" || undefined}>
        {lista.status === "erro" ? (
          <Alert>{lista.mensagem}</Alert>
        ) : lista.status === "carregando" ? (
          <p className={shared.carregando} role="status">
            Carregando turmas...
          </p>
        ) : lista.turmas.length === 0 ? (
          <p className={shared.carregando} role="status">
            {MSG.nenhumResultado}
          </p>
        ) : (
          <fieldset className={styles.radiosTurma}>
            <legend className="sr-only">Turmas ativas</legend>
            {lista.turmas.map((turma) => (
              <label key={turma.id} className={styles.opcaoTurma}>
                <input
                  type="radio"
                  name="turma"
                  value={turma.id}
                  checked={selecionada === turma.id}
                  onChange={() => setSelecionada(turma.id)}
                />
                {turma.nome} · {turma.etapa.nome} · {turma.quantidadeAlunos}{" "}
                {turma.quantidadeAlunos === 1 ? "aluno" : "alunos"}
              </label>
            ))}
          </fieldset>
        )}
      </div>

      <p className={styles.notaModal}>A etapa do aluno passa a ser a etapa da turma escolhida.</p>

      {erro && (
        <div className={shared.modalAlerta}>
          <Alert>{erro}</Alert>
        </div>
      )}

      <div className={shared.modalAcoes}>
        <Button variant="secondary" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button
          onClick={vincular}
          loading={enviando}
          disabled={!selecionada || selecionada === card.turma?.id}
        >
          {enviando ? "Vinculando..." : "Vincular"}
        </Button>
      </div>
    </Modal>
  );
}
