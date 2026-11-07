"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { FichasMatricula, Matricula, NovaMatriculaPayload } from "@/types";
import styles from "./MatriculaForm.module.css";

interface MatriculaFormProps {
  matricula: Matricula | null;
  onCancel: () => void;
  onSave: (payload: NovaMatriculaPayload) => void;
}

function payloadInicial(matricula: Matricula | null): NovaMatriculaPayload {
  if (matricula) return { aluno: { ...matricula.aluno }, fichas: structuredClone(matricula.fichas) };
  return {
    aluno: {
      nome: "",
      cpf: "",
      numeroMatricula: "",
      dataNascimento: "",
      nomeResponsavel: "",
      telefoneResponsavel: "",
    },
    fichas: {
      socioeconomica: {
        rendaFamiliar: "",
        pessoasNaResidencia: "",
        situacaoMoradia: "",
        beneficioSocial: "",
      },
      imagem: { autorizada: null, responsavel: "" },
      saida: { autorizadaSemResponsavel: null, responsavel: "", pessoasAutorizadas: "" },
      compromisso: { aceito: false, responsavel: "" },
      requerimento: { anoLetivo: "", turmaPretendida: "", responsavel: "" },
    },
  };
}

function atualizarFicha<K extends keyof FichasMatricula>(
  fichas: FichasMatricula,
  grupo: K,
  campo: keyof FichasMatricula[K],
  valor: string | boolean | null,
): FichasMatricula {
  return {
    ...fichas,
    [grupo]: { ...fichas[grupo], [campo]: valor },
  };
}

interface OpcaoBooleanaProps {
  nome: string;
  rotulo: string;
  valor: boolean | null;
  onChange: (valor: boolean) => void;
  required?: boolean;
}

function OpcaoBooleana({ nome, rotulo, valor, onChange, required = true }: OpcaoBooleanaProps) {
  return (
    <fieldset className={styles.opcoes}>
      <legend>
        {rotulo}
        {required && <span aria-hidden="true"> *</span>}
      </legend>
      <label>
        <input
          type="radio"
          name={nome}
          checked={valor === true}
          onChange={() => onChange(true)}
          required={required && valor === null}
        />
        Sim
      </label>
      <label>
        <input
          type="radio"
          name={nome}
          checked={valor === false}
          onChange={() => onChange(false)}
        />
        Não
      </label>
    </fieldset>
  );
}

export function MatriculaForm({ matricula, onCancel, onSave }: MatriculaFormProps) {
  const [payload, setPayload] = useState(() => payloadInicial(matricula));
  const aluno = payload.aluno;
  const fichas = payload.fichas;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      aluno: { ...aluno, cpf: aluno.cpf.replace(/\D/g, "") },
      fichas,
    });
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <section className={styles.secao} aria-labelledby="dados-aluno">
        <header className={styles.cabecalhoSecao}>
          <span className={styles.numero}>01</span>
          <div>
            <h2 id="dados-aluno">Dados do aluno</h2>
            <p>Informações básicas para identificar a matrícula.</p>
          </div>
        </header>
        <div className={styles.grade}>
          <TextField
            label="Nome completo"
            name="nome"
            autoComplete="off"
            required
            value={aluno.nome}
            onChange={(event) =>
              setPayload((atual) => ({ ...atual, aluno: { ...atual.aluno, nome: event.target.value } }))
            }
          />
          <TextField
            label="CPF"
            name="cpf"
            inputMode="numeric"
            pattern="[0-9]{11}"
            maxLength={11}
            hint="Digite os 11 números, sem pontos ou traços."
            required
            value={aluno.cpf}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                aluno: { ...atual.aluno, cpf: event.target.value.replace(/\D/g, "") },
              }))
            }
          />
          <TextField
            label="Número de matrícula"
            name="numeroMatricula"
            required
            value={aluno.numeroMatricula}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                aluno: { ...atual.aluno, numeroMatricula: event.target.value },
              }))
            }
          />
          <TextField
            label="Data de nascimento"
            name="dataNascimento"
            type="date"
            required
            value={aluno.dataNascimento}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                aluno: { ...atual.aluno, dataNascimento: event.target.value },
              }))
            }
          />
          <TextField
            label="Nome do responsável"
            name="nomeResponsavel"
            required
            value={aluno.nomeResponsavel}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                aluno: { ...atual.aluno, nomeResponsavel: event.target.value },
              }))
            }
          />
          <TextField
            label="Telefone do responsável"
            name="telefoneResponsavel"
            type="tel"
            autoComplete="tel"
            required
            value={aluno.telefoneResponsavel}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                aluno: { ...atual.aluno, telefoneResponsavel: event.target.value },
              }))
            }
          />
        </div>
      </section>

      <section className={styles.secao} aria-labelledby="ficha-socioeconomica">
        <header className={styles.cabecalhoSecao}>
          <span className={styles.numero}>02</span>
          <div>
            <h2 id="ficha-socioeconomica">Ficha socioeconômica</h2>
            <p>Dados do grupo familiar e da situação socioeconômica.</p>
          </div>
        </header>
        <div className={styles.grade}>
          <TextField
            label="Renda familiar mensal"
            name="rendaFamiliar"
            placeholder="Ex.: R$ 2.000,00"
            required
            value={fichas.socioeconomica.rendaFamiliar}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "socioeconomica", "rendaFamiliar", event.target.value),
              }))
            }
          />
          <TextField
            label="Pessoas que residem com o aluno"
            name="pessoasNaResidencia"
            type="number"
            min="1"
            step="1"
            required
            value={fichas.socioeconomica.pessoasNaResidencia}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(
                  atual.fichas,
                  "socioeconomica",
                  "pessoasNaResidencia",
                  event.target.value,
                ),
              }))
            }
          />
          <TextField
            label="Situação da moradia"
            name="situacaoMoradia"
            placeholder="Ex.: própria, alugada ou cedida"
            required
            value={fichas.socioeconomica.situacaoMoradia}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "socioeconomica", "situacaoMoradia", event.target.value),
              }))
            }
          />
          <TextField
            label="Benefício social recebido"
            name="beneficioSocial"
            placeholder="Informe o benefício ou “Nenhum”"
            required
            value={fichas.socioeconomica.beneficioSocial}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "socioeconomica", "beneficioSocial", event.target.value),
              }))
            }
          />
        </div>
      </section>

      <section className={styles.secao} aria-labelledby="ficha-imagem">
        <header className={styles.cabecalhoSecao}>
          <span className={styles.numero}>03</span>
          <div>
            <h2 id="ficha-imagem">Autorização de uso de imagem</h2>
            <p>Registre a decisão e o responsável pela autorização.</p>
          </div>
        </header>
        <div className={styles.grade}>
          <OpcaoBooleana
            nome="autorizacaoImagem"
            rotulo="Autoriza o uso de imagem do aluno?"
            valor={fichas.imagem.autorizada}
            onChange={(valor) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "imagem", "autorizada", valor),
              }))
            }
          />
          <TextField
            label="Nome do responsável que assinou"
            name="responsavelImagem"
            required
            value={fichas.imagem.responsavel}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "imagem", "responsavel", event.target.value),
              }))
            }
          />
        </div>
      </section>

      <section className={styles.secao} aria-labelledby="ficha-saida">
        <header className={styles.cabecalhoSecao}>
          <span className={styles.numero}>04</span>
          <div>
            <h2 id="ficha-saida">Autorização de saída</h2>
            <p>Defina a autorização para saída sem os responsáveis.</p>
          </div>
        </header>
        <div className={styles.grade}>
          <OpcaoBooleana
            nome="autorizacaoSaida"
            rotulo="Autoriza a saída sem acompanhamento do responsável?"
            valor={fichas.saida.autorizadaSemResponsavel}
            onChange={(valor) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "saida", "autorizadaSemResponsavel", valor),
              }))
            }
          />
          <TextField
            label="Nome do responsável que assinou"
            name="responsavelSaida"
            required
            value={fichas.saida.responsavel}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "saida", "responsavel", event.target.value),
              }))
            }
          />
          <TextField
            label="Pessoas autorizadas para retirada"
            name="pessoasAutorizadas"
            hint="Se não houver, informe “Nenhuma”."
            required
            value={fichas.saida.pessoasAutorizadas}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "saida", "pessoasAutorizadas", event.target.value),
              }))
            }
          />
        </div>
      </section>

      <section className={styles.secao} aria-labelledby="ficha-compromisso">
        <header className={styles.cabecalhoSecao}>
          <span className={styles.numero}>05</span>
          <div>
            <h2 id="ficha-compromisso">Compromisso escolar</h2>
            <p>O termo de compromisso deve ser aceito para ativar a matrícula.</p>
          </div>
        </header>
        <div className={styles.grade}>
          <label className={styles.aceite}>
            <input
              type="checkbox"
              required
              checked={fichas.compromisso.aceito}
              onChange={(event) =>
                setPayload((atual) => ({
                  ...atual,
                  fichas: atualizarFicha(atual.fichas, "compromisso", "aceito", event.target.checked),
                }))
              }
            />
            Confirmo o aceite do termo de compromisso escolar.
            <span aria-hidden="true"> *</span>
          </label>
          <TextField
            label="Nome do responsável que assinou"
            name="responsavelCompromisso"
            required
            value={fichas.compromisso.responsavel}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "compromisso", "responsavel", event.target.value),
              }))
            }
          />
        </div>
      </section>

      <section className={styles.secao} aria-labelledby="ficha-requerimento">
        <header className={styles.cabecalhoSecao}>
          <span className={styles.numero}>06</span>
          <div>
            <h2 id="ficha-requerimento">Requerimento de matrícula</h2>
            <p>Indique o período e a turma solicitada.</p>
          </div>
        </header>
        <div className={styles.grade}>
          <TextField
            label="Ano letivo"
            name="anoLetivo"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            required
            value={fichas.requerimento.anoLetivo}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "requerimento", "anoLetivo", event.target.value),
              }))
            }
          />
          <TextField
            label="Turma pretendida"
            name="turmaPretendida"
            required
            value={fichas.requerimento.turmaPretendida}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "requerimento", "turmaPretendida", event.target.value),
              }))
            }
          />
          <TextField
            label="Nome do responsável pelo requerimento"
            name="responsavelRequerimento"
            required
            value={fichas.requerimento.responsavel}
            onChange={(event) =>
              setPayload((atual) => ({
                ...atual,
                fichas: atualizarFicha(atual.fichas, "requerimento", "responsavel", event.target.value),
              }))
            }
          />
        </div>
      </section>

      <footer className={styles.acoes}>
        <p>Os campos marcados com * são obrigatórios.</p>
        <div>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">{matricula ? "Revisar alterações" : "Revisar matrícula"}</Button>
        </div>
      </footer>
    </form>
  );
}
