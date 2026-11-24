"use client";

import { useId, useState } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import {
  OPCOES_MODALIDADE,
  OPCOES_REGIME,
  REGIME_PADRAO,
  dataDigitadaParaIso,
  isoParaData,
  mascaraCpf,
  mascaraData,
  somenteDigitos,
  validarTermoCompromisso,
  type ErrosCampos,
} from "@/lib/alunos";
import { MSG, NORMAS_TERMO_COMPROMISSO } from "@/lib/mensagens";
import type { AlunoCard, TermoCompromisso as Termo } from "@/types";
import { useAlunoCard } from "../card/AlunoCardContext";
import { DadosAlunoCard, Obrigatorio, Secao, TermoForm } from "./TermoForm";
import { TextoTermoCompromissoModal } from "./TextoTermoCompromissoModal";
import shared from "../Alunos.module.css";
import formStyles from "@/components/ui/Form.module.css";
import styles from "./Termos.module.css";

interface Formulario {
  nomeResponsavel: string;
  cpfResponsavel: string; // com máscara
  modalidade: string;
  regime: string;
  ciente: boolean;
  dataAssinatura: string; // dd/mm/aaaa
}

function inicial(card: AlunoCard): Formulario {
  const termo = card.termos.compromisso;
  if (termo) {
    return {
      ...termo,
      cpfResponsavel: mascaraCpf(termo.cpfResponsavel),
      dataAssinatura: isoParaData(termo.dataAssinatura),
    };
  }
  return {
    nomeResponsavel: card.resumo.responsavel,
    cpfResponsavel: "",
    modalidade: "",
    regime: REGIME_PADRAO,
    ciente: false,
    dataAssinatura: "",
  };
}

/** UC04 – Termo de compromisso escolar (RF09, RF10). */
export function TermoCompromisso() {
  const { card } = useAlunoCard();
  const cienteErroId = useId();
  const [form, setForm] = useState<Formulario>(() => inicial(card));
  const [erros, setErros] = useState<ErrosCampos>({});
  const [textoAberto, setTextoAberto] = useState(false);
  const anoMatricula = card.matricula.dataMatricula.slice(0, 4);

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros(({ [campo]: _removido, ...resto }) => resto);
  }

  function cancelar() {
    setForm(inicial(card));
    setErros({});
  }

  function montarPayload(): Termo {
    return {
      nomeResponsavel: form.nomeResponsavel.trim(),
      cpfResponsavel: somenteDigitos(form.cpfResponsavel),
      modalidade: form.modalidade.trim(),
      regime: form.regime.trim(),
      ciente: form.ciente,
      dataAssinatura: dataDigitadaParaIso(form.dataAssinatura),
    };
  }

  return (
    <>
      <TermoForm
        termo="compromisso"
        avisoPendente={MSG.termoCompromissoPendente}
        montarPayload={montarPayload}
        validar={validarTermoCompromisso}
        onErros={setErros}
        onCancelar={cancelar}
      >
        <Secao titulo="Responsável">
          <div className={shared.grid2}>
            <TextField
              label="Nome do responsável"
              required
              placeholder="Digite o nome completo"
              value={form.nomeResponsavel}
              onChange={(e) => alterar("nomeResponsavel", e.target.value)}
              error={erros.nomeResponsavel}
            />
            <TextField
              label="CPF"
              required
              placeholder="000.000.000-00"
              inputMode="numeric"
              value={form.cpfResponsavel}
              onChange={(e) => alterar("cpfResponsavel", mascaraCpf(e.target.value))}
              error={erros.cpfResponsavel}
            />
          </div>
        </Secao>

        <DadosAlunoCard extras={[{ rotulo: "Ano da matrícula", valor: anoMatricula }]} />

        <Secao titulo="Matrícula">
          <div className={shared.grid2}>
            <SelectField
              label="Modalidade"
              required
              placeholder="Selecione"
              value={form.modalidade}
              options={OPCOES_MODALIDADE}
              onChange={(e) => alterar("modalidade", e.target.value)}
              error={erros.modalidade}
            />
            <SelectField
              label="Regime"
              required
              placeholder="Selecione"
              value={form.regime}
              options={OPCOES_REGIME}
              onChange={(e) => alterar("regime", e.target.value)}
              error={erros.regime}
            />
          </div>
        </Secao>

        <Secao
          titulo="Principais normas do termo"
          descricao="Resumo para consulta rápida. O texto completo fica no termo assinado."
        >
          <div className={shared.campos}>
            <ul className={styles.normas}>
              {NORMAS_TERMO_COMPROMISSO.map((norma) => (
                <li key={norma}>{norma}</li>
              ))}
            </ul>
            {/* Um link (e não um botão) para continuar disponível quando o card está inativo. */}
            <a
              href="#texto-completo"
              role="button"
              className={styles.linkTexto}
              onClick={(e) => {
                e.preventDefault();
                setTextoAberto(true);
              }}
            >
              Ver texto completo do termo →
            </a>
            <div className={formStyles.field}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.ciente}
                  onChange={(e) => alterar("ciente", e.target.checked)}
                  aria-required="true"
                  aria-invalid={erros.ciente ? true : undefined}
                  aria-describedby={erros.ciente ? cienteErroId : undefined}
                />
                <span>
                  O responsável leu e assinou o termo de compromisso escolar
                  <Obrigatorio />
                </span>
              </label>
              {erros.ciente && (
                <p id={cienteErroId} className={formStyles.error}>
                  {erros.ciente}
                </p>
              )}
            </div>
            <TextField
              label="Data da assinatura"
              required
              placeholder="dd/mm/aaaa"
              inputMode="numeric"
              value={form.dataAssinatura}
              onChange={(e) => alterar("dataAssinatura", mascaraData(e.target.value))}
              error={erros.dataAssinatura}
            />
          </div>
        </Secao>
      </TermoForm>

      {textoAberto && (
        <TextoTermoCompromissoModal
          responsavel={form.nomeResponsavel}
          aluno={card.aluno.nome}
          anoMatricula={anoMatricula}
          modalidade={form.modalidade}
          onClose={() => setTextoAberto(false)}
        />
      )}
    </>
  );
}
