"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import {
  LOCAL_PADRAO,
  OPCOES_AUTORIZACAO_IMAGEM,
  OPCOES_ESTADO_CIVIL,
  dataDigitadaParaIso,
  isoParaData,
  mascaraCpf,
  mascaraData,
  somenteDigitos,
  validarTermoUsoImagem,
  type AutorizacaoImagem,
  type ErrosCampos,
} from "@/lib/alunos";
import { MSG } from "@/lib/mensagens";
import type { AlunoCard, ResponsavelLegal, TermoUsoImagem as Termo } from "@/types";
import { useAlunoCard } from "../card/AlunoCardContext";
import { DadosAlunoCard, Secao, TermoForm } from "./TermoForm";
import { TextoTermoUsoImagemModal } from "./TextoTermoUsoImagemModal";
import shared from "../Alunos.module.css";
import styles from "./Termos.module.css";

interface Formulario extends ResponsavelLegal {
  autoriza: AutorizacaoImagem | null;
  local: string;
  data: string; // dd/mm/aaaa
}

function inicial(card: AlunoCard): Formulario {
  const termo = card.termos.usoImagem;
  if (termo) {
    return {
      ...termo.responsavel,
      cpf: mascaraCpf(termo.responsavel.cpf),
      autoriza: termo.autoriza === null ? null : termo.autoriza ? "SIM" : "NAO",
      local: termo.local,
      data: isoParaData(termo.data),
    };
  }
  return {
    nome: card.resumo.responsavel,
    nacionalidade: "",
    estadoCivil: "",
    rg: "",
    cpf: "",
    endereco: "",
    autoriza: null,
    local: LOCAL_PADRAO,
    data: "",
  };
}

/** UC04 – Termo de autorização de uso de imagem (RF09, RF10). */
export function TermoUsoImagem() {
  const { card } = useAlunoCard();
  const [form, setForm] = useState<Formulario>(() => inicial(card));
  const [erros, setErros] = useState<ErrosCampos>({});
  const [textoAberto, setTextoAberto] = useState(false);

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (erros[campo]) setErros(({ [campo]: _removido, ...resto }) => resto);
  }

  function cancelar() {
    setForm(inicial(card));
    setErros({});
  }

  function montarPayload(): Termo {
    return {
      responsavel: {
        nome: form.nome.trim(),
        nacionalidade: form.nacionalidade.trim(),
        estadoCivil: form.estadoCivil,
        rg: form.rg.trim(),
        cpf: somenteDigitos(form.cpf),
        endereco: form.endereco.trim(),
      },
      autoriza: form.autoriza === null ? null : form.autoriza === "SIM",
      local: form.local.trim(),
      data: dataDigitadaParaIso(form.data),
    };
  }

  const anoSerie = [card.etapa?.nome, card.matricula.anoLetivo].filter(Boolean).join(" · ");

  return (
    <>
      <TermoForm
        termo="usoImagem"
        avisoPendente={MSG.termoImagemPendente}
        montarPayload={montarPayload}
        validar={validarTermoUsoImagem}
        onErros={setErros}
        onCancelar={cancelar}
      >
        <Secao titulo="Responsável legal">
          <div className={shared.campos}>
            <div className={shared.grid3}>
              <TextField
                label="Nome do responsável legal"
                required
                placeholder="Digite o nome completo"
                value={form.nome}
                onChange={(e) => alterar("nome", e.target.value)}
                error={erros.nome}
              />
              <TextField
                label="Nacionalidade"
                required
                placeholder="Brasileira"
                value={form.nacionalidade}
                onChange={(e) => alterar("nacionalidade", e.target.value)}
                error={erros.nacionalidade}
              />
              <SelectField
                label="Estado civil"
                required
                placeholder="Selecione"
                value={form.estadoCivil}
                options={OPCOES_ESTADO_CIVIL}
                onChange={(e) => alterar("estadoCivil", e.target.value)}
                error={erros.estadoCivil}
              />
            </div>
            <div className={shared.grid2}>
              <TextField
                label="RG"
                required
                placeholder="0.000.000"
                value={form.rg}
                onChange={(e) => alterar("rg", e.target.value)}
                error={erros.rg}
              />
              <TextField
                label="CPF"
                required
                placeholder="000.000.000-00"
                inputMode="numeric"
                value={form.cpf}
                onChange={(e) => alterar("cpf", mascaraCpf(e.target.value))}
                error={erros.cpf}
              />
            </div>
            <TextField
              label="Residente em"
              required
              placeholder="Endereço completo"
              value={form.endereco}
              onChange={(e) => alterar("endereco", e.target.value)}
              error={erros.endereco}
            />
          </div>
        </Secao>

        <DadosAlunoCard />

        <Secao
          titulo="Autorização"
          descricao="Uso da imagem do(a) aluno(a) em fotos e documentos de campanhas promocionais e institucionais do Centro de Educação Infantil Sociedade Estação Vida."
        >
          <div className={shared.campos}>
            <RadioGroup
              label="O responsável autoriza o uso da imagem?"
              name="autoriza"
              required
              value={form.autoriza}
              options={OPCOES_AUTORIZACAO_IMAGEM}
              onChange={(valor) => alterar("autoriza", valor)}
              error={erros.autoriza}
            />
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
            <div className={styles.abrangencia}>
              <Alert variant="info">
                Abrangência do termo: a título gratuito, em todo o território nacional e no exterior — outdoor,
                bus-door, folhetos, folder, anúncios em revistas e jornais, home page, cartazes, back-light e mídia
                eletrônica.
              </Alert>
            </div>
            {/* Um link (e não um botão) para continuar disponível quando o card está inativo. */}
            <a
              href="#texto-completo"
              role="button"
              className={styles.linkTexto}
              onClick={(e) => {
                e.preventDefault();
                setTextoAberto(true);
              }}
            >
              Ver texto completo do termo →
            </a>
          </div>
        </Secao>
      </TermoForm>

      {textoAberto && (
        <TextoTermoUsoImagemModal
          responsavel={form}
          aluno={{
            nome: card.aluno.nome,
            anoSerie,
            dataNascimento: isoParaData(card.aluno.dataNascimento),
          }}
          autoriza={form.autoriza}
          local={form.local}
          data={form.data}
          onClose={() => setTextoAberto(false)}
        />
      )}
    </>
  );
}
