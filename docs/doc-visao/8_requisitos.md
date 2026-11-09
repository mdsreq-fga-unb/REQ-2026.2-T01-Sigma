# 8. Catálogo Unificado de Requisitos

Este documento consolida os requisitos funcionais e não funcionais do sistema **SIGMA**, estruturando suas relações com os objetivos do produto, regras de negócio e planejamento de entregas. Os requisitos funcionais são declarados através de **Casos de Uso (UC)**, detalhando fluxos principais, alternativos, exceções e critérios de aceitação.

---

## 8.1 Catálogo de Casos de Uso

O painel a seguir apresenta os Casos de Uso do sistema, indicando o vínculo com Características do Produto (CP) e Objetivos Específicos (OE), capacidades funcionais (RF), requisitos não funcionais (RNF), regras de negócio (RN) e status no MVP:

<!-- Âncoras para compatibilidade de links e deep-linking de modais -->
<div class="sigma-anchors-container" style="display:none;" aria-hidden="true">
  <span id="rf01"></span><span id="req-rf01"></span>
  <span id="rf02"></span><span id="req-rf02"></span>
  <span id="rf03"></span><span id="req-rf03"></span>
  <span id="rf04"></span><span id="req-rf04"></span>
  <span id="rf05"></span><span id="req-rf05"></span>
  <span id="rf06"></span><span id="req-rf06"></span>
  <span id="rf07"></span><span id="req-rf07"></span>
  <span id="rf08"></span><span id="req-rf08"></span>
  <span id="rf09"></span><span id="req-rf09"></span>
  <span id="rf10"></span><span id="req-rf10"></span>
  <span id="rf11"></span><span id="req-rf11"></span>
  <span id="rf12"></span><span id="req-rf12"></span>
  <span id="rf13"></span><span id="req-rf13"></span>
  <span id="rf14"></span><span id="req-rf14"></span>
  <span id="rf15"></span><span id="req-rf15"></span>
  <span id="rf16"></span><span id="req-rf16"></span>
  <span id="rf17"></span><span id="req-rf17"></span>
  <span id="rf18"></span><span id="req-rf18"></span>
  <span id="rf19"></span><span id="req-rf19"></span>
  <span id="rf20"></span><span id="req-rf20"></span>
  <span id="rf21"></span><span id="req-rf21"></span>
  <span id="rf22"></span><span id="req-rf22"></span>
  <span id="rf23"></span><span id="req-rf23"></span>
  <span id="rf24"></span><span id="req-rf24"></span>
  <span id="rnf01"></span><span id="req-rnf01"></span>
  <span id="rnf02"></span><span id="req-rnf02"></span>
  <span id="rnf03"></span><span id="req-rnf03"></span>
  <span id="rnf04"></span><span id="req-rnf04"></span>
  <span id="rnf05"></span><span id="req-rnf05"></span>
  <span id="rnf06"></span><span id="req-rnf06"></span>
  <span id="rnf07"></span><span id="req-rnf07"></span>
  <span id="rnf08"></span><span id="req-rnf08"></span>
  <span id="rnf09"></span><span id="req-rnf09"></span>
  <span id="rnf10"></span><span id="req-rnf10"></span>
  <span id="rn01"></span>
  <span id="rn02"></span>
  <span id="rn03"></span>
  <span id="rn04"></span>
  <span id="rn05"></span>
  <span id="rn06"></span>
  <span id="rn07"></span>
  <span id="rn08"></span>
  <span id="rn09"></span>
  <span id="rn10"></span>
  <span id="rn11"></span>
  <span id="rn12"></span>
  <span id="rn13"></span>
  <span id="rn14"></span>
  <span id="rn15"></span>
  <span id="rn16"></span>
  <span id="rn17"></span>
  <span id="rn18"></span>
  <span id="rn19"></span>
  <span id="rn20"></span>
  <span id="rn21"></span>
  <span id="rn22"></span>
</div>

<!-- Barra de Filtros do Catálogo (MVP) -->
<div class="catalogo-filter-bar" role="toolbar" aria-label="Filtro de Casos de Uso por MVP">
  <div class="catalogo-filter-info">
    <span class="catalogo-filter-label">Filtrar por MVP:</span>
  </div>
  <div class="catalogo-filter-buttons" role="group">
    <button type="button" class="catalogo-filter-btn is-active" data-filter="todos">
      Todos <span class="catalogo-filter-count">8</span>
    </button>
    <button type="button" class="catalogo-filter-btn" data-filter="sim">
      No MVP <span class="catalogo-filter-count">7</span>
    </button>
    <button type="button" class="catalogo-filter-btn" data-filter="nao">
      Fora do MVP <span class="catalogo-filter-count">1</span>
    </button>
  </div>
</div>

<div class="catalogo-panel">

  <!-- UC01 -->
  <div class="catalogo-card" id="uc01" data-mvp="sim">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="../casos-uso/uc01/">UC01 - Gerenciar Autenticação</a></h3>
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
            <button type="button" class="chip chip--rf" data-modal-id="RF06" title="Clique para ver detalhes do RF06">RF06 - Realizar Login</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF07" title="Clique para ver detalhes do RF07">RF07 - Realizar Logout</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rnf" data-modal-id="RNF01" title="Clique para ver detalhes do RNF01">RNF01</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF02" title="Clique para ver detalhes do RNF02">RNF02</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF05" title="Clique para ver detalhes do RNF05">RNF05</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rn" data-modal-id="RN16" title="Clique para ver detalhes da RN16">RN16</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN17" title="Clique para ver detalhes da RN17">RN17</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN18" title="Clique para ver detalhes da RN18">RN18</button>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="../casos-uso/uc01/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC02 -->
  <div class="catalogo-card" id="uc02" data-mvp="sim">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="../casos-uso/uc02/">UC02 - Gerenciar Usuários Administrativos</a></h3>
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
            <button type="button" class="chip chip--rf" data-modal-id="RF05" title="Clique para ver detalhes do RF05">RF05 - Cadastrar Usuários</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rnf" data-modal-id="RNF01" title="Clique para ver detalhes do RNF01">RNF01</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF02" title="Clique para ver detalhes do RNF02">RNF02</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rn" data-modal-id="RN18" title="Clique para ver detalhes da RN18">RN18</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN19" title="Clique para ver detalhes da RN19">RN19</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN20" title="Clique para ver detalhes da RN20">RN20</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN21" title="Clique para ver detalhes da RN21">RN21</button>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="../casos-uso/uc02/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC03 -->
  <div class="catalogo-card" id="uc03" data-mvp="nao">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="../casos-uso/uc03/">UC03 - Gerenciar Quadro de Avisos</a></h3>
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
            <button type="button" class="chip chip--rf" data-modal-id="RF01" title="Clique para ver detalhes do RF01">RF01</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF02" title="Clique para ver detalhes do RF02">RF02</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF03" title="Clique para ver detalhes do RF03">RF03</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF04" title="Clique para ver detalhes do RF04">RF04</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rnf" data-modal-id="RNF01" title="Clique para ver detalhes do RNF01">RNF01</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF02" title="Clique para ver detalhes do RNF02">RNF02</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rn" data-modal-id="RN09" title="Clique para ver detalhes da RN09">RN09</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN17" title="Clique para ver detalhes da RN17">RN17</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN18" title="Clique para ver detalhes da RN18">RN18</button>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="../casos-uso/uc03/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC04 -->
  <div class="catalogo-card" id="uc04" data-mvp="sim">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="../casos-uso/uc04/">UC04 - Gerenciar Fichas de Matrícula</a></h3>
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
            <button type="button" class="chip chip--rf" data-modal-id="RF08" title="Clique para ver detalhes do RF08">RF08</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF09" title="Clique para ver detalhes do RF09">RF09</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF10" title="Clique para ver detalhes do RF10">RF10</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF11" title="Clique para ver detalhes do RF11">RF11</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF12" title="Clique para ver detalhes do RF12">RF12</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF17" title="Clique para ver detalhes do RF17">RF17</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF23" title="Clique para ver detalhes do RF23">RF23</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rnf" data-modal-id="RNF01" title="Clique para ver detalhes do RNF01">RNF01</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF02" title="Clique para ver detalhes do RNF02">RNF02</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF08" title="Clique para ver detalhes do RNF08">RNF08</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rn" data-modal-id="RN01" title="Clique para ver detalhes da RN01">RN01</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN03" title="Clique para ver detalhes da RN03">RN03</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN06" title="Clique para ver detalhes da RN06">RN06</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN07" title="Clique para ver detalhes da RN07">RN07</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN10" title="Clique para ver detalhes da RN10">RN10</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN15" title="Clique para ver detalhes da RN15">RN15</button>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="../casos-uso/uc04/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC05 -->
  <div class="catalogo-card" id="uc05" data-mvp="sim">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="../casos-uso/uc05/">UC05 - Gerenciar Documentos Digitais</a></h3>
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
            <button type="button" class="chip chip--rf" data-modal-id="RF14" title="Clique para ver detalhes do RF14">RF14 - Anexar</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF15" title="Clique para ver detalhes do RF15">RF15 - Substituir</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF16" title="Clique para ver detalhes do RF16">RF16 - Baixar PDF</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rnf" data-modal-id="RNF01" title="Clique para ver detalhes do RNF01">RNF01</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF02" title="Clique para ver detalhes do RNF02">RNF02</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rn" data-modal-id="RN05" title="Clique para ver detalhes da RN05">RN05</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN10" title="Clique para ver detalhes da RN10">RN10</button>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="../casos-uso/uc05/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC06 -->
  <div class="catalogo-card" id="uc06" data-mvp="sim">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="../casos-uso/uc06/">UC06 - Gerenciar Estrutura Escolar</a></h3>
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
            <button type="button" class="chip chip--rf" data-modal-id="RF18" title="Clique para ver detalhes do RF18">RF18 - Cadastrar Etapa</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF19" title="Clique para ver detalhes do RF19">RF19 - Inativar</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF20" title="Clique para ver detalhes do RF20">RF20 - Vincular</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF24" title="Clique para ver detalhes do RF24">RF24 - Cadastrar Turma</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rnf" data-modal-id="RNF02" title="Clique para ver detalhes do RNF02">RNF02</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF07" title="Clique para ver detalhes do RNF07">RNF07</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rn" data-modal-id="RN04" title="Clique para ver detalhes da RN04">RN04</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN11" title="Clique para ver detalhes da RN11">RN11</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN12" title="Clique para ver detalhes da RN12">RN12</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN13" title="Clique para ver detalhes da RN13">RN13</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN14" title="Clique para ver detalhes da RN14">RN14</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN22" title="Clique para ver detalhes da RN22">RN22</button>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="../casos-uso/uc06/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC07 -->
  <div class="catalogo-card" id="uc07" data-mvp="sim">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="../casos-uso/uc07/">UC07 - Alocar Alunos</a></h3>
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
            <button type="button" class="chip chip--rf" data-modal-id="RF13" title="Clique para ver detalhes do RF13">RF13 - Vincular Turma</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF21" title="Clique para ver detalhes do RF21">RF21 - Buscar Aluno</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF22" title="Clique para ver detalhes do RF22">RF22 - Buscar Turma</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rnf" data-modal-id="RNF02" title="Clique para ver detalhes do RNF02">RNF02</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF06" title="Clique para ver detalhes do RNF06">RNF06</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF07" title="Clique para ver detalhes do RNF07">RNF07</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rn" data-modal-id="RN02" title="Clique para ver detalhes da RN02">RN02</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN03" title="Clique para ver detalhes da RN03">RN03</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN04" title="Clique para ver detalhes da RN04">RN04</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN06" title="Clique para ver detalhes da RN06">RN06</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN08" title="Clique para ver detalhes da RN08">RN08</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN10" title="Clique para ver detalhes da RN10">RN10</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN11" title="Clique para ver detalhes da RN11">RN11</button>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="../casos-uso/uc07/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

  <!-- UC08 -->
  <div class="catalogo-card" id="uc08" data-mvp="sim">
    <div>
      <div class="catalogo-card__header">
        <h3 class="catalogo-card__title"><a href="../casos-uso/uc08/">UC08 - Consultar Registros (Busca)</a></h3>
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
            <button type="button" class="chip chip--rf" data-modal-id="RF21" title="Clique para ver detalhes do RF21">RF21 - Buscar Aluno</button>
            <button type="button" class="chip chip--rf" data-modal-id="RF22" title="Clique para ver detalhes do RF22">RF22 - Buscar Turmas</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Requisitos Não Funcionais (RNF)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rnf" data-modal-id="RNF02" title="Clique para ver detalhes do RNF02">RNF02</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF06" title="Clique para ver detalhes do RNF06">RNF06</button>
            <button type="button" class="chip chip--rnf" data-modal-id="RNF07" title="Clique para ver detalhes do RNF07">RNF07</button>
          </div>
        </div>
        <div class="catalogo-card__row">
          <span class="catalogo-card__label">Regras de Negócio (RN)</span>
          <div class="catalogo-card__chips">
            <button type="button" class="chip chip--rn" data-modal-id="RN07" title="Clique para ver detalhes da RN07">RN07</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN11" title="Clique para ver detalhes da RN11">RN11</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN12" title="Clique para ver detalhes da RN12">RN12</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN13" title="Clique para ver detalhes da RN13">RN13</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN14" title="Clique para ver detalhes da RN14">RN14</button>
            <button type="button" class="chip chip--rn" data-modal-id="RN18" title="Clique para ver detalhes da RN18">RN18</button>
          </div>
        </div>
      </div>
    </div>
    <div class="catalogo-card__footer">
      <a href="../casos-uso/uc08/" class="catalogo-card__link">Ver especificação completa →</a>
    </div>
  </div>

</div>

<!-- Mensagem de estado vazio caso nenhum card corresponda ao filtro -->
<div id="catalogo-empty-state" class="catalogo-empty-state" style="display: none;">
  <p>Nenhum Caso de Uso encontrado para o filtro selecionado.</p>
</div>

---

<span id="83-rastreabilidade-dos-requisitos-funcionais-aos-casos-de-uso"></span>
<span id="82-lista-de-requisitos-nao-funcionais-especificacao-suplementar"></span>
<span id="83-arvore-de-rastreabilidade"></span>
## 8.2 Árvore de Rastreabilidade

A árvore de rastreabilidade a seguir mapeia a conexão estruturada entre os níveis de abstração do **SIGMA**: **Problema Central → Objetivos Específicos (OE) → Características do Produto (CP) → Casos de Uso (UC)** e os respectivos **Requisitos Funcionais (RF)** e **Requisitos Não Funcionais (RNF)**.

Os nós dos Casos de Uso e dos Requisitos são **interativos e clicáveis**:
- Clicar em um **Caso de Uso** direciona imediatamente para o seu card detalhado nesta página.
- Clicar em um **Requisito Funcional (RF)** ou **Não Funcional (RNF)** abre o seu respectivo modal interativo com detalhes técnicos e regras de negócio.

=== "Visão Geral Estrutural (Problema a Casos de Uso)"

    ```mermaid
    flowchart TD
        PROB["Problema Central:<br/>Gestão Manual de Fichas e Perda de Históricos"]

        subgraph OBJETIVOS["Objetivos Específicos (OE)"]
            OE1["OE.1: Agilidade e Organização Administrativa"]
            OE2["OE.2: Preservação e Histórico de Matrículas"]
            OE3["OE.3: Segurança, Acesso e LGPD"]
            OE4["OE.4: Comunicação e Estrutura Escolar"]
        end

        subgraph CARACTERISTICAS["Características do Produto (CP)"]
            CP1["CP1: Concepção de Cards de Matrícula"]
            CP2["CP2: Edição e Atualização de Cards"]
            CP3["CP3: Consulta de Informações dos Cards"]
            CP4["CP4: Controle de Acesso de Usuários"]
            CP5["CP5: Gerenciamento de Documentos Digitais"]
            CP6["CP6: Mural de Avisos Rápidos"]
            CP7["CP7: Gerenciamento de Turmas e Etapas"]
            CP8["CP8: Auditoria e Integridade dos Dados"]
        end

        subgraph CASOS_USO["Casos de Uso (UC)"]
            UC01["UC01: Gerenciar Autenticação (MVP)"]
            UC02["UC02: Gerenciar Usuários Administrativos (MVP)"]
            UC03["UC03: Gerenciar Quadro de Avisos (Pós-MVP)"]
            UC04["UC04: Gerenciar Fichas de Matrícula (MVP)"]
            UC05["UC05: Gerenciar Documentos Digitais (MVP)"]
            UC06["UC06: Gerenciar Estrutura Escolar (MVP)"]
            UC07["UC07: Alocar Alunos (MVP)"]
            UC08["UC08: Consultar Registros - Busca (MVP)"]
        end

        PROB --> OE1
        PROB --> OE2
        PROB --> OE3
        PROB --> OE4

        OE1 --> CP2
        OE1 --> CP3
        OE2 --> CP1
        OE2 --> CP5
        OE3 --> CP4
        OE3 --> CP8
        OE4 --> CP6
        OE4 --> CP7
        OE1 -.-> CP7

        CP4 --> UC01
        CP4 --> UC02
        CP6 --> UC03
        CP1 --> UC04
        CP2 --> UC04
        CP8 --> UC04
        CP5 --> UC05
        CP7 --> UC06
        CP7 --> UC07
        CP1 --> UC07
        CP3 --> UC08
        CP7 --> UC08

        classDef prob fill:#135C7D,stroke:#09394F,stroke-width:2px,color:#ffffff,font-weight:bold;
        classDef oe fill:#27829C,stroke:#195C70,stroke-width:2px,color:#ffffff,font-weight:bold;
        classDef cp fill:#D5F0FD,stroke:#27829C,stroke-width:2px,color:#031921,font-weight:bold;
        classDef ucMvp fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d,font-weight:bold;
        classDef ucPos fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f,font-weight:bold;

        class PROB prob;
        class OE1,OE2,OE3,OE4 oe;
        class CP1,CP2,CP3,CP4,CP5,CP6,CP7,CP8 cp;
        class UC01,UC02,UC04,UC05,UC06,UC07,UC08 ucMvp;
        class UC03 ucPos;

        click UC01 href "#uc01" "Ver UC01 no catálogo"
        click UC02 href "#uc02" "Ver UC02 no catálogo"
        click UC03 href "#uc03" "Ver UC03 no catálogo"
        click UC04 href "#uc04" "Ver UC04 no catálogo"
        click UC05 href "#uc05" "Ver UC05 no catálogo"
        click UC06 href "#uc06" "Ver UC06 no catálogo"
        click UC07 href "#uc07" "Ver UC07 no catálogo"
        click UC08 href "#uc08" "Ver UC08 no catálogo"
    ```

=== "Eixo Matrículas e Documentos"

    ```mermaid
    flowchart LR
        subgraph CPS_MAT["Características"]
            CP1["CP1: Concepção de Cards"]
            CP2["CP2: Edição de Cards"]
            CP3["CP3: Consulta de Cards"]
            CP5["CP5: Documentos Digitais"]
            CP7["CP7: Turmas e Etapas"]
            CP8["CP8: Auditoria e Integridade"]
        end

        subgraph UCS_MAT["Casos de Uso"]
            UC04["UC04: Gerenciar Fichas (MVP)"]
            UC05["UC05: Documentos Digitais (MVP)"]
            UC07["UC07: Alocar Alunos (MVP)"]
            UC08["UC08: Consulta e Busca (MVP)"]
        end

        subgraph RFS_MAT["Requisitos Funcionais"]
            RF08["RF08: Cadastrar Card"]
            RF09["RF09: Preencher Fichas"]
            RF10["RF10: Editar Fichas"]
            RF11["RF11: Inativar Card"]
            RF12["RF12: Reativar Card"]
            RF17["RF17: Histórico"]
            RF23["RF23: Confirmação Salvar"]
            RF14["RF14: Anexar Documento"]
            RF15["RF15: Substituir Doc"]
            RF16["RF16: Baixar PDF"]
            RF13["RF13: Vincular Turma"]
            RF21["RF21: Buscar Aluno"]
            RF22["RF22: Buscar Turma"]
        end

        subgraph RNFS_MAT["Requisitos Não Funcionais"]
            RNF01["RNF01: LGPD"]
            RNF02["RNF02: Acesso Restrito"]
            RNF03["RNF03: Responsivo"]
            RNF06["RNF06: Busca menor 2s"]
            RNF07["RNF07: Busca Turma menor 2s"]
            RNF08["RNF08: Salvar menor 5s"]
        end

        CP1 --> UC04
        CP2 --> UC04
        CP8 --> UC04
        CP5 --> UC05
        CP7 --> UC07
        CP1 --> UC07
        CP3 --> UC08
        CP7 --> UC08

        UC04 --> RF08
        UC04 --> RF09
        UC04 --> RF10
        UC04 --> RF11
        UC04 --> RF12
        UC04 --> RF17
        UC04 --> RF23
        UC04 -.-> RNF01
        UC04 -.-> RNF02
        UC04 -.-> RNF03
        UC04 -.-> RNF08

        UC05 --> RF14
        UC05 --> RF15
        UC05 --> RF16
        UC05 -.-> RNF01
        UC05 -.-> RNF02

        UC07 --> RF13
        UC07 --> RF21
        UC07 --> RF22
        UC07 -.-> RNF02
        UC07 -.-> RNF06
        UC07 -.-> RNF07

        UC08 --> RF21
        UC08 --> RF22
        UC08 -.-> RNF02
        UC08 -.-> RNF06
        UC08 -.-> RNF07

        classDef cp fill:#D5F0FD,stroke:#27829C,stroke-width:1px,color:#031921,font-weight:bold;
        classDef uc fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d,font-weight:bold;
        classDef rf fill:#f1f5f9,stroke:#0284c7,stroke-width:1px,color:#0369a1;
        classDef rnf fill:#ffedd5,stroke:#ea580c,stroke-width:1px,color:#9a3412;

        class CP1,CP2,CP3,CP5,CP7,CP8 cp;
        class UC04,UC05,UC07,UC08 uc;
        class RF08,RF09,RF10,RF11,RF12,RF17,RF23,RF14,RF15,RF16,RF13,RF21,RF22 rf;
        class RNF01,RNF02,RNF03,RNF06,RNF07,RNF08 rnf;

        click UC04 href "#uc04" "Ver UC04 no catálogo"
        click UC05 href "#uc05" "Ver UC05 no catálogo"
        click UC07 href "#uc07" "Ver UC07 no catálogo"
        click UC08 href "#uc08" "Ver UC08 no catálogo"
        click RF08 href "#rf08" "Abrir modal do RF08"
        click RF09 href "#rf09" "Abrir modal do RF09"
        click RF10 href "#rf10" "Abrir modal do RF10"
        click RF11 href "#rf11" "Abrir modal do RF11"
        click RF12 href "#rf12" "Abrir modal do RF12"
        click RF17 href "#rf17" "Abrir modal do RF17"
        click RF23 href "#rf23" "Abrir modal do RF23"
        click RF14 href "#rf14" "Abrir modal do RF14"
        click RF15 href "#rf15" "Abrir modal do RF15"
        click RF16 href "#rf16" "Abrir modal do RF16"
        click RF13 href "#rf13" "Abrir modal do RF13"
        click RF21 href "#rf21" "Abrir modal do RF21"
        click RF22 href "#rf22" "Abrir modal do RF22"
        click RNF01 href "#rnf01" "Abrir modal do RNF01"
        click RNF02 href "#rnf02" "Abrir modal do RNF02"
        click RNF03 href "#rnf03" "Abrir modal do RNF03"
        click RNF06 href "#rnf06" "Abrir modal do RNF06"
        click RNF07 href "#rnf07" "Abrir modal do RNF07"
        click RNF08 href "#rnf08" "Abrir modal do RNF08"
    ```

=== "Eixo Segurança e Controle de Acesso"

    ```mermaid
    flowchart LR
        subgraph CPS_SEG["Características"]
            CP4["CP4: Controle de Acesso"]
            CP8["CP8: Auditoria e Integridade"]
        end

        subgraph UCS_SEG["Casos de Uso"]
            UC01["UC01: Gerenciar Autenticação (MVP)"]
            UC02["UC02: Gerenciar Usuários Administrativos (MVP)"]
        end

        subgraph RFS_SEG["Requisitos Funcionais"]
            RF06["RF06: Realizar Login"]
            RF07["RF07: Realizar Logout"]
            RF05["RF05: Cadastrar Usuários"]
        end

        subgraph RNFS_SEG["Requisitos Não Funcionais"]
            RNF01["RNF01: Proteção e Privacidade LGPD"]
            RNF02["RNF02: Restrição Acesso Não Autenticado"]
            RNF05["RNF05: Tempo Resposta Login menor 2s"]
        end

        CP4 --> UC01
        CP4 --> UC02
        CP8 --> UC02

        UC01 --> RF06
        UC01 --> RF07
        UC01 -.-> RNF01
        UC01 -.-> RNF02
        UC01 -.-> RNF05

        UC02 --> RF05
        UC02 -.-> RNF01
        UC02 -.-> RNF02

        classDef cp fill:#D5F0FD,stroke:#27829C,stroke-width:1px,color:#031921,font-weight:bold;
        classDef uc fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d,font-weight:bold;
        classDef rf fill:#f1f5f9,stroke:#0284c7,stroke-width:1px,color:#0369a1;
        classDef rnf fill:#ffedd5,stroke:#ea580c,stroke-width:1px,color:#9a3412;

        class CP4,CP8 cp;
        class UC01,UC02 uc;
        class RF05,RF06,RF07 rf;
        class RNF01,RNF02,RNF05 rnf;

        click UC01 href "#uc01" "Ver UC01 no catálogo"
        click UC02 href "#uc02" "Ver UC02 no catálogo"
        click RF05 href "#rf05" "Abrir modal do RF05"
        click RF06 href "#rf06" "Abrir modal do RF06"
        click RF07 href "#rf07" "Abrir modal do RF07"
        click RNF01 href "#rnf01" "Abrir modal do RNF01"
        click RNF02 href "#rnf02" "Abrir modal do RNF02"
        click RNF05 href "#rnf05" "Abrir modal do RNF05"
    ```

=== "Eixo Estrutura Escolar e Comunicação"

    ```mermaid
    flowchart LR
        subgraph CPS_EST["Características"]
            CP6["CP6: Avisos Rápidos"]
            CP7["CP7: Turmas e Etapas"]
        end

        subgraph UCS_EST["Casos de Uso"]
            UC03["UC03: Gerenciar Quadro de Avisos (Pós-MVP)"]
            UC06["UC06: Gerenciar Estrutura Escolar (MVP)"]
        end

        subgraph RFS_EST["Requisitos Funcionais"]
            RF01["RF01: Disponibilizar Quadro"]
            RF02["RF02: Lançar Avisos"]
            RF03["RF03: Exibir Avisos"]
            RF04["RF04: Apagar Avisos"]
            RF18["RF18: Cadastrar Etapa"]
            RF19["RF19: Inativar Turma e Etapa"]
            RF20["RF20: Vincular Turma à Etapa"]
            RF24["RF24: Cadastrar Turma"]
        end

        subgraph RNFS_EST["Requisitos Não Funcionais"]
            RNF01["RNF01: LGPD"]
            RNF02["RNF02: Acesso Restrito"]
            RNF07["RNF07: Tempo Busca Turmas menor 2s"]
        end

        CP6 --> UC03
        CP7 --> UC06

        UC03 --> RF01
        UC03 --> RF02
        UC03 --> RF03
        UC03 --> RF04
        UC03 -.-> RNF01
        UC03 -.-> RNF02

        UC06 --> RF18
        UC06 --> RF19
        UC06 --> RF20
        UC06 --> RF24
        UC06 -.-> RNF02
        UC06 -.-> RNF07

        classDef cp fill:#D5F0FD,stroke:#27829C,stroke-width:1px,color:#031921,font-weight:bold;
        classDef ucMvp fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d,font-weight:bold;
        classDef ucPos fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f,font-weight:bold;
        classDef rf fill:#f1f5f9,stroke:#0284c7,stroke-width:1px,color:#0369a1;
        classDef rnf fill:#ffedd5,stroke:#ea580c,stroke-width:1px,color:#9a3412;

        class CP6,CP7 cp;
        class UC06 ucMvp;
        class UC03 ucPos;
        class RF01,RF02,RF03,RF04,RF18,RF19,RF20,RF24 rf;
        class RNF01,RNF02,RNF07 rnf;

        click UC03 href "#uc03" "Ver UC03 no catálogo"
        click UC06 href "#uc06" "Ver UC06 no catálogo"
        click RF01 href "#rf01" "Abrir modal do RF01"
        click RF02 href "#rf02" "Abrir modal do RF02"
        click RF03 href "#rf03" "Abrir modal do RF03"
        click RF04 href "#rf04" "Abrir modal do RF04"
        click RF18 href "#rf18" "Abrir modal do RF18"
        click RF19 href "#rf19" "Abrir modal do RF19"
        click RF20 href "#rf20" "Abrir modal do RF20"
        click RF24 href "#rf24" "Abrir modal do RF24"
        click RNF01 href "#rnf01" "Abrir modal do RNF01"
        click RNF02 href "#rnf02" "Abrir modal do RNF02"
        click RNF07 href "#rnf07" "Abrir modal do RNF07"
    ```

