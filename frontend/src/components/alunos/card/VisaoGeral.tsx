"use client";

import Link from "next/link";
import { ABA_DA_FICHA, NOMES_FICHAS, formatarDataHora } from "@/lib/alunos";
import { resumoDocumentos } from "@/lib/documentos";
import type { FichaAluno } from "@/types";
import { SituacaoBadge } from "../SituacaoBadge";
import { useAlunoCard } from "./AlunoCardContext";
import shared from "../Alunos.module.css";
import styles from "./AlunoCard.module.css";

const ORDEM_FICHAS: FichaAluno[] = ["requerimento", "socioeconomica", "usoImagem", "saida", "compromisso"];

/** UC04 – Card do aluno · visão geral (RF08, RF11) e versão somente consulta do card inativo (RF12, RN10). */
export function VisaoGeral() {
  const { card } = useAlunoCard();
  const ativo = card.status !== "INATIVO"; // Pendente também pode ser editado
  const base = `/alunos/${encodeURIComponent(card.id)}`;
  // UC05: situação calculada pelos anexos reais, a mesma usada nas pendências da aba Documentos.
  const documentos = resumoDocumentos(card.documentos.filter((doc) => doc.situacao === "ENTREGUE"));
  const entregues = documentos.filter((d) => d.situacao === "ENTREGUE").length;
  const responsavel = card.resumo.responsavel
    ? `${card.resumo.responsavel}${card.resumo.parentesco ? ` (${card.resumo.parentesco})` : ""}`
    : "";
  const turmaEtapa = [card.turma?.nome, card.etapa?.nome].filter(Boolean).join(" · ");

  return (
    <>
      <div className={`${styles.visaoGeral} ${ativo ? "" : styles.visaoGeralInativo}`}>
        <section className={styles.painel} aria-labelledby="fichas-titulo">
          <h2 id="fichas-titulo" className={styles.painelTitulo}>
            Fichas e termos
          </h2>
          <p className={styles.painelDescricao}>
            {ativo ? "Clique em uma ficha para preencher ou editar." : "Somente consulta enquanto o card estiver inativo."}
          </p>
          <ul className={styles.listaFichas}>
            {ORDEM_FICHAS.map((ficha) => {
              const preenchida = card.fichas[ficha] === "PREENCHIDA";
              const rotulo = !ativo ? "Consultar" : preenchida ? "Abrir →" : "Preencher →";
              return (
                <li key={ficha} className={styles.ficha}>
                  <span>{NOMES_FICHAS[ficha]}</span>
                  <span className={styles.fichaAcoes}>
                    <SituacaoBadge ok={preenchida} />
                    <Link
                      href={`${base}/${ABA_DA_FICHA[ficha]}`}
                      className={shared.linkAcao}
                      aria-label={`${rotulo.replace(" →", "")}: ${NOMES_FICHAS[ficha]}`}
                    >
                      {rotulo}
                    </Link>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {ativo && (
          <div className={styles.coluna}>
            <section className={styles.painel} aria-labelledby="resumo-titulo">
              <h2 id="resumo-titulo" className={styles.painelTitulo}>
                Resumo
              </h2>
              <dl className={styles.resumo}>
                <Dado rotulo="Responsável" valor={responsavel} />
                <Dado rotulo="Telefone" valor={card.resumo.telefone} />
                <Dado rotulo="Endereço" valor={card.resumo.endereco} />
                <Dado rotulo="Turma / etapa" valor={turmaEtapa} />
              </dl>
            </section>

            <section className={styles.painel} aria-labelledby="documentos-titulo">
              <h2 id="documentos-titulo" className={styles.painelTitulo}>
                Documentos
              </h2>
              <p className={styles.painelDescricao}>
                {entregues} de {documentos.length} entregues
              </p>
              <ul className={styles.documentos}>
                {documentos.map((doc) => (
                  <li key={doc.tipo}>
                    <span>{doc.nome}</span>
                    <SituacaoBadge ok={doc.situacao === "ENTREGUE"} rotuloOk="Entregue" />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>

      {card.ultimaEdicao && (
        <p className={styles.rodape}>
          Última edição em {formatarDataHora(card.ultimaEdicao.data)}, por {card.ultimaEdicao.autor} ·{" "}
          <Link href={`${base}/historico`} className={shared.linkAcao}>
            Ver histórico
          </Link>
        </p>
      )}
    </>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt>{rotulo}</dt>
      <dd>{valor || "—"}</dd>
    </div>
  );
}