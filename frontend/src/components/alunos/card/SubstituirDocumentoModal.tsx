"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MSG_DOCUMENTOS, TAMANHO_MAXIMO_BYTES } from "@/lib/documentos";
import { substituirDocumento } from "@/services/documentos.service";
import type { DocumentoAnexado, DocumentosAluno } from "@/types";
import { mensagemErroAluno } from "../erros";
import { AreaUpload } from "./AreaUpload";
import shared from "../Alunos.module.css";
import styles from "./Documentos.module.css";

interface SubstituirDocumentoModalProps {
  idAluno: string;
  documento: DocumentoAnexado;
  /** PDF já escolhido na aba ("Anexar" de um tipo que já tem arquivo). */
  arquivoInicial?: File | null;
  onClose: () => void;
  onSubstituido: (dados: DocumentosAluno) => void;
}

/**
 * UC05 FA01 / RF15 – "Substituir documento". O próprio modal é a confirmação do FA01: ao
 * confirmar, o arquivo anterior é removido e só o novo PDF fica salvo (sem versões antigas).
 * Fecha com Cancelar, Esc ou clique fora, exceto durante o envio.
 */
export function SubstituirDocumentoModal({
  idAluno,
  documento,
  arquivoInicial = null,
  onClose,
  onSubstituido,
}: SubstituirDocumentoModalProps) {
  const [arquivo, setArquivo] = useState<File | null>(arquivoInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function substituir() {
    if (!arquivo) return;
    setErro(null);
    setEnviando(true);
    try {
      onSubstituido(await substituirDocumento(idAluno, documento.id, arquivo));
    } catch (error) {
      // Mantém o modal aberto com o arquivo escolhido para tentar de novo.
      setErro(mensagemErroAluno(error));
      setEnviando(false);
    }
  }

  return (
    <Modal
      title={`Substituir “${documento.nomeArquivo}”?`}
      description="O arquivo atual será removido e só o novo PDF ficará salvo."
      onClose={onClose}
      dismissible={!enviando}
      size="sm"
    >
      <div className={styles.modalUpload}>
        <AreaUpload
          compacta
          arquivo={arquivo}
          titulo="Escolher novo PDF"
          dica="nenhum arquivo selecionado"
          disabled={enviando}
          onArquivo={(novo) => {
            setArquivo(novo);
            setErro(null);
          }}
          onInvalido={(mensagem) => {
            setArquivo(null);
            setErro(mensagem);
          }}
        />
      </div>

      {arquivo && arquivo.size > TAMANHO_MAXIMO_BYTES && (
        <div className={shared.modalAlerta}>
          <Alert variant="warning">{MSG_DOCUMENTOS.arquivoGrande}</Alert>
        </div>
      )}

      {erro && (
        <div className={shared.modalAlerta}>
          <Alert>{erro}</Alert>
        </div>
      )}

      <div className={shared.modalAcoes}>
        <Button variant="secondary" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button onClick={substituir} loading={enviando} disabled={!arquivo}>
          {enviando ? "Substituindo..." : "Substituir"}
        </Button>
      </div>
    </Modal>
  );
}
