"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { NOMES_FICHAS, isoParaData, temErros, type ErrosCampos } from "@/lib/alunos";
import { MSG } from "@/lib/mensagens";
import { isApiError, usandoBackendReal } from "@/services/api";
import { salvarTermo } from "@/services/alunos.service";
import {
  baixarPdfTermoCompromisso,
  baixarPdfTermoImagem,
  baixarPdfTermoSaida,
} from "@/services/fichas.service";
import type { AlunoCard, TermoAluno, TermosAluno } from "@/types";
import { ConfirmacaoModal } from "../ConfirmacaoModal";
import { mensagemErroAluno } from "../erros";
import { useAlunoCard } from "../card/AlunoCardContext";
import { focarPrimeiroErro } from "../focarErro";
import shared from "../Alunos.module.css";
import styles from "./Termos.module.css";

interface TermoFormProps<T extends TermoAluno> {
  termo: T;
  /** Aviso exibido enquanto o termo estiver pendente. */
  avisoPendente: string;
  /** Monta o payload a partir do estado do formulário. */
  montarPayload: () => NonNullable<TermosAluno[T]>;
  validar: (payload: NonNullable<TermosAluno[T]>) => ErrosCampos;
  /** Recebe os erros por campo para destacá-los (FE01). */
  onErros: (erros: ErrosCampos) => void;
  /** Quando informado, restaura o último estado salvo sem sair da aba. */
  onCancelar?: () => void;
  children: ReactNode;
}

/**
 * Estrutura comum aos termos do card (RF09, RF10):
 * - card inativo → campos desabilitados, somente consulta (FE03, RN10);
 * - "Salvar ficha" valida os obrigatórios (FE01, RN06) e pede confirmação (RF23, RN15);
 * - "Cancelar" descarta as alterações (restaura o estado salvo ou volta à visão geral) (FA05).
 */
export function TermoForm<T extends TermoAluno>({
  termo,
  avisoPendente,
  montarPayload,
  validar,
  onErros,
  onCancelar,
  children,
}: TermoFormProps<T>) {
  const router = useRouter();
  const toast = useToast();
  const { card, atualizar } = useAlunoCard();
  const formRef = useRef<HTMLFormElement>(null);
  const [payload, setPayload] = useState<NonNullable<TermosAluno[T]> | null>(null);
  const [incompleto, setIncompleto] = useState(false);
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const [erroPdf, setErroPdf] = useState<string | null>(null);
  const [erroConflito, setErroConflito] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);

  const ativo = card.status !== "INATIVO" && !somenteLeitura; // Pendente também pode ser editado
  const pendente = card.termos[termo] === null;
  const visaoGeral = `/alunos/${encodeURIComponent(card.id)}`;
  const podeExportarPdf = usandoBackendReal;

  function enviar(event: React.FormEvent) {
    event.preventDefault();
    if (!ativo) return;
    const dados = montarPayload();
    const erros = validar(dados);
    onErros(erros);
    setIncompleto(temErros(erros));
    if (temErros(erros)) {
      focarPrimeiroErro(formRef.current);
      return;
    }
    setPayload(dados);
  }

  async function confirmar() {
    if (!payload) return;
    let atualizado: AlunoCard;
    try {
      atualizado = await salvarTermo(card.id, card.idMatricula, termo, payload);
    } catch (error) {
      if (termo === "compromisso" && isApiError(error) && error.status === 409) {
        setSomenteLeitura(true);
        setErroConflito(true);
        setPayload(null);
        return;
      }
      throw error;
    }
    atualizar(atualizado);
    setPayload(null);
    toast(MSG.fichaSalva, `${NOMES_FICHAS[termo]} · ${MSG.fichaSalvaDetalhe}`);
    router.push(visaoGeral);
  }

  async function exportarPdf() {
    setErroPdf(null);
    setExportandoPdf(true);
    try {
      if (termo === "usoImagem") await baixarPdfTermoImagem(card.idMatricula);
      else if (termo === "saida") await baixarPdfTermoSaida(card.idMatricula);
      else if (termo === "compromisso") await baixarPdfTermoCompromisso(card.idMatricula);
    } catch (e) {
      setErroPdf(mensagemErroAluno(e));
    } finally {
      setExportandoPdf(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={enviar} noValidate>
      {ativo && pendente && (
        <div className={styles.alerta}>
          <Alert variant="warning">{avisoPendente}</Alert>
        </div>
      )}
      {incompleto && (
        <div className={styles.alerta}>
          <Alert>{MSG.fichaIncompleta}</Alert>
        </div>
      )}
      {erroPdf && (
        <div className={styles.alerta}>
          <Alert>{erroPdf}</Alert>
        </div>
      )}
      {erroConflito && (
        <div className={styles.alerta}>
          <Alert variant="warning">
            A matrícula está inativa. O termo agora está disponível somente para consulta.
          </Alert>
        </div>
      )}

      <fieldset className={styles.conteudo} disabled={!ativo}>
        <legend className="sr-only">{NOMES_FICHAS[termo]}</legend>
        <div className={shared.secoes}>{children}</div>
      </fieldset>

      <div className={shared.acoesForm}>
        {podeExportarPdf && (
          <Button variant="secondary" onClick={exportarPdf} loading={exportandoPdf} disabled={exportandoPdf}>
            {exportandoPdf ? "Exportando..." : "Exportar PDF"}
          </Button>
        )}
        {ativo ? (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                if (onCancelar) {
                  setIncompleto(false);
                  onCancelar();
                } else {
                  router.push(visaoGeral);
                }
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar ficha</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => router.push(visaoGeral)}>
            Voltar à visão geral
          </Button>
        )}
      </div>

      {payload && (
        <ConfirmacaoModal
          titulo="Salvar as alterações da ficha?"
          descricao="As alterações ficam registradas no histórico de edições com o seu nome, a data e a hora."
          rotuloConfirmar="Confirmar"
          rotuloEnviando="Salvando..."
          onConfirmar={confirmar}
          onClose={() => setPayload(null)}
        />
      )}
    </form>
  );
}

interface SecaoProps {
  titulo: string;
  descricao?: string;
  /** Exibe "*" no título quando o conteúdo da seção é obrigatório. */
  obrigatorio?: boolean;
  children: ReactNode;
}

export function Secao({ titulo, descricao, obrigatorio, children }: SecaoProps) {
  return (
    <section className={shared.secao}>
      <header className={shared.secaoCabecalho}>
        <h2 className={shared.secaoTitulo}>
          {titulo}
          {obrigatorio && <Obrigatorio />}
        </h2>
        {descricao && <p className={shared.secaoDescricao}>{descricao}</p>}
      </header>
      {children}
    </section>
  );
}

/** Asterisco de campo obrigatório (decorativo; o campo já tem aria-required). */
export function Obrigatorio() {
  return (
    <span className={shared.obrigatorio} aria-hidden="true">
      {" "}
      *
    </span>
  );
}

/** Bloco "Aluno – Dados vindos do card", comum a todos os termos. */
export function DadosAlunoCard({ extras = [] }: { extras?: { rotulo: string; valor: string }[] }) {
  const { card } = useAlunoCard();
  const dados = [
    { rotulo: "Nome", valor: card.aluno.nome },
    { rotulo: "Nascimento", valor: isoParaData(card.aluno.dataNascimento) },
    { rotulo: "Ano/série", valor: [card.etapa?.nome, card.matricula.anoLetivo].filter(Boolean).join(" · ") },
    ...extras,
  ];
  return (
    <Secao titulo="Aluno" descricao="Dados vindos do card.">
      <dl className={shared.dadosCard}>
        {dados.map((d) => (
          <div key={d.rotulo}>
            <dt>{d.rotulo}</dt>
            <dd>{d.valor || "—"}</dd>
          </div>
        ))}
      </dl>
    </Secao>
  );
}
