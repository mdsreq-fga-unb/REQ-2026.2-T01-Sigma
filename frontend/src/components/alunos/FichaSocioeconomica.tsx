"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { mascaraCep, mascaraTelefone, somenteDigitos } from "@/lib/alunos";
import { MSG } from "@/lib/mensagens";
import { obterAluno } from "@/services/alunos.service";
import { isApiError } from "@/services/api";
import type { BackendMembroFamiliar, BackendSocioeconomica } from "@/types";
import { ConfirmacaoModal } from "./ConfirmacaoModal";
import { useAlunoCard } from "./card/AlunoCardContext";
import { focarPrimeiroErroApi } from "./focarErro";
import shared from "./Alunos.module.css";
import { baixarPdfSocioeconomica, obterSocioeconomica, salvarSocioeconomica } from "@/services/fichas.service";

const MAX_MEMBROS = 20;

const OPCOES_MORADIA = [
  { valor: "PROPRIO", rotulo: "Próprio" },
  { valor: "ALUGADO", rotulo: "Alugado" },
  { valor: "FINANCIADO", rotulo: "Financiado" },
  { valor: "CEDIDO", rotulo: "Cedido" },
  { valor: "OCUPACAO_IRREGULAR", rotulo: "Ocupação irregular" },
];

const OPCOES_UF = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
].map((uf) => ({ valor: uf, rotulo: uf }));

const OPCOES_SIM_NAO = [
  { valor: "true", rotulo: "Sim" },
  { valor: "false", rotulo: "Não" },
];

const OPCOES_TRANSPORTE = [
  { valor: "NENHUM_A_PE_BICICLETA", rotulo: "Nenhum, a pé ou bicicleta" },
  { valor: "CARONA", rotulo: "Carona" },
  { valor: "TRANSPORTE_COLETIVO", rotulo: "Transporte coletivo" },
  { valor: "CARRO_MOTO_PROPRIO", rotulo: "Carro ou moto próprio" },
];

type MembroForm = {
  _key: string;
  id?: number;
  tipo: string;
  profissao: string;
  idade: string;
  estado_civil: string;
  escolaridade: string;
  renda_mensal: string;
};

type FormState = {
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf_residencia: string;
    cep: string;
  };
  contato: { telefone_contato: string; celular: string; email: string };
  moradia: { situacao: NonNullable<BackendSocioeconomica["moradia"]["situacao"]> | ""; cedido_por: string; valor: string };
  transporte: { meio: NonNullable<BackendSocioeconomica["transporte"]["meio"]> | "" };
  nucleo_familiar: { membros: MembroForm[]; observacoes: string };
  outras_propriedades: { possui: boolean | null; relacao: string };
  declaracao: { nome: string; local: string; data: string };
};

function chave() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `m-${Math.random().toString(36).slice(2)}`;
}

function membroVazio(): MembroForm {
  return { _key: chave(), tipo: "", profissao: "", idade: "", estado_civil: "", escolaridade: "", renda_mensal: "" };
}

function paraForm(d: BackendSocioeconomica): FormState {
  return {
    endereco: {
      logradouro: d.endereco?.logradouro ?? "",
      numero: d.endereco?.numero ?? "",
      bairro: d.endereco?.bairro ?? "",
      cidade: d.endereco?.cidade ?? "",
      uf_residencia: d.endereco?.uf_residencia ?? "",
      cep: mascaraCep(d.endereco?.cep ?? ""),
    },
    contato: {
      telefone_contato: mascaraTelefone(d.contato?.telefone_contato ?? ""),
      celular: mascaraTelefone(d.contato?.celular ?? ""),
      email: d.contato?.email ?? "",
    },
    moradia: {
      situacao: d.moradia?.situacao ?? "",
      cedido_por: d.moradia?.cedido_por ?? "",
      valor: d.moradia?.valor != null ? String(d.moradia.valor) : "",
    },
    transporte: {
      meio: d.transporte?.meio ?? "",
    },
    nucleo_familiar: {
      membros: d.nucleo_familiar?.membros.length
        ? d.nucleo_familiar.membros.map((m) => ({
        _key: chave(),
        id: m.id ?? undefined,
        tipo: m.tipo ?? "",
        profissao: m.profissao ?? "",
        idade: m.idade != null ? String(m.idade) : "",
        estado_civil: m.estado_civil ?? "",
        escolaridade: m.escolaridade ?? "",
        renda_mensal: m.renda_mensal != null ? String(m.renda_mensal) : "",
        }))
        : [membroVazio()],
      observacoes: d.nucleo_familiar?.observacoes ?? "",
    },
    outras_propriedades: {
      possui: d.outras_propriedades?.possui ?? null,
      relacao: d.outras_propriedades?.relacao ?? "",
    },
    declaracao: {
      nome: d.declaracao?.nome ?? "",
      local: d.declaracao?.local ?? "",
      data: d.declaracao?.data ?? "",
    },
  };
}

function numeroOpcional(v: string): number | null {
  const t = v.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function paraPayload(form: FormState) {
  const mostraCedido = form.moradia.situacao === "CEDIDO";
  const mostraValorMoradia = form.moradia.situacao === "ALUGADO" || form.moradia.situacao === "FINANCIADO";

  return {
    endereco: {
      logradouro: form.endereco.logradouro.trim(),
      numero: form.endereco.numero.trim(),
      bairro: form.endereco.bairro.trim(),
      cidade: form.endereco.cidade.trim(),
      uf_residencia: form.endereco.uf_residencia,
      cep: somenteDigitos(form.endereco.cep),
    },
    contato: {
      telefone_contato: somenteDigitos(form.contato.telefone_contato) || null,
      celular: somenteDigitos(form.contato.celular),
      email: form.contato.email.trim() || null,
    },
    moradia: {
      situacao: form.moradia.situacao || null,
      cedido_por: mostraCedido ? (form.moradia.cedido_por.trim() || null) : null,
      valor: mostraValorMoradia ? numeroOpcional(form.moradia.valor) : null,
    },
    transporte: { meio: form.transporte.meio || null },
    nucleo_familiar: {
      membros: form.nucleo_familiar.membros.map((m) => {
        const base: BackendMembroFamiliar = {
          tipo: m.tipo.trim() || null,
          profissao: m.profissao.trim() || null,
          idade: m.idade.trim() ? Number(m.idade) : null,
          estado_civil: m.estado_civil.trim() || null,
          escolaridade: m.escolaridade.trim() || null,
          renda_mensal: numeroOpcional(m.renda_mensal),
        };
        if (m.id != null) base.id = m.id;
        return base;
      }),
      observacoes: form.nucleo_familiar.observacoes.trim() || null,
    },
    outras_propriedades: {
      possui: form.outras_propriedades.possui,
      relacao: form.outras_propriedades.possui === true ? (form.outras_propriedades.relacao.trim() || null) : null,
    },
    declaracao: {
      nome: form.declaracao.nome.trim(),
      local: form.declaracao.local.trim(),
      data: form.declaracao.data || null,
    },
  };
}

function mensagemErro(erro: unknown): string {
  if (isApiError(erro)) {
    if (erro.status === 503) return "Não foi possível salvar. Tente novamente.";
    if (erro.status === 404 || erro.code === "NAO_ENCONTRADO") return "Matrícula não encontrada.";
    return erro.message ?? "Erro inesperado. Tente novamente.";
  }
  return "Erro inesperado. Tente novamente.";
}

export function FichaSocioeconomica() {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { card, atualizar } = useAlunoCard();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarSalvar, setConfirmarSalvar] = useState(false);
  const [dados, setDados] = useState<BackendSocioeconomica | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        setCarregando(true);
        setErro(null);
        const resposta = await obterSocioeconomica(card.idMatricula);
        if (!ativo) return;
        setDados(resposta);
        setForm(paraForm(resposta));
      } catch (e) {
        if (!ativo) return;
        setErro(mensagemErro(e));
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => { ativo = false; };
  }, [card.idMatricula]);

  const podeRemoverMembro = (form?.nucleo_familiar.membros.length ?? 0) > 0;

  function setCampo<K extends keyof FormState>(secao: K, valor: FormState[K]) {
    setForm((atual) => (atual ? { ...atual, [secao]: valor } : atual));
  }

  function atualizarMembro(key: string, patch: Partial<MembroForm>) {
    setForm((atual) => {
      if (!atual) return atual;
      return {
        ...atual,
        nucleo_familiar: {
          ...atual.nucleo_familiar,
          membros: atual.nucleo_familiar.membros.map((m) => (m._key === key ? { ...m, ...patch } : m)),
        },
      };
    });
  }

  function adicionarMembro() {
    setForm((atual) => {
      if (!atual || atual.nucleo_familiar.membros.length >= MAX_MEMBROS) return atual;
      return {
        ...atual,
        nucleo_familiar: { ...atual.nucleo_familiar, membros: [...atual.nucleo_familiar.membros, membroVazio()] },
      };
    });
  }

  function removerMembro(key: string) {
    setForm((atual) => {
      if (!atual) return atual;
      return {
        ...atual,
        nucleo_familiar: { ...atual.nucleo_familiar, membros: atual.nucleo_familiar.membros.filter((m) => m._key !== key) },
      };
    });
  }

  async function salvar() {
    if (!form || !dados) return;
    setSalvando(true);
    setErro(null);
    try {
      const payload = paraPayload(form);
      const salvo = await salvarSocioeconomica(card.idMatricula, payload);
      setDados(salvo);
      setForm(paraForm(salvo));
      atualizar(await obterAluno(card.id));
      toast(MSG.fichaSalva, MSG.fichaSalvaDetalhe);
      setConfirmarSalvar(false);
    } catch (e) {
      const msg = mensagemErro(e);
      setErro(msg);
      focarPrimeiroErroApi(formRef.current, e);
      throw e;
    } finally {
      setSalvando(false);
    }
  }

  async function exportarPdf() {
    setExportando(true);
    setErro(null);
    try {
      await baixarPdfSocioeconomica(card.idMatricula);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setExportando(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setConfirmarSalvar(true);
  }

  if (carregando) return <p aria-live="polite">Carregando ficha socioeconômica...</p>;
  if (erro && !form) return <Alert>{erro}</Alert>;
  if (!form || !dados) return <Alert>Não foi possível carregar a ficha socioeconômica.</Alert>;

  const dp = dados.dados_pessoais;
  const mostraCedido = form.moradia.situacao === "CEDIDO";
  const mostraValorMoradia = form.moradia.situacao === "ALUGADO" || form.moradia.situacao === "FINANCIADO";

  return (
    <form ref={formRef} className={shared.secoes} onSubmit={onSubmit} noValidate>
      <h2 className={shared.secaoTitulo}>Ficha socioeconômica</h2>

      {erro && <Alert>{erro}</Alert>}

      <section className={shared.secao} aria-label="Dados pessoais do aluno">
        <h3 className={shared.secaoSubtitulo}>Dados pessoais (somente leitura)</h3>
        <div className={shared.grid2}>
          <TextField label="Nome" value={dp.nome ?? ""} readOnly disabled />
          <TextField label="Data de nascimento" value={dp.data_nasc ?? ""} readOnly disabled />
          <TextField label="Sexo" value={dp.sexo ?? ""} readOnly disabled />
          <TextField label="Etapa" value={dp.etapa ?? ""} readOnly disabled />
          <TextField label="Ano letivo" value={dp.ano_letivo == null ? "" : String(dp.ano_letivo)} readOnly disabled />
          <TextField label="Nome da mãe" value={dp.nome_mae ?? ""} readOnly disabled />
          <TextField label="Nome do pai" value={dp.nome_pai ?? ""} readOnly disabled />
        </div>
      </section>

      <section className={shared.secao} aria-label="Endereço e contato">
        <h3 className={shared.secaoSubtitulo}>Endereço e contato</h3>
        <div className={shared.grid2}>
          <TextField label="Logradouro" name="endereco.logradouro" value={form.endereco.logradouro} onChange={(e) => setCampo("endereco", { ...form.endereco, logradouro: e.target.value })} required />
          <TextField label="Número" name="endereco.numero" value={form.endereco.numero} onChange={(e) => setCampo("endereco", { ...form.endereco, numero: e.target.value })} required />
          <TextField label="Bairro" name="endereco.bairro" value={form.endereco.bairro} onChange={(e) => setCampo("endereco", { ...form.endereco, bairro: e.target.value })} required />
          <TextField label="Cidade" name="endereco.cidade" value={form.endereco.cidade} onChange={(e) => setCampo("endereco", { ...form.endereco, cidade: e.target.value })} required />
          <SelectField label="UF" name="endereco.uf_residencia" value={form.endereco.uf_residencia} onChange={(e) => setCampo("endereco", { ...form.endereco, uf_residencia: e.target.value })} options={OPCOES_UF} placeholder="Selecione" required />
          <TextField label="CEP" name="endereco.cep" value={form.endereco.cep} onChange={(e) => setCampo("endereco", { ...form.endereco, cep: mascaraCep(e.target.value) })} required />
          <TextField label="Telefone de contato" name="contato.telefone_contato" value={form.contato.telefone_contato} onChange={(e) => setCampo("contato", { ...form.contato, telefone_contato: mascaraTelefone(e.target.value) })} />
          <TextField label="Celular" name="contato.celular" value={form.contato.celular} onChange={(e) => setCampo("contato", { ...form.contato, celular: mascaraTelefone(e.target.value) })} />
          <TextField label="E-mail" name="contato.email" type="email" value={form.contato.email} onChange={(e) => setCampo("contato", { ...form.contato, email: e.target.value })} />
        </div>
      </section>

      <section className={shared.secao} aria-label="Moradia e transporte">
        <h3 className={shared.secaoSubtitulo}>Moradia e transporte</h3>
        <div className={shared.grid2}>
          <SelectField label="Situação da moradia" name="moradia.situacao" value={form.moradia.situacao} onChange={(e) => setCampo("moradia", { ...form.moradia, situacao: e.target.value as FormState["moradia"]["situacao"] })} options={OPCOES_MORADIA} required />
          {mostraCedido && (
            <TextField label="Cedido por" name="moradia.cedido_por" value={form.moradia.cedido_por} onChange={(e) => setCampo("moradia", { ...form.moradia, cedido_por: e.target.value })} />
          )}
          {mostraValorMoradia && (
            <TextField label="Valor" name="moradia.valor" type="number" inputMode="decimal" step="0.01" value={form.moradia.valor} onChange={(e) => setCampo("moradia", { ...form.moradia, valor: e.target.value })} />
          )}
          <SelectField label="Meio de transporte" name="transporte.meio" value={form.transporte.meio} onChange={(e) => setCampo("transporte", { meio: e.target.value as FormState["transporte"]["meio"] })} options={OPCOES_TRANSPORTE} placeholder="Selecione" />
        </div>
      </section>

      <section className={shared.secao} aria-label="Núcleo familiar">
        <h3 className={shared.secaoSubtitulo}>Núcleo familiar</h3>
        <p className={shared.secaoDescricao}>O envio salva a lista completa de membros (até {MAX_MEMBROS}).</p>
        <div className={shared.secoes}>
          {form.nucleo_familiar.membros.map((m, idx) => (
            <div key={m._key} className={shared.secao}>
              <div className={shared.grid2}>
                <TextField label={`Componente familiar ${idx + 1}`} name={`nucleo_familiar.membros.${idx}.tipo`} value={m.tipo} onChange={(e) => atualizarMembro(m._key, { tipo: e.target.value })} required />
                <TextField label="Profissão" name={`nucleo_familiar.membros.${idx}.profissao`} value={m.profissao} onChange={(e) => atualizarMembro(m._key, { profissao: e.target.value })} />
                <TextField label="Idade" name={`nucleo_familiar.membros.${idx}.idade`} type="number" inputMode="numeric" min={0} max={120} value={m.idade} onChange={(e) => atualizarMembro(m._key, { idade: e.target.value })} required />
                <TextField label="Estado civil" name={`nucleo_familiar.membros.${idx}.estado_civil`} value={m.estado_civil} onChange={(e) => atualizarMembro(m._key, { estado_civil: e.target.value })} />
                <TextField label="Escolaridade" name={`nucleo_familiar.membros.${idx}.escolaridade`} value={m.escolaridade} onChange={(e) => atualizarMembro(m._key, { escolaridade: e.target.value })} />
                <TextField label="Renda mensal" name={`nucleo_familiar.membros.${idx}.renda_mensal`} type="number" inputMode="decimal" step="0.01" value={m.renda_mensal} onChange={(e) => atualizarMembro(m._key, { renda_mensal: e.target.value })} />
              </div>
              <div className={shared.acoesForm}>
                <Button type="button" variant="secondary" onClick={() => removerMembro(m._key)} disabled={!podeRemoverMembro}>
                  Remover membro
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className={shared.acoesForm}>
          <Button type="button" variant="secondary" onClick={adicionarMembro} disabled={form.nucleo_familiar.membros.length >= MAX_MEMBROS}>
            Adicionar membro
          </Button>
        </div>
        <TextField label="Observações" value={form.nucleo_familiar.observacoes} onChange={(e) => setCampo("nucleo_familiar", { ...form.nucleo_familiar, observacoes: e.target.value })} />
      </section>

      <section className={shared.secao} aria-label="Propriedades e declaração">
        <h3 className={shared.secaoSubtitulo}>Propriedades e declaração</h3>
        <div className={shared.grid2}>
          <SelectField label="Possui outras propriedades" name="outras_propriedades.possui" value={form.outras_propriedades.possui === null ? "" : String(form.outras_propriedades.possui)} onChange={(e) => setCampo("outras_propriedades", { ...form.outras_propriedades, possui: e.target.value === "" ? null : e.target.value === "true" })} options={OPCOES_SIM_NAO} placeholder="Selecione" />
          {form.outras_propriedades.possui === true && (
            <TextField label="Relação das outras propriedades" name="outras_propriedades.relacao" value={form.outras_propriedades.relacao} onChange={(e) => setCampo("outras_propriedades", { ...form.outras_propriedades, relacao: e.target.value })} />
          )}
          <TextField label="Nome do declarante" name="declaracao.nome" value={form.declaracao.nome} onChange={(e) => setCampo("declaracao", { ...form.declaracao, nome: e.target.value })} required />
          <TextField label="Local da declaração" name="declaracao.local" value={form.declaracao.local} onChange={(e) => setCampo("declaracao", { ...form.declaracao, local: e.target.value })} required />
          <TextField label="Data da declaração" name="declaracao.data" type="date" value={form.declaracao.data} onChange={(e) => setCampo("declaracao", { ...form.declaracao, data: e.target.value })} required />
        </div>
      </section>

      <div className={shared.acoesForm}>
        <Button type="button" variant="secondary" onClick={() => router.push(`/alunos/${encodeURIComponent(card.id)}`)}>
          Voltar
        </Button>
        <Button type="button" variant="secondary" onClick={exportarPdf} disabled={exportando}>
          {exportando ? "Exportando..." : "Baixar PDF"}
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar ficha"}
        </Button>
      </div>

      {confirmarSalvar && (
        <ConfirmacaoModal
          titulo="Salvar ficha socioeconômica?"
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
