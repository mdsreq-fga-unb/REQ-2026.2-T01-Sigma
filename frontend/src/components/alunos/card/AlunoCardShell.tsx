"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { isoParaData } from "@/lib/alunos";
import { MSG } from "@/lib/mensagens";
import { obterAluno, reativarAluno } from "@/services/alunos.service";
import type { AlunoCard } from "@/types";
import { ConfirmacaoModal } from "../ConfirmacaoModal";
import { mensagemErroAluno } from "../erros";
import { AlunoCardContext } from "./AlunoCardContext";
import { VincularTurmaModal } from "./VincularTurmaModal";
import shared from "../Alunos.module.css";
import styles from "./AlunoCard.module.css";

const ABAS = [
  { segmento: "", rotulo: "Visão geral" },
  { segmento: "requerimento", rotulo: "Requerimento" },
  { segmento: "socioeconomica", rotulo: "Socioeconômica" },
  { segmento: "uso-imagem", rotulo: "Uso de imagem" },
  { segmento: "saida", rotulo: "Saída" },
  { segmento: "compromisso", rotulo: "Compromisso" },
  { segmento: "documentos", rotulo: "Documentos" },
  { segmento: "historico", rotulo: "Histórico" },
];

type Carga = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "ok"; card: AlunoCard };
type Modal = "reativar" | "vincular" | null;

/** "Nascida em 12/03/2024 · Turma A · Berçário · Ano letivo 2026" */
function subtitulo(card: AlunoCard): string {
  const verbo =
    card.aluno.sexo === "FEMININO" ? "Nascida em" : card.aluno.sexo === "MASCULINO" ? "Nascido em" : "Nascimento em";
  return [
    `${verbo} ${isoParaData(card.aluno.dataNascimento)}`,
    card.turma?.nome ?? "Sem turma",
    card.etapa?.nome,
    `Ano letivo ${card.matricula.anoLetivo}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Layout do card do aluno (UC04): carrega o card uma vez e mantém cabeçalho, ações,
 * abas e modais enquanto o usuário navega entre as fichas.
 */
export function AlunoCardShell({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const toast = useToast();
  const [carga, setCarga] = useState<Carga>({ status: "carregando" });
  const [modal, setModal] = useState<Modal>(null);

  const carregar = useCallback(async () => {
    setCarga({ status: "carregando" });
    try {
      setCarga({ status: "ok", card: await obterAluno(id) });
    } catch (error) {
      setCarga({ status: "erro", mensagem: mensagemErroAluno(error, "carregar") });
    }
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const atualizar = useCallback((card: AlunoCard) => setCarga({ status: "ok", card }), []);
  const card = carga.status === "ok" ? carga.card : null;
  const contexto = useMemo(() => (card ? { card, atualizar } : null), [card, atualizar]);

  const base = `/alunos/${encodeURIComponent(id)}`;
  const segmentoAtual = pathname.startsWith(`${base}/`) ? pathname.slice(base.length + 1).split("/")[0] : "";

  if (!card || !contexto) {
    return (
      <>
        <nav aria-label="Navegação estrutural">
          <ol className={shared.breadcrumb}>
            <li>
              <Link href="/alunos">Alunos</Link>
            </li>
            <li aria-current="page">Card do aluno</li>
          </ol>
        </nav>
        {carga.status === "erro" ? (
          <div className={shared.estado}>
            <Alert>{carga.mensagem}</Alert>
            <div className={styles.acoes}>
              <Button variant="secondary" onClick={() => void carregar()}>
                Tentar novamente
              </Button>
              <Link href="/alunos" className={shared.linkAcao}>
                Voltar para a lista de alunos
              </Link>
            </div>
          </div>
        ) : (
          <p className={shared.carregando} role="status">
            Carregando card do aluno...
          </p>
        )}
      </>
    );
  }

  const inativo = card.status === "INATIVO";

  return (
    <AlunoCardContext.Provider value={contexto}>
      <nav aria-label="Navegação estrutural">
        <ol className={shared.breadcrumb}>
          <li>
            <Link href="/alunos">Alunos</Link>
          </li>
          <li aria-current="page">{card.aluno.nome}</li>
        </ol>
      </nav>

      <header className={styles.cabecalho}>
        <div className={styles.identificacao}>
          <div className={styles.tituloLinha}>
            <h1 className={styles.titulo}>{card.aluno.nome}</h1>
            <StatusBadge status={card.status} />
          </div>
          <p className={styles.subtitulo}>{subtitulo(card)}</p>
        </div>

        <div className={styles.acoes}>
          {inativo ? (
            <Button onClick={() => setModal("reativar")}>Reativar card</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setModal("vincular")}>
                Vincular à turma
              </Button>
              <Button
                variant="secondary"
                disabled
                title="A geração do PDF será implementada em uma próxima iteração."
              >
                Baixar ficha (PDF)
              </Button>
            </>
          )}
        </div>
      </header>

      {inativo && (
        // UC04 FE03 / RN10: card inativo é somente consulta.
        <div className={styles.aviso}>
          <Alert variant="warning">
            Este card está inativo. As fichas ficam disponíveis apenas para consulta e nenhuma ação pode ser feita até a
            reativação.
          </Alert>
        </div>
      )}

      <nav aria-label="Fichas do card" className={styles.abas}>
        <ul>
          {ABAS.map((aba) => {
            const atual = aba.segmento === segmentoAtual;
            return (
              <li key={aba.rotulo}>
                <Link
                  href={aba.segmento ? `${base}/${aba.segmento}` : base}
                  className={`${styles.aba} ${atual ? styles.abaAtual : ""}`}
                  aria-current={atual ? "page" : undefined}
                >
                  {aba.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {children}

      {modal === "reativar" && (
        <ConfirmacaoModal
          titulo={`Reativar o card de ${card.aluno.nome}?`}
          descricao="O card volta a ficar ativo e as fichas podem ser editadas novamente."
          rotuloConfirmar="Reativar card"
          rotuloEnviando="Reativando..."
          onConfirmar={async () => {
            atualizar(await reativarAluno(card.id));
            setModal(null);
            toast(MSG.cardReativado, "alteração registrada no histórico");
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "vincular" && (
        <VincularTurmaModal
          card={card}
          onClose={() => setModal(null)}
          onVinculado={(atualizado) => {
            atualizar(atualizado);
            setModal(null);
            toast(MSG.alunoVinculado, `${atualizado.turma?.nome ?? ""} · ${atualizado.etapa?.nome ?? ""}`);
          }}
        />
      )}
    </AlunoCardContext.Provider>
  );
}