"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { fichasCompletas } from "@/lib/matriculas";
import { isApiError } from "@/services/api";
import {
  criarMatricula,
  editarMatricula,
  inativarMatricula,
  listarMatriculas,
  reativarMatricula,
} from "@/services/matriculas.service";
import type { Matricula, NovaMatriculaPayload, StatusMatricula } from "@/types";
import { MatriculaForm } from "./MatriculaForm";
import { NovoAlunoForm } from "./NovoAlunoForm";
import styles from "./MatriculasView.module.css";

type Tela = "lista" | "formulario" | "detalhe";
type Filtro = "TODAS" | StatusMatricula;
type AcaoStatus = "INATIVAR" | "REATIVAR";
type AbaCard = "VISAO_GERAL" | "REQUERIMENTO" | "SOCIOECONOMICA" | "TERMOS" | "HISTORICO";

function dataFormatada(valor: string): string {
  const [ano, mes, dia] = valor.slice(0, 10).split("-").map(Number);
  if (!ano || !mes || !dia) return "—";
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
}

function erroDeMatricula(error: unknown): string {
  if (!isApiError(error)) return "Não foi possível concluir a operação. Tente novamente.";
  switch (error.code) {
    case "FALHA_CONEXAO":
      return "Não foi possível conectar ao sistema. Verifique a conexão e tente novamente.";
    case "CPF_EM_USO":
      return "Já existe um card cadastrado com este CPF.";
    case "MATRICULA_EM_USO":
      return "Já existe um card cadastrado com este número de matrícula.";
    case "MATRICULA_INATIVA":
      return "Matrículas inativas não podem ser editadas. Reative o card para fazer alterações.";
    case "FICHAS_INCOMPLETAS":
      return "Preencha todas as fichas obrigatórias antes de salvar ou reativar.";
    case "NAO_ENCONTRADO":
      return "O card não foi encontrado. Atualize a listagem.";
    case "NAO_AUTENTICADO":
      return "Sua sessão expirou. Entre novamente no SIGMA.";
    default:
      return "Não foi possível concluir a operação. Verifique os dados e tente novamente.";
  }
}

export function MatriculasView() {
  const toast = useToast();
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [tela, setTela] = useState<Tela>("lista");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("TODAS");
  const [selecionada, setSelecionada] = useState<Matricula | null>(null);
  const [editando, setEditando] = useState<Matricula | null>(null);
  const [abaCard, setAbaCard] = useState<AbaCard>("VISAO_GERAL");
  const [salvarPendente, setSalvarPendente] = useState<NovaMatriculaPayload | null>(null);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [acaoStatus, setAcaoStatus] = useState<AcaoStatus | null>(null);
  const [erroStatus, setErroStatus] = useState<string | null>(null);
  const [alterandoStatus, setAlterandoStatus] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setMatriculas(await listarMatriculas());
    } catch (error) {
      setErro(erroDeMatricula(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return matriculas.filter((matricula) => {
      const correspondeStatus = filtro === "TODAS" || matricula.status === filtro;
      const correspondeBusca =
        !termo ||
        matricula.aluno.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
        matricula.aluno.cpf.includes(termo.replace(/\D/g, "")) ||
        matricula.aluno.numeroMatricula.toLocaleLowerCase("pt-BR").includes(termo);
      return correspondeStatus && correspondeBusca;
    });
  }, [busca, filtro, matriculas]);

  function iniciarCriacao() {
    setEditando(null);
    setErroSalvar(null);
    setSalvarPendente(null);
    setTela("formulario");
  }

  function iniciarEdicao(matricula: Matricula) {
    setEditando(matricula);
    setErroSalvar(null);
    setTela("formulario");
  }

  async function confirmarSalvamento() {
    if (!salvarPendente || salvando) return;
    setSalvando(true);
    setErroSalvar(null);
    try {
      const salva = editando
        ? await editarMatricula(editando.id, salvarPendente)
        : await criarMatricula(salvarPendente);
      setMatriculas((atuais) =>
        editando ? atuais.map((item) => (item.id === salva.id ? salva : item)) : [...atuais, salva],
      );
      setSelecionada(salva);
      setAbaCard("VISAO_GERAL");
      setTela("detalhe");
      setSalvarPendente(null);
      toast(
        editando
          ? salva.status === "ATIVA"
            ? "Fichas salvas e matrícula ativada."
            : "Dados salvos. A matrícula continua pendente até concluir as fichas."
          : "Card criado. Preencha as fichas no perfil do aluno.",
      );
    } catch (error) {
      setErroSalvar(erroDeMatricula(error));
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarAlteracaoStatus() {
    if (!selecionada || !acaoStatus || alterandoStatus) return;
    setAlterandoStatus(true);
    setErroStatus(null);
    try {
      const atualizada =
        acaoStatus === "INATIVAR"
          ? await inativarMatricula(selecionada.id)
          : await reativarMatricula(selecionada.id);
      setMatriculas((atuais) => atuais.map((item) => (item.id === atualizada.id ? atualizada : item)));
      setSelecionada(atualizada);
      setAcaoStatus(null);
      toast(acaoStatus === "INATIVAR" ? "Matrícula inativada." : "Matrícula reativada.");
    } catch (error) {
      setErroStatus(erroDeMatricula(error));
    } finally {
      setAlterandoStatus(false);
    }
  }

  if (tela === "formulario") {
    return (
      <>
        <PageHeader
          title={editando ? `Editar ${editando.aluno.nome}` : "Novo aluno"}
          subtitle={
            editando
              ? "Edite os dados do aluno e preencha as fichas dentro do card."
              : "Crie o card de matrícula. As fichas e os termos serão preenchidos depois, dentro do card."
          }
        />
        {erroSalvar && <Alert>{erroSalvar}</Alert>}
        {editando ? (
          <MatriculaForm
            key={editando.id}
            matricula={editando}
            onCancel={() => {
              setErroSalvar(null);
              setTela("detalhe");
            }}
            onSave={(payload) => {
              setSalvarPendente(payload);
              setErroSalvar(null);
            }}
          />
        ) : (
          <NovoAlunoForm
            onCancel={() => setTela("lista")}
            onCreate={(payload) => {
              setSalvarPendente(payload);
              setErroSalvar(null);
            }}
          />
        )}
        {salvarPendente && (
          <Modal
            title={editando ? "Confirmar salvamento" : "Confirmar criação do card"}
            description={
              editando
                ? `Salvar as alterações no card de ${salvarPendente.aluno.nome}?`
                : `Criar o card de ${salvarPendente.aluno.nome}? As fichas poderão ser preenchidas depois.`
            }
            onClose={() => {
              if (!salvando) setSalvarPendente(null);
            }}
            dismissible={!salvando}
            size="sm"
          >
            {erroSalvar && <div className={styles.modalErro}><Alert>{erroSalvar}</Alert></div>}
            <div className={styles.acoesModal}>
              <Button variant="secondary" onClick={() => setSalvarPendente(null)} disabled={salvando}>
                Voltar
              </Button>
              <Button onClick={confirmarSalvamento} loading={salvando}>
                {salvando ? "Salvando..." : editando ? "Confirmar" : "Criar card"}
              </Button>
            </div>
          </Modal>
        )}
      </>
    );
  }

  if (tela === "detalhe" && selecionada) {
    const ficha = selecionada.fichas;
    const fichaEstaCompleta = fichasCompletas(ficha);
    const statusFichas = fichaEstaCompleta ? "Ficha concluída" : "Ficha em preenchimento";
    return (
      <>
        <PageHeader
          title={selecionada.aluno.nome}
          subtitle={`Matrícula ${selecionada.aluno.numeroMatricula} · ${ficha.requerimento.anoEscolaridade || "Etapa não informada"} · Ano letivo ${ficha.requerimento.anoLetivo || "—"}`}
          action={
            <div className={styles.acoesCabecalho}>
              <Button variant="secondary" onClick={() => setTela("lista")}>
                Alunos
              </Button>
              {selecionada.status !== "INATIVA" ? (
                <>
                  <Button variant="secondary" onClick={() => iniciarEdicao(selecionada)}>
                    {selecionada.status === "PENDENTE" ? "Preencher fichas" : "Editar card"}
                  </Button>
                  <Button variant="danger" onClick={() => setAcaoStatus("INATIVAR")}>
                    Inativar card
                  </Button>
                </>
              ) : (
                <Button onClick={() => setAcaoStatus("REATIVAR")}>Reativar matrícula</Button>
              )}
            </div>
          }
        />
        <nav className={styles.abasCard} aria-label="Seções do card do aluno">
          {([
            ["VISAO_GERAL", "Visão geral"],
            ["REQUERIMENTO", "Requerimento"],
            ["SOCIOECONOMICA", "Socioeconômica"],
            ["TERMOS", "Termos"],
            ["HISTORICO", "Histórico"],
          ] as const).map(([aba, rotulo]) => (
            <button
              type="button"
              key={aba}
              className={abaCard === aba ? styles.abaCardAtiva : styles.abaCard}
              aria-current={abaCard === aba ? "page" : undefined}
              onClick={() => setAbaCard(aba)}
            >
              {rotulo}
            </button>
          ))}
        </nav>

        {selecionada.status === "PENDENTE" && abaCard !== "HISTORICO" && (
          <div className={styles.avisoPendente}>
            Card criado. Preencha e salve as fichas obrigatórias para ativar a matrícula.
          </div>
        )}

        {abaCard === "VISAO_GERAL" && (
          <>
            <section className={styles.card}>
              <div className={styles.cardTopo}>
                <div>
                  <p className={styles.rotulo}>Aluno</p>
                  <h2>{selecionada.aluno.nome}</h2>
                </div>
                <span className={`${styles.badge} ${classeStatus(selecionada.status)}`}>
                  {rotuloStatus(selecionada.status)}
                </span>
              </div>
              <div className={styles.dadosGrid}>
                <Dado rotulo="Número de matrícula" valor={selecionada.aluno.numeroMatricula} />
                <Dado rotulo="CPF" valor={selecionada.aluno.cpf} />
                <Dado rotulo="Data de nascimento" valor={dataFormatada(selecionada.aluno.dataNascimento)} />
                <Dado rotulo="Sexo" valor={selecionada.aluno.sexo === "F" ? "Feminino" : selecionada.aluno.sexo === "M" ? "Masculino" : ""} />
                <Dado
                  rotulo="NIS / ID"
                  valor={`${selecionada.aluno.nis || "—"} / ${selecionada.aluno.identidade || "—"}`}
                />
                <Dado
                  rotulo="Naturalidade"
                  valor={`${selecionada.aluno.naturalidade || "—"} / ${selecionada.aluno.ufNaturalidade || "—"}`}
                />
                <Dado rotulo="Nacionalidade" valor={selecionada.aluno.nacionalidade} />
                <Dado rotulo="Cor/raça" valor={selecionada.aluno.corRaca} />
                <Dado rotulo="Etapa" valor={ficha.requerimento.anoEscolaridade} />
                <Dado rotulo="Ano letivo" valor={ficha.requerimento.anoLetivo} />
                <Dado rotulo="Data da matrícula" valor={dataFormatada(ficha.requerimento.dataMatricula)} />
                <Dado rotulo="Responsável" valor={ficha.socioeconomica.declaracao.responsavel} />
                <Dado rotulo="Cadastrada em" valor={dataFormatada(selecionada.criadaEm)} />
              </div>
            </section>
            <section className={styles.secaoDetalhe}>
              <h2>Fichas do aluno</h2>
              <div className={styles.fichasGrid}>
                <FichaResumo
                  titulo="Requerimento"
                  status={statusFichas}
                >
                  <Button variant="secondary" size="sm" onClick={() => setAbaCard("REQUERIMENTO")}>Abrir ficha</Button>
                </FichaResumo>
                <FichaResumo
                  titulo="Socioeconômica"
                  status={statusFichas}
                >
                  <Button variant="secondary" size="sm" onClick={() => setAbaCard("SOCIOECONOMICA")}>Abrir ficha</Button>
                </FichaResumo>
                <FichaResumo
                  titulo="Termos e autorizações"
                  status={fichaEstaCompleta ? "Termos concluídos" : "Termos em preenchimento"}
                >
                  <Button variant="secondary" size="sm" onClick={() => setAbaCard("TERMOS")}>Abrir fichas</Button>
                </FichaResumo>
              </div>
            </section>
          </>
        )}

        {abaCard === "REQUERIMENTO" && (
          <section className={styles.secaoDetalhe}>
            <h2>Requerimento de matrícula</h2>
            <div className={styles.fichasGrid}>
              <Ficha titulo="Documentação civil">
                <Dado rotulo="RG / órgão emissor / UF" valor={[ficha.requerimento.documentacaoCivil.rg, ficha.requerimento.documentacaoCivil.orgaoEmissor, ficha.requerimento.documentacaoCivil.ufEmissor].filter(Boolean).join(" · ")} />
                <Dado rotulo="Expedição" valor={dataFormatada(ficha.requerimento.documentacaoCivil.dataExpedicao)} />
                <Dado rotulo="Certidão" valor={[ficha.requerimento.documentacaoCivil.tipoCertidao, ficha.requerimento.documentacaoCivil.numeroTermo, ficha.requerimento.documentacaoCivil.folha, ficha.requerimento.documentacaoCivil.livro].filter(Boolean).join(" · ")} />
                <Dado rotulo="Cartório / UF" valor={`${ficha.requerimento.documentacaoCivil.nomeCartorio} / ${ficha.requerimento.documentacaoCivil.ufCartorio}`} />
                <Dado rotulo="CPF / documento estrangeiro" valor={`${selecionada.aluno.cpf} / ${ficha.requerimento.documentacaoCivil.documentoEstrangeiro}`} />
              </Ficha>
              <Ficha titulo="Filiação">
                <Dado rotulo="Pai" valor={[ficha.requerimento.filiacao.pai.nome, ficha.requerimento.filiacao.pai.escolaridade, ficha.requerimento.filiacao.pai.localTrabalho, ficha.requerimento.filiacao.pai.telefoneTrabalho].filter(Boolean).join(" · ")} />
                <Dado rotulo="Mãe" valor={[ficha.requerimento.filiacao.mae.nome, ficha.requerimento.filiacao.mae.escolaridade, ficha.requerimento.filiacao.mae.localTrabalho, ficha.requerimento.filiacao.mae.telefoneTrabalho].filter(Boolean).join(" · ")} />
              </Ficha>
              <Ficha titulo="Endereço e saúde">
                <Dado rotulo="Endereço / telefone" valor={`${ficha.requerimento.endereco} / ${ficha.requerimento.telefone}`} />
                <Dado rotulo="Problemas de saúde" valor={[...ficha.requerimento.saude.problemas, ficha.requerimento.saude.observacoesProblemas].filter(Boolean).join(" · ")} />
                <Dado rotulo="Acompanhamentos médicos" valor={[...ficha.requerimento.saude.acompanhamentos, ficha.requerimento.saude.observacoesAcompanhamento].filter(Boolean).join(" · ")} />
              </Ficha>
              <Ficha titulo="Compromisso e documentos">
                <Dado rotulo="Responsável" valor={ficha.requerimento.compromissoDocumentos.responsavel} />
                <Dado rotulo="Documentos entregues" valor={ficha.requerimento.compromissoDocumentos.documentosEntregues.join(", ")} />
              </Ficha>
              <Ficha titulo="Renovações e transferência">
                <Dado rotulo="Renovações" valor={ficha.requerimento.renovacoes.map((renovacao) => `${dataFormatada(renovacao.data)} · ${renovacao.ano} · ${renovacao.responsavel}`).join("; ")} />
                <Dado rotulo="Transferência" valor={[dataFormatada(ficha.requerimento.transferencia.dataPedido), dataFormatada(ficha.requerimento.transferencia.dataEntrega), ficha.requerimento.transferencia.responsavel].filter((valor) => valor !== "—").join(" · ")} />
              </Ficha>
            </div>
          </section>
        )}

        {abaCard === "SOCIOECONOMICA" && (
          <section className={styles.secaoDetalhe}>
            <h2>Ficha socioeconômica</h2>
            <div className={styles.fichasGrid}>
              <Ficha titulo="Endereço e contato">
                <Dado rotulo="Endereço" valor={`${ficha.socioeconomica.endereco.logradouro} ${ficha.socioeconomica.endereco.numero}, ${ficha.socioeconomica.endereco.bairro}`} />
                <Dado rotulo="Cidade / estado / CEP" valor={`${ficha.socioeconomica.endereco.cidade} / ${ficha.socioeconomica.endereco.estado} / ${ficha.socioeconomica.endereco.cep}`} />
                <Dado rotulo="Telefone / celular" valor={`${ficha.socioeconomica.endereco.telefone} / ${ficha.socioeconomica.endereco.celular}`} />
                <Dado rotulo="E-mail" valor={ficha.socioeconomica.endereco.email} />
              </Ficha>
              <Ficha titulo="Moradia e transporte">
                <Dado rotulo="Moradia" valor={[ficha.socioeconomica.moradia.tipo, ficha.socioeconomica.moradia.cedidoPor, ficha.socioeconomica.moradia.valorMensal].filter(Boolean).join(" · ")} />
                <Dado rotulo="Transporte" valor={ficha.socioeconomica.transporte} />
              </Ficha>
              <Ficha titulo="Núcleo familiar">
                {ficha.socioeconomica.nucleoFamiliar.map((membro, index) => (
                  <Dado key={`membro-${index}`} rotulo={membro.componente || `Pessoa ${index + 1}`} valor={[membro.profissao, membro.idade, membro.estadoCivil, membro.escolaridade, membro.rendaMensal].filter(Boolean).join(" · ")} />
                ))}
                <Dado rotulo="Observações" valor={ficha.socioeconomica.observacoes} />
              </Ficha>
              <Ficha titulo="Outras propriedades e declaração">
                <Dado rotulo="Outras propriedades" valor={ficha.socioeconomica.outrasPropriedades.possui ? ficha.socioeconomica.outrasPropriedades.descricao || "Sim" : "Não"} />
                <Dado rotulo="Responsável" valor={ficha.socioeconomica.declaracao.responsavel} />
                <Dado rotulo="Local / data" valor={`${ficha.socioeconomica.declaracao.local} / ${dataFormatada(ficha.socioeconomica.declaracao.data)}`} />
              </Ficha>
            </div>
          </section>
        )}

        {abaCard === "TERMOS" && (
          <section className={styles.secaoDetalhe}>
            <h2>Termos e autorizações</h2>
            <div className={styles.fichasGrid}>
              <Ficha titulo="Autorização de uso de imagem">
                <Dado rotulo="Autorização" valor={ficha.imagem.autorizada === null ? "" : ficha.imagem.autorizada ? "Autorizada" : "Não autorizada"} />
                <Dado rotulo="Responsável pela assinatura" valor={ficha.imagem.responsavel} />
              </Ficha>
              <Ficha titulo="Autorização de saída">
                <Dado rotulo="Saída sem responsável" valor={ficha.saida.autorizadaSemResponsavel === null ? "" : ficha.saida.autorizadaSemResponsavel ? "Autorizada" : "Não autorizada"} />
                <Dado rotulo="Responsável pela assinatura" valor={ficha.saida.responsavel} />
                <Dado rotulo="Pessoas autorizadas para retirada" valor={ficha.saida.pessoasAutorizadas} />
              </Ficha>
              <Ficha titulo="Compromisso escolar">
                <Dado rotulo="Termo" valor={ficha.compromisso.aceito ? "Aceito" : "Pendente"} />
                <Dado rotulo="Responsável pela assinatura" valor={ficha.compromisso.responsavel} />
              </Ficha>
            </div>
          </section>
        )}

        {abaCard === "HISTORICO" && (
          <section className={styles.secaoDetalhe}>
            <h2>Histórico de alterações</h2>
            {selecionada.historico.length === 0 ? (
              <p className={styles.vazio}>Nenhuma alteração registrada.</p>
            ) : (
              <ol className={styles.historico}>
                {selecionada.historico.map((item) => (
                  <li key={item.id}>
                    <div className={styles.historicoTopo}>
                      <strong>{tituloHistorico(item.tipo)}</strong>
                      <time dateTime={item.data}>{new Date(item.data).toLocaleString("pt-BR")}</time>
                    </div>
                    <p>Por {item.autor}</p>
                    <ul>{item.alteracoes.map((alteracao) => <li key={alteracao}>{alteracao}</li>)}</ul>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {acaoStatus && (
          <Modal
            title={acaoStatus === "INATIVAR" ? "Inativar matrícula" : "Reativar matrícula"}
            description={
              acaoStatus === "INATIVAR"
                ? `Inativar a matrícula de ${selecionada.aluno.nome}? O card continuará disponível para consulta, mas não poderá ser editado.`
                : `Reativar a matrícula de ${selecionada.aluno.nome}? O card voltará a poder ser editado.`
            }
            onClose={() => {
              if (!alterandoStatus) {
                setAcaoStatus(null);
                setErroStatus(null);
              }
            }}
            dismissible={!alterandoStatus}
            size="sm"
          >
            {erroStatus && <div className={styles.modalErro}><Alert>{erroStatus}</Alert></div>}
            <div className={styles.acoesModal}>
              <Button
                variant="secondary"
                onClick={() => {
                  setAcaoStatus(null);
                  setErroStatus(null);
                }}
                disabled={alterandoStatus}
              >
                Cancelar
              </Button>
              <Button
                variant={acaoStatus === "INATIVAR" ? "danger" : "primary"}
                onClick={confirmarAlteracaoStatus}
                loading={alterandoStatus}
              >
                {alterandoStatus ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </Modal>
        )}
      </>
    );
  }

  const ativas = matriculas.filter((item) => item.status === "ATIVA").length;
  const pendentes = matriculas.filter((item) => item.status === "PENDENTE").length;
  const inativas = matriculas.filter((item) => item.status === "INATIVA").length;
  return (
    <>
      <PageHeader
        title="Matrículas"
        subtitle="Gerencie os cards dos alunos, suas fichas e o histórico de alterações."
        action={<Button onClick={iniciarCriacao}>+ Nova matrícula</Button>}
      />
      <div className={styles.resumo}>
        <Resumo rotulo="Cards cadastrados" valor={matriculas.length} />
        <Resumo rotulo="Matrículas ativas" valor={ativas} />
        <Resumo rotulo="Fichas pendentes" valor={pendentes} />
        <Resumo rotulo="Matrículas inativas" valor={inativas} />
      </div>

      <div className={styles.filtros}>
        <TextField
          label="Buscar aluno"
          placeholder="Nome, CPF ou número de matrícula"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />
        <label className={styles.filtroStatus}>
          Situação
          <select value={filtro} onChange={(event) => setFiltro(event.target.value as Filtro)}>
            <option value="TODAS">Todas</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="ATIVA">Ativas</option>
            <option value="INATIVA">Inativas</option>
          </select>
        </label>
      </div>

      {carregando ? (
        <p className={styles.vazio} role="status">Carregando matrículas...</p>
      ) : erro ? (
        <div className={styles.estadoErro}>
          <Alert>{erro}</Alert>
          <Button variant="secondary" onClick={carregar}>Tentar novamente</Button>
        </div>
      ) : filtradas.length === 0 ? (
        <div className={styles.vazio}>
          <h2>{matriculas.length === 0 ? "Nenhuma matrícula cadastrada" : "Nenhum card encontrado"}</h2>
          <p>
            {matriculas.length === 0
              ? "Crie um card para registrar os dados do aluno e preencher as fichas obrigatórias."
              : "Altere a busca ou os filtros para ver outros cards."}
          </p>
          {matriculas.length === 0 && <Button onClick={iniciarCriacao}>Criar primeira matrícula</Button>}
        </div>
      ) : (
        <div className={styles.tabelaWrap}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th scope="col">Aluno</th>
                <th scope="col">Nº matrícula</th>
                <th scope="col">CPF</th>
                <th scope="col">Responsável</th>
                <th scope="col">Situação</th>
                <th scope="col"><span className={styles.srOnly}>Ação</span></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((matricula) => (
                <tr key={matricula.id} className={matricula.status === "INATIVA" ? styles.linhaInativa : undefined}>
                  <td className={styles.nome}>{matricula.aluno.nome}</td>
                  <td>{matricula.aluno.numeroMatricula}</td>
                  <td>{matricula.aluno.cpf}</td>
                  <td>{matricula.fichas.socioeconomica.declaracao.responsavel || "—"}</td>
                  <td>
                    <span className={`${styles.badge} ${classeStatus(matricula.status)}`}>
                      {rotuloStatus(matricula.status)}
                    </span>
                  </td>
                  <td className={styles.acaoLinha}>
                    <Button variant="secondary" size="sm" onClick={() => {
                      setSelecionada(matricula);
                      setAbaCard("VISAO_GERAL");
                      setTela("detalhe");
                    }}>
                      Abrir card
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className={styles.dado}>
      <span>{rotulo}</span>
      <strong>{valor || "—"}</strong>
    </div>
  );
}

function FichaResumo({ titulo, status, children }: { titulo: string; status: string; children: React.ReactNode }) {
  return (
    <article className={styles.fichaResumo}>
      <div>
        <h3>{titulo}</h3>
        <p>{status}</p>
      </div>
      {children}
    </article>
  );
}

function Ficha({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <article className={styles.ficha}>
      <h3>{titulo}</h3>
      <div className={styles.dadosFicha}>{children}</div>
    </article>
  );
}

function classeStatus(status: StatusMatricula): string {
  if (status === "ATIVA") return styles.badgeAtiva;
  if (status === "PENDENTE") return styles.badgePendente;
  return styles.badgeInativa;
}

function rotuloStatus(status: StatusMatricula): string {
  if (status === "ATIVA") return "Ativa";
  if (status === "PENDENTE") return "Pendente";
  return "Inativa";
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <article className={styles.resumoItem}>
      <span>{rotulo}</span>
      <strong>{valor}</strong>
    </article>
  );
}

function tituloHistorico(tipo: Matricula["historico"][number]["tipo"]): string {
  switch (tipo) {
    case "CRIACAO":
      return "Card criado";
    case "EDICAO":
      return "Dados atualizados";
    case "INATIVACAO":
      return "Matrícula inativada";
    case "REATIVACAO":
      return "Matrícula reativada";
  }
}
