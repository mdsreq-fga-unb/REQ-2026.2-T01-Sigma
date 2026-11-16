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
  somenteDigitos,
  temErros,
  validarNovoAluno,
  type ErrosCampos,
} from "@/lib/alunos";
import { MSG } from "@/lib/mensagens";
import { novoPayloadMatricula } from "@/lib/matriculas";
import { criarAluno } from "@/services/alunos.service";
import { listarEtapas } from "@/services/etapas.service";
import type { CorRaca, Etapa, NovaMatriculaPayload, NovoAlunoPayload, Sexo } from "@/types";
import { ConfirmacaoModal } from "./ConfirmacaoModal";
import { focarPrimeiroErro } from "./focarErro";
import stylesAluno from "./Alunos.module.css";
import stylesMatricula from "./MatriculaForm.module.css";

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
}

interface NovoAlunoFormProps {
  onCancel?: () => void;
  onCreate?: (payload: NovaMatriculaPayload) => void;
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
  };
}

function FluxoMatricula({ onCancel, onCreate }: NovoAlunoFormProps) {
  const [payload, setPayload] = useState<NovaMatriculaPayload>(() => novoPayloadMatricula());
  const { aluno } = payload;
  const requerimento = payload.fichas.requerimento;

  function atualizarAluno(campo: keyof typeof aluno, valor: string) {
    setPayload((atual) => ({ ...atual, aluno: { ...atual.aluno, [campo]: valor } }));
  }

  function atualizarMatricula(campo: "anoEscolaridade" | "anoLetivo" | "dataMatricula", valor: string) {
    setPayload((atual) => ({
      ...atual,
      fichas: {
        ...atual.fichas,
        requerimento: { ...atual.fichas.requerimento, [campo]: valor },
      },
    }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onCreate) return;
    onCreate({
      ...payload,
      aluno: { ...aluno, cpf: aluno.cpf.replace(/\D/g, "") },
    });
  }

  return (
    <form className={stylesMatricula.form} onSubmit={onSubmit}>
      <section className={stylesMatricula.secao}>
        <header className={stylesMatricula.cabecalhoSecao}>
          <div>
            <h2>Dados pessoais do aluno</h2>
            <p>Comuns ao Requerimento de matrícula e à Ficha socioeconômica — preenchidos uma vez.</p>
          </div>
        </header>
        <div className={stylesMatricula.gradeTres}>
          <div className={stylesMatricula.larguraTotal}>
            <TextField
              label="Nome do aluno"
              required
              autoComplete="off"
              placeholder="Digite o nome completo"
              value={aluno.nome}
              onChange={(event) => atualizarAluno("nome", event.target.value)}
            />
          </div>
          <TextField
            label="Data de nascimento"
            type="date"
            required
            value={aluno.dataNascimento}
            onChange={(event) => atualizarAluno("dataNascimento", event.target.value)}
          />
          <fieldset className={stylesMatricula.grupoOpcoes}>
            <legend>Sexo<span aria-hidden="true"> *</span></legend>
            <div className={stylesMatricula.opcoes}>
              {[{ valor: "M", rotulo: "Masculino" }, { valor: "F", rotulo: "Feminino" }].map((opcao, index) => (
                <label className={stylesMatricula.opcao} key={opcao.valor}>
                  <input
                    type="radio"
                    name="sexo-aluno"
                    value={opcao.valor}
                    checked={aluno.sexo === opcao.valor}
                    required={index === 0 && !aluno.sexo}
                    onChange={() => atualizarAluno("sexo", opcao.valor)}
                  />
                  {opcao.rotulo}
                </label>
              ))}
            </div>
          </fieldset>
          <TextField
            label="Nº do NIS"
            placeholder="—"
            value={aluno.nis}
            onChange={(event) => atualizarAluno("nis", event.target.value)}
          />
          <TextField
            label="ID"
            placeholder="—"
            value={aluno.identidade}
            onChange={(event) => atualizarAluno("identidade", event.target.value)}
          />
          <TextField
            label="CPF do aluno"
            inputMode="numeric"
            pattern="[0-9]{11}"
            maxLength={11}
            placeholder="000.000.000-00"
            hint="Informe os 11 números do CPF."
            required
            value={aluno.cpf}
            onChange={(event) => atualizarAluno("cpf", event.target.value.replace(/\D/g, ""))}
          />
          <TextField
            label="Naturalidade"
            placeholder="Cidade"
            value={aluno.naturalidade}
            onChange={(event) => atualizarAluno("naturalidade", event.target.value)}
          />
          <label className={stylesMatricula.campo}>
            <span className={stylesMatricula.rotulo}>UF</span>
            <select
              className={stylesMatricula.controle}
              value={aluno.ufNaturalidade}
              onChange={(event) => atualizarAluno("ufNaturalidade", event.target.value)}
            >
              <option value="">Selecione</option>
              {[
                "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
                "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
                "SP", "SE", "TO",
              ].map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </label>
          <TextField
            label="Nacionalidade"
            value={aluno.nacionalidade}
            onChange={(event) => atualizarAluno("nacionalidade", event.target.value)}
          />
          <div className={stylesMatricula.larguraTotal}>
            <fieldset className={stylesMatricula.grupoOpcoes}>
              <legend>Cor/raça</legend>
              <div className={stylesMatricula.opcoes}>
                {[
                  { valor: "BRANCA", rotulo: "Branca" },
                  { valor: "PRETA", rotulo: "Preta" },
                  { valor: "PARDA", rotulo: "Parda" },
                  { valor: "AMARELA", rotulo: "Amarela" },
                  { valor: "INDIGENA", rotulo: "Indígena" },
                  { valor: "NAO_DECLARADA", rotulo: "Não declarada" },
                ].map((opcao) => (
                  <label className={stylesMatricula.opcao} key={opcao.valor}>
                    <input
                      type="radio"
                      name="cor-raca"
                      value={opcao.valor}
                      checked={aluno.corRaca === opcao.valor}
                      onChange={() => atualizarAluno("corRaca", opcao.valor)}
                    />
                    {opcao.rotulo}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </section>

      <section className={stylesMatricula.secao}>
        <header className={stylesMatricula.cabecalhoSecao}>
          <div>
            <h2>Matrícula</h2>
          </div>
        </header>
        <div className={stylesMatricula.gradeTres}>
          <label className={stylesMatricula.campo}>
            <span className={stylesMatricula.rotulo}>Ano de escolaridade / etapa</span>
            <select
              className={stylesMatricula.controle}
              value={requerimento.anoEscolaridade}
              onChange={(event) => atualizarMatricula("anoEscolaridade", event.target.value)}
              required
            >
              <option value="">Selecione</option>
              {[
                "Berçário",
                "Maternal I",
                "Maternal II",
                "Jardim I",
                "Jardim II",
                "Pré-escola",
              ].map((opcao) => (
                <option value={opcao} key={opcao}>{opcao}</option>
              ))}
            </select>
          </label>
          <TextField
            label="Ano letivo"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            required
            value={requerimento.anoLetivo}
            onChange={(event) => atualizarMatricula("anoLetivo", event.target.value)}
          />
          <TextField
            label="Data da matrícula"
            type="date"
            required
            value={requerimento.dataMatricula}
            onChange={(event) => atualizarMatricula("dataMatricula", event.target.value)}
          />
        </div>
        <p className={stylesMatricula.ajuda}>A turma é vinculada depois, pelo botão “Vincular à turma” no card do aluno.</p>
      </section>

      <footer className={stylesMatricula.acoes}>
        <p>As fichas e os termos serão preenchidos depois, dentro do card.</p>
        <div>
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Criar card</Button>
        </div>
      </footer>
    </form>
  );
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
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  value={form.cpf}
                  onChange={(e) => alterar("cpf", mascaraCpf(e.target.value))}
                  error={erros.cpf}
                />
              </div>

              <div className={stylesAluno.grid3}>
                <TextField
                  label="Naturalidade"
                  placeholder="Cidade"
                  value={form.naturalidade}
                  onChange={(e) => alterar("naturalidade", e.target.value)}
                />
                <SelectField
                  label="UF"
                  placeholder="Selecione"
                  options={UFS.map((uf) => ({ valor: uf, rotulo: uf }))}
                  value={form.uf}
                  onChange={(e) => alterar("uf", e.target.value)}
                />
                <TextField
                  label="Nacionalidade"
                  placeholder="Brasileira"
                  value={form.nacionalidade}
                  onChange={(e) => alterar("nacionalidade", e.target.value)}
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
                  placeholder="Selecione"
                  options={etapas.map((e) => ({ valor: e.id, rotulo: e.nome }))}
                  value={form.etapaId}
                  onChange={(e) => alterar("etapaId", e.target.value)}
                  error={erroEtapas ? "Não foi possível carregar as etapas." : undefined}
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
          descricao="O card é criado como ativo e a criação fica registrada no histórico com o seu nome, a data e a hora."
          rotuloConfirmar="Confirmar"
          rotuloEnviando="Criando..."
          onConfirmar={criar}
          onClose={() => setConfirmando(null)}
        />
      )}
    </>
  );
}

export function NovoAlunoForm(props: NovoAlunoFormProps = {}) {
  if (props.onCreate || props.onCancel) return <FluxoMatricula {...props} />;
  return <FluxoCard />;
}
