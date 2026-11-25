"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { AutorizacaoImagem } from "@/lib/alunos";
import { usandoBackendReal } from "@/services/api";
import { obterTextoTermoUsoImagem } from "@/services/fichas.service";
import { mensagemErroAluno } from "../erros";
import shared from "../Alunos.module.css";
import styles from "./Termos.module.css";

interface TextoTermoUsoImagemModalProps {
  responsavel: {
    nome: string;
    nacionalidade: string;
    estadoCivil: string;
    rg: string;
    cpf: string;
    endereco: string;
  };
  aluno: {
    nome: string;
    anoSerie: string;
    dataNascimento: string;
  };
  autoriza: AutorizacaoImagem | null;
  local: string;
  data: string;
  onClose: () => void;
}

export function TextoTermoUsoImagemModal({ autoriza, onClose }: TextoTermoUsoImagemModalProps) {
  const [titulo, setTitulo] = useState("Termo de Autorização de Uso de Imagem");
  const [texto, setTexto] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(usandoBackendReal);

  useEffect(() => {
    if (!usandoBackendReal) {
      setTexto(
        "Texto do termo de uso de imagem indisponível no modo mock. Configure o backend real para carregar o texto oficial.",
      );
      setCarregando(false);
      return;
    }
    let ativo = true;
    setCarregando(true);
    obterTextoTermoUsoImagem()
      .then((res) => {
        if (!ativo) return;
        setTitulo(res.titulo || "Termo de Autorização de Uso de Imagem");
        setTexto(res.texto || "");
      })
      .catch((e) => {
        if (!ativo) return;
        setErro(mensagemErroAluno(e));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <Modal
      title={titulo}
      description={autoriza === "NAO" ? "Situação atual no formulário: não autorizado." : autoriza === "SIM" ? "Situação atual no formulário: autorizado." : undefined}
      onClose={onClose}
      size="lg"
    >
      {carregando && <p>Carregando texto do termo...</p>}
      {erro && <Alert>{erro}</Alert>}
      {!carregando && !erro && (
        <div className={styles.textoTermo}>
          <p style={{ whiteSpace: "pre-wrap" }}>{texto}</p>
        </div>
      )}
      <div className={shared.modalAcoes}>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  );
}
