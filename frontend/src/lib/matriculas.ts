import type { NovaMatriculaPayload } from "@/types";

/** Payload vazio usado como base do formulário de fichas (MatriculaForm). */
export function novoPayloadMatricula(): NovaMatriculaPayload {
  const agora = new Date();
  const dataLocal = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  return {
    aluno: {
      nome: "",
      cpf: "",
      numeroMatricula: "",
      dataNascimento: "",
      nomeResponsavel: "",
      telefoneResponsavel: "",
      sexo: "",
      nis: "",
      identidade: "",
      naturalidade: "",
      ufNaturalidade: "",
      nacionalidade: "Brasileira",
      corRaca: "NAO_DECLARADA",
    },
    fichas: {
      socioeconomica: {
        endereco: {
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          telefone: "",
          celular: "",
          email: "",
        },
        moradia: { tipo: "", valorMensal: "", cedidoPor: "" },
        transporte: "",
        nucleoFamiliar: [{ componente: "", profissao: "", idade: "", estadoCivil: "", escolaridade: "", rendaMensal: "" }],
        observacoes: "",
        outrasPropriedades: { possui: false, descricao: "" },
        declaracao: { responsavel: "", local: "", data: "" },
      },
      imagem: { autorizada: null, responsavel: "" },
      saida: { autorizadaSemResponsavel: null, responsavel: "", pessoasAutorizadas: "" },
      compromisso: { aceito: false, responsavel: "" },
      requerimento: {
        anoEscolaridade: "",
        anoLetivo: String(agora.getFullYear()),
        dataMatricula: dataLocal,
        documentacaoCivil: {
          rg: "",
          orgaoEmissor: "",
          ufEmissor: "",
          dataExpedicao: "",
          tipoCertidao: "NASCIMENTO",
          numeroTermo: "",
          folha: "",
          livro: "",
          dataEmissao: "",
          nomeCartorio: "",
          ufCartorio: "",
          documentoEstrangeiro: "",
        },
        filiacao: {
          pai: { nome: "", escolaridade: "", localTrabalho: "", telefoneTrabalho: "" },
          mae: { nome: "", escolaridade: "", localTrabalho: "", telefoneTrabalho: "" },
        },
        endereco: "",
        telefone: "",
        saude: {
          problemas: [],
          observacoesProblemas: "",
          acompanhamentos: [],
          observacoesAcompanhamento: "",
        },
        compromissoDocumentos: { responsavel: "", documentosEntregues: [] },
        renovacoes: [],
        transferencia: { dataPedido: "", dataEntrega: "", responsavel: "" },
      },
    },
  };
}
