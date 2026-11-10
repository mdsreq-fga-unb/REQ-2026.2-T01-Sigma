"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { IconChevronDown } from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import formStyles from "@/components/ui/Form.module.css";
import { MSG } from "@/lib/mensagens";
import { isApiError } from "@/services/api";
import { listarEtapas } from "@/services/etapas.service";
import { criarTurma } from "@/services/turmas.service";
import type { Etapa, Turma } from "@/types";
import { mensagemDeErro } from "./useTurmasEtapas";
import styles from "./TurmaModais.module.css";

interface NovaTurmaModalProps {
  onClose: () => void;
  onCriada: (turma: Turma) => void;
}

type EtapasAtivas =
  | { status: "carregando" }
  | { status: "erro"; mensagem: string }
  | { status: "ok"; etapas: Etapa[] };

type Campo = "nome" | "etapa";
type Erros = Partial<Record<Campo, string>>;

// UC06 FP02 – Cadastrar turma (RF24, RN04, RN11, RN14, RN22)
export function NovaTurmaModal({ onClose, onCriada }: NovaTurmaModalProps) {
  const [nome, setNome] = useState("");
  const [etapaId, setEtapaId] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [etapasAtivas, setEtapasAtivas] = useState<EtapasAtivas>({ status: "carregando" });

  const etapaFieldId = useId();
  const etapaErroId = `${etapaFieldId}-erro`;
  const refs = { nome: useRef<HTMLInputElement>(null), etapa: useRef<HTMLSelectElement>(null) };

  // RN11: só etapas ativas podem receber novas turmas.
  useEffect(() => {
    let ativo = true;
    listarEtapas({ status: "ATIVO" })
      .then((etapas) => ativo && setEtapasAtivas({ status: "ok", etapas }))
      .catch((error) => ativo && setEtapasAtivas({ status: "erro", mensagem: mensagemDeErro(error) }));
    return () => {
      ativo = false;
    };
  }, []);

  const semEtapas = etapasAtivas.status === "ok" && etapasAtivas.etapas.length === 0; // FE04
  const podeEnviar = etapasAtivas.status === "ok" && !semEtapas;

  function mostrarErros(novos: Erros) {
    setErros(novos);
    const primeiro = (["nome", "etapa"] as Campo[]).find((c) => novos[c]);
    if (primeiro) refs[primeiro].current?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando || !podeEnviar) return;

    setErroGeral(null);
    const novos: Erros = {};
    if (!nome.trim()) novos.nome = "Informe o nome da turma.";
    if (!etapaId) novos.etapa = "Selecione a etapa da turma.";
    if (Object.keys(novos).length > 0) {
      setErroGeral(MSG.camposObrigatorios); // FE01
      mostrarErros(novos);
      return;
    }

    setErros({});
    setEnviando(true);
    try {
      onCriada(await criarTurma({ nome: nome.trim(), etapaId }));
    } catch (error) {
      const code = isApiError(error) ? error.code : null;
      if (code === "TURMA_NOME_EM_USO") mostrarErros({ nome: MSG.turmaNomeEmUso }); // FE03
      else if (code === "ETAPA_INATIVA") mostrarErros({ etapa: MSG.vinculoInativo }); // FE05
      else if (code === "DADOS_INVALIDOS") setErroGeral(MSG.camposObrigatorios);
      else setErroGeral(mensagemDeErro(error)); // FE06
      setEnviando(false);
    }
  }

  const placeholderEtapa =
    etapasAtivas.status === "carregando" ? "Carregando etapas..." : "Selecione uma etapa ativa";

  return (
    <Modal
      title="Nova turma"
      description="Toda turma precisa estar vinculada a uma etapa ativa."
      onClose={onClose}
      dismissible={!enviando}
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          ref={refs.nome}
          label="Nome da turma"
          required
          name="nome"
          autoComplete="off"
          placeholder="Ex.: Turma E"
          maxLength={80}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={erros.nome}
          disabled={enviando}
        />

        <div className={formStyles.field}>
          <label htmlFor={etapaFieldId} className={formStyles.label}>
            Etapa
            <span className={formStyles.required} aria-hidden="true">
              {" "}
              *
            </span>
          </label>
          <div className={styles.selectWrap}>
            <select
              ref={refs.etapa}
              id={etapaFieldId}
              name="etapa"
              className={`${formStyles.input} ${styles.select} ${etapaId ? "" : styles.placeholder}`}
              value={etapaId}
              onChange={(e) => setEtapaId(e.target.value)}
              disabled={enviando || !podeEnviar}
              aria-required="true"
              aria-invalid={erros.etapa ? true : undefined}
              aria-describedby={erros.etapa ? etapaErroId : undefined}
            >
              <option value="" disabled>
                {placeholderEtapa}
              </option>
              {etapasAtivas.status === "ok" &&
                etapasAtivas.etapas.map((etapa) => (
                  <option key={etapa.id} value={etapa.id}>
                    {etapa.nome}
                  </option>
                ))}
            </select>
            <IconChevronDown size={18} className={styles.chevron} />
          </div>
          {erros.etapa && (
            <p id={etapaErroId} className={formStyles.error}>
              {erros.etapa}
            </p>
          )}
        </div>

        {semEtapas && <Alert variant="info">{MSG.semEtapasAtivas}</Alert>}
        {etapasAtivas.status === "erro" && <Alert>{etapasAtivas.mensagem}</Alert>}
        {erroGeral && <Alert>{erroGeral}</Alert>}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando} disabled={!podeEnviar}>
            {enviando ? "Cadastrando..." : "Cadastrar turma"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
