/**
 * SIGMA - Sistema Integrado de Gestão de Matrículas e Alunos
 * Catálogo Unificado de Requisitos: Modais Interativos
 */

(function () {
  'use strict';

  // Base de Conhecimento Consolidada de Requisitos e Regras de Negócio
  const REQUIREMENTS_DATA = {
    // -------------------------------------------------------------------------
    // Requisitos Funcionais (RF01 - RF24)
    // -------------------------------------------------------------------------
    RF01: {
      id: 'RF01',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Disponibilizar quadro de avisos',
      description: 'O sistema deve disponibilizar um espaço central para visualização e gerenciamento de avisos administrativos da creche.',
      related: ['UC03']
    },
    RF02: {
      id: 'RF02',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Lançar avisos',
      description: 'As secretárias ou administradores devem poder publicar novos avisos informando assunto, descrição, autor e data.',
      related: ['UC03', 'RN09']
    },
    RF03: {
      id: 'RF03',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Exibir avisos',
      description: 'O sistema deve listar de forma clara os avisos cadastrados no mural geral da instituição.',
      related: ['UC03']
    },
    RF04: {
      id: 'RF04',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Apagar avisos',
      description: 'As secretárias ou administradores devem poder excluir avisos publicados quando não forem mais necessários.',
      related: ['UC03']
    },
    RF05: {
      id: 'RF05',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Cadastrar Usuários',
      description: 'Permitir que usuários com perfil administrativo realizem o cadastro de novos usuários no sistema.',
      related: ['UC02', 'RN18', 'RN19', 'RN20', 'RN21']
    },
    RF06: {
      id: 'RF06',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Realizar login',
      description: 'As secretárias e administradores devem poder realizar login no sistema com e-mail cadastrado e senha.',
      related: ['UC01', 'RN16', 'RN18', 'RNF05']
    },
    RF07: {
      id: 'RF07',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Realizar logout',
      description: 'As secretárias e administradores devem poder encerrar com segurança sua sessão ativa no sistema.',
      related: ['UC01', 'RN17']
    },
    RF08: {
      id: 'RF08',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Cadastrar card de aluno',
      description: 'As secretárias devem poder criar cards de alunos representando os registros oficiais de matrícula da instituição.',
      related: ['UC04', 'RN01', 'RN07']
    },
    RF09: {
      id: 'RF09',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Preenchimento de fichas',
      description: 'As secretárias devem poder preencher as fichas obrigatórias: Termo de Compromisso Escolar, Termo de Autorização de Uso de Imagem, Termo de Saída de Aluno, Ficha Socioeconômica e Requerimento de Matrícula.',
      related: ['UC04', 'RN01', 'RN03', 'RN06']
    },
    RF10: {
      id: 'RF10',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Editar fichas do card',
      description: 'As secretárias devem poder editar qualquer uma das informações das fichas do card para manutenção e atualização cadastral contínua.',
      related: ['UC04', 'RN03', 'RN06', 'RN10', 'RN15']
    },
    RF11: {
      id: 'RF11',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Inativar card de aluno',
      description: 'As secretárias devem poder inativar o card de um aluno, alterando seu status para "inativo" e restringindo edições.',
      related: ['UC04', 'RN10']
    },
    RF12: {
      id: 'RF12',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Reativar card de aluno',
      description: 'Permitir a alteração do status do card de aluno de inativo para ativo, restaurando as permissões de edição e vinculação.',
      related: ['UC04', 'RN10']
    },
    RF13: {
      id: 'RF13',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Vincular aluno a turma',
      description: 'As secretárias devem poder associar o card de matrícula de um aluno a uma turma cadastrada e ativa da creche.',
      related: ['UC07', 'RN02', 'RN06', 'RN08', 'RN10', 'RN11']
    },
    RF14: {
      id: 'RF14',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Anexar documentos',
      description: 'O sistema deve permitir anexar cópias digitalizadas de documentos (certidões, declarações, termos) em formato PDF às fichas dos alunos.',
      related: ['UC05', 'RN05', 'RN10']
    },
    RF15: {
      id: 'RF15',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Editar/Substituir documento',
      description: 'O sistema deve permitir substituir um documento PDF previamente anexado a uma ficha, removendo o arquivo anterior e mantendo o novo documento.',
      related: ['UC05', 'RN05', 'RN10']
    },
    RF16: {
      id: 'RF16',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Baixar fichas e documentos',
      description: 'O sistema deve permitir o download individual de qualquer ficha de matrícula ou documento anexado em formato PDF.',
      related: ['UC05']
    },
    RF17: {
      id: 'RF17',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Apresentar histórico de edições',
      description: 'O sistema deve permitir a consulta do histórico de edições de uma ficha, exibindo usuário responsável, data/hora da edição, campo alterado, valor anterior e novo valor.',
      related: ['UC04']
    },
    RF18: {
      id: 'RF18',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Cadastrar Etapa',
      description: 'O sistema deve permitir que as secretárias ou administradores cadastrem novas etapas escolares da creche.',
      related: ['UC06', 'RN02', 'RN04', 'RN13', 'RN22']
    },
    RF19: {
      id: 'RF19',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Inativar turma e etapa',
      description: 'O sistema deve permitir inativar turmas ou etapas quando não estiverem mais em operação, preservando o histórico de vínculos anteriores.',
      related: ['UC06', 'RN12']
    },
    RF20: {
      id: 'RF20',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Vincular turma à etapa',
      description: 'O sistema deve permitir vincular uma turma a uma etapa de ensino existente e ativa.',
      related: ['UC06', 'RN04', 'RN11']
    },
    RF21: {
      id: 'RF21',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Buscar aluno pelo nome',
      description: 'O sistema deve permitir buscar alunos pelo nome completo ou parcial, sem distinção de maiúsculas, minúsculas ou acentos, retornando os registros de matrícula correspondentes.',
      related: ['UC07', 'UC08', 'RN07', 'RNF06']
    },
    RF22: {
      id: 'RF22',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Buscar turmas e etapas',
      description: 'O sistema deve permitir pesquisar turmas e etapas cadastradas na instituição para consulta e vinculação.',
      related: ['UC07', 'UC08', 'RN13', 'RN14', 'RNF07']
    },
    RF23: {
      id: 'RF23',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Possibilitar salvamento com confirmação',
      description: 'O sistema deve exigir confirmação explícita ("Confirmar" ou "Cancelar") ao solicitar o salvamento ou alteração de uma ficha de matrícula, prevenindo perdas acidentais.',
      related: ['UC04', 'RN15']
    },
    RF24: {
      id: 'RF24',
      category: 'rf',
      type: 'Requisito Funcional',
      name: 'Cadastrar Turma',
      description: 'O sistema deve permitir cadastrar uma nova turma associada obrigatoriamente a uma etapa de ensino existente.',
      related: ['UC06', 'RN02', 'RN04', 'RN11', 'RN14', 'RN22']
    },

    // -------------------------------------------------------------------------
    // Requisitos Não Funcionais (RNF01 - RNF10)
    // -------------------------------------------------------------------------
    RNF01: {
      id: 'RNF01',
      category: 'rnf',
      type: 'Requisito Não Funcional (Segurança)',
      name: 'Privacidade de Dados e Proteção LGPD',
      description: 'Garantir a privacidade dos dados pessoais e sensíveis das crianças e famílias, restringindo o acesso e a visualização exclusivamente a usuários autenticados da creche, em conformidade com a LGPD.',
      related: ['UC01', 'UC02', 'UC03', 'UC04', 'UC05', 'RN17', 'RN20']
    },
    RNF02: {
      id: 'RNF02',
      category: 'rnf',
      type: 'Requisito Não Funcional (Segurança)',
      name: 'Restrição de Acesso não Autenticado',
      description: 'O sistema deve restringir o acesso a todas as rotas e funcionalidades internas exclusivamente a usuários autenticados com credenciais válidas. Requisições não autenticadas devem retornar HTTP 401 e redirecionar para login.',
      related: ['UC01', 'UC02', 'UC03', 'UC04', 'UC05', 'UC06', 'UC07', 'UC08', 'RN16', 'RN17', 'RN18']
    },
    RNF03: {
      id: 'RNF03',
      category: 'rnf',
      type: 'Requisito Não Funcional (Usabilidade)',
      name: 'Interface Responsiva e Adaptável',
      description: 'O sistema deve adaptar seus componentes visuais para monitores desktop e dispositivos móveis (resoluções de 360px mobile, 768px tablet e 1280px desktop), preservando layout e funcionalidade.',
      related: []
    },
    RNF04: {
      id: 'RNF04',
      category: 'rnf',
      type: 'Requisito Não Funcional (Usabilidade)',
      name: 'Suporte a Modo Escuro Alternável',
      description: 'O sistema deve disponibilizar alternância de tema visual (claro/escuro), assegurando índices de contraste e legibilidade adequados em ambas as paletas.',
      related: []
    },
    RNF05: {
      id: 'RNF05',
      category: 'rnf',
      type: 'Requisito Não Funcional (Desempenho)',
      name: 'Tempo de Resposta ao Logar',
      description: 'Garantir tempo de resposta inferior a 2 segundos entre o clique no botão de login e a autorização de acesso ao painel, sob conexão de rede estável.',
      related: ['UC01', 'RF06']
    },
    RNF06: {
      id: 'RNF06',
      category: 'rnf',
      type: 'Requisito Não Funcional (Desempenho)',
      name: 'Tempo de Resposta ao Buscar Aluno',
      description: 'Retornar os resultados da consulta de alunos em tempo inferior a 2 segundos para 95% das requisições na base da creche (estimada em ~200-300 registros anuais).',
      related: ['UC07', 'UC08', 'RF21']
    },
    RNF07: {
      id: 'RNF07',
      category: 'rnf',
      type: 'Requisito Não Funcional (Desempenho)',
      name: 'Tempo de Resposta para Buscar Turmas ou Etapas',
      description: 'Retornar os resultados da consulta de turmas e etapas em tempo inferior a 2 segundos para 95% das requisições.',
      related: ['UC06', 'UC07', 'UC08', 'RF22']
    },
    RNF08: {
      id: 'RNF08',
      category: 'rnf',
      type: 'Requisito Não Funcional (Desempenho)',
      name: 'Tempo de Resposta para Salvar Ficha',
      description: 'O sistema deve concluir o salvamento de uma ficha de matrícula em tempo inferior a 5 segundos para 95% das requisições, exibindo confirmação de sucesso.',
      related: ['UC04']
    },
    RNF09: {
      id: 'RNF09',
      category: 'rnf',
      type: 'Requisito Não Funcional (Confiabilidade)',
      name: 'Disponibilidade Operacional',
      description: 'O sistema deve assegurar disponibilidade de 99,5% durante o horário de expediente comercial da creche (segunda a sexta-feira, das 07h00 às 19h30).',
      related: []
    },
    RNF10: {
      id: 'RNF10',
      category: 'rnf',
      type: 'Requisito Não Funcional (Desempenho)',
      name: 'Suporte a Acessos Concorrentes',
      description: 'O sistema deve suportar simultaneamente a equipe administrativa (mínimo de 10 usuários simultâneos) sem degradação perceptível de tempo de resposta.',
      related: []
    },

    // -------------------------------------------------------------------------
    // Regras de Negócio (RN01 - RN22)
    // -------------------------------------------------------------------------
    RN01: {
      id: 'RN01',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Matrícula Única por Aluno',
      description: 'Cada aluno pode ter apenas uma matrícula ativa por vez.',
      justification: 'Evita duplicidade de registros e conflitos de turma.',
      related: ['RF08', 'RF09', 'UC04']
    },
    RN02: {
      id: 'RN02',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Vínculo Único de Turma e Etapa',
      description: 'Toda matrícula deve estar vinculada a exatamente uma turma e a uma etapa.',
      justification: 'Estrutura organizacional da creche.',
      related: ['RF13', 'RF18', 'RF24', 'UC07']
    },
    RN03: {
      id: 'RN03',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Ativação Mediante Fichas Completas',
      description: 'Uma matrícula só pode ser considerada ativa após o preenchimento completo das fichas obrigatórias: Termo de compromisso escolar, Termo de Autorização de uso de Imagem, Termo de autorização saída de aluno sem os responsáveis, Socioeconômica e Requerimento de Matrícula.',
      justification: 'Garantir conformidade e documentação completa.',
      related: ['RF09', 'RF10', 'UC04', 'UC07']
    },
    RN04: {
      id: 'RN04',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Vínculo Obrigatório de Turma a Etapa',
      description: 'Uma turma deve estar obrigatoriamente vinculada a uma etapa existente.',
      justification: 'Não pode existir turma solta.',
      related: ['RF18', 'RF24', 'UC06', 'UC07']
    },
    RN05: {
      id: 'RN05',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Formato Obrigatório de Documentos',
      description: 'Todos os documentos anexados devem estar em formato PDF.',
      justification: 'Padronização e compatibilidade.',
      related: ['RF14', 'RF15', 'UC05']
    },
    RN06: {
      id: 'RN06',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Validação Prévia de Campos Obrigatórios',
      description: 'Campos obrigatórios devem ser validados antes do salvamento.',
      justification: 'Garantir conformidade.',
      related: ['RF09', 'RF10', 'RF13', 'UC04', 'UC07']
    },
    RN07: {
      id: 'RN07',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Unicidade de Matrícula e CPF',
      description: 'Impedir cadastro de dois alunos com a mesma matrícula ou CPF.',
      justification: 'Evita conflito de dados.',
      related: ['RF08', 'RF21', 'UC04', 'UC08']
    },
    RN08: {
      id: 'RN08',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Alocação Exclusiva em Turma',
      description: 'Um aluno não pode estar matriculado em duas turmas simultaneamente.',
      justification: 'Evitar duplicidade e conflito de horários.',
      related: ['RF13', 'UC07']
    },
    RN09: {
      id: 'RN09',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Requisitos Mínimos para Publicação de Avisos',
      description: 'A criação de um aviso exige data e autor registrados e só poderá ser publicado quando o assunto e descrição estiverem devidamente preenchidos.',
      justification: 'Garante identificação e rastreabilidade.',
      related: ['RF02', 'UC03']
    },
    RN10: {
      id: 'RN10',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Bloqueio de Edição em Matrículas Inativas',
      description: 'Uma matrícula inativa correspondente a um aluno não poderá ser editada, só pode ser consultada e reativada.',
      justification: 'Garante que registros inativos não sejam alterados.',
      related: ['RF10', 'RF11', 'RF13', 'RF14', 'UC04', 'UC05', 'UC07']
    },
    RN11: {
      id: 'RN11',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Vínculos Restritos a Estruturas Ativas',
      description: 'Só turmas e etapas ativas podem receber novos vínculos.',
      justification: 'Evita alocar matrículas em estruturas inativas.',
      related: ['RF13', 'RF20', 'RF24', 'UC06', 'UC07', 'UC08']
    },
    RN12: {
      id: 'RN12',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Preservação de Histórico na Inativação',
      description: 'Inativar uma turma ou etapa não elimina os vínculos existentes.',
      justification: 'Preserva o histórico de alocação dos alunos.',
      related: ['RF19', 'UC06', 'UC08']
    },
    RN13: {
      id: 'RN13',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Unicidade de Nomes de Etapas',
      description: 'Impedir cadastro de duas etapas com o mesmo nome.',
      justification: 'Evita conflito de dados.',
      related: ['RF18', 'RF22', 'UC06', 'UC08']
    },
    RN14: {
      id: 'RN14',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Unicidade de Nomes de Turmas na Etapa',
      description: 'Impedir cadastro de duas turmas com o mesmo nome dentro da mesma etapa.',
      justification: 'Evita conflito de dados.',
      related: ['RF22', 'RF24', 'UC06', 'UC08']
    },
    RN15: {
      id: 'RN15',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Confirmação Prévia de Salvamento',
      description: 'As alterações na matrícula só são aplicadas após a confirmação. Se a operação for cancelada, os dados não serão salvos.',
      justification: 'Evita salvamentos acidentais.',
      related: ['RF10', 'RF23', 'UC04']
    },
    RN16: {
      id: 'RN16',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Bloqueio por Tentativas Inválidas de Login',
      description: 'O sistema deve bloquear o acesso após 5 tentativas consecutivas de login inválidas.',
      justification: 'Previne ataques de força bruta e garante a segurança do sistema.',
      related: ['RF06', 'RNF02', 'UC01']
    },
    RN17: {
      id: 'RN17',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Timeout de Sessão por Inatividade',
      description: 'A sessão do usuário deve ser encerrada após 30 minutos de inatividade contínua.',
      justification: 'Protege os dados sensíveis dos alunos caso o usuário tenha que sair do sistema e deixar ele logado.',
      related: ['RF07', 'RNF01', 'RNF02', 'UC01', 'UC03']
    },
    RN18: {
      id: 'RN18',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Restrição de Acesso a Contas Ativas',
      description: 'Apenas contas com status "Ativo" podem acessar o sistema. Contas inativadas devem ser bloqueadas do sistema imediatamente.',
      justification: 'Garantir que ex-funcionários e/ou pessoas não autorizadas percam acesso total ao sistema e aos dados nele contidos.',
      related: ['RF05', 'RF06', 'RNF02', 'UC01', 'UC02', 'UC03', 'UC08']
    },
    RN19: {
      id: 'RN19',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'E-mail Único por Usuário',
      description: 'Cada usuário deverá ser cadastrado no sistema com um e-mail único.',
      justification: 'O e-mail atua como chave de identificação no login. E-mails duplicados geram falhas de autenticação e conflitos de contas.',
      related: ['RF05', 'UC02']
    },
    RN20: {
      id: 'RN20',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Complexidade e Tamanho de Senha',
      description: 'O cadastro da senha de um novo usuário do sistema deve conter obrigatoriamente 8 caracteres, incluindo letras, números e caracteres especiais.',
      justification: 'Garantir o nível mínimo de segurança contra acessos indevidos, apoiando a proteção de dados exigida pela LGPD.',
      related: ['RF05', 'RNF01', 'UC02']
    },
    RN21: {
      id: 'RN21',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Inativação Lógica de Usuários',
      description: 'Um usuário não pode ter sua conta excluída de forma definitiva do banco de dados, apenas inativado.',
      justification: 'Preservar a consistência e a rastreabilidade do sistema (manter o registro de quem criou um aviso ou editou uma matrícula, por exemplo).',
      related: ['RF05', 'UC02']
    },
    RN22: {
      id: 'RN22',
      category: 'rn',
      type: 'Regra de Negócio',
      name: 'Campos Obrigatórios de Estrutura Escolar',
      description: 'O cadastro de etapa exige obrigatoriamente o nome. O cadastro de turma exige obrigatoriamente o nome e a etapa vinculada.',
      justification: 'Sem o nome, não é possível aplicar as regras de unicidade (RN13 e RN14) nem buscar turmas e etapas.',
      related: ['RF18', 'RF24', 'UC06']
    }
  };

  // Mapeamento de títulos dos Casos de Uso
  const UC_TITLES = {
    UC01: 'UC01 - Gerenciar Autenticação',
    UC02: 'UC02 - Gerenciar Usuários Administrativos',
    UC03: 'UC03 - Gerenciar Quadro de Avisos',
    UC04: 'UC04 - Gerenciar Fichas de Matrícula',
    UC05: 'UC05 - Gerenciar Documentos Digitais',
    UC06: 'UC06 - Gerenciar Estrutura Escolar',
    UC07: 'UC07 - Alocar Alunos',
    UC08: 'UC08 - Consultar Registros (Busca)'
  };

  let modalElement = null;

  /**
   * Constrói e injeta o elemento de modal <dialog> no DOM
   */
  function ensureModalElement() {
    if (modalElement && document.body.contains(modalElement)) {
      return modalElement;
    }

    modalElement = document.createElement('dialog');
    modalElement.id = 'sigma-modal';
    modalElement.className = 'sigma-modal';
    modalElement.setAttribute('aria-modal', 'true');

    modalElement.innerHTML = `
      <div class="sigma-modal__container">
        <div class="sigma-modal__header">
          <div class="sigma-modal__badges">
            <span id="sigma-modal-type" class="sigma-modal__type-badge"></span>
            <span id="sigma-modal-id" class="sigma-modal__id-badge"></span>
          </div>
          <button type="button" class="sigma-modal__close-btn" id="sigma-modal-close-x" aria-label="Fechar modal">&times;</button>
        </div>

        <h3 id="sigma-modal-title" class="sigma-modal__title"></h3>

        <div class="sigma-modal__body">
          <div class="sigma-modal__section">
            <span class="sigma-modal__section-label">Enunciado / Descrição</span>
            <p id="sigma-modal-desc" class="sigma-modal__text"></p>
          </div>

          <div id="sigma-modal-justification-sec" class="sigma-modal__section" style="display: none;">
            <span class="sigma-modal__section-label">Justificativa</span>
            <p id="sigma-modal-justification" class="sigma-modal__text"></p>
          </div>

          <div id="sigma-modal-related-sec" class="sigma-modal__section" style="display: none;">
            <span class="sigma-modal__section-label">Rastreabilidade & Relações</span>
            <div id="sigma-modal-related-list" class="sigma-modal__chips-list"></div>
          </div>
        </div>

        <div class="sigma-modal__footer">
          <button type="button" class="sigma-modal__btn-close" id="sigma-modal-close-btn">Fechar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalElement);

    // Eventos de fechar
    const closeBtnX = modalElement.querySelector('#sigma-modal-close-x');
    const closeBtnFooter = modalElement.querySelector('#sigma-modal-close-btn');

    closeBtnX.addEventListener('click', closeModal);
    closeBtnFooter.addEventListener('click', closeModal);

    // Fechar ao clicar no backdrop (fora do container)
    modalElement.addEventListener('click', function (e) {
      const rect = modalElement.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeModal();
      }
    });

    // Fechar com tecla ESC
    modalElement.addEventListener('cancel', function (e) {
      e.preventDefault();
      closeModal();
    });

    return modalElement;
  }

  /**
   * Abre o modal com os dados correspondentes ao ID fornecido
   * @param {string} rawId - Ex: "RF06", "req-rf06", "RN16", "rn16"
   */
  function openModal(rawId) {
    if (!rawId) return;

    // Normaliza ID (remove prefixos como 'req-', 'modal-', '#', etc.)
    const cleanId = rawId
      .replace(/^(#|modal-|req-)/i, '')
      .toUpperCase();

    const data = REQUIREMENTS_DATA[cleanId];
    if (!data) return;

    const modal = ensureModalElement();

    // Elementos internos
    const typeBadge = modal.querySelector('#sigma-modal-type');
    const idBadge = modal.querySelector('#sigma-modal-id');
    const titleEl = modal.querySelector('#sigma-modal-title');
    const descEl = modal.querySelector('#sigma-modal-desc');
    const justSec = modal.querySelector('#sigma-modal-justification-sec');
    const justEl = modal.querySelector('#sigma-modal-justification');
    const relSec = modal.querySelector('#sigma-modal-related-sec');
    const relList = modal.querySelector('#sigma-modal-related-list');

    // Categoria para estilização
    modal.setAttribute('data-category', data.category);

    typeBadge.textContent = data.type;
    typeBadge.className = `sigma-modal__type-badge sigma-modal__type-badge--${data.category}`;

    idBadge.textContent = data.id;
    idBadge.className = `sigma-modal__id-badge sigma-modal__id-badge--${data.category}`;

    titleEl.textContent = data.name;
    descEl.textContent = data.description;

    // Justificativa (específica de regras de negócio)
    if (data.justification) {
      justEl.textContent = data.justification;
      justSec.style.display = 'block';
    } else {
      justSec.style.display = 'none';
      justEl.textContent = '';
    }

    // Relações / Rastreabilidade
    relList.innerHTML = '';
    if (data.related && data.related.length > 0) {
      data.related.forEach(relId => {
        const isUC = relId.startsWith('UC');
        if (isUC) {
          // Link para caso de uso
          const ucLink = document.createElement('a');
          const ucNum = relId.toLowerCase();
          // Caminho relativo para página do caso de uso a partir de doc-visao
          const currentPath = window.location.pathname;
          if (currentPath.includes('/doc-visao/8_requisitos')) {
            ucLink.href = `../casos-uso/${ucNum}/`;
          } else if (currentPath.includes('/doc-visao/')) {
            ucLink.href = `casos-uso/${ucNum}/`;
          } else {
            ucLink.href = `doc-visao/casos-uso/${ucNum}/`;
          }
          ucLink.className = 'chip chip--uc-link';
          ucLink.textContent = UC_TITLES[relId] || relId;
          ucLink.title = `Ver especificação do ${relId}`;
          relList.appendChild(ucLink);
        } else {
          // Chip interativo para outro requisito ou regra de negócio
          const relData = REQUIREMENTS_DATA[relId];
          const chipBtn = document.createElement('button');
          chipBtn.type = 'button';
          chipBtn.className = `chip chip--${relData ? relData.category : 'rf'}`;
          chipBtn.textContent = relId + (relData && relData.category === 'rf' ? ` - ${relData.name}` : '');
          chipBtn.title = relData ? relData.name : relId;
          chipBtn.setAttribute('data-modal-id', relId);
          chipBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            openModal(relId);
          });
          relList.appendChild(chipBtn);
        }
      });
      relSec.style.display = 'block';
    } else {
      relSec.style.display = 'none';
    }

    // Exibe o modal nativo
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }

    document.body.classList.add('sigma-modal-open');
  }

  /**
   * Fecha o modal
   */
  function closeModal() {
    if (!modalElement) return;
    if (typeof modalElement.close === 'function') {
      modalElement.close();
    } else {
      modalElement.removeAttribute('open');
    }
    document.body.classList.remove('sigma-modal-open');
  }

  // Expõe helpers globalmente
  window.openSigmaModal = openModal;
  window.closeSigmaModal = closeModal;

  // Intercepta cliques globais em elementos com [data-modal-id]
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-modal-id]');
    if (trigger) {
      e.preventDefault();
      const id = trigger.getAttribute('data-modal-id');
      openModal(id);
    }
  });

  // Abertura automática caso a URL contenha hash correspondente a um ID
  function checkUrlHash() {
    if (window.location.hash) {
      const hashId = window.location.hash.substring(1);
      const clean = hashId.replace(/^(modal-|req-)/i, '').toUpperCase();
      if (REQUIREMENTS_DATA[clean]) {
        setTimeout(function () {
          openModal(clean);
        }, 150);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkUrlHash);
  } else {
    checkUrlHash();
  }

  window.addEventListener('hashchange', checkUrlHash);

})();
