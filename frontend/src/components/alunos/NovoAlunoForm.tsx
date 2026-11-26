"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import {
  OPCOES_COR_RACA,
  OPCOES_SEXO,
  UFS,
  dataDigitadaParaIso,
  hojeIso,
  isoParaData,
  mascaraCpf,
  mascaraData,
  mascaraTelefone,
  somenteDigitos,
  temErros,
  validarNovoAluno,
  type ErrosCampos,
} from "@/lib/alunos";
import { MSG } from "@/lib/mensagens";
import { criarAluno } from "@/services/alunos.service";
import { listarEtapas } from "@/services/etapas.service";
import type { CorRaca, Etapa, NovoAlunoPayload, Sexo } from "@/types";
import { ConfirmacaoModal } from "./ConfirmacaoModal";
import { focarPrimeiroErro } from "./focarErro";
import stylesAluno from "./Alunos.module.css";

interface Formulario {
  nome: string;
  dataNascimento: string;
  sexo: Sexo | null;
  nis: string;
  rg: string;
  cpf: string;
  naturalidade: string;
  uf: string;
  nacionalidade: string;
  corRaca: CorRaca | null;
  etapaId: string;
  anoLetivo: string;
  dataMatricula: string;
  nomeResponsavel: string;
  parentescoResponsavel: string;
  cpfResponsavel: string;
  telefoneResponsavel: string;
}

function formularioInicial(): Formulario {
  const hoje = hojeIso();
  return {
    nome: "",
    dataNascimento: "",
    sexo: null,
    nis: "",
    rg: "",
    cpf: "",
    naturalidade: "",
    uf: "",
    nacionalidade: "",
    corRaca: null,
    etapaId: "",
    anoLetivo: hoje.slice(0, 4),
    dataMatricula: isoParaData(hoje),
    nomeResponsavel: "",
    parentescoResponsavel: "",
    cpfResponsavel: "",
    telefoneResponsavel: "",
  };
}

function paraPayload(f: Formulario): NovoAlunoPayload {
  return {
    aluno: {
      nome: f.nome.trim(),
      dataNascimento: dataDigitadaParaIso(f.dataNascimento),
      sexo: f.sexo,
      nis: f.nis.trim(),
      rg: f.rg.trim(),
      cpf: somenteDigitos(f.cpf),
      naturalidade: f.naturalidade.trim(),
      uf: f.uf,
      nacionalidade: f.nacionalidade.trim(),
      corRaca: f.corRaca,
    },
    matricula: {
      etapaId: f.etapaId || null,
      anoLetivo: f.anoLetivo.trim(),
      dataMatricula: dataDigitadaParaIso(f.dataMatricula),
    },
    responsavel: {
      nome: f.nomeResponsavel.trim(),
      parentesco: f.parentescoResponsavel.trim(),
      cpf: somenteDigitos(f.cpfResponsavel),
      telefone: somenteDigitos(f.telefoneResponsavel),
    },
  };
}

function FluxoCard() {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<Formulario>(formularioInicial);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [confirmando, setConfirmando] = useState<NovoAlunoPayload | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [erroEtapas, setErroEtapas] = useState(false);

  useEffect(() => {
    listarEtapas({ status: "ATIVO" }).then(
      (lista) => setEtapas(lista.filter((e) => e.status === "ATIVO")),
      () => setErroEtapas(true),
    );
  }, []);

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros(({ [campo]: _removido, ...resto }) => resto);
  }

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = paraPayload(form);
    const encontrados = validarNovoAluno(payload);
    setErros(encontrados);
    if (temErros(encontrados)) {
      focarPrimeiroErro(formRef.current);
      return;
    }
    setConfirmando(payload);
  }

  async function criar() {
    if (!confirmando) return;
    const card = await criarAluno(confirmando);
    toast(MSG.cardCriado, `${card.aluno.nome} · preencha as fichas e os termos no card`);
    router.push(`/alunos/${encodeURIComponent(card.id)}`);
  }

  return (
    <>
      <nav aria-label="Navegação estrutural">
        <ol className={stylesAluno.breadcrumb}>
          <li>
            <Link href="/alunos">Alunos</Link>
          </li>
          <li aria-current="page">Novo aluno</li>
        </ol>
      </nav>

      <PageHeader
        title="Novo aluno"
        subtitle="Crie o card de matrícula. As fichas e os termos são preenchidos depois, dentro do card."
      />

      <form ref={formRef} onSubmit={enviar} noValidate>
        {temErros(erros) && (
          <div className={stylesAluno.modalAlerta}>
            <Alert>{MSG.fichaIncompleta}</Alert>
          </div>
        )}

        <div className={stylesAluno.secoes}>
          <section className={stylesAluno.secao} aria-labelledby="secao-dados-pessoais">
            <header className={stylesAluno.secaoCabecalho}>
              <h2 id="secao-dados-pessoais" className={stylesAluno.secaoTitulo}>
                Dados pessoais do aluno
              </h2>
              <p className={stylesAluno.secaoDescricao}>
                Comuns ao Requerimento de matrícula e à Ficha socioeconômica — preenchidos uma vez só.
              </p>
            </header>

            <div className={stylesAluno.campos}>
              <TextField
                label="Nome do aluno"
                required
                placeholder="Digite o nome completo"
                autoComplete="off"
                value={form.nome}
                onChange={(e) => alterar("nome", e.target.value)}
                error={erros.nome}
              />

              <div className={stylesAluno.grid2x1}>
                <TextField
                  label="Data de nascimento"
                  required
                  placeholder="dd/mm/aaaa"
                  inputMode="numeric"
                  value={form.dataNascimento}
                  onChange={(e) => alterar("dataNascimento", mascaraData(e.target.value))}
                  error={erros.dataNascimento}
                />
                <RadioGroup
                  label="Sexo"
                  name="sexo"
                  required
                  value={form.sexo}
                  options={OPCOES_SEXO}
                  onChange={(valor) => alterar("sexo", valor)}
                  error={erros.sexo}
                />
              </div>

              <div className={stylesAluno.grid3}>
                <TextField
                  label="Nº do NIS"
                  placeholder="—"
                  inputMode="numeric"
                  value={form.nis}
                  onChange={(e) => alterar("nis", e.target.value)}
                />
                <TextField label="ID" placeholder="—" value={form.rg} onChange={(e) => alterar("rg", e.target.value)} />
                <TextField
                  label="CPF do aluno"
                  required
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  value={form.cpf}
                  onChange={(e) => alterar("cpf", mascaraCpf(e.target.value))}
                  error={erros.cpf}
                />
              </div>
              <p className={stylesAluno.notaCampo}>O campo ID/RG não é enviado ao backend neste cadastro.</p>

              <div className={stylesAluno.grid3}>
                <TextField
                  label="Naturalidade"
                  placeholder="Cidade"
                  value={form.naturalidade}
                  onChange={(e) => alterar("naturalidade", e.target.value)}
                />
                <SelectField
                  label="UF"
                  required
                  placeholder="Selecione"
                  options={UFS.map((uf) => ({ valor: uf, rotulo: uf }))}
                  value={form.uf}
                  onChange={(e) => alterar("uf", e.target.value)}
                  error={erros.uf}
                />
                <TextField
                  label="Nacionalidade"
                  required
                  placeholder="Brasileira"
                  value={form.nacionalidade}
                  onChange={(e) => alterar("nacionalidade", e.target.value)}
                  error={erros.nacionalidade}
                />
              </div>

              <RadioGroup
                label="Cor/Raça"
                name="corRaca"
                value={form.corRaca}
                options={OPCOES_COR_RACA}
                onChange={(valor) => alterar("corRaca", valor)}
              />
            </div>
          </section>

          <section className={stylesAluno.secao} aria-labelledby="secao-responsavel">
            <header className={stylesAluno.secaoCabecalho}>
              <h2 id="secao-responsavel" className={stylesAluno.secaoTitulo}>
                Responsável
              </h2>
              <p className={stylesAluno.secaoDescricao}>
                Nome e parentesco são necessários para criar o card. CPF e telefone são opcionais.
              </p>
            </header>
            <div className={stylesAluno.campos}>
              <div className={stylesAluno.grid2}>
                <TextField
                  label="Nome do responsável"
                  required
                  placeholder="Digite o nome completo"
                  value={form.nomeResponsavel}
                  onChange={(e) => alterar("nomeResponsavel", e.target.value)}
                  error={erros.nomeResponsavel}
                />
                <TextField
                  label="Parentesco"
                  required
                  placeholder="Ex.: mãe, pai, responsável legal"
                  value={form.parentescoResponsavel}
                  onChange={(e) => alterar("parentescoResponsavel", e.target.value)}
                  error={erros.parentescoResponsavel}
                />
              </div>
              <div className={stylesAluno.grid2}>
                <TextField
                  label="CPF do responsável"
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  value={form.cpfResponsavel}
                  onChange={(e) => alterar("cpfResponsavel", mascaraCpf(e.target.value))}
                  error={erros.cpfResponsavel}
                />
                <TextField
                  label="Telefone do responsável"
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  value={form.telefoneResponsavel}
                  onChange={(e) => alterar("telefoneResponsavel", mascaraTelefone(e.target.value))}
                  error={erros.telefoneResponsavel}
                />
              </div>
            </div>
          </section>

          <section className={stylesAluno.secao} aria-labelledby="secao-matricula">
            <header className={stylesAluno.secaoCabecalho}>
              <h2 id="secao-matricula" className={stylesAluno.secaoTitulo}>
                Matrícula
              </h2>
            </header>

            <div className={stylesAluno.campos}>
              <div className={stylesAluno.grid3}>
                <SelectField
                  label="Ano de escolaridade / etapa"
                  required
                  placeholder="Selecione"
                  options={etapas.map((e) => ({ valor: e.id, rotulo: e.nome }))}
                  value={form.etapaId}
                  onChange={(e) => alterar("etapaId", e.target.value)}
                  error={erroEtapas ? "Não foi possível carregar as etapas." : erros.etapaId}
                />
                <TextField
                  label="Ano letivo"
                  required
                  inputMode="numeric"
                  maxLength={4}
                  value={form.anoLetivo}
                  onChange={(e) => alterar("anoLetivo", somenteDigitos(e.target.value))}
                  error={erros.anoLetivo}
                />
                <TextField
                  label="Data da matrícula"
                  required
                  placeholder="dd/mm/aaaa"
                  inputMode="numeric"
                  value={form.dataMatricula}
                  onChange={(e) => alterar("dataMatricula", mascaraData(e.target.value))}
                  error={erros.dataMatricula}
                />
              </div>
              <p className={stylesAluno.notaCampo}>
                A turma é vinculada depois, pelo botão “Vincular à turma” no card do aluno.
              </p>
            </div>
          </section>
        </div>

        <div className={stylesAluno.acoesForm}>
          <Button variant="secondary" onClick={() => router.push("/alunos")}>
            Cancelar
          </Button>
          <Button type="submit">Criar card</Button>
        </div>
      </form>

      {confirmando && (
        <ConfirmacaoModal
          titulo={`Criar o card de ${confirmando.aluno.nome}?`}
          descricao="O card é criado com os dados do aluno, do responsável e da matrícula. A situação inicial depende das fichas pendentes."
          rotuloConfirmar="Confirmar"
          rotuloEnviando="Criando..."
          onConfirmar={criar}
          onClose={() => setConfirmando(null)}
        />
      )}
    </>
  );
}

export function NovoAlunoForm() {
  return <FluxoCard />;
}
