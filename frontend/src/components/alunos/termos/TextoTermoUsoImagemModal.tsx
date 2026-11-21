"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { AutorizacaoImagem } from "@/lib/alunos";
import shared from "../Alunos.module.css";
import styles from "./Termos.module.css";

interface TextoTermoUsoImagemModalProps {
  responsavel: {
    nome: string;
    nacionalidade: string;
    estadoCivil: string;
    rg: string;
    cpf: string;
    endereco: string;
  };
  aluno: {
    nome: string;
    anoSerie: string;
    dataNascimento: string;
  };
  autoriza: AutorizacaoImagem | null;
  local: string;
  data: string;
  onClose: () => void;
}

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Valor preenchido no formulário ou a linha em branco do termo impresso. */
function Lacuna({ valor, curta = false }: { valor: string; curta?: boolean }) {
  return valor.trim() ? (
    <strong>{valor.trim()}</strong>
  ) : (
    <span className={styles.lacuna}>{curta ? "________" : "________________"}</span>
  );
}

function partesDataExtenso(data: string): { dia: string; mes: string; ano: string } | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data.trim());
  if (!m) return null;
  const indiceMes = Number(m[2]) - 1;
  if (indiceMes < 0 || indiceMes >= MESES.length) return null;
  return { dia: m[1], mes: MESES[indiceMes], ano: m[3] };
}

/**
 * Texto completo do Termo de Autorização de Uso de Imagem – Aluno Menor de Idade
 * da Sociedade Estação Vida (SEV), transcrito do documento oficial da creche.
 */
export function TextoTermoUsoImagemModal({
  responsavel,
  aluno,
  autoriza,
  local,
  data,
  onClose,
}: TextoTermoUsoImagemModalProps) {
  const partesData = partesDataExtenso(data);
  const naoAutoriza = autoriza === "NAO";

  return (
    <Modal
      title="Termo de Autorização de Uso de Imagem – Aluno Menor de Idade"
      description="Centro de Educação Infantil Sociedade Estação Vida – SEV · CNPJ 03.860.360/0001-51"
      onClose={onClose}
      size="lg"
    >
      <div className={styles.textoTermo}>
        <p>
          Responsável Legal <Lacuna valor={responsavel.nome} />, nacionalidade{" "}
          <Lacuna valor={responsavel.nacionalidade} curta />, RG <Lacuna valor={responsavel.rg} curta />, Estado Civil{" "}
          <Lacuna valor={responsavel.estadoCivil} curta />, CPF <Lacuna valor={responsavel.cpf} curta />.
          <br />
          Residente na <Lacuna valor={responsavel.endereco} />.
        </p>

        <p>
          Representante legal do(a) aluno(a) <Lacuna valor={aluno.nome} />, <Lacuna valor={aluno.anoSerie} />,
          nascido(a) aos <Lacuna valor={aluno.dataNascimento} curta />, menor de idade, aluno(a) do Centro de Educação
          Infantil Sociedade Estação Vida, <strong>{naoAutoriza ? "NÃO AUTORIZO" : "AUTORIZO"}</strong> o uso da
          imagem do(a) meu(minha) filho(a), em todo e qualquer material entre fotos e documentos, para ser utilizada em
          campanhas promocionais e institucional do Centro de Educação Infantil Sociedade Estação Vida, localizada na
          Quadra 55 conjunto “A” lote 35 Setor 5 Águas Lindas, inscrita no CNPJ sob o nº 03.860.360/0001-51, sejam essas
          destinadas à divulgação ao público em geral e/ou apenas para alunos da escola.
        </p>

        <p>
          A presente autorização é concedida a título gratuito, abrangendo o uso da imagem acima mencionada em todo
          território nacional e no exterior, sob qualquer forma e meios, ou seja, em destaques:
        </p>

        <ol className={styles.itensTermo}>
          {[
            ["I –", "out-door;"],
            ["II –", "bus-door, folhetos em geral (encartes, mala-direta, catálogo, etc.);"],
            ["III –", "folder de apresentação;"],
            ["IV –", "anúncios em revistas e jornais em geral;"],
            ["V –", "home page;"],
            ["VI –", "cartazes;"],
            ["VII –", "back-light;"],
            ["VIII –", "mídia eletrônica (painéis, vídeo-tapes, televisão, cinema, programa para rádio, entre outros)."],
          ].map(([numero, texto]) => (
            <li key={numero}>
              <span className={styles.numeroItem}>{numero}</span>
              <span>{texto}</span>
            </li>
          ))}
        </ol>

        <p>
          Por esta ser a expressão da minha vontade declaro que{" "}
          <strong>{naoAutoriza ? "não autorizo" : "autorizo"}</strong> o uso acima descrito da imagem de meu filho, sem
          que nada haja a ser reclamado a título de direitos conexos à sua imagem ou a qualquer outro, e assino a
          presente autorização em 02 (duas) vias de igual teor e forma.
        </p>

        <p>
          <Lacuna valor={local} />,{" "}
          {partesData ? (
            <>
              <strong>{partesData.dia}</strong> de <strong>{partesData.mes}</strong> de{" "}
              <strong>{partesData.ano}</strong>
            </>
          ) : data.trim() ? (
            <strong>{data.trim()}</strong>
          ) : (
            <>
              <Lacuna valor="" curta /> de <Lacuna valor="" curta /> de <Lacuna valor="" curta />
            </>
          )}
          .
        </p>
      </div>

      <div className={shared.modalAcoes}>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  );
}
