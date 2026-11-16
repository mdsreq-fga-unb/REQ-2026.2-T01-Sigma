"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import shared from "../Alunos.module.css";
import styles from "./Termos.module.css";

interface TextoTermoCompromissoModalProps {
  responsavel: string;
  aluno: string;
  anoMatricula: string;
  modalidade: string;
  onClose: () => void;
}

/** Valor preenchido no formulário ou a linha em branco do termo impresso. */
function Lacuna({ valor }: { valor: string }) {
  return valor.trim() ? <strong>{valor.trim()}</strong> : <span className={styles.lacuna}>________________</span>;
}

/**
 * Texto completo do Termo de Compromisso Escolar da Sociedade Estação Vida (versão 2025/2026),
 * transcrito do documento oficial da creche.
 */
export function TextoTermoCompromissoModal({
  responsavel,
  aluno,
  anoMatricula,
  modalidade,
  onClose,
}: TextoTermoCompromissoModalProps) {
  return (
    <Modal title="Termo de compromisso escolar" description="Centro Sociedade Estação Vida – SEV" onClose={onClose} size="lg">
      <div className={styles.textoTermo}>
        <p>
          Eu, <Lacuna valor={responsavel} /> na condição de responsável pelo(a) aluno(a) <Lacuna valor={aluno} />,
          matriculado(a) no ano de <Lacuna valor={anoMatricula} />. Modalidade de <Lacuna valor={modalidade} />, em
          tempo integral na Educação Infantil creche e pré-escola nesta Unidade escolar, estou <strong>CIENTE</strong>{" "}
          das exigências contidas neste termo bem como das <strong>NORMAS E REGRAS</strong> da escola, assumindo e
          firmando compromisso com a equipe gestora e pedagógica desta unidade escolar.
        </p>
        <p>
          Afirmo ainda que, no caso de desrespeito/infração ou não cumprimento dos termos/regras implicará em sanções
          para o(a) meu filho(a) como: suspensão, expulsão ou transferência, como também a escola estará tomando
          providências junto aos órgãos competentes: Ministério Público e Conselho Tutelar.
        </p>
        <p>
          Igualmente, “afirmo que tenho consciência que, para que meu filho(a) venha a ter êxito na sua VIDA ESCOLAR”,
          depende principalmente do <strong>ACOMPANHAMENTO</strong> e <strong>APOIO FAMILIAR</strong>, portanto
          estarei empenhado(a) em dar toda assistência necessária tanto para meu(a) filho(a) como para escola, onde
          estarei participando das reuniões e dos projetos desenvolvidos pela mesma.
        </p>

        <ol className={styles.itensTermo}>
          <li>
            <span className={styles.numeroItem}>1.1 –</span>
            <span>
              <u>O Código Penal em seu artigo 246</u>, diz que “deixar, sem justa causa, de prover a instrução primária
              de filho em idade escolar” pode ocasionar a <strong>PENA DE DETENÇÃO</strong> de 15 dias a um mês ou
              multa. Isto quer dizer que{" "}
              <strong>
                os pais podem ser punidos se não mantiverem o filho estudando e/ou acompanhar a situação escolar do
                filho
              </strong>
              .
            </span>
          </li>
          <li>
            <span className={styles.numeroItem}>1.2 –</span>
            <span>
              <u>O Artigo 22 do Estatuto da Criança e do Adolescente ECA</u>, que: Aos pais incumbe o{" "}
              <strong>DEVER DE SUSTENTO, GUARDA E EDUCAÇÃO</strong> dos filhos menores, cabendo-lhes ainda no
              interesse deste a obrigação de cumprir e fazer cumprir as determinações judiciais. “Isto quer dizer que os
              pais têm dever de cuidar dos filhos e acompanhar a vida escolar dos mesmos”.
            </span>
          </li>
          <li>
            <span className={styles.numeroItem}>1.3 –</span>
            <span>
              <u>O Artigo 56 do ECA</u>, diz que dirigentes de Estabelecimento de Ensino Fundamental comunicarão ao
              Conselho Tutelar os casos de:
              <span className={styles.subitens}>
                <span>I – Maus-tratos envolvendo seus alunos;</span>
                <span>II – Reiteração de faltas injustificadas e de evasão escolar, esgotados os recursos;</span>
                <span>III – Elevados níveis de faltas.</span>
              </span>
              Isto quer dizer que as escolas também não podem “descuidar” da frequência escolar do estudante e nem
              deixar de preocupar-se com os elevados níveis de faltas, devendo repensar e reorganizar a estrutura
              educacional da escola para melhorar seus resultados.
            </span>
          </li>
        </ol>

        <h3 className={styles.subtituloTermo}>2.0 – Respeitar os horários</h3>
        <p>
          <u>Entrada:</u> 07h30min – 08h00.
          <br />
          <strong>Obs.:</strong> Após o término do tempo estipulado o portão será fechado e o aluno atrasado voltará.
        </p>
        <p>
          <u>Saída:</u> 16h00 às 17h00min – (tarde).
          <br />
          <strong>Obs.:</strong> Depois deste horário a escola se tornará isenta de qualquer problema que venha ocorrer
          com o seu(a) filho(a). Após reincidências de constantes atrasos a escola poderá acionar órgão de proteção da
          criança e do adolescente (Conselho Tutelar).
        </p>

        <ol className={styles.itensTermo}>
          {[
            ["2.1 –", "Não é permitido o uso de roupas inadequadas, crianças sem roupas íntimas."],
            ["2.2 –", "Não será permitida a entrada do aluno sem uniforme."],
            [
              "2.3 –",
              "A escola não se responsabilizará por: celulares, joias, brinquedos ou qualquer outro objeto de valor trazido pela criança.",
            ],
            [
              "2.4 –",
              "Quando os senhores pais precisarem falar com os professores ou seus(as) filhos(as) dirijam-se primeiro à secretaria da escola para solicitar e falar com os mesmos;",
            ],
            [
              "2.5 –",
              "Durante o período de aula não é permitido o acesso dos pais à sala de aula sem antes solicitarem na secretaria;",
            ],
            [
              "2.6 –",
              "O aluno que danificar qualquer patrimônio da escola, o responsável pelo mesmo será chamado na escola para providenciar a restauração do que foi danificado;",
            ],
            [
              "2.7 –",
              "O material escolar coletivo entregue na secretaria da Unidade Escolar não será devolvido em hipótese alguma em caso de desistência da vaga, transferência e outros.",
            ],
            [
              "2.8 –",
              "Qualquer tipo de violência física ou verbal direcionada à equipe escolar, a direção tomará as devidas providências (registrará ocorrência), se preciso for.",
            ],
            [
              "2.9 –",
              "Em caso de necessidade do(a) aluno(a) sair antes do término do horário de aula, o mesmo só será liberado mediante a presença dos responsáveis com solicitação anterior na secretaria da escola.",
            ],
            [
              "2.10 –",
              "A escola é proibida de ministrar qualquer tipo de medicação e, se a criança estiver febril ou com estado de saúde preocupante, será entrado em contato com os responsáveis para vir buscar.",
            ],
            [
              "2.11 –",
              "Todos os meses o pai/mãe ou alguém responsável terá que comparecer na escola para assinar a lista de frequência do aluno(a).",
            ],
          ].map(([numero, texto]) => (
            <li key={numero}>
              <span className={styles.numeroItem}>{numero}</span>
              <span>{texto}</span>
            </li>
          ))}
          <li>
            <span className={styles.numeroItem}>2.12 –</span>
            <span>
              Faltas de aluno(a) não justificadas correrão o risco de perder a vaga nessa Unidade Escolar e a ficha
              do(a) mesmo(a){" "}
              <strong>
                será encaminhada aos órgãos competentes (Ministério Público e Conselho Tutelar). A falta só será
                justificada mediante a apresentação de atestado médico.
              </strong>
            </span>
          </li>
          <li>
            <span className={styles.numeroItem}>3.0 –</span>
            <strong>O aluno(a) só será matriculado(a) nessa instituição com cópia de toda documentação solicitada.</strong>
          </li>
        </ol>

        <p>
          Estes são alguns dos itens que precisam ser respeitados e assim tudo poderá transcorrer dentro da normalidade.
        </p>
        <p>Contamos com os senhores, no sentido de conscientização das nossas crianças.</p>
        <p className={styles.lembrete}>
          <strong>“LEMBRE-SE:</strong> O INTERESSE EM ACOMPANHAR A VIDA ESCOLAR DOS SEUS FILHOS CONTRIBUI PARA QUE ELES
          APRENDAM MAIS, POIS UMA EDUCAÇÃO DE QUALIDADE COMEÇA EM CASA.”
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
