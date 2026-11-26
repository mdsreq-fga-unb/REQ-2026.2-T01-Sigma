"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { somenteDigitos } from "@/lib/alunos";
import { MSG } from "@/lib/mensagens";
import { obterAluno } from "@/services/alunos.service";
import { isApiError } from "@/services/api";
import {
  baixarPdfRequerimento,
  obterRequerimento,
  salvarRequerimento,
} from "@/services/fichas.service";
import type { BackendRequerimentoMatricula, BackendRequerimentoPayload } from "@/types";
import { ConfirmacaoModal } from "./ConfirmacaoModal";
import { useAlunoCard } from "./card/AlunoCardContext";
import { focarPrimeiroErroApi } from "./focarErro";
import shared from "./Alunos.module.css";

const OPCOES_SEXO = [
  { valor: "FEMININO", rotulo: "Feminino" },
  { valor: "MASCULINO", rotulo: "Masculino" },
  { valor: "NAO_DECLARADO", rotulo: "Não declarado" },
];
const OPCOES_RACA = [
  { valor: "BRANCO", rotulo: "Branca" },
  { valor: "PRETO", rotulo: "Preta" },
  { valor: "PARDO", rotulo: "Parda" },
  { valor: "AMARELO", rotulo: "Amarela" },
  { valor: "INDIGENA", rotulo: "Indígena" },
  { valor: "NAO_DECLARADO", rotulo: "Não declarada" },
];
const OPCOES_CERTIDAO = [
  { valor: "NASCIMENTO", rotulo: "Certidão de nascimento" },
  { valor: "CASAMENTO", rotulo: "Certidão de casamento" },
];
const OPCOES_UF = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
  "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
].map((uf) => ({ valor: uf, rotulo: uf }));
const OPCOES_PROBLEMAS = [
  { valor: "AUDICAO", rotulo: "Audição" },
  { valor: "GARGANTA", rotulo: "Garganta" },
  { valor: "FALA", rotulo: "Fala" },
  { valor: "VISAO", rotulo: "Visão" },
  { valor: "DESMAIOS", rotulo: "Desmaios" },
  { valor: "RINS", rotulo: "Rins" },
  { valor: "ALERGIA", rotulo: "Alergia" },
  { valor: "OUTROS", rotulo: "Outros" },
];
const OPCOES_ACOMPANHAMENTOS = [
  { valor: "PSICOLOGICO", rotulo: "Psicológico" },
  { valor: "ALERGISTA", rotulo: "Alergista" },
  { valor: "UROLOGICO", rotulo: "Urológico" },
  { valor: "FONOAUDIOLOGICO", rotulo: "Fonoaudiológico" },
  { valor: "CARDIOLOGICO", rotulo: "Cardiológico" },
  { valor: "RINS", rotulo: "Rins" },
  { valor: "OUTROS", rotulo: "Outros" },
];
const OPCOES_DOCUMENTOS = [
  { valor: "FOTO_3X4", rotulo: "2 fotos 3x4" },
  { valor: "CERTIDAO_NASCIMENTO", rotulo: "Certidão de nascimento" },
  { valor: "HISTORICO_ESCOLAR", rotulo: "Histórico escolar" },
  { valor: "CARTAO_VACINA", rotulo: "Cartão de vacina" },
  { valor: "COMPROVANTE_RESIDENCIA", rotulo: "Comprovante de residência" },
];

function payloadInicial(resposta: BackendRequerimentoMatricula): BackendRequerimentoPayload {
  return {
    dados_pessoais: resposta.dados_pessoais,
    matricula: {
      ano_letivo: resposta.matricula.ano_letivo,
      data_matricula: resposta.matricula.data_matricula,
    },
    documentacao_civil: resposta.documentacao_civil,
    filiacao: resposta.filiacao,
    endereco_contato: resposta.endereco_contato,
    saude: resposta.saude,
    termo_compromisso: resposta.termo_compromisso,
    transferencia: resposta.transferencia,
  };
}

function mensagemErro(erro: unknown): string {
  if (!isApiError(erro)) return "Não foi possível concluir a operação. Tente novamente.";
  if (erro.status === 404) return "Matrícula não encontrada.";
  if (erro.status === 503) return "Não foi possível salvar. Tente novamente.";
  return erro.message ?? "Não foi possível concluir a operação. Tente novamente.";
}

export function FichaRequerimento() {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { card, atualizar } = useAlunoCard();
  const [form, setForm] = useState<BackendRequerimentoPayload | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarSalvar, setConfirmarSalvar] = useState(false);

  useEffect(() => {
    let ativo = true;
    void (async () => {
      try {
        setErro(null);
        const resposta = await obterRequerimento(card.idMatricula);
        if (ativo) setForm(payloadInicial(resposta));
      } catch (error) {
        if (ativo) setErro(mensagemErro(error));
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => { ativo = false; };
  }, [card.idMatricula]);

  function atualizarSecao<K extends keyof BackendRequerimentoPayload>(
    secao: K,
    atualizar: (valor: BackendRequerimentoPayload[K]) => BackendRequerimentoPayload[K],
  ) {
    setForm((atual) => atual ? { ...atual, [secao]: atualizar(atual[secao]) } : atual);
  }

  function prepararPayload(atual: BackendRequerimentoPayload): BackendRequerimentoPayload {
    return {
      ...atual,
      dados_pessoais: {
        ...atual.dados_pessoais,
        cpf: somenteDigitos(atual.dados_pessoais.cpf ?? ""),
        nis: somenteDigitos(atual.dados_pessoais.nis ?? ""),
      },
      filiacao: {
        pai: { ...atual.filiacao.pai, telefone_trabalho: somenteDigitos(atual.filiacao.pai.telefone_trabalho ?? "") || null },
        mae: { ...atual.filiacao.mae, telefone_trabalho: somenteDigitos(atual.filiacao.mae.telefone_trabalho ?? "") || null },
      },
      endereco_contato: {
        ...atual.endereco_contato,
        cep: somenteDigitos(atual.endereco_contato.cep ?? ""),
        telefone: somenteDigitos(atual.endereco_contato.telefone ?? "") || null,
      },
    };
  }

  async function salvar() {
    if (!form) return;
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await salvarRequerimento(card.idMatricula, prepararPayload(form));
      setForm(payloadInicial(resposta));
      atualizar(await obterAluno(card.id));
      setConfirmarSalvar(false);
      toast(MSG.fichaSalva, MSG.fichaSalvaDetalhe);
    } catch (error) {
      setErro(mensagemErro(error));
      focarPrimeiroErroApi(formRef.current, error);
      throw error;
    } finally {
      setSalvando(false);
    }
  }

  async function exportarPdf() {
    setExportando(true);
    setErro(null);
    try {
      await baixarPdfRequerimento(card.idMatricula);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setExportando(false);
    }
  }

  function enviar(event: FormEvent) {
    event.preventDefault();
    if (card.status !== "INATIVO") setConfirmarSalvar(true);
  }

  if (carregando) return <p aria-live="polite">Carregando requerimento...</p>;
  if (!form) return <Alert>{erro ?? "Não foi possível carregar o requerimento."}</Alert>;

  const somenteLeitura = card.status === "INATIVO";
  const problemas = form.saude.problemas;
  const acompanhamentos = form.saude.acompanhamentos;

  return (
    <form ref={formRef} className={shared.secoes} onSubmit={enviar} noValidate>
      <h2 className={shared.secaoTitulo}>Requerimento de matrícula</h2>
      {erro && <Alert>{erro}</Alert>}
      {somenteLeitura && <Alert variant="warning">A matrícula está inativa. O requerimento está disponível somente para consulta.</Alert>}

      <fieldset disabled={somenteLeitura} className={shared.secoes}>
        <section className={shared.secao} aria-label="Dados pessoais">
          <h3 className={shared.secaoSubtitulo}>Dados pessoais</h3>
          <div className={shared.grid2}>
            <TextField label="Nome do aluno" name="dados_pessoais.nome" value={form.dados_pessoais.nome ?? ""} onChange={(e) => atualizarSecao("dados_pessoais", (v) => ({ ...v, nome: e.target.value }))} required />
            <TextField label="Data de nascimento" name="dados_pessoais.data_nascimento" type="date" value={form.dados_pessoais.data_nascimento ?? ""} onChange={(e) => atualizarSecao("dados_pessoais", (v) => ({ ...v, data_nascimento: e.target.value || null }))} required />
            <SelectField label="Sexo" name="dados_pessoais.sexo" value={form.dados_pessoais.sexo ?? ""} onChange={(e) => atualizarSecao("dados_pessoais", (v) => ({ ...v, sexo: e.target.value || null }))} options={OPCOES_SEXO} placeholder="Selecione" required />
            <TextField label="NIS" name="dados_pessoais.nis" value={form.dados_pessoais.nis ?? ""} onChange={(e) => atualizarSecao("dados_pessoais", (v) => ({ ...v, nis: e.target.value || null }))} />
            <TextField label="CPF" name="dados_pessoais.cpf" value={form.dados_pessoais.cpf ?? ""} onChange={(e) => atualizarSecao("dados_pessoais", (v) => ({ ...v, cpf: e.target.value || null }))} required />
            <TextField label="Naturalidade" name="dados_pessoais.naturalidade" value={form.dados_pessoais.naturalidade ?? ""} onChange={(e) => atualizarSecao("dados_pessoais", (v) => ({ ...v, naturalidade: e.target.value || null }))} required />
            <SelectField label="UF de naturalidade" name="dados_pessoais.uf" value={form.dados_pessoais.uf ?? ""} onChange={(e) => atualizarSecao("dados_pessoais", (v) => ({ ...v, uf: e.target.value || null }))} options={OPCOES_UF} placeholder="Selecione" required />
            <TextField label="Nacionalidade" name="dados_pessoais.nacionalidade" value={form.dados_pessoais.nacionalidade ?? ""} onChange={(e) => atualizarSecao("dados_pessoais", (v) => ({ ...v, nacionalidade: e.target.value || null }))} required />
            <SelectField label="Cor/raça" name="dados_pessoais.raca" value={form.dados_pessoais.raca ?? ""} onChange={(e) => atualizarSecao("dados_pessoais", (v) => ({ ...v, raca: e.target.value || null }))} options={OPCOES_RACA} placeholder="Selecione" required />
          </div>
        </section>

        <section className={shared.secao} aria-label="Dados da matrícula">
          <h3 className={shared.secaoSubtitulo}>Matrícula</h3>
          <div className={shared.grid2}>
            <TextField label="Ano letivo" name="matricula.ano_letivo" type="number" min={2000} value={form.matricula.ano_letivo ?? ""} onChange={(e) => atualizarSecao("matricula", (v) => ({ ...v, ano_letivo: e.target.value ? Number(e.target.value) : null }))} required />
            <TextField label="Data da matrícula" name="matricula.data_matricula" type="date" value={form.matricula.data_matricula ?? ""} onChange={(e) => atualizarSecao("matricula", (v) => ({ ...v, data_matricula: e.target.value || null }))} required />
            <TextField label="Ano de escolaridade" value={card.etapa?.nome ?? ""} disabled readOnly />
            <TextField label="Turma" value={card.turma?.nome ?? ""} disabled readOnly />
          </div>
        </section>

        <section className={shared.secao} aria-label="Documentação civil">
          <h3 className={shared.secaoSubtitulo}>Documentação civil</h3>
          <div className={shared.grid2}>
            <TextField label="RG" name="documentacao_civil.rg" value={form.documentacao_civil.rg ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, rg: e.target.value || null }))} />
            <TextField label="Órgão emissor" name="documentacao_civil.orgao_emissor" value={form.documentacao_civil.orgao_emissor ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, orgao_emissor: e.target.value || null }))} />
            <SelectField label="UF do RG" name="documentacao_civil.uf_rg" value={form.documentacao_civil.uf_rg ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, uf_rg: e.target.value || null }))} options={OPCOES_UF} placeholder="Selecione" />
            <TextField label="Data de expedição" name="documentacao_civil.data_expedicao" type="date" value={form.documentacao_civil.data_expedicao ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, data_expedicao: e.target.value || null }))} />
            <SelectField label="Tipo de certidão" name="documentacao_civil.tipo_certidao" value={form.documentacao_civil.tipo_certidao ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, tipo_certidao: e.target.value || null }))} options={OPCOES_CERTIDAO} placeholder="Selecione" />
            <TextField label="Número do termo" name="documentacao_civil.num_termo" value={form.documentacao_civil.num_termo ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, num_termo: e.target.value || null }))} />
            <TextField label="Folha" name="documentacao_civil.folha" value={form.documentacao_civil.folha ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, folha: e.target.value || null }))} />
            <TextField label="Livro" name="documentacao_civil.livro" value={form.documentacao_civil.livro ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, livro: e.target.value || null }))} />
            <TextField label="Data de emissão da certidão" name="documentacao_civil.data_emissao_certidao" type="date" value={form.documentacao_civil.data_emissao_certidao ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, data_emissao_certidao: e.target.value || null }))} />
            <TextField label="Nome do cartório" name="documentacao_civil.nome_cartorio" value={form.documentacao_civil.nome_cartorio ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, nome_cartorio: e.target.value || null }))} />
            <SelectField label="UF do cartório" name="documentacao_civil.uf_cartorio" value={form.documentacao_civil.uf_cartorio ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, uf_cartorio: e.target.value || null }))} options={OPCOES_UF} placeholder="Selecione" />
            <TextField label="Documento estrangeiro" name="documentacao_civil.documento_estrangeiro" value={form.documentacao_civil.documento_estrangeiro ?? ""} onChange={(e) => atualizarSecao("documentacao_civil", (v) => ({ ...v, documento_estrangeiro: e.target.value || null }))} />
          </div>
        </section>

        <section className={shared.secao} aria-label="Filiação">
          <h3 className={shared.secaoSubtitulo}>Filiação</h3>
          {(["pai", "mae"] as const).map((parent) => (
            <div className={shared.grid2} key={parent}>
              <TextField label={`Nome do ${parent === "pai" ? "pai" : "mãe"}`} name={`filiacao.${parent}.nome`} value={form.filiacao[parent].nome ?? ""} onChange={(e) => atualizarSecao("filiacao", (v) => ({ ...v, [parent]: { ...v[parent], nome: e.target.value || null } }))} />
              <TextField label={`Escolaridade do ${parent === "pai" ? "pai" : "mãe"}`} name={`filiacao.${parent}.escolaridade`} value={form.filiacao[parent].escolaridade ?? ""} onChange={(e) => atualizarSecao("filiacao", (v) => ({ ...v, [parent]: { ...v[parent], escolaridade: e.target.value || null } }))} />
              <TextField label={`Local de trabalho do ${parent === "pai" ? "pai" : "mãe"}`} name={`filiacao.${parent}.local_trabalho`} value={form.filiacao[parent].local_trabalho ?? ""} onChange={(e) => atualizarSecao("filiacao", (v) => ({ ...v, [parent]: { ...v[parent], local_trabalho: e.target.value || null } }))} />
              <TextField label={`Telefone do trabalho do ${parent === "pai" ? "pai" : "mãe"}`} name={`filiacao.${parent}.telefone_trabalho`} value={form.filiacao[parent].telefone_trabalho ?? ""} onChange={(e) => atualizarSecao("filiacao", (v) => ({ ...v, [parent]: { ...v[parent], telefone_trabalho: e.target.value || null } }))} />
            </div>
          ))}
        </section>

        <section className={shared.secao} aria-label="Endereço e contato">
          <h3 className={shared.secaoSubtitulo}>Endereço e contato</h3>
          <div className={shared.grid2}>
            <TextField label="Logradouro" name="endereco_contato.logradouro" value={form.endereco_contato.logradouro ?? ""} onChange={(e) => atualizarSecao("endereco_contato", (v) => ({ ...v, logradouro: e.target.value || null }))} required />
            <TextField label="Número" name="endereco_contato.numero" value={form.endereco_contato.numero ?? ""} onChange={(e) => atualizarSecao("endereco_contato", (v) => ({ ...v, numero: e.target.value || null }))} />
            <TextField label="Bairro" name="endereco_contato.bairro" value={form.endereco_contato.bairro ?? ""} onChange={(e) => atualizarSecao("endereco_contato", (v) => ({ ...v, bairro: e.target.value || null }))} />
            <TextField label="Cidade" name="endereco_contato.cidade" value={form.endereco_contato.cidade ?? ""} onChange={(e) => atualizarSecao("endereco_contato", (v) => ({ ...v, cidade: e.target.value || null }))} required />
            <SelectField label="UF" name="endereco_contato.uf" value={form.endereco_contato.uf ?? ""} onChange={(e) => atualizarSecao("endereco_contato", (v) => ({ ...v, uf: e.target.value || null }))} options={OPCOES_UF} placeholder="Selecione" />
            <TextField label="CEP" name="endereco_contato.cep" value={form.endereco_contato.cep ?? ""} onChange={(e) => atualizarSecao("endereco_contato", (v) => ({ ...v, cep: e.target.value || null }))} required />
            <TextField label="Telefone" name="endereco_contato.telefone" value={form.endereco_contato.telefone ?? ""} onChange={(e) => atualizarSecao("endereco_contato", (v) => ({ ...v, telefone: e.target.value || null }))} />
          </div>
        </section>

        <section className={shared.secao} aria-label="Saúde">
          <h3 className={shared.secaoSubtitulo}>Saúde</h3>
          <div className={shared.grid2}>
            {[["Problemas de saúde", "problemas", OPCOES_PROBLEMAS], ["Acompanhamentos médicos", "acompanhamentos", OPCOES_ACOMPANHAMENTOS]].map(([titulo, campo, opcoes]) => (
              <fieldset key={campo as string}>
                <legend>{titulo as string}</legend>
                {(opcoes as typeof OPCOES_PROBLEMAS).map((opcao) => (
                  <label key={opcao.valor}>
                    <input
                      type="checkbox"
                      checked={(campo === "problemas" ? problemas : acompanhamentos).includes(opcao.valor)}
                      onChange={(e) => atualizarSecao("saude", (v) => ({
                        ...v,
                        [campo as string]: e.target.checked
                          ? [...(campo === "problemas" ? v.problemas : v.acompanhamentos), opcao.valor]
                          : (campo === "problemas" ? v.problemas : v.acompanhamentos).filter((valor) => valor !== opcao.valor),
                      }))}
                    />
                    {opcao.rotulo}
                  </label>
                ))}
              </fieldset>
            ))}
            <TextField label="Observação dos problemas de saúde" name="saude.observacao_problemas" value={form.saude.observacao_problemas ?? ""} onChange={(e) => atualizarSecao("saude", (v) => ({ ...v, observacao_problemas: e.target.value || null }))} />
            <TextField label="Observação dos acompanhamentos" name="saude.observacao_acompanhamentos" value={form.saude.observacao_acompanhamentos ?? ""} onChange={(e) => atualizarSecao("saude", (v) => ({ ...v, observacao_acompanhamentos: e.target.value || null }))} />
          </div>
        </section>

        <section className={shared.secao} aria-label="Termo de compromisso e transferência">
          <h3 className={shared.secaoSubtitulo}>Termo de compromisso e transferência</h3>
          <div className={shared.grid2}>
            <TextField label="Nome de quem assina o termo" name="termo_compromisso.nome_responsavel" value={form.termo_compromisso.nome_responsavel ?? ""} onChange={(e) => atualizarSecao("termo_compromisso", (v) => ({ ...v, nome_responsavel: e.target.value || null }))} />
            <TextField label="Data do pedido de transferência" name="transferencia.data_pedido" type="date" value={form.transferencia.data_pedido ?? ""} onChange={(e) => atualizarSecao("transferencia", (v) => ({ ...v, data_pedido: e.target.value || null }))} />
            <TextField label="Data de entrega da transferência" name="transferencia.data_entrega" type="date" value={form.transferencia.data_entrega ?? ""} onChange={(e) => atualizarSecao("transferencia", (v) => ({ ...v, data_entrega: e.target.value || null }))} />
            <TextField label="Responsável pela transferência" name="transferencia.nome_responsavel" value={form.transferencia.nome_responsavel ?? ""} onChange={(e) => atualizarSecao("transferencia", (v) => ({ ...v, nome_responsavel: e.target.value || null }))} />
          </div>
          <fieldset>
            <legend>Documentos entregues</legend>
            {OPCOES_DOCUMENTOS.map((opcao) => (
              <label key={opcao.valor}>
                <input
                  type="checkbox"
                  checked={form.termo_compromisso.documentos_entregues.includes(opcao.valor)}
                  onChange={(e) => atualizarSecao("termo_compromisso", (v) => ({
                    ...v,
                    documentos_entregues: e.target.checked
                      ? [...v.documentos_entregues, opcao.valor]
                      : v.documentos_entregues.filter((valor) => valor !== opcao.valor),
                  }))}
                />
                {opcao.rotulo}
              </label>
            ))}
          </fieldset>
        </section>
      </fieldset>

      <div className={shared.acoesForm}>
        <Button variant="secondary" onClick={() => router.push(`/alunos/${encodeURIComponent(card.id)}`)}>
          Voltar
        </Button>
        <Button variant="secondary" onClick={exportarPdf} disabled={exportando}>
          {exportando ? "Exportando..." : "Baixar PDF"}
        </Button>
        {!somenteLeitura && (
          <Button type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar ficha"}
          </Button>
        )}
      </div>

      {confirmarSalvar && (
        <ConfirmacaoModal
          titulo="Salvar requerimento?"
          descricao="As alterações serão enviadas para a matrícula no backend."
          rotuloConfirmar="Salvar"
          rotuloEnviando="Salvando..."
          onConfirmar={salvar}
          onClose={() => setConfirmarSalvar(false)}
        />
      )}
    </form>
  );
}
