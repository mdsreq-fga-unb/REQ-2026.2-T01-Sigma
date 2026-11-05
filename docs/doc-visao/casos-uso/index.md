# Casos de Uso

Esta seção apresenta o **Painel Unificado de Casos de Uso** do sistema **SIGMA**, desenvolvidos para atender às necessidades operacionais da **Creche Estação Vida**.

No projeto SIGMA, optou-se formalmente por utilizar os **Casos de Uso como forma principal de declaração e especificação de requisitos funcionais**. Desta forma, cada caso de uso concentra o fluxo de interação, as capacidades requeridas (RFs), os requisitos não funcionais aplicáveis (RNFs), as regras de negócio governantes e a definição de entrega do MVP, eliminando declarações duplicadas e mantendo uma única fonte da verdade.

### Estrutura Hierárquica de Rastreabilidade

A rastreabilidade dos requisitos percorre a seguinte hierarquia do negócio até a especificação:

<div class="hierarchy-flow">
  <div class="flow-step">
    <span class="flow-step__label">Problema</span>
    <span class="flow-step__desc">Gestão manual em papel</span>
  </div>
  <span class="flow-arrow">➔</span>
  <div class="flow-step">
    <span class="flow-step__label">Objetivo Geral</span>
    <span class="flow-step__desc">Centralização digital</span>
  </div>
  <span class="flow-arrow">➔</span>
  <div class="flow-step">
    <span class="flow-step__label">Objetivos Específicos</span>
    <span class="flow-step__desc">OE.1 a OE.4</span>
  </div>
  <span class="flow-arrow">➔</span>
  <div class="flow-step">
    <span class="flow-step__label">Características</span>
    <span class="flow-step__desc">CP1 a CP8</span>
  </div>
  <span class="flow-arrow">➔</span>
  <div class="flow-step flow-step--active">
    <span class="flow-step__label">Requisitos</span>
    <span class="flow-step__desc">Casos de Uso (UC01-UC08)</span>
  </div>
</div>

- **[Problema](../1_cenarioAtual.md#14-identificacao-da-oportunidade-ou-problema):** Sobrecarga e lentidão no gerenciamento manual em papel das fichas de matrícula de mais de 200 crianças, com risco de deterioração e perda de documentos.
- **[Objetivo Geral](../2_solucao.md#21-objetivo-geral-do-produto):** Centralizar e digitalizar a organização e recuperação das informações de matrículas da creche em cards digitais.
- **[Objetivos Específicos (OEs)](../2_solucao.md#22-objetivos-especificos-oe-do-produto):**
    - **OE.1:** Facilitar e agilizar a organização e a continuidade do processo administrativo.
    - **OE.2:** Preservar e centralizar o histórico e as informações das matrículas.
    - **OE.3:** Controlar o acesso e garantir a segurança das informações do sistema.
    - **OE.4:** Facilitar a comunicação interna entre a equipe administrativa.
- **[Características do Produto (CPs)](../2_solucao.md#23-caracteristicas-de-produto):** CP1 (Cards de matrícula), CP2 (Edição de cards), CP3 (Consulta de informações), CP4 (Controle de acesso), CP5 (Gerenciamento de documentos), CP6 (Avisos rápidos), CP7 (Gerenciamento de turmas e etapas) e CP8 (Auditoria e integridade).
- **Declaração Vigente:** Requisitos declarados unificadamente como Casos de Uso (UC01 a UC08) abaixo.

---

## Painel Unificado de Casos de Uso

<div class="catalogo-panel">

  <!-- UC01 -->
  <div class="catalogo-card">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="uc01/">UC01 - Gerenciar Autenticação</a></h3>
        <span class="badge-mvp badge-mvp--sim"><a href="../10_backlog/#102-priorizacao-do-backlog-e-mvp">MVP: Sim</a></span>
      </div>
      <div class="catalogo-card__hierarchy">
        <span><a href="../2_solucao/#23-caracteristicas-de-produto">CP4 - Controle de Acesso</a></span> • <span><a href="../2_solucao/#22-objetivos-especificos-oe-do-produto">OE.3 - Segurança</a></span>
      </div>
      <p class="catalogo-card__desc">
        Permitir que as secretárias e administradores acessem e encerrem suas sessões com credenciais seguras, protegendo o acesso aos dados sensíveis da instituição.
      </p>
      <div class="catalogo-card__attributes">
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Funcionais (RF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rf06" class="chip chip--rf" title="Realizar login">RF06 - Realizar Login</a>
            <a href="../8_requisitos/#req-rf07" class="chip chip--rf" title="Realizar logout">RF07 - Realizar Logout</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rnf01" class="chip chip--rnf" title="Privacidade de Dados">RNF01</a>
            <a href="../8_requisitos/#req-rnf02" class="chip chip--rnf" title="Restrição de Acesso">RNF02</a>
            <a href="../8_requisitos/#req-rnf05" class="chip chip--rnf" title="Tempo de Resposta ao Logar < 2s">RNF05</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <a href="../Regras-Negocio/#rn16" class="chip chip--rn" title="Bloqueio após 5 tentativas consecutivas inválidas">RN16</a>
            <a href="../Regras-Negocio/#rn17" class="chip chip--rn" title="Encerramento de sessão após 30 min de inatividade">RN17</a>
            <a href="../Regras-Negocio/#rn18" class="chip chip--rn" title="Apenas contas com status Ativo">RN18</a>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="uc01/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC02 -->
  <div class="catalogo-card">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="uc02/">UC02 - Gerenciar Usuários Administrativos</a></h3>
        <span class="badge-mvp badge-mvp--sim"><a href="../10_backlog/#102-priorizacao-do-backlog-e-mvp">MVP: Sim</a></span>
      </div>
      <div class="catalogo-card__hierarchy">
        <span><a href="../2_solucao/#23-caracteristicas-de-produto">CP4 - Controle de Acesso</a></span> • <span><a href="../2_solucao/#22-objetivos-especificos-oe-do-produto">OE.3 - Segurança</a></span>
      </div>
      <p class="catalogo-card__desc">
        Permitir o cadastro, controle e inativação de contas da equipe administrativa da creche com restrições e políticas de senhas fortes.
      </p>
      <div class="catalogo-card__attributes">
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Funcionais (RF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rf05" class="chip chip--rf" title="Cadastrar Usuários">RF05 - Cadastrar Usuários</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rnf01" class="chip chip--rnf" title="Privacidade de Dados">RNF01</a>
            <a href="../8_requisitos/#req-rnf02" class="chip chip--rnf" title="Restrição de Acesso não Autenticado">RNF02</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <a href="../Regras-Negocio/#rn18" class="chip chip--rn" title="Bloqueio imediato de contas inativas">RN18</a>
            <a href="../Regras-Negocio/#rn19" class="chip chip--rn" title="E-mail único cadastrado">RN19</a>
            <a href="../Regras-Negocio/#rn20" class="chip chip--rn" title="Senha de 8 caracteres com letras, números e especiais">RN20</a>
            <a href="../Regras-Negocio/#rn21" class="chip chip--rn" title="Impedimento de exclusão física, apenas inativação">RN21</a>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="uc02/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC03 -->
  <div class="catalogo-card">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="uc03/">UC03 - Gerenciar Quadro de Avisos</a></h3>
        <span class="badge-mvp badge-mvp--nao"><a href="../10_backlog/#102-priorizacao-do-backlog-e-mvp">MVP: Não</a></span>
      </div>
      <div class="catalogo-card__hierarchy">
        <span><a href="../2_solucao/#23-caracteristicas-de-produto">CP6 - Avisos Rápidos</a></span> • <span><a href="../2_solucao/#22-objetivos-especificos-oe-do-produto">OE.4 - Comunicação Interna</a></span>
      </div>
      <p class="catalogo-card__desc">
        Disponibilizar espaço central para lançamento, visualização e remoção de avisos internos entre a equipe administrativa da creche.
      </p>
      <div class="catalogo-card__attributes">
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Funcionais (RF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rf01" class="chip chip--rf" title="Disponibilizar quadro de avisos">RF01</a>
            <a href="../8_requisitos/#req-rf02" class="chip chip--rf" title="Lançar avisos">RF02</a>
            <a href="../8_requisitos/#req-rf03" class="chip chip--rf" title="Exibir avisos">RF03</a>
            <a href="../8_requisitos/#req-rf04" class="chip chip--rf" title="Apagar avisos">RF04</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rnf01" class="chip chip--rnf" title="Privacidade de Dados">RNF01</a>
            <a href="../8_requisitos/#req-rnf02" class="chip chip--rnf" title="Restrição de Acesso">RNF02</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <a href="../Regras-Negocio/#rn09" class="chip chip--rn" title="Assunto, descrição, data e autor obrigatórios">RN09</a>
            <a href="../Regras-Negocio/#rn17" class="chip chip--rn" title="Timeout de inatividade 30 min">RN17</a>
            <a href="../Regras-Negocio/#rn18" class="chip chip--rn" title="Apenas contas ativas">RN18</a>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="uc03/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC04 -->
  <div class="catalogo-card">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="uc04/">UC04 - Gerenciar Fichas de Matrícula</a></h3>
        <span class="badge-mvp badge-mvp--sim"><a href="../10_backlog/#102-priorizacao-do-backlog-e-mvp">MVP: Sim</a></span>
      </div>
      <div class="catalogo-card__hierarchy">
        <span><a href="../2_solucao/#23-caracteristicas-de-produto">CP1, CP2, CP8</a></span> • <span><a href="../2_solucao/#22-objetivos-especificos-oe-do-produto">OE.1, OE.2, OE.3</a></span>
      </div>
      <p class="catalogo-card__desc">
        Cadastrar cards de alunos, preencher fichas socioeconômicas e termos escolares, editar dados, registrar histórico e exigir confirmação de salvamento.
      </p>
      <div class="catalogo-card__attributes">
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Funcionais (RF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rf08" class="chip chip--rf" title="Cadastrar card de aluno">RF08</a>
            <a href="../8_requisitos/#req-rf09" class="chip chip--rf" title="Preenchimento de fichas">RF09</a>
            <a href="../8_requisitos/#req-rf10" class="chip chip--rf" title="Editar fichas do card">RF10</a>
            <a href="../8_requisitos/#req-rf11" class="chip chip--rf" title="Inativar card de aluno (Pós-MVP)">RF11</a>
            <a href="../8_requisitos/#req-rf12" class="chip chip--rf" title="Reativar card de aluno (Pós-MVP)">RF12</a>
            <a href="../8_requisitos/#req-rf17" class="chip chip--rf" title="Apresentar histórico de edições">RF17</a>
            <a href="../8_requisitos/#req-rf23" class="chip chip--rf" title="Possibilitar salvamento com confirmação">RF23</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rnf01" class="chip chip--rnf" title="Privacidade de Dados LGPD">RNF01</a>
            <a href="../8_requisitos/#req-rnf02" class="chip chip--rnf" title="Restrição de Acesso">RNF02</a>
            <a href="../8_requisitos/#req-rnf08" class="chip chip--rnf" title="Tempo de salvamento de ficha < 5s">RNF08</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <a href="../Regras-Negocio/#rn01" class="chip chip--rn" title="Apenas uma matrícula ativa por vez">RN01</a>
            <a href="../Regras-Negocio/#rn03" class="chip chip--rn" title="Matrícula ativa mediante 5 fichas completas">RN03</a>
            <a href="../Regras-Negocio/#rn06" class="chip chip--rn" title="Validação de campos obrigatórios">RN06</a>
            <a href="../Regras-Negocio/#rn07" class="chip chip--rn" title="Impedir dois alunos com mesmo CPF ou matrícula">RN07</a>
            <a href="../Regras-Negocio/#rn10" class="chip chip--rn" title="Matrícula inativa não pode ser editada">RN10</a>
            <a href="../Regras-Negocio/#rn15" class="chip chip--rn" title="Alterações confirmadas antes de salvar">RN15</a>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="uc04/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC05 -->
  <div class="catalogo-card">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="uc05/">UC05 - Gerenciar Documentos Digitais</a></h3>
        <span class="badge-mvp badge-mvp--sim"><a href="../10_backlog/#102-priorizacao-do-backlog-e-mvp">MVP: Sim</a></span>
      </div>
      <div class="catalogo-card__hierarchy">
        <span><a href="../2_solucao/#23-caracteristicas-de-produto">CP5 - Gerenciamento de Documentos</a></span> • <span><a href="../2_solucao/#22-objetivos-especificos-oe-do-produto">OE.2 - Preservar Informações</a></span>
      </div>
      <p class="catalogo-card__desc">
        Anexar documentos digitalizados (certidões, declarações) em formato PDF, realizar download e substituir arquivos vinculados às fichas.
      </p>
      <div class="catalogo-card__attributes">
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Funcionais (RF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rf14" class="chip chip--rf" title="Anexar documentos">RF14 - Anexar</a>
            <a href="../8_requisitos/#req-rf15" class="chip chip--rf" title="Editar/Substituir documento">RF15 - Substituir</a>
            <a href="../8_requisitos/#req-rf16" class="chip chip--rf" title="Baixar fichas e documentos">RF16 - Baixar PDF</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rnf01" class="chip chip--rnf" title="Privacidade e Retenção Segura LGPD">RNF01</a>
            <a href="../8_requisitos/#req-rnf02" class="chip chip--rnf" title="Restrição de Acesso">RNF02</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <a href="../Regras-Negocio/#rn05" class="chip chip--rn" title="Formato obrigatório em PDF">RN05</a>
            <a href="../Regras-Negocio/#rn10" class="chip chip--rn" title="Matrícula inativa não pode receber novos anexos">RN10</a>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="uc05/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC06 -->
  <div class="catalogo-card">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="uc06/">UC06 - Gerenciar Estrutura Escolar</a></h3>
        <span class="badge-mvp badge-mvp--sim"><a href="../10_backlog/#102-priorizacao-do-backlog-e-mvp">MVP: Sim</a></span>
      </div>
      <div class="catalogo-card__hierarchy">
        <span><a href="../2_solucao/#23-caracteristicas-de-produto">CP7 - Turmas e Etapas</a></span> • <span><a href="../2_solucao/#22-objetivos-especificos-oe-do-produto">OE.1 - Organização Administrativa</a></span>
      </div>
      <p class="catalogo-card__desc">
        Cadastrar novas etapas de ensino e turmas da creche, vincular turmas às suas respectivas etapas e gerenciar inativações com histórico.
      </p>
      <div class="catalogo-card__attributes">
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Funcionais (RF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rf18" class="chip chip--rf" title="Cadastrar Etapa">RF18 - Cadastrar Etapa</a>
            <a href="../8_requisitos/#req-rf19" class="chip chip--rf" title="Inativar turma e etapa">RF19 - Inativar</a>
            <a href="../8_requisitos/#req-rf20" class="chip chip--rf" title="Vincular turma à etapa">RF20 - Vincular</a>
            <a href="../8_requisitos/#req-rf24" class="chip chip--rf" title="Cadastrar Turma">RF24 - Cadastrar Turma</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rnf02" class="chip chip--rnf" title="Restrição de Acesso">RNF02</a>
            <a href="../8_requisitos/#req-rnf07" class="chip chip--rnf" title="Tempo de busca de turmas/etapas < 2s">RNF07</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <a href="../Regras-Negocio/#rn04" class="chip chip--rn" title="Turma obrigatoriamente vinculada a etapa">RN04</a>
            <a href="../Regras-Negocio/#rn11" class="chip chip--rn" title="Apenas estruturas ativas recebem vínculos">RN11</a>
            <a href="../Regras-Negocio/#rn12" class="chip chip--rn" title="Inativação mantém vínculos existentes">RN12</a>
            <a href="../Regras-Negocio/#rn13" class="chip chip--rn" title="Impedir etapas duplicadas">RN13</a>
            <a href="../Regras-Negocio/#rn14" class="chip chip--rn" title="Impedir turmas duplicadas na mesma etapa">RN14</a>
            <a href="../Regras-Negocio/#rn22" class="chip chip--rn" title="Campos obrigatórios de etapa e turma">RN22</a>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="uc06/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC07 -->
  <div class="catalogo-card">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="uc07/">UC07 - Alocar Alunos</a></h3>
        <span class="badge-mvp badge-mvp--sim"><a href="../10_backlog/#102-priorizacao-do-backlog-e-mvp">MVP: Sim</a></span>
      </div>
      <div class="catalogo-card__hierarchy">
        <span><a href="../2_solucao/#23-caracteristicas-de-produto">CP7, CP1</a></span> • <span><a href="../2_solucao/#22-objetivos-especificos-oe-do-produto">OE.1 - Organização Administrativa</a></span>
      </div>
      <p class="catalogo-card__desc">
        Vincular o card de matrícula do aluno a uma turma existente ativa, garantindo alocação única e consistência na formação de salas.
      </p>
      <div class="catalogo-card__attributes">
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Funcionais (RF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rf13" class="chip chip--rf" title="Vincular aluno a turma">RF13 - Vincular Turma</a>
            <a href="../8_requisitos/#req-rf21" class="chip chip--rf" title="Buscar aluno pelo nome">RF21 - Buscar Aluno</a>
            <a href="../8_requisitos/#req-rf22" class="chip chip--rf" title="Buscar turmas e etapas">RF22 - Buscar Turma</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rnf02" class="chip chip--rnf" title="Restrição de Acesso">RNF02</a>
            <a href="../8_requisitos/#req-rnf06" class="chip chip--rnf" title="Tempo de busca de aluno < 2s">RNF06</a>
            <a href="../8_requisitos/#req-rnf07" class="chip chip--rnf" title="Tempo de busca de turmas < 2s">RNF07</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <a href="../Regras-Negocio/#rn02" class="chip chip--rn" title="Matrícula vinculada a 1 turma e 1 etapa">RN02</a>
            <a href="../Regras-Negocio/#rn03" class="chip chip--rn" title="Fichas completas para ativação">RN03</a>
            <a href="../Regras-Negocio/#rn04" class="chip chip--rn" title="Turma vinculada a etapa">RN04</a>
            <a href="../Regras-Negocio/#rn06" class="chip chip--rn" title="Validação de campos antes de salvar">RN06</a>
            <a href="../Regras-Negocio/#rn08" class="chip chip--rn" title="Impedir aluno em duas turmas simultaneamente">RN08</a>
            <a href="../Regras-Negocio/#rn10" class="chip chip--rn" title="Matrícula inativa não pode ter alocação alterada">RN10</a>
            <a href="../Regras-Negocio/#rn11" class="chip chip--rn" title="Apenas turmas ativas recebem novos alunos">RN11</a>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="uc07/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC08 -->
  <div class="catalogo-card">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="uc08/">UC08 - Consultar Registros (Busca)</a></h3>
        <span class="badge-mvp badge-mvp--sim"><a href="../10_backlog/#102-priorizacao-do-backlog-e-mvp">MVP: Sim</a></span>
      </div>
      <div class="catalogo-card__hierarchy">
        <span><a href="../2_solucao/#23-caracteristicas-de-produto">CP3, CP7</a></span> • <span><a href="../2_solucao/#22-objetivos-especificos-oe-do-produto">OE.1 - Organização e Continuidade</a></span>
      </div>
      <p class="catalogo-card__desc">
        Consultar alunos por nome completo ou parcial (sem distinção de maiúsculas/acentos) e pesquisar turmas e etapas em tempo hábil.
      </p>
      <div class="catalogo-card__attributes">
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Funcionais (RF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rf21" class="chip chip--rf" title="Buscar aluno pelo nome">RF21 - Buscar Aluno</a>
            <a href="../8_requisitos/#req-rf22" class="chip chip--rf" title="Buscar turmas e etapas">RF22 - Buscar Turmas</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <a href="../8_requisitos/#req-rnf02" class="chip chip--rnf" title="Restrição de Acesso">RNF02</a>
            <a href="../8_requisitos/#req-rnf06" class="chip chip--rnf" title="Tempo de busca de aluno < 2s">RNF06</a>
            <a href="../8_requisitos/#req-rnf07" class="chip chip--rnf" title="Tempo de busca de turmas < 2s">RNF07</a>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <a href="../Regras-Negocio/#rn07" class="chip chip--rn" title="Resultados únicos de matrícula e CPF">RN07</a>
            <a href="../Regras-Negocio/#rn11" class="chip chip--rn" title="Identificação de status ativo/inativo">RN11</a>
            <a href="../Regras-Negocio/#rn12" class="chip chip--rn" title="Inativos permanecem visíveis na consulta">RN12</a>
            <a href="../Regras-Negocio/#rn13" class="chip chip--rn" title="Unicidade de nomes de etapas">RN13</a>
            <a href="../Regras-Negocio/#rn14" class="chip chip--rn" title="Unicidade de nomes de turmas na etapa">RN14</a>
            <a href="../Regras-Negocio/#rn18" class="chip chip--rn" title="Apenas usuários autenticados">RN18</a>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="uc08/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

</div>

> Para consultar as diretrizes gerais de qualidade, consulte a [Lista de Requisitos Não Funcionais](../8_requisitos.md#82-lista-de-requisitos-nao-funcionais-especificacao-suplementar). Para acompanhar o recorte de entregas, acesse o [Backlog e MVP](../10_backlog.md#102-priorizacao-do-backlog-e-mvp).
