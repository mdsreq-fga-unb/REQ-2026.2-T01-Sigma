"use client";

import { useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { MSG } from "@/lib/mensagens";
import { isApiError } from "@/services/api";
import { criarEtapa } from "@/services/etapas.service";
import type { Etapa } from "@/types";
import { mensagemDeErro } from "./useTurmasEtapas";
import styles from "./TurmaModais.module.css";

interface NovaEtapaModalProps {
  onClose: () => void;
  onCriada: (etapa: Etapa) => void;
}

// UC06 FP01 – Cadastrar etapa (RF18, RN13, RN22)
export function NovaEtapaModal({ onClose, onCriada }: NovaEtapaModalProps) {
  const [nome, setNome] = useState("");
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const nomeRef = useRef<HTMLInputElement>(null);

  function mostrarErroNome(mensagem: string) {
    setErroNome(mensagem);
    nomeRef.current?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;

    setErroGeral(null);
    setErroNome(null);
    if (!nome.trim()) {
      mostrarErroNome(MSG.camposObrigatorios); // FE01
      return;
    }

    setEnviando(true);
    try {
      onCriada(await criarEtapa({ nome: nome.trim() }));
    } catch (error) {
      const code = isApiError(error) ? error.code : null;
      if (code === "ETAPA_NOME_EM_USO") mostrarErroNome(MSG.etapaNomeEmUso); // FE02
      else if (code === "DADOS_INVALIDOS") mostrarErroNome(MSG.camposObrigatorios);
      else setErroGeral(mensagemDeErro(error)); // FE06
      setEnviando(false);
    }
  }

  return (
    <Modal
      title="Nova etapa"
      description="Etapa é a série de ensino (ex.: Berçário, Maternal I, Maternal II)."
      onClose={onClose}
      dismissible={!enviando}
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          ref={nomeRef}
          label="Nome da etapa"
          required
          name="nome"
          autoComplete="off"
          placeholder="Ex.: Maternal I"
          maxLength={80}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={erroNome ?? undefined}
          disabled={enviando}
        />

        {erroGeral && <Alert>{erroGeral}</Alert>}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar etapa"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
