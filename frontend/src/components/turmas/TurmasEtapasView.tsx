"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MSG } from "@/lib/mensagens";
import type { Turma } from "@/types";
import { AlterarStatusTurmaModal, type AcaoStatusTurma } from "./AlterarStatusTurmaModal";
import { BuscaEstrutura } from "./BuscaEstrutura";
import { EtapasList, EtapasListSkeleton } from "./EtapasList";
import { NenhumResultado } from "./NenhumResultado";
import { NovaEtapaModal } from "./NovaEtapaModal";
import { NovaTurmaModal } from "./NovaTurmaModal";
import { TurmasTable, TurmasTableSkeleton } from "./TurmasTable";
import { useTurmasEtapas } from "./useTurmasEtapas";
import styles from "./TurmasEtapas.module.css";

type ModalAberto =
  | { tipo: "nova-turma" }
  | { tipo: "nova-etapa" }
  | { tipo: "status"; turma: Turma; acao: AcaoStatusTurma }
  | null;

// UC06 – Gerenciar Estrutura Escolar (RF18, RF19, RF20, RF24) e UC08 FP02/FA02 – Buscar turmas e etapas (RF22)
export function TurmasEtapasView() {
  const toast = useToast();
  const estado = useTurmasEtapas();
  const { listagem, buscaAtiva } = estado;
  const [modal, setModal] = useState<ModalAberto>(null);

  const carregando = listagem.status === "carregando";
  const turmas = listagem.status === "ok" ? listagem.turmas : [];
  const etapas = listagem.status === "ok" ? listagem.etapas : [];
  const algumaSecaoVazia = listagem.status === "ok" && (turmas.length === 0 || etapas.length === 0);

  function fecharModal() {
    setModal(null);
  }

  function onCadastrado(mensagem: string) {
    setModal(null);
    toast(mensagem);
    void estado.recarregar();
  }

  function onStatusAlterado(turma: Turma, acao: AcaoStatusTurma) {
    estado.substituirTurma(turma);
    setModal(null);
    toast(acao === "INATIVAR" ? MSG.registroInativado : MSG.turmaReativada);
  }

  /** Sem busca ativa, lista vazia significa "nada cadastrado"; com busca, é o FA02 do UC08. */
  function vazio(entidade: "turma" | "etapa") {
    return buscaAtiva ? (
      <NenhumResultado titulo={MSG.nenhumResultado} texto={MSG.nenhumResultadoDica} />
    ) : (
      <NenhumResultado
        titulo={`Nenhuma ${entidade} cadastrada`}
        texto={`Use "+ Nova ${entidade}" para cadastrar a primeira.`}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Turmas e etapas"
        subtitle="Organize os cards de alunos por turma e etapa (série de ensino)."
        action={
          <div className={styles.acoesCabecalho}>
            <Button variant="secondary" onClick={() => setModal({ tipo: "nova-etapa" })}>
              + Nova etapa
            </Button>
            <Button onClick={() => setModal({ tipo: "nova-turma" })}>+ Nova turma</Button>
          </div>
        }
      />

      <BuscaEstrutura
        termo={estado.termo}
        onTermoChange={estado.setTermo}
        filtroStatus={estado.filtroStatus}
        onFiltroStatusChange={estado.setFiltroStatus}
        onBuscar={estado.buscar}
      />

      {listagem.status === "erro" ? (
        <div className={styles.estadoErro}>
          <Alert>{listagem.mensagem}</Alert>
          <Button variant="secondary" onClick={() => void estado.recarregar()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className={styles.colunas}>
          <section className={styles.secao} aria-labelledby="titulo-turmas">
            <h2 id="titulo-turmas" className={styles.secaoTitulo}>
              Turmas
            </h2>
            {carregando ? (
              <TurmasTableSkeleton />
            ) : turmas.length === 0 ? (
              vazio("turma")
            ) : (
              <>
                <TurmasTable
                  turmas={turmas}
                  onInativar={(turma) => setModal({ tipo: "status", turma, acao: "INATIVAR" })}
                  onReativar={(turma) => setModal({ tipo: "status", turma, acao: "REATIVAR" })}
                />
                <p className={styles.nota}>Turmas inativas mantêm os alunos vinculados e continuam aparecendo na busca.</p>
              </>
            )}
          </section>

          <section className={styles.secao} aria-labelledby="titulo-etapas">
            <h2 id="titulo-etapas" className={styles.secaoTitulo}>
              Etapas
            </h2>
            {carregando ? (
              <EtapasListSkeleton />
            ) : etapas.length === 0 ? (
              vazio("etapa")
            ) : (
              <>
                <EtapasList etapas={etapas} />
                <p className={styles.nota}>Toda turma precisa estar vinculada a uma etapa ativa.</p>
              </>
            )}
          </section>
        </div>
      )}

      {buscaAtiva && algumaSecaoVazia && (
        <div className={styles.limpar}>
          <Button variant="secondary" onClick={estado.limparBusca}>
            Limpar busca
          </Button>
        </div>
      )}

      {modal?.tipo === "nova-etapa" && (
        <NovaEtapaModal onClose={fecharModal} onCriada={() => onCadastrado(MSG.etapaCadastrada)} />
      )}
      {modal?.tipo === "nova-turma" && (
        <NovaTurmaModal onClose={fecharModal} onCriada={() => onCadastrado(MSG.turmaCadastrada)} />
      )}
      {modal?.tipo === "status" && (
        <AlterarStatusTurmaModal
          turma={modal.turma}
          acao={modal.acao}
          onClose={fecharModal}
          onAlterada={onStatusAlterado}
        />
      )}
    </>
  );
}
