"use client";

import { useId, useState } from "react";
import { TextField } from "@/components/ui/TextField";
import {
  REGIME_PADRAO,
  dataDigitadaParaIso,
  isoParaData,
  mascaraCpf,
  mascaraData,
  validarTermoCompromisso,
  type ErrosCampos,
} from "@/lib/alunos";
import type { AlunoCard, TermoCompromisso as Termo } from "@/types";
import { useAlunoCard } from "../card/AlunoCardContext";
import { DadosAlunoCard, Obrigatorio, Secao, TermoForm } from "./TermoForm";
import { TextoTermoCompromissoModal } from "./TextoTermoCompromissoModal";
import shared from "../Alunos.module.css";
import formStyles from "@/components/ui/Form.module.css";
import styles from "./Termos.module.css";

/** Resumo das normas do termo assinado (texto do protótipo). */
const NORMAS = [
  "Entrada das 07h30 às 08h00; depois disso o portão é fechado.",
  "Saída das 16h00 às 17h00; atrasos constantes podem ser comunicados ao Conselho Tutelar.",
  "Entrada só com uniforme; a escola não se responsabiliza por celulares, joias ou brinquedos.",
  "A escola não administra medicação; em caso de febre, o responsável é chamado.",
  "Todo mês um responsável assina a lista de frequência.",
  "Faltas só são justificadas com atestado médico; faltas não justificadas podem levar à perda da vaga.",
];

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

  function montarPayload(): Termo {
    return {
      nomeResponsavel: form.nomeResponsavel.trim(),
      cpfResponsavel: form.cpfResponsavel,
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
        avisoPendente="Ficha pendente. O aluno só é matriculado com cópia de toda a documentação solicitada."
        montarPayload={montarPayload}
        validar={validarTermoCompromisso}
        onErros={setErros}
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
            <TextField
              label="Modalidade"
              required
              placeholder="Ex.: creche ou pré-escola"
              value={form.modalidade}
              onChange={(e) => alterar("modalidade", e.target.value)}
              error={erros.modalidade}
            />
            <TextField
              label="Regime"
              required
              placeholder="Ex.: tempo integral"
              value={form.regime}
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
              {NORMAS.map((norma) => (
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
