"use client";

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/Icons";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import {
  LOCAL_PADRAO,
  MAX_PESSOAS_AUTORIZADAS,
  OPCOES_FORMA_SAIDA,
  OPCOES_PARENTESCO,
  dataDigitadaParaIso,
  exigePessoasAutorizadas,
  isoParaData,
  mascaraData,
  validarTermoSaida,
  type ErrosCampos,
} from "@/lib/alunos";
import { MSG } from "@/lib/mensagens";
import type { AlunoCard, FormaSaida, PessoaAutorizada, TermoSaida as Termo } from "@/types";
import { useAlunoCard } from "../card/AlunoCardContext";
import { DadosAlunoCard, Secao, TermoForm } from "./TermoForm";
import shared from "../Alunos.module.css";
import styles from "./Termos.module.css";

interface Formulario {
  nomeResponsavel: string;
  formaSaida: FormaSaida | null;
  pessoasAutorizadas: PessoaAutorizada[];
  local: string;
  data: string; // dd/mm/aaaa
  descricaoOutros: string;
}

function inicial(card: AlunoCard): Formulario {
  const termo = card.termos.saida;
  if (termo) {
    return {
      ...termo,
      pessoasAutorizadas: [...termo.pessoasAutorizadas],
      data: isoParaData(termo.data),
      descricaoOutros: termo.descricaoOutros ?? "",
    };
  }
  return {
    nomeResponsavel: card.resumo.responsavel,
    formaSaida: null,
    pessoasAutorizadas: [],
    local: LOCAL_PADRAO,
    data: "",
    descricaoOutros: "",
  };
}

/** UC04 – Termo de autorização de saída do aluno (RF09, RF10). */
export function TermoSaida() {
  const { card } = useAlunoCard();
  const [form, setForm] = useState<Formulario>(() => inicial(card));
  const [erros, setErros] = useState<ErrosCampos>({});
  const [novaPessoa, setNovaPessoa] = useState<PessoaAutorizada>({ nome: "", parentesco: "" });
  const [erroNovaPessoa, setErroNovaPessoa] = useState<{ nome?: string; parentesco?: string }>({});

  const periodo = card.termos.saida?.periodo || card.termos.compromisso?.regime || "";
  const exigePessoas = exigePessoasAutorizadas(form.formaSaida);
  const lotado = form.pessoasAutorizadas.length >= MAX_PESSOAS_AUTORIZADAS;

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    const limparPessoas = campo === "formaSaida" && !exigePessoasAutorizadas(valor as FormaSaida | null);
    if (erros[campo] || (limparPessoas && erros.pessoasAutorizadas)) {
      setErros(({ [campo]: _removido, pessoasAutorizadas, descricaoOutros, ...resto }) => {
        const base = limparPessoas ? resto : pessoasAutorizadas ? { ...resto, pessoasAutorizadas } : { ...resto, pessoasAutorizadas, descricaoOutros };
        if (campo === "formaSaida" && valor !== "OUTROS") {
          const { descricaoOutros: _d, ...semDesc } = base as ErrosCampos;
          return semDesc;
        }
        return base as ErrosCampos;
      });
    }
  }

  function cancelar() {
    setForm(inicial(card));
    setErros({});
    setNovaPessoa({ nome: "", parentesco: "" });
    setErroNovaPessoa({});
  }

  function adicionarPessoa() {
    const nome = novaPessoa.nome.trim();
    const faltando = {
      nome: nome ? undefined : "Informe o nome.",
      parentesco: novaPessoa.parentesco.trim() ? undefined : "Selecione o parentesco.",
    };
    setErroNovaPessoa(faltando);
    if (faltando.nome || faltando.parentesco || lotado) return;
    alterar("pessoasAutorizadas", [...form.pessoasAutorizadas, { nome, parentesco: novaPessoa.parentesco.trim() }]);
    setNovaPessoa({ nome: "", parentesco: "" });
  }

  function removerPessoa(indice: number) {
    alterar(
      "pessoasAutorizadas",
      form.pessoasAutorizadas.filter((_, i) => i !== indice),
    );
  }

  function montarPayload(): Termo {
    return {
      nomeResponsavel: form.nomeResponsavel.trim(),
      formaSaida: form.formaSaida,
      pessoasAutorizadas: form.pessoasAutorizadas,
      local: form.local.trim(),
      data: dataDigitadaParaIso(form.data),
      periodo: periodo || undefined,
      descricaoOutros: form.formaSaida === "OUTROS" ? form.descricaoOutros.trim() : undefined,
    };
  }

  return (
    <TermoForm
      termo="saida"
      avisoPendente={MSG.termoSaidaPendente}
      montarPayload={montarPayload}
      validar={validarTermoSaida}
      onErros={setErros}
      onCancelar={cancelar}
    >
      <Secao titulo="Responsável legal">
        <TextField
          label="Nome do responsável legal"
          required
          placeholder="Digite o nome completo"
          value={form.nomeResponsavel}
          onChange={(e) => alterar("nomeResponsavel", e.target.value)}
          error={erros.nomeResponsavel}
        />
      </Secao>

      <DadosAlunoCard extras={periodo ? [{ rotulo: "Período", valor: periodo }] : []} />

      <Secao titulo="Saída da escola" obrigatorio descricao="Como o aluno sai no horário de encerramento da aula?">
        <div className={shared.campos}>
          <RadioGroup
            label="Como o aluno sai no horário de encerramento da aula?"
            labelOculto
            required
            name="formaSaida"
            value={form.formaSaida}
            options={OPCOES_FORMA_SAIDA}
            onChange={(valor) => alterar("formaSaida", valor)}
            error={erros.formaSaida}
          />
          {form.formaSaida === "OUTROS" && (
            <TextField
              label="Descreva a forma de saída"
              required
              placeholder="Informe a forma de saída"
              value={form.descricaoOutros}
              onChange={(e) => alterar("descricaoOutros", e.target.value)}
              error={erros.descricaoOutros}
            />
          )}
        </div>
      </Secao>

      <Secao
        titulo="Pessoas autorizadas a buscar o aluno"
        obrigatorio={exigePessoas}
        descricao={`Obrigatório quando a saída for por transporte escolar ou "Outros". Máximo de ${MAX_PESSOAS_AUTORIZADAS} pessoas.`}
      >
        <div className={shared.campos}>
          <div className={styles.tabelaPessoas}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Parentesco</th>
                  <th scope="col" className={styles.colunaAcao}>
                    <span className="sr-only">Remover</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {form.pessoasAutorizadas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.vazio}>
                      Nenhuma pessoa adicionada
                    </td>
                  </tr>
                ) : (
                  form.pessoasAutorizadas.map((pessoa, i) => (
                    <tr key={pessoa.id ?? `${pessoa.nome}-${i}`}>
                      <td>{pessoa.nome}</td>
                      <td>{pessoa.parentesco}</td>
                      <td className={styles.colunaAcao}>
                        <button
                          type="button"
                          className={styles.remover}
                          onClick={() => removerPessoa(i)}
                          aria-label={`Remover ${pessoa.nome}`}
                        >
                          <IconTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {erros.pessoasAutorizadas && (
            <p className={styles.erroCampo} role="alert">
              {erros.pessoasAutorizadas}
            </p>
          )}

          <div className={styles.adicionar}>
            <TextField
              label="Nome"
              placeholder="—"
              value={novaPessoa.nome}
              disabled={lotado}
              aria-invalid={erros.pessoasAutorizadas && form.pessoasAutorizadas.length === 0 ? true : undefined}
              onChange={(e) => {
                setNovaPessoa((p) => ({ ...p, nome: e.target.value }));
                if (erroNovaPessoa.nome) setErroNovaPessoa((err) => ({ ...err, nome: undefined }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  adicionarPessoa();
                }
              }}
              error={erroNovaPessoa.nome}
            />
            <SelectField
              label="Parentesco"
              placeholder="Selecione"
              value={novaPessoa.parentesco}
              options={OPCOES_PARENTESCO}
              disabled={lotado}
              onChange={(e) => {
                setNovaPessoa((p) => ({ ...p, parentesco: e.target.value }));
                if (erroNovaPessoa.parentesco) setErroNovaPessoa((err) => ({ ...err, parentesco: undefined }));
              }}
              error={erroNovaPessoa.parentesco}
            />
            <Button variant="secondary" onClick={adicionarPessoa} disabled={lotado}>
              Adicionar
            </Button>
          </div>

          <p className={shared.notaCampo}>
            {lotado
              ? `Limite de ${MAX_PESSOAS_AUTORIZADAS} pessoas atingido.`
              : exigePessoas
                ? "Adicione ao menos uma pessoa. Se outra pessoa for buscar a criança, a escola precisa ser avisada com antecedência."
                : "Se outra pessoa for buscar a criança, a escola precisa ser avisada com antecedência."}
          </p>
        </div>
      </Secao>

      <Secao titulo="Data">
        <div className={shared.grid2}>
          <TextField
            label="Local"
            required
            value={form.local}
            onChange={(e) => alterar("local", e.target.value)}
            error={erros.local}
          />
          <TextField
            label="Data"
            required
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            value={form.data}
            onChange={(e) => alterar("data", mascaraData(e.target.value))}
            error={erros.data}
          />
        </div>
      </Secao>
    </TermoForm>
  );
}
