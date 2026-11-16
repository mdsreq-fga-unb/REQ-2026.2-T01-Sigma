"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { criarAluno } from "@/services/alunos.service";
import { listarEtapas } from "@/services/etapas.service";
import type { CorRaca, Etapa, NovoAlunoPayload, Sexo } from "@/types";
import { ConfirmacaoModal } from "./ConfirmacaoModal";
import { focarPrimeiroErro } from "./focarErro";
import styles from "./Alunos.module.css";

interface Formulario {
  nome: string;
  dataNascimento: string; // dd/mm/aaaa
  sexo: Sexo | null;
  nis: string;
  rg: string;
  cpf: string; // com máscara
  naturalidade: string;
  uf: string;
  nacionalidade: string;
  corRaca: CorRaca | null;
  etapaId: string;
  anoLetivo: string;
  dataMatricula: string; // dd/mm/aaaa
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

/**
 * UC04 FP01 / RF08 – Novo aluno: cria o card de matrícula com os dados pessoais.
 * Fichas e termos são preenchidos depois, dentro do card; a turma é vinculada pelo card.
 */
export function NovoAlunoForm() {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<Formulario>(formularioInicial);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [confirmando, setConfirmando] = useState<NovoAlunoPayload | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [erroEtapas, setErroEtapas] = useState(false);

  useEffect(() => {
    // RN11: só etapas ativas recebem novos vínculos.
    listarEtapas({ status: "ATIVO" }).then(
      (lista) => setEtapas(lista.filter((e) => e.status === "ATIVO")),
      () => setErroEtapas(true),
    );
  }, []);

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros(({ [campo]: _removido, ...resto }) => resto);
  }

  function enviar(event: React.FormEvent) {
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
        <ol className={styles.breadcrumb}>
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
          <div className={styles.modalAlerta}>
            <Alert>{MSG.fichaIncompleta}</Alert>
          </div>
        )}

        <div className={styles.secoes}>
          <section className={styles.secao} aria-labelledby="secao-dados-pessoais">
            <header className={styles.secaoCabecalho}>
              <h2 id="secao-dados-pessoais" className={styles.secaoTitulo}>
                Dados pessoais do aluno
              </h2>
              <p className={styles.secaoDescricao}>
                Comuns ao Requerimento de matrícula e à Ficha socioeconômica — preenchidos uma vez só.
              </p>
            </header>

            <div className={styles.campos}>
              <TextField
                label="Nome do aluno"
                required
                placeholder="Digite o nome completo"
                autoComplete="off"
                value={form.nome}
                onChange={(e) => alterar("nome", e.target.value)}
                error={erros.nome}
              />

              <div className={styles.grid2x1}>
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

              <div className={styles.grid3}>
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

              <div className={styles.grid3}>
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

          <section className={styles.secao} aria-labelledby="secao-matricula">
            <header className={styles.secaoCabecalho}>
              <h2 id="secao-matricula" className={styles.secaoTitulo}>
                Matrícula
              </h2>
            </header>

            <div className={styles.campos}>
              <div className={styles.grid3}>
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
              <p className={styles.notaCampo}>
                A turma é vinculada depois, pelo botão “Vincular à turma” no card do aluno.
              </p>
            </div>
          </section>
        </div>

        <div className={styles.acoesForm}>
          {/* FA05: cancelar descarta o que foi digitado e volta para a lista. */}
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
