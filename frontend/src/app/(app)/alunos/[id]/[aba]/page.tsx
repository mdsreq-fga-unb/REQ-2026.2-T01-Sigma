"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MatriculaForm } from "@/components/alunos/MatriculaForm";
import { TermoCompromisso } from "@/components/alunos/termos/TermoCompromisso";
import { TermoSaida } from "@/components/alunos/termos/TermoSaida";
import { TermoUsoImagem } from "@/components/alunos/termos/TermoUsoImagem";
import { EmBreve } from "@/components/layout/EmBreve";
import { novoPayloadMatricula } from "@/lib/matriculas";
import { obterAluno } from "@/services/alunos.service";
import type { AlunoCard, Matricula } from "@/types";

function montarMatricula(card: AlunoCard): Matricula {
  const base = novoPayloadMatricula();

  return {
    id: card.id,
    aluno: {
      ...base.aluno,
      nome: card.aluno.nome,
      cpf: card.aluno.cpf,
      dataNascimento: card.aluno.dataNascimento,
      nomeResponsavel: card.resumo.responsavel || base.aluno.nomeResponsavel,
      telefoneResponsavel: card.resumo.telefone || base.aluno.telefoneResponsavel,
      sexo: card.aluno.sexo === "MASCULINO" ? "M" : card.aluno.sexo === "FEMININO" ? "F" : "",
      nis: base.aluno.nis,
      identidade: card.aluno.rg || base.aluno.identidade,
      naturalidade: card.aluno.naturalidade || base.aluno.naturalidade,
      ufNaturalidade: card.aluno.uf || base.aluno.ufNaturalidade,
      nacionalidade: card.aluno.nacionalidade || base.aluno.nacionalidade,
      corRaca: card.aluno.corRaca ?? base.aluno.corRaca,
    },
    fichas: structuredClone(base.fichas),
    status: "PENDENTE",
    criadaEm: new Date().toISOString(),
    atualizadaEm: new Date().toISOString(),
    historico: [],
  };
}

// Abas do card do aluno. Termos: UC04 (RF09, RF10).
export default function AlunoAbaPage() {
  const params = useParams<{ id: string; aba: string }>();
  const router = useRouter();
  const { id, aba } = params;
  const [card, setCard] = useState<AlunoCard | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!id) return;

    let ativo = true;
    void (async () => {
      try {
        const dados = await obterAluno(id);
        if (ativo) setCard(dados);
      } catch {
        if (ativo) setCard(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return <p aria-live="polite">Carregando ficha...</p>;
  }

  switch (aba) {
    case "uso-imagem":
      return <TermoUsoImagem />;
    case "saida":
      return <TermoSaida />;
    case "compromisso":
      return <TermoCompromisso />;
    case "requerimento":
      if (!card) return <EmBreve casoDeUso="UC04 – Requerimento de matrícula" />;
      return (
        <MatriculaForm
          matricula={montarMatricula(card)}
          onCancel={() => router.push(`/alunos/${encodeURIComponent(id)}`)}
          onSave={() => router.push(`/alunos/${encodeURIComponent(id)}`)}
        />
      );
    case "socioeconomica":
      if (!card) return <EmBreve casoDeUso="UC04 – Ficha socioeconômica" />;
      return (
        <MatriculaForm
          matricula={montarMatricula(card)}
          onCancel={() => router.push(`/alunos/${encodeURIComponent(id)}`)}
          onSave={() => router.push(`/alunos/${encodeURIComponent(id)}`)}
        />
      );
    case "documentos":
      return <EmBreve casoDeUso="UC05 – Documentos digitais" />;
    case "historico":
      return <EmBreve casoDeUso="UC04 – Histórico de edições (RF17)" />;
    default:
      return null;
  }
}
