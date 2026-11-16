"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { novoPayloadMatricula } from "@/lib/matriculas";
import type {
  DadosFiliacao,
  DocumentoCivil,
  FichaRequerimento,
  FichaSocioeconomica,
  FichasMatricula,
  Matricula,
  MembroFamiliar,
  NovaMatriculaPayload,
  RenovacaoMatricula,
} from "@/types";
import styles from "./MatriculaForm.module.css";

interface MatriculaFormProps {
  matricula: Matricula | null;
  onCancel: () => void;
  onSave: (payload: NovaMatriculaPayload) => void;
}

type AbaFicha = "REQUERIMENTO" | "SOCIOECONOMICA";

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];
const PROBLEMAS_SAUDE = ["Audição", "Sangramento", "Fala", "Visão", "Desmaios", "Rins", "Alergia", "Outros"];
const ACOMPANHAMENTOS = [
  "Psicológico", "Alergista", "Urológico", "Fonoaudiológico", "Cardiológico", "Rins", "Outros",
];
const DOCUMENTOS = [
  "2 fotos 3x4",
  "Certidão de nascimento",
  "Histórico escolar",
  "Cartão de vacina",
  "Comprovante de residência",
];
const OPCOES_ESCOLARIDADE = [
  "Berçário",
  "Maternal I",
  "Maternal II",
  "Jardim I",
  "Jardim II",
  "Pré-escola",
];
const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "União estável", "Separado(a)", "Divorciado(a)", "Viúvo(a)"];
const ESCOLARIDADES = [
  "Não alfabetizado(a)",
  "Fundamental incompleto",
  "Fundamental completo",
  "Médio incompleto",
  "Médio completo",
  "Superior incompleto",
  "Superior completo",
  "Pós-graduação",
];

function payloadInicial(matricula: Matricula | null): NovaMatriculaPayload {
  if (matricula) return { aluno: { ...matricula.aluno }, fichas: structuredClone(matricula.fichas) };
  return novoPayloadMatricula();
}

interface CampoProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  maxLength?: number;
  hint?: string;
  options?: string[];
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  maxLength,
  hint,
  options,
}: CampoProps) {
  if (options) {
    return (
      <label className={styles.campo}>
        <span className={styles.rotulo}>{label}{required && <span aria-hidden="true"> *</span>}</span>
        <select
          className={styles.controle}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        >
          <option value="">Selecione</option>
          {options.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}
        </select>
        {hint && <span className={styles.ajuda}>{hint}</span>}
      </label>
    );
  }

  return (
    <TextField
      className={styles.campo}
      label={label}
      type={type}
      value={value}
      placeholder={placeholder}
      required={required}
      min={min}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      hint={hint}
    />
  );
}

function AreaTexto({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className={styles.campo}>
      <span className={styles.rotulo}>{label}{required && <span aria-hidden="true"> *</span>}</span>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </label>
  );
}

function GrupoRadio({
  label,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <fieldset className={styles.grupoOpcoes}>
      <legend>{label}{required && <span aria-hidden="true"> *</span>}</legend>
      <div className={styles.opcoes}>
        {options.map((option, index) => (
          <label key={option.value} className={styles.opcao}>
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              required={required && !value && index === 0}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function GrupoCheckbox({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  return (
    <fieldset className={styles.grupoOpcoes}>
      <legend>{label}</legend>
      <div className={styles.opcoes}>
        {options.map((option) => (
          <label key={option} className={styles.opcao}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) => onChange(
                event.target.checked
                  ? [...selected, option]
                  : selected.filter((item) => item !== option),
              )}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Cartao({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <section className={styles.secao}>
      <header className={styles.cabecalhoSecao}>
        <div>
          <h2>{titulo}</h2>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function OpcaoBooleana({
  nome,
  rotulo,
  valor,
  onChange,
  required = true,
}: {
  nome: string;
  rotulo: string;
  valor: boolean | null;
  onChange: (valor: boolean) => void;
  required?: boolean;
}) {
  return (
    <fieldset className={styles.grupoOpcoes}>
      <legend>{rotulo}{required && <span aria-hidden="true"> *</span>}</legend>
      <div className={styles.opcoes}>
        {[{ label: "Sim", value: true }, { label: "Não", value: false }].map((item) => (
          <label key={item.label} className={styles.opcao}>
            <input
              type="radio"
              name={nome}
              checked={valor === item.value}
              onChange={() => onChange(item.value)}
              required={required && valor === null && item.value === true}
            />
            {item.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function MatriculaForm({ matricula, onCancel, onSave }: MatriculaFormProps) {
  const [payload, setPayload] = useState(() => payloadInicial(matricula));
  const [aba, setAba] = useState<AbaFicha>("REQUERIMENTO");
  const aluno = payload.aluno;
  const fichas = payload.fichas;
  const requerimento = fichas.requerimento;
  const socio = fichas.socioeconomica;

  function atualizarRequerimento<K extends keyof FichaRequerimento>(campo: K, valor: FichaRequerimento[K]) {
    setPayload((atual) => ({
      ...atual,
      fichas: { ...atual.fichas, requerimento: { ...atual.fichas.requerimento, [campo]: valor } },
    }));
  }

  function atualizarSocio<K extends keyof FichaSocioeconomica>(campo: K, valor: FichaSocioeconomica[K]) {
    setPayload((atual) => ({
      ...atual,
      fichas: { ...atual.fichas, socioeconomica: { ...atual.fichas.socioeconomica, [campo]: valor } },
    }));
  }

  function atualizarDocumento<K extends keyof DocumentoCivil>(campo: K, valor: DocumentoCivil[K]) {
    atualizarRequerimento("documentacaoCivil", { ...requerimento.documentacaoCivil, [campo]: valor });
  }

  function atualizarFiliacao(parente: "pai" | "mae", campo: keyof DadosFiliacao, valor: string) {
    atualizarRequerimento("filiacao", {
      ...requerimento.filiacao,
      [parente]: { ...requerimento.filiacao[parente], [campo]: valor },
    });
  }

  function atualizarEndereco(campo: keyof FichaSocioeconomica["endereco"], valor: string) {
    atualizarSocio("endereco", { ...socio.endereco, [campo]: valor });
  }

  function atualizarMoradia(campo: keyof FichaSocioeconomica["moradia"], valor: string) {
    atualizarSocio("moradia", { ...socio.moradia, [campo]: valor });
  }

  function atualizarDeclaracao(campo: keyof FichaSocioeconomica["declaracao"], valor: string) {
    atualizarSocio("declaracao", { ...socio.declaracao, [campo]: valor });
  }

  function atualizarMembro(index: number, campo: keyof MembroFamiliar, valor: string) {
    atualizarSocio(
      "nucleoFamiliar",
      socio.nucleoFamiliar.map((membro, i) => i === index ? { ...membro, [campo]: valor } : membro),
    );
  }

  function atualizarRenovacao(index: number, campo: keyof RenovacaoMatricula, valor: string) {
    atualizarRequerimento(
      "renovacoes",
      requerimento.renovacoes.map((renovacao, i) => i === index ? { ...renovacao, [campo]: valor } : renovacao),
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      aluno: { ...aluno, cpf: aluno.cpf.replace(/\D/g, "") },
      fichas,
    });
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Cartao titulo="Dados pessoais do aluno" subtitulo="Comuns ao Requerimento e à Ficha socioeconômica — preenchidos uma vez.">
        <div className={styles.gradeTres}>
          <TextField
            label="Nome do aluno"
            name="nome"
            autoComplete="off"
            value={aluno.nome}
            onChange={(event) => setPayload((atual) => ({
              ...atual, aluno: { ...atual.aluno, nome: event.target.value },
            }))}
          />
          <TextField
            label="CPF"
            name="cpf"
            inputMode="numeric"
            pattern="[0-9]{11}"
            maxLength={11}
            hint="Digite os 11 números, sem pontos ou traços."
            value={aluno.cpf}
            onChange={(event) => setPayload((atual) => ({
              ...atual, aluno: { ...atual.aluno, cpf: event.target.value.replace(/\D/g, "") },
            }))}
          />
          <TextField
            label="Data de nascimento"
            name="dataNascimento"
            type="date"
            value={aluno.dataNascimento}
            onChange={(event) => setPayload((atual) => ({
              ...atual, aluno: { ...atual.aluno, dataNascimento: event.target.value },
            }))}
          />
          <GrupoRadio
            label="Sexo"
            value={aluno.sexo}
            options={[{ label: "Masculino", value: "M" }, { label: "Feminino", value: "F" }]}
            onChange={(value) => setPayload((atual) => ({
              ...atual, aluno: { ...atual.aluno, sexo: value },
            }))}
          />
          <Campo label="Nº do NIS" value={aluno.nis} onChange={(value) => setPayload((atual) => ({
            ...atual, aluno: { ...atual.aluno, nis: value },
          }))} />
          <Campo label="ID" value={aluno.identidade} onChange={(value) => setPayload((atual) => ({
            ...atual, aluno: { ...atual.aluno, identidade: value },
          }))} />
          <Campo label="Naturalidade" value={aluno.naturalidade} onChange={(value) => setPayload((atual) => ({
            ...atual, aluno: { ...atual.aluno, naturalidade: value },
          }))} />
          <Campo label="UF" value={aluno.ufNaturalidade} options={ESTADOS} onChange={(value) => setPayload((atual) => ({
            ...atual, aluno: { ...atual.aluno, ufNaturalidade: value },
          }))} />
          <Campo label="Nacionalidade" value={aluno.nacionalidade} onChange={(value) => setPayload((atual) => ({
            ...atual, aluno: { ...atual.aluno, nacionalidade: value },
          }))} />
          <div className={styles.larguraTotal}>
            <GrupoRadio
              label="Cor/raça"
              value={aluno.corRaca}
              options={[
                { label: "Branca", value: "BRANCA" },
                { label: "Preta", value: "PRETA" },
                { label: "Parda", value: "PARDA" },
                { label: "Amarela", value: "AMARELA" },
                { label: "Indígena", value: "INDIGENA" },
                { label: "Não declarada", value: "NAO_DECLARADA" },
              ]}
              onChange={(value) => setPayload((atual) => ({
                ...atual, aluno: { ...atual.aluno, corRaca: value },
              }))}
            />
          </div>
        </div>
      </Cartao>

      <Cartao titulo="Matrícula">
        <div className={styles.gradeTres}>
          <Campo
            label="Ano de escolaridade / etapa"
            value={requerimento.anoEscolaridade}
            options={OPCOES_ESCOLARIDADE}
            required
            onChange={(value) => atualizarRequerimento("anoEscolaridade", value)}
          />
          <Campo
            label="Ano letivo"
            value={requerimento.anoLetivo}
            type="number"
            required
            onChange={(value) => atualizarRequerimento("anoLetivo", value)}
          />
          <Campo
            label="Data da matrícula"
            value={requerimento.dataMatricula}
            type="date"
            onChange={(value) => atualizarRequerimento("dataMatricula", value)}
          />
        </div>
      </Cartao>

      <div className={styles.abas} role="tablist" aria-label="Fichas obrigatórias">
        <button
          type="button"
          role="tab"
          id="aba-requerimento"
          aria-selected={aba === "REQUERIMENTO"}
          aria-controls="painel-requerimento"
          className={aba === "REQUERIMENTO" ? styles.abaAtiva : styles.aba}
          onClick={() => setAba("REQUERIMENTO")}
        >
          Requerimento
        </button>
        <button
          type="button"
          role="tab"
          id="aba-socioeconomica"
          aria-selected={aba === "SOCIOECONOMICA"}
          aria-controls="painel-socioeconomica"
          className={aba === "SOCIOECONOMICA" ? styles.abaAtiva : styles.aba}
          onClick={() => setAba("SOCIOECONOMICA")}
        >
          Socioeconômica
        </button>
      </div>

      {aba === "REQUERIMENTO" ? (
        <div role="tabpanel" id="painel-requerimento" aria-labelledby="aba-requerimento" className={styles.conteudoFicha}>
          <div className={styles.info}>
            <strong>Ficha digital do Requerimento de matrícula (Secretaria Municipal de Educação):</strong>{" "}
            as assinaturas continuam no papel; depois de assinada, anexe a ficha digitalizada na aba Documentos.
          </div>

          <Cartao titulo="Documentação civil">
            <div className={styles.gradeQuatro}>
              <Campo label="Nº do RG" value={requerimento.documentacaoCivil.rg} onChange={(value) => atualizarDocumento("rg", value)} />
              <Campo label="Órgão emissor" value={requerimento.documentacaoCivil.orgaoEmissor} onChange={(value) => atualizarDocumento("orgaoEmissor", value)} />
              <Campo label="UF" value={requerimento.documentacaoCivil.ufEmissor} options={ESTADOS} onChange={(value) => atualizarDocumento("ufEmissor", value)} />
              <Campo label="Data de expedição" value={requerimento.documentacaoCivil.dataExpedicao} type="date" onChange={(value) => atualizarDocumento("dataExpedicao", value)} />
            </div>
            <div className={styles.espacamento}>
              <GrupoRadio
                label="Certidão civil"
                value={requerimento.documentacaoCivil.tipoCertidao}
                options={[
                  { label: "Certidão de nascimento", value: "NASCIMENTO" },
                  { label: "Certidão de casamento", value: "CASAMENTO" },
                ]}
                onChange={(value) => {
                  if (value === "NASCIMENTO" || value === "CASAMENTO") {
                    atualizarDocumento("tipoCertidao", value);
                  }
                }}
              />
            </div>
            <div className={`${styles.gradeQuatro} ${styles.espacamento}`}>
              <Campo label="Nº do termo" value={requerimento.documentacaoCivil.numeroTermo} onChange={(value) => atualizarDocumento("numeroTermo", value)} />
              <Campo label="Folha" value={requerimento.documentacaoCivil.folha} onChange={(value) => atualizarDocumento("folha", value)} />
              <Campo label="Livro" value={requerimento.documentacaoCivil.livro} onChange={(value) => atualizarDocumento("livro", value)} />
              <Campo label="Data de emissão" value={requerimento.documentacaoCivil.dataEmissao} type="date" onChange={(value) => atualizarDocumento("dataEmissao", value)} />
              <Campo label="Nome do cartório" value={requerimento.documentacaoCivil.nomeCartorio} onChange={(value) => atualizarDocumento("nomeCartorio", value)} />
              <Campo label="UF do cartório" value={requerimento.documentacaoCivil.ufCartorio} options={ESTADOS} onChange={(value) => atualizarDocumento("ufCartorio", value)} />
              <Campo label="Nº do CPF" value={aluno.cpf} onChange={(value) => setPayload((atual) => ({
                ...atual, aluno: { ...atual.aluno, cpf: value.replace(/\D/g, "") },
              }))} />
              <Campo label="Nº do documento estrangeiro" value={requerimento.documentacaoCivil.documentoEstrangeiro} onChange={(value) => atualizarDocumento("documentoEstrangeiro", value)} />
            </div>
          </Cartao>

          <Cartao titulo="Filiação">
            <div className={styles.gradeQuatro}>
              <Campo label="Nome do pai" value={requerimento.filiacao.pai.nome} onChange={(value) => atualizarFiliacao("pai", "nome", value)} />
              <Campo label="Escolaridade do pai" value={requerimento.filiacao.pai.escolaridade} options={ESCOLARIDADES} onChange={(value) => atualizarFiliacao("pai", "escolaridade", value)} />
              <Campo label="Local de trabalho do pai" value={requerimento.filiacao.pai.localTrabalho} onChange={(value) => atualizarFiliacao("pai", "localTrabalho", value)} />
              <Campo label="Telefone do trabalho do pai" value={requerimento.filiacao.pai.telefoneTrabalho} type="tel" onChange={(value) => atualizarFiliacao("pai", "telefoneTrabalho", value)} />
              <Campo label="Nome da mãe" value={requerimento.filiacao.mae.nome} onChange={(value) => atualizarFiliacao("mae", "nome", value)} />
              <Campo label="Escolaridade da mãe" value={requerimento.filiacao.mae.escolaridade} options={ESCOLARIDADES} onChange={(value) => atualizarFiliacao("mae", "escolaridade", value)} />
              <Campo label="Local de trabalho da mãe" value={requerimento.filiacao.mae.localTrabalho} onChange={(value) => atualizarFiliacao("mae", "localTrabalho", value)} />
              <Campo label="Telefone do trabalho da mãe" value={requerimento.filiacao.mae.telefoneTrabalho} type="tel" onChange={(value) => atualizarFiliacao("mae", "telefoneTrabalho", value)} />
            </div>
          </Cartao>

          <Cartao titulo="Endereço e contato">
            <div className={styles.grade}>
              <Campo label="Endereço" value={requerimento.endereco} onChange={(value) => atualizarRequerimento("endereco", value)} />
              <Campo label="Telefone" value={requerimento.telefone} type="tel" onChange={(value) => atualizarRequerimento("telefone", value)} />
            </div>
          </Cartao>

          <Cartao titulo="Saúde" subtitulo="Marque todas as opções que se aplicam.">
            <GrupoCheckbox
              label="Problemas de saúde"
              options={PROBLEMAS_SAUDE}
              selected={requerimento.saude.problemas}
              onChange={(value) => atualizarRequerimento("saude", { ...requerimento.saude, problemas: value })}
            />
            <AreaTexto
              label="Observações sobre problemas de saúde"
              value={requerimento.saude.observacoesProblemas}
              onChange={(value) => atualizarRequerimento("saude", { ...requerimento.saude, observacoesProblemas: value })}
            />
            <div className={styles.espacamento}>
              <GrupoCheckbox
                label="Acompanhamento médico"
                options={ACOMPANHAMENTOS}
                selected={requerimento.saude.acompanhamentos}
                onChange={(value) => atualizarRequerimento("saude", { ...requerimento.saude, acompanhamentos: value })}
              />
            </div>
            <AreaTexto
              label="Observações sobre acompanhamento médico"
              value={requerimento.saude.observacoesAcompanhamento}
              onChange={(value) => atualizarRequerimento("saude", { ...requerimento.saude, observacoesAcompanhamento: value })}
            />
          </Cartao>

          <Cartao
            titulo="Termo de compromisso — documentos"
            subtitulo="O responsável tem 30 dias para entregar os documentos. Sem eles, a matrícula fica incompleta."
          >
            <div className={styles.grade}>
              <Campo
                label="Nome do responsável que assina o compromisso"
                value={requerimento.compromissoDocumentos.responsavel}
                onChange={(value) => atualizarRequerimento("compromissoDocumentos", {
                  ...requerimento.compromissoDocumentos, responsavel: value,
                })}
              />
              <GrupoCheckbox
                label="Documentos entregues"
                options={DOCUMENTOS}
                selected={requerimento.compromissoDocumentos.documentosEntregues}
                onChange={(value) => atualizarRequerimento("compromissoDocumentos", {
                  ...requerimento.compromissoDocumentos, documentosEntregues: value,
                })}
              />
            </div>
          </Cartao>

          <Cartao titulo="Renovações de matrícula">
            {requerimento.renovacoes.length === 0 ? (
              <p className={styles.ajuda}>Nenhuma renovação registrada.</p>
            ) : (
              <div className={styles.listaRenovacoes}>
                {requerimento.renovacoes.map((renovacao, index) => (
                  <div className={styles.gradeTres} key={`renovacao-${index}`}>
                    <Campo label="Renovada em" type="date" value={renovacao.data} onChange={(value) => atualizarRenovacao(index, "data", value)} />
                    <Campo label="Para o ano" value={renovacao.ano} type="number" onChange={(value) => atualizarRenovacao(index, "ano", value)} />
                    <Campo label="Responsável" value={renovacao.responsavel} onChange={(value) => atualizarRenovacao(index, "responsavel", value)} />
                    <Button type="button" variant="secondary" size="sm" onClick={() => atualizarRequerimento(
                      "renovacoes", requerimento.renovacoes.filter((_, i) => i !== index),
                    )}>Remover renovação</Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => atualizarRequerimento("renovacoes", [
                ...requerimento.renovacoes,
                { data: new Date().toISOString().slice(0, 10), ano: "", responsavel: "" },
              ])}
            >
              + Registrar renovação
            </Button>
          </Cartao>

          <Cartao titulo="Transferência" subtitulo="Preencha somente se o responsável pedir transferência.">
            <div className={styles.gradeTres}>
              <Campo label="Data do pedido" value={requerimento.transferencia.dataPedido} type="date" onChange={(value) => atualizarRequerimento("transferencia", { ...requerimento.transferencia, dataPedido: value })} />
              <Campo label="Data da entrega" value={requerimento.transferencia.dataEntrega} type="date" onChange={(value) => atualizarRequerimento("transferencia", { ...requerimento.transferencia, dataEntrega: value })} />
              <Campo label="Nome do responsável" value={requerimento.transferencia.responsavel} onChange={(value) => atualizarRequerimento("transferencia", { ...requerimento.transferencia, responsavel: value })} />
            </div>
          </Cartao>
        </div>
      ) : (
        <div role="tabpanel" id="painel-socioeconomica" aria-labelledby="aba-socioeconomica" className={styles.conteudoFicha}>
          <Cartao titulo="Dados pessoais do aluno" subtitulo="Reaproveitados do Requerimento de matrícula; edite os dados cadastrais do card para evitar duplicidade.">
            <div className={styles.resumoPessoal}>
              <Resumo rotulo="Nome" valor={aluno.nome} />
              <Resumo rotulo="Nascimento" valor={aluno.dataNascimento} />
              <Resumo rotulo="Sexo" valor={aluno.sexo === "F" ? "Feminino" : aluno.sexo === "M" ? "Masculino" : "—"} />
              <Resumo rotulo="Ano/série" valor={`${requerimento.anoEscolaridade || "—"} · ${requerimento.anoLetivo || "—"}`} />
              <Resumo rotulo="Nome da mãe" valor={requerimento.filiacao.mae.nome} />
              <Resumo rotulo="Nome do pai" valor={requerimento.filiacao.pai.nome} />
            </div>
            <p className={styles.ajuda}>O cadastro do aluno é compartilhado entre as fichas e pode ser alterado na seção “Dados do aluno”.</p>
          </Cartao>

          <Cartao titulo="Endereço e contato">
            <div className={styles.grade}>
              <Campo label="Endereço do aluno" value={socio.endereco.logradouro} onChange={(value) => atualizarEndereco("logradouro", value)} />
              <Campo label="Nº" value={socio.endereco.numero} onChange={(value) => atualizarEndereco("numero", value)} />
            </div>
            <div className={`${styles.gradeQuatro} ${styles.espacamento}`}>
              <Campo label="Bairro" value={socio.endereco.bairro} onChange={(value) => atualizarEndereco("bairro", value)} />
              <Campo label="Cidade" value={socio.endereco.cidade} onChange={(value) => atualizarEndereco("cidade", value)} />
              <Campo label="Estado" value={socio.endereco.estado} options={ESTADOS} onChange={(value) => atualizarEndereco("estado", value)} />
              <Campo label="CEP" value={socio.endereco.cep} onChange={(value) => atualizarEndereco("cep", value)} />
            </div>
            <div className={`${styles.gradeTres} ${styles.espacamento}`}>
              <Campo label="Telefone para contato" value={socio.endereco.telefone} type="tel" onChange={(value) => atualizarEndereco("telefone", value)} />
              <Campo label="Telefone celular" value={socio.endereco.celular} type="tel" onChange={(value) => atualizarEndereco("celular", value)} />
              <Campo label="E-mail" value={socio.endereco.email} type="email" onChange={(value) => atualizarEndereco("email", value)} />
            </div>
          </Cartao>

          <Cartao titulo="1. Moradia" subtitulo="O imóvel onde a criança reside é:">
            <GrupoRadio
              label="Tipo de moradia"
              value={socio.moradia.tipo}
              required
              options={[
                { label: "Próprio", value: "PROPRIO" },
                { label: "Cedido", value: "CEDIDO" },
                { label: "Financiado", value: "FINANCIADO" },
                { label: "Alugado", value: "ALUGADO" },
                { label: "Ocupação irregular", value: "IRREGULAR" },
              ]}
              onChange={(value) => atualizarMoradia("tipo", value)}
            />
            {socio.moradia.tipo === "CEDIDO" ? (
              <div className={styles.espacamento}>
                <Campo label="Por quem o imóvel foi cedido?" value={socio.moradia.cedidoPor} required onChange={(value) => atualizarMoradia("cedidoPor", value)} />
              </div>
            ) : ["FINANCIADO", "ALUGADO"].includes(socio.moradia.tipo) ? (
              <div className={styles.espacamento}>
                <Campo label="Valor mensal pago (R$)" value={socio.moradia.valorMensal} type="number" min="0" required onChange={(value) => atualizarMoradia("valorMensal", value)} />
              </div>
            ) : null}
            <p className={styles.ajuda}>Os campos adicionais variam conforme o tipo de moradia informado.</p>
          </Cartao>

          <Cartao titulo="2. Transporte" subtitulo="Meio de transporte usado no percurso residência–creche:">
            <GrupoRadio
              label="Transporte"
              value={socio.transporte}
              required
              options={[
                { label: "Nenhum, a pé ou bicicleta", value: "A_PE_BICICLETA" },
                { label: "Carona", value: "CARONA" },
                { label: "Transporte coletivo (ônibus, fretado)", value: "COLETIVO" },
                { label: "Carro ou motocicleta próprio", value: "PROPRIO" },
              ]}
              onChange={(value) => atualizarSocio("transporte", value)}
            />
          </Cartao>

          <Cartao titulo="3. Núcleo familiar" subtitulo="Todas as pessoas que fazem parte do núcleo familiar da criança.">
            <div className={styles.membros}>
              {socio.nucleoFamiliar.map((membro, index) => (
                <div className={styles.membro} key={`membro-${index}`}>
                  <div className={styles.gradeTres}>
                    <Campo label="Componente" value={membro.componente} required onChange={(value) => atualizarMembro(index, "componente", value)} />
                    <Campo label="Profissão/função" value={membro.profissao} onChange={(value) => atualizarMembro(index, "profissao", value)} />
                    <Campo label="Idade" value={membro.idade} type="number" min="0" onChange={(value) => atualizarMembro(index, "idade", value)} />
                    <Campo label="Estado civil" value={membro.estadoCivil} options={ESTADOS_CIVIS} onChange={(value) => atualizarMembro(index, "estadoCivil", value)} />
                    <Campo label="Escolaridade" value={membro.escolaridade} options={ESCOLARIDADES} onChange={(value) => atualizarMembro(index, "escolaridade", value)} />
                    <Campo label="Renda mensal (R$)" value={membro.rendaMensal} type="number" min="0" onChange={(value) => atualizarMembro(index, "rendaMensal", value)} />
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={() => atualizarSocio(
                    "nucleoFamiliar", socio.nucleoFamiliar.filter((_, i) => i !== index),
                  )}>Remover membro</Button>
                </div>
              ))}
            </div>
            <div className={styles.espacamento}>
              <Button type="button" variant="secondary" onClick={() => atualizarSocio("nucleoFamiliar", [
                ...socio.nucleoFamiliar,
                { componente: "", profissao: "", idade: "", estadoCivil: "", escolaridade: "", rendaMensal: "" },
              ])}>
                + Adicionar membro da família
              </Button>
            </div>
            <div className={styles.espacamento}>
              <AreaTexto
                label="Observações"
                value={socio.observacoes}
                onChange={(value) => atualizarSocio("observacoes", value)}
                placeholder="Informe, se necessário, situações familiares relevantes."
              />
            </div>
            <p className={styles.ajuda}>
              Informe, quando aplicável, pais separados (se a separação é legalizada e há quanto tempo),
              falecimento dos pais, aposentadoria ou desemprego.
            </p>
          </Cartao>

          <Cartao titulo="4. Outras propriedades" subtitulo="A família possui imóveis, terrenos ou propriedades rurais além da moradia?">
            <GrupoRadio
              label="Possui outras propriedades?"
              value={socio.outrasPropriedades.possui ? "SIM" : "NAO"}
              options={[{ label: "Não", value: "NAO" }, { label: "Sim", value: "SIM" }]}
              onChange={(value) => atualizarSocio("outrasPropriedades", {
                ...socio.outrasPropriedades,
                possui: value === "SIM",
                descricao: value === "SIM" ? socio.outrasPropriedades.descricao : "",
              })}
            />
            <div className={styles.espacamento}>
              <AreaTexto
                label="Relacione as propriedades"
                value={socio.outrasPropriedades.descricao}
                onChange={(value) => atualizarSocio("outrasPropriedades", { ...socio.outrasPropriedades, descricao: value })}
                placeholder={socio.outrasPropriedades.possui ? "Descreva as propriedades" : "Disponível quando a resposta for “Sim”"}
                disabled={!socio.outrasPropriedades.possui}
                required={socio.outrasPropriedades.possui}
              />
            </div>
          </Cartao>

          <Cartao titulo="Declaração do responsável">
            <div className={styles.gradeTres}>
              <Campo label="Nome do(a) responsável pela criança" value={socio.declaracao.responsavel} required onChange={(value) => atualizarDeclaracao("responsavel", value)} />
              <Campo label="Local" value={socio.declaracao.local} required onChange={(value) => atualizarDeclaracao("local", value)} />
              <Campo label="Data" value={socio.declaracao.data} type="date" required onChange={(value) => atualizarDeclaracao("data", value)} />
            </div>
            <div className={`${styles.info} ${styles.espacamento}`}>
              <strong>O Serviço Social alerta que,</strong> no caso de falsificação de documentos,
              falseamento ou omissão de dados socioeconômicos, o(a) candidato(a) poderá ser
              desclassificado(a) do processo de seleção.
            </div>
          </Cartao>
        </div>
      )}

      <Cartao titulo="Autorização de uso de imagem" subtitulo="Registre a decisão e o responsável pela autorização.">
        <div className={styles.grade}>
          <OpcaoBooleana
            nome="autorizacaoImagem"
            rotulo="Autoriza o uso de imagem do aluno?"
            valor={fichas.imagem.autorizada}
            onChange={(valor) => setPayload((atual) => ({
              ...atual, fichas: { ...atual.fichas, imagem: { ...atual.fichas.imagem, autorizada: valor } },
            }))}
          />
          <Campo
            label="Nome do responsável que assinou"
            value={fichas.imagem.responsavel}
            onChange={(value) => setPayload((atual) => ({
              ...atual, fichas: { ...atual.fichas, imagem: { ...atual.fichas.imagem, responsavel: value } },
            }))}
            required
          />
        </div>
      </Cartao>

      <Cartao titulo="Autorização de saída" subtitulo="Defina se o aluno pode sair sem os responsáveis.">
        <div className={styles.grade}>
          <OpcaoBooleana
            nome="autorizacaoSaida"
            rotulo="Autoriza a saída sem acompanhamento do responsável?"
            valor={fichas.saida.autorizadaSemResponsavel}
            onChange={(valor) => setPayload((atual) => ({
              ...atual, fichas: { ...atual.fichas, saida: { ...atual.fichas.saida, autorizadaSemResponsavel: valor } },
            }))}
          />
          <Campo
            label="Nome do responsável que assinou"
            value={fichas.saida.responsavel}
            onChange={(value) => setPayload((atual) => ({
              ...atual, fichas: { ...atual.fichas, saida: { ...atual.fichas.saida, responsavel: value } },
            }))}
            required
          />
          <Campo
            label="Pessoas autorizadas para retirada"
            value={fichas.saida.pessoasAutorizadas}
            onChange={(value) => setPayload((atual) => ({
              ...atual, fichas: { ...atual.fichas, saida: { ...atual.fichas.saida, pessoasAutorizadas: value } },
            }))}
            hint="Se não houver, informe “Nenhuma”."
            required
          />
        </div>
      </Cartao>

      <Cartao titulo="Compromisso escolar" subtitulo="O termo de compromisso deve ser aceito para ativar a matrícula.">
        <div className={styles.grade}>
          <label className={styles.aceite}>
            <input
              type="checkbox"
              required
              checked={fichas.compromisso.aceito}
              onChange={(event) => setPayload((atual) => ({
                ...atual,
                fichas: { ...atual.fichas, compromisso: { ...atual.fichas.compromisso, aceito: event.target.checked } },
              }))}
            />
            Confirmo o aceite do termo de compromisso escolar.
            <span aria-hidden="true"> *</span>
          </label>
          <Campo
            label="Nome do responsável que assinou"
            value={fichas.compromisso.responsavel}
            onChange={(value) => setPayload((atual) => ({
              ...atual, fichas: { ...atual.fichas, compromisso: { ...atual.fichas.compromisso, responsavel: value } },
            }))}
            required
          />
        </div>
      </Cartao>

      <footer className={styles.acoes}>
        <p>Os campos marcados com * são obrigatórios.</p>
        <div>
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">{matricula ? "Revisar alterações" : "Revisar matrícula"}</Button>
        </div>
      </footer>
    </form>
  );
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className={styles.resumoItem}>
      <span>{rotulo}</span>
      <strong>{valor || "—"}</strong>
    </div>
  );
}
