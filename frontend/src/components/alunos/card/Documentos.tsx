"use client";

import { useEffect, useId, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { IconChevronDown } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { isoParaData } from "@/lib/alunos";
import {
  GRUPOS_TIPO_DOCUMENTO,
  MSG_DOCUMENTOS,
  NOMES_TIPO_DOCUMENTO,
  PRAZO_ENTREGA_DIAS,
  TAMANHO_MAXIMO_BYTES,
  TAMANHO_MAXIMO_MB,
  ehTipoDocumento,
  prazoEntregaDocumentos,
  resumoDocumentos,
} from "@/lib/documentos";
import { MSG } from "@/lib/mensagens";
import { obterAluno } from "@/services/alunos.service";
import { anexarDocumento, baixarDocumento, listarDocumentos } from "@/services/documentos.service";
import {
  baixarPdfRequerimento,
  baixarPdfSocioeconomica,
  baixarPdfTermoCompromisso,
  baixarPdfTermoImagem,
  baixarPdfTermoSaida,
} from "@/services/fichas.service";
import type { DocumentoAnexado, DocumentosAluno, TipoDocumento } from "@/types";
import { SituacaoBadge } from "../SituacaoBadge";
import { mensagemErroAluno } from "../erros";
import { useAlunoCard } from "./AlunoCardContext";
import { AreaUpload } from "./AreaUpload";
import { SubstituirDocumentoModal } from "./SubstituirDocumentoModal";
import shared from "../Alunos.module.css";
import lista from "../AlunosView.module.css";
import formStyles from "@/components/ui/Form.module.css";
import styles from "./Documentos.module.css";

type Carga = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "ok"; dados: DocumentosAluno };

type FichaPdf = "requerimento" | "socioeconomica" | "usoImagem" | "saida" | "compromisso";

const FICHAS_PDF: { ficha: FichaPdf; rotulo: string; baixar: (idMatricula: string) => Promise<void> }[] = [
  { ficha: "requerimento", rotulo: "Requerimento de matrícula", baixar: baixarPdfRequerimento },
  { ficha: "socioeconomica", rotulo: "Ficha socioeconômica", baixar: baixarPdfSocioeconomica },
  { ficha: "usoImagem", rotulo: "Uso de imagem", baixar: baixarPdfTermoImagem },
  { ficha: "saida", rotulo: "Saída do aluno", baixar: baixarPdfTermoSaida },
  { ficha: "compromisso", rotulo: "Compromisso escolar", baixar: baixarPdfTermoCompromisso },
];

const COLUNAS = ["Tipo", "Arquivo", "Anexado em", "Ações"];

/** Abertura do modal de substituição, pelo link da tabela ou pelo "Anexar" de um tipo já anexado. */
interface Substituicao {
  documento: DocumentoAnexado;
  arquivoInicial: File | null;
}

/**
 * UC05 – Aba Documentos do card (RF14, RF15, RF16): anexar PDFs, baixar e substituir os
 * anexos, acompanhar as pendências do termo de compromisso e baixar as fichas em PDF.
 * Card inativo (RN10): só os downloads ficam disponíveis.
 */
export function Documentos() {
  const { card, atualizar } = useAlunoCard();
  const toast = useToast();
  const tipoId = useId();
  const ativo = card.status !== "INATIVO";

  const [carga, setCarga] = useState<Carga>({ status: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [tipo, setTipo] = useState<TipoDocumento | "">("");
  const [erroAnexo, setErroAnexo] = useState<string | null>(null);
  const [anexando, setAnexando] = useState(false);

  const [substituicao, setSubstituicao] = useState<Substituicao | null>(null);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);
  const [erroDownload, setErroDownload] = useState<string | null>(null);
  const [gerandoFicha, setGerandoFicha] = useState<FichaPdf | null>(null);
  const [erroFicha, setErroFicha] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCarga({ status: "carregando" });
    listarDocumentos(card.id).then(
      (dados) => vigente && setCarga({ status: "ok", dados }),
      (error) => vigente && setCarga({ status: "erro", mensagem: mensagemErroAluno(error, "carregar") }),
    );
    return () => {
      vigente = false;
    };
  }, [card.id, tentativa]);

  const dados = carga.status === "ok" ? carga.dados : null;

  /**
   * Atualiza a tabela e as pendências com a resposta da API e recarrega o card, para que a
   * Visão geral e "Última edição em..." reflitam o anexo sem recarregar a página.
   */
  function aplicar(novos: DocumentosAluno) {
    setCarga({ status: "ok", dados: novos });
    obterAluno(card.id).then(atualizar, () => {
      // O anexo já foi gravado; se o card não recarregar agora, ele se atualiza na próxima visita.
    });
  }

  function limparFormulario() {
    setArquivo(null);
    setTipo("");
    setErroAnexo(null);
  }

  async function anexar() {
    if (!arquivo || !tipo || !dados) return;
    // Um arquivo por tipo: se já existe, a troca passa pelo modal de substituição (RF15).
    const existente = dados.itens.find((d) => d.tipo === tipo);
    if (existente) {
      setSubstituicao({ documento: existente, arquivoInicial: arquivo });
      return;
    }
    setErroAnexo(null);
    setAnexando(true);
    try {
      aplicar(await anexarDocumento(card.id, tipo, arquivo));
      limparFormulario();
      toast(MSG_DOCUMENTOS.anexado, `${NOMES_TIPO_DOCUMENTO[tipo]} · ${MSG.fichaSalvaDetalhe}`);
    } catch (error) {
      // Mantém o arquivo e o tipo escolhidos para tentar de novo.
      setErroAnexo(mensagemErroAluno(error));
    } finally {
      setAnexando(false);
    }
  }

  async function baixar(documento: DocumentoAnexado) {
    setErroDownload(null);
    setBaixandoId(documento.id);
    try {
      await baixarDocumento(card.id, documento.id, documento.nomeArquivo);
    } catch (error) {
      setErroDownload(mensagemErroAluno(error, "carregar"));
    } finally {
      setBaixandoId(null);
    }
  }

  async function baixarFicha(item: (typeof FICHAS_PDF)[number]) {
    setErroFicha(null);
    setGerandoFicha(item.ficha);
    try {
      await item.baixar(card.idMatricula);
    } catch (error) {
      setErroFicha(mensagemErroAluno(error, "carregar"));
    } finally {
      setGerandoFicha(null);
    }
  }

  return (
    <div className={styles.blocos}>
      {/* 1. Anexar documento (RF14) */}
      <section className={styles.bloco} aria-labelledby="anexar-titulo">
        <h2 id="anexar-titulo" className={styles.blocoTitulo}>
          Anexar documento
        </h2>
        <p className={styles.blocoDescricao}>
          Somente arquivos PDF. Use para documentos entregues pela família e para as fichas já assinadas.
        </p>

        <div className={styles.areaWrap}>
          <AreaUpload
            arquivo={arquivo}
            titulo="Arraste um PDF aqui ou clique para escolher"
            dica={`Tamanho máximo sugerido: ${TAMANHO_MAXIMO_MB} MB`}
            disabled={!ativo || anexando}
            motivoBloqueio={ativo ? undefined : MSG_DOCUMENTOS.inativo}
            onArquivo={(novo) => {
              setArquivo(novo);
              setErroAnexo(null);
            }}
            onInvalido={(mensagem) => {
              setArquivo(null);
              setErroAnexo(mensagem);
            }}
            onRemover={() => {
              setArquivo(null);
              setErroAnexo(null);
            }}
          />
        </div>

        {arquivo && arquivo.size > TAMANHO_MAXIMO_BYTES && (
          <div className={styles.alerta}>
            <Alert variant="warning">{MSG_DOCUMENTOS.arquivoGrande}</Alert>
          </div>
        )}

        <div className={styles.linhaTipo}>
          <div className={`${formStyles.field} ${styles.campoTipo}`}>
            <label htmlFor={tipoId} className={styles.rotulo}>
              Tipo de documento
            </label>
            <div className={formStyles.selectWrap}>
              <select
                id={tipoId}
                className={`${formStyles.input} ${formStyles.select} ${styles.select} ${tipo ? "" : formStyles.selectVazio}`}
                value={tipo}
                disabled={!ativo || anexando}
                title={ativo ? undefined : MSG_DOCUMENTOS.inativo}
                onChange={(e) => {
                  setTipo(ehTipoDocumento(e.target.value) ? e.target.value : "");
                  setErroAnexo(null);
                }}
              >
                <option value="">Selecione</option>
                {GRUPOS_TIPO_DOCUMENTO.map((grupo) => (
                  <optgroup key={grupo.rotulo} label={grupo.rotulo}>
                    {grupo.tipos.map((t) => (
                      <option key={t} value={t}>
                        {NOMES_TIPO_DOCUMENTO[t]}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <IconChevronDown size={18} className={formStyles.selectChevron} />
            </div>
          </div>
          <Button
            onClick={anexar}
            loading={anexando}
            disabled={!ativo || !arquivo || !tipo || !dados}
            title={ativo ? undefined : MSG_DOCUMENTOS.inativo}
          >
            {anexando ? "Anexando..." : "Anexar"}
          </Button>
        </div>

        {erroAnexo && (
          <div className={styles.alerta}>
            <Alert>{erroAnexo}</Alert>
          </div>
        )}
      </section>

      {/* 2. Documentos anexados (RF15, RF16) */}
      <section className={styles.bloco} aria-labelledby="anexados-titulo">
        <h2 id="anexados-titulo" className={styles.blocoTitulo}>
          Documentos anexados
        </h2>

        {erroDownload && (
          <div className={styles.alerta}>
            <Alert>{erroDownload}</Alert>
          </div>
        )}

        {carga.status === "erro" ? (
          <div className={`${lista.estadoErro} ${styles.estado}`}>
            <Alert>{carga.mensagem}</Alert>
            <Button variant="secondary" onClick={() => setTentativa((n) => n + 1)}>
              Tentar novamente
            </Button>
          </div>
        ) : dados && dados.itens.length === 0 ? (
          <p className={styles.vazio}>Nenhum documento anexado ainda.</p>
        ) : (
          <div className={styles.tabelaCaixa}>
            <div className={lista.tabelaWrap}>
              <table className={`${lista.tabela} ${styles.tabela}`} aria-busy={!dados || undefined}>
                <caption className="sr-only">Documentos anexados ao card de {card.aluno.nome}</caption>
                <thead>
                  <tr>
                    {COLUNAS.map((coluna) => (
                      <th key={coluna} scope="col">
                        {coluna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados
                    ? dados.itens.map((documento) => (
                        <tr key={documento.id}>
                          <td className={styles.quebra}>{NOMES_TIPO_DOCUMENTO[documento.tipo] ?? documento.tipo}</td>
                          <td className={`${lista.muted} ${styles.arquivo}`}>{documento.nomeArquivo}</td>
                          <td className={lista.muted}>{isoParaData(dataLocal(documento.anexadoEm))}</td>
                          <td>
                            <span className={styles.acoes}>
                              <button
                                type="button"
                                className={shared.linkAcao}
                                onClick={() => void baixar(documento)}
                                disabled={baixandoId === documento.id}
                                aria-label={`Baixar ${documento.nomeArquivo}`}
                              >
                                {baixandoId === documento.id ? "Baixando..." : "Baixar"}
                              </button>
                              <button
                                type="button"
                                className={shared.linkAcao}
                                onClick={() => setSubstituicao({ documento, arquivoInicial: null })}
                                disabled={!ativo}
                                title={ativo ? undefined : MSG_DOCUMENTOS.inativo}
                                aria-label={`Substituir ${documento.nomeArquivo}`}
                              >
                                Substituir
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))
                    : Array.from({ length: 3 }, (_, linha) => (
                        <tr key={linha}>
                          {COLUNAS.map((coluna) => (
                            <td key={coluna}>
                              <span className={lista.skeleton} />
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className={styles.nota}>
          “Substituir” troca o PDF anexado: o arquivo anterior é removido e só o novo fica salvo.
        </p>
        {!ativo && <p className={styles.nota}>{MSG_DOCUMENTOS.inativo}</p>}
      </section>

      {/* 3. Pendências do termo de compromisso */}
      <Pendencias carga={carga} />

      {/* 4. Baixar fichas preenchidas em PDF */}
      <section className={styles.bloco} aria-labelledby="fichas-pdf-titulo">
        <h2 id="fichas-pdf-titulo" className={styles.blocoTitulo}>
          Baixar fichas preenchidas em PDF
        </h2>
        <p className={styles.blocoDescricao}>
          Gera o PDF da ficha digital com os dados atuais, pronto para imprimir e colher a assinatura.
        </p>
        <div className={styles.fichasPdf}>
          {FICHAS_PDF.map((item) => (
            <Button
              key={item.ficha}
              variant="secondary"
              size="sm"
              onClick={() => void baixarFicha(item)}
              disabled={gerandoFicha === item.ficha}
            >
              {gerandoFicha === item.ficha ? (
                "Gerando..."
              ) : (
                <>
                  <span aria-hidden="true">↓</span> {item.rotulo}
                </>
              )}
            </Button>
          ))}
        </div>
        {erroFicha && (
          <div className={styles.alerta}>
            <Alert>{erroFicha}</Alert>
          </div>
        )}
      </section>

      {substituicao && (
        <SubstituirDocumentoModal
          idAluno={card.id}
          documento={substituicao.documento}
          arquivoInicial={substituicao.arquivoInicial}
          onClose={() => setSubstituicao(null)}
          onSubstituido={(novos) => {
            // Veio do "Anexar": o arquivo escolhido na aba foi usado na substituição.
            if (substituicao.arquivoInicial) limparFormulario();
            setSubstituicao(null);
            aplicar(novos);
            toast(
              MSG_DOCUMENTOS.substituido,
              `${NOMES_TIPO_DOCUMENTO[substituicao.documento.tipo]} · ${MSG.fichaSalvaDetalhe}`,
            );
          }}
        />
      )}
    </div>
  );
}

/** ISO 8601 com horário → data (AAAA-MM-DD) no fuso de Brasília. */
function dataLocal(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(data);
}

/** Documentos exigidos pelo termo de compromisso que ainda não foram anexados. */
function Pendencias({ carga }: { carga: Carga }) {
  const dados = carga.status === "ok" ? carga.dados : null;
  const pendentes = dados ? resumoDocumentos(dados.itens).filter((d) => d.situacao === "PENDENTE") : [];
  const prazo = dados?.dataAceiteCompromisso ? isoParaData(prazoEntregaDocumentos(dados.dataAceiteCompromisso)) : null;

  return (
    <section className={styles.bloco} aria-labelledby="pendencias-titulo" aria-busy={!dados || undefined}>
      <h2 id="pendencias-titulo" className={styles.blocoTitulo}>
        Pendências do termo de compromisso
      </h2>
      {dados && (
        <p className={styles.blocoDescricao}>
          Documentos que o responsável se comprometeu a entregar em até {PRAZO_ENTREGA_DIAS} dias (
          {prazo ? `prazo: ${prazo}` : "Termo de compromisso ainda não assinado"}).
        </p>
      )}

      {carga.status === "carregando" ? (
        <p className={`${shared.carregando} ${styles.estado}`} role="status">
          Carregando pendências...
        </p>
      ) : carga.status === "erro" ? (
        <p className={`${styles.vazio} ${styles.estado}`}>
          Não foi possível carregar as pendências. Use “Tentar novamente” em Documentos anexados.
        </p>
      ) : pendentes.length === 0 ? (
        <p className={styles.vazio}>Todos os documentos foram entregues.</p>
      ) : (
        <ul className={styles.pendencias}>
          {pendentes.map((doc) => (
            <li key={doc.tipo}>
              <span>{doc.nome}</span>
              <SituacaoBadge ok={false} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
