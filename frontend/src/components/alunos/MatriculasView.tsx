"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
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
import styles from "./MatriculasView.module.css";

type Tela = "lista" | "formulario" | "detalhe";
type Filtro = "TODAS" | StatusMatricula;
type AcaoStatus = "INATIVAR" | "REATIVAR";

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
      setTela("detalhe");
      setSalvarPendente(null);
      toast(editando ? "Matrícula salva com sucesso." : "Matrícula criada e ativada com sucesso.");
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
          title={editando ? "Editar matrícula" : "Nova matrícula"}
          subtitle="Preencha os dados do aluno e todas as fichas obrigatórias."
        />
        {erroSalvar && <Alert>{erroSalvar}</Alert>}
        <MatriculaForm
          key={editando?.id ?? "nova-matricula"}
          matricula={editando}
          onCancel={() => {
            setErroSalvar(null);
            setTela(editando ? "detalhe" : "lista");
          }}
          onSave={(payload) => {
            setSalvarPendente(payload);
            setErroSalvar(null);
          }}
        />
        {salvarPendente && (
          <Modal
            title="Confirmar salvamento"
            description={
              editando
                ? `Salvar as alterações no card de ${salvarPendente.aluno.nome}?`
                : `Criar e ativar a matrícula de ${salvarPendente.aluno.nome}?`
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
                Revisar dados
              </Button>
              <Button onClick={confirmarSalvamento} loading={salvando}>
                {salvando ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </Modal>
        )}
      </>
    );
  }

  if (tela === "detalhe" && selecionada) {
    const ficha = selecionada.fichas;
    return (
      <>
        <PageHeader
          title="Card da matrícula"
          subtitle="Dados do aluno, fichas preenchidas e histórico de alterações."
          action={
            <div className={styles.acoesCabecalho}>
              <Button variant="secondary" onClick={() => setTela("lista")}>
                Voltar à lista
              </Button>
              {selecionada.status === "ATIVA" ? (
                <>
                  <Button variant="secondary" onClick={() => iniciarEdicao(selecionada)}>
                    Editar card
                  </Button>
                  <Button variant="danger" onClick={() => setAcaoStatus("INATIVAR")}>
                    Inativar matrícula
                  </Button>
                </>
              ) : (
                <Button onClick={() => setAcaoStatus("REATIVAR")}>Reativar matrícula</Button>
              )}
            </div>
          }
        />
        <section className={styles.card}>
          <div className={styles.cardTopo}>
            <div>
              <p className={styles.rotulo}>Aluno</p>
              <h2>{selecionada.aluno.nome}</h2>
            </div>
            <span className={`${styles.badge} ${selecionada.status === "ATIVA" ? styles.badgeAtiva : styles.badgeInativa}`}>
              {selecionada.status === "ATIVA" ? "Ativa" : "Inativa"}
            </span>
          </div>
          <div className={styles.dadosGrid}>
            <Dado rotulo="Número de matrícula" valor={selecionada.aluno.numeroMatricula} />
            <Dado rotulo="CPF" valor={selecionada.aluno.cpf} />
            <Dado rotulo="Data de nascimento" valor={dataFormatada(selecionada.aluno.dataNascimento)} />
            <Dado rotulo="Responsável" valor={selecionada.aluno.nomeResponsavel} />
            <Dado rotulo="Telefone do responsável" valor={selecionada.aluno.telefoneResponsavel} />
            <Dado rotulo="Cadastrada em" valor={dataFormatada(selecionada.criadaEm)} />
          </div>
        </section>

        <section className={styles.secaoDetalhe}>
          <h2>Fichas da matrícula</h2>
          <div className={styles.fichasGrid}>
            <Ficha titulo="Socioeconômica">
              <Dado rotulo="Renda familiar mensal" valor={ficha.socioeconomica.rendaFamiliar} />
              <Dado rotulo="Pessoas na residência" valor={ficha.socioeconomica.pessoasNaResidencia} />
              <Dado rotulo="Situação da moradia" valor={ficha.socioeconomica.situacaoMoradia} />
              <Dado rotulo="Benefício social" valor={ficha.socioeconomica.beneficioSocial} />
            </Ficha>
            <Ficha titulo="Autorização de uso de imagem">
              <Dado rotulo="Autorização" valor={ficha.imagem.autorizada ? "Autorizada" : "Não autorizada"} />
              <Dado rotulo="Responsável pela assinatura" valor={ficha.imagem.responsavel} />
            </Ficha>
            <Ficha titulo="Autorização de saída">
              <Dado
                rotulo="Saída sem responsável"
                valor={ficha.saida.autorizadaSemResponsavel ? "Autorizada" : "Não autorizada"}
              />
              <Dado rotulo="Responsável pela assinatura" valor={ficha.saida.responsavel} />
              <Dado rotulo="Pessoas autorizadas para retirada" valor={ficha.saida.pessoasAutorizadas} />
            </Ficha>
            <Ficha titulo="Compromisso escolar">
              <Dado rotulo="Termo" valor={ficha.compromisso.aceito ? "Aceito" : "Não aceito"} />
              <Dado rotulo="Responsável pela assinatura" valor={ficha.compromisso.responsavel} />
            </Ficha>
            <Ficha titulo="Requerimento de matrícula">
              <Dado rotulo="Ano letivo" valor={ficha.requerimento.anoLetivo} />
              <Dado rotulo="Turma pretendida" valor={ficha.requerimento.turmaPretendida} />
              <Dado rotulo="Responsável pelo requerimento" valor={ficha.requerimento.responsavel} />
            </Ficha>
          </div>
        </section>

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
                  <ul>
                    {item.alteracoes.map((alteracao) => (
                      <li key={alteracao}>{alteracao}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </section>

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
  const inativas = matriculas.length - ativas;
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
                  <td>{matricula.aluno.nomeResponsavel}</td>
                  <td>
                    <span className={`${styles.badge} ${matricula.status === "ATIVA" ? styles.badgeAtiva : styles.badgeInativa}`}>
                      {matricula.status === "ATIVA" ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className={styles.acaoLinha}>
                    <Button variant="secondary" size="sm" onClick={() => {
                      setSelecionada(matricula);
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

function Ficha({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <article className={styles.ficha}>
      <h3>{titulo}</h3>
      <div className={styles.dadosFicha}>{children}</div>
    </article>
  );
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
