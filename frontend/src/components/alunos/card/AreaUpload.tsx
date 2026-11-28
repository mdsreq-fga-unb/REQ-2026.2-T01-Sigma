"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { IconFile, IconUpload } from "@/components/ui/Icons";
import { MSG_DOCUMENTOS, arquivoEhPdf } from "@/lib/documentos";
import styles from "./Documentos.module.css";

interface AreaUploadProps {
  arquivo: File | null;
  /** Chamado só com PDFs válidos (extensão e MIME type). */
  onArquivo: (arquivo: File) => void;
  /** Chamado quando o arquivo é recusado na tela (FE01 / RN05). */
  onInvalido: (mensagem: string) => void;
  /** Quando informado, mostra "Remover" depois que um arquivo é escolhido. */
  onRemover?: () => void;
  titulo: string;
  /** Texto de apoio sem arquivo escolhido. */
  dica: string;
  disabled?: boolean;
  /** Motivo do bloqueio, exibido como dica quando `disabled`. */
  motivoBloqueio?: string;
  compacta?: boolean;
}

/** "1,2 MB" / "350 KB" */
export function formatarTamanho(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * UC05 – Área de upload de PDF com borda tracejada: clique abre o explorador de arquivos
 * (filtrado para .pdf) e também aceita arrastar e soltar. Usada na aba Documentos e no
 * modal "Substituir documento".
 */
export function AreaUpload({
  arquivo,
  onArquivo,
  onInvalido,
  onRemover,
  titulo,
  dica,
  disabled = false,
  motivoBloqueio,
  compacta = false,
}: AreaUploadProps) {
  const inputId = useId();
  const dicaId = useId();
  const [arrastando, setArrastando] = useState(false);
  const profundidade = useRef(0); // dragenter/dragleave disparam também nos filhos

  function receber(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return;
    if (arquivos.length > 1) {
      onInvalido("Envie um arquivo por vez.");
      return;
    }
    const escolhido = arquivos[0];
    if (arquivoEhPdf(escolhido)) onArquivo(escolhido);
    else onInvalido(MSG_DOCUMENTOS.formatoInvalido);
  }

  function aoArrastar(event: DragEvent<HTMLDivElement>) {
    if (disabled || !event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  const classes = [
    styles.areaUpload,
    compacta && styles.areaUploadCompacta,
    arrastando && styles.areaUploadArrastando,
    disabled && styles.areaUploadBloqueada,
  ]
    .filter(Boolean)
    .join(" ");

  // Na aba, o nome do arquivo escolhido vira o título; no modal (compacta), aparece no texto de apoio.
  const tituloExibido = arquivo && !compacta ? arquivo.name : titulo;
  let textoApoio = dica;
  if (disabled && motivoBloqueio) textoApoio = motivoBloqueio;
  else if (arquivo && compacta) textoApoio = `${arquivo.name} (${formatarTamanho(arquivo.size)})`;
  else if (arquivo) textoApoio = `${formatarTamanho(arquivo.size)} · clique para trocar`;

  return (
    <div
      className={classes}
      title={disabled ? motivoBloqueio : undefined}
      onDragEnter={(event) => {
        if (disabled || !event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        profundidade.current += 1;
        setArrastando(true);
      }}
      onDragOver={aoArrastar}
      onDragLeave={() => {
        profundidade.current = Math.max(0, profundidade.current - 1);
        if (profundidade.current === 0) setArrastando(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        profundidade.current = 0;
        setArrastando(false);
        if (!disabled) receber(event.dataTransfer.files);
      }}
    >
      <input
        id={inputId}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        disabled={disabled}
        aria-describedby={dicaId}
        onChange={(event) => {
          receber(event.target.files);
          // Permite escolher o mesmo arquivo de novo depois de removê-lo.
          event.target.value = "";
        }}
      />
      <label htmlFor={inputId} className={styles.areaUploadClique}>
        {arquivo ? <IconFile size={22} /> : <IconUpload size={22} />}
        <span className={styles.areaUploadTitulo}>{tituloExibido}</span>
        <span id={dicaId} className={styles.areaUploadDica}>
          {textoApoio}
        </span>
      </label>
      {arquivo && onRemover && !disabled && (
        <button type="button" className={styles.areaUploadRemover} onClick={onRemover}>
          Remover arquivo
        </button>
      )}
    </div>
  );
}
