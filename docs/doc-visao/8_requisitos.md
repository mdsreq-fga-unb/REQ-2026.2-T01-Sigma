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

        subgraph PILAR1["Eixo Matrículas e Documentos"]
            direction TB
            OE_MAT["OE.1 e OE.2: Agilidade e Preservação de Históricos"]
            CP_MAT["CP1, CP2, CP5, CP8:<br/>Cards, Edição, Docs Digitais e Integridade"]
            UC04["UC04: Gerenciar Fichas de Matrícula (MVP)"]
            UC05["UC05: Gerenciar Documentos Digitais (MVP)"]
            OE_MAT --> CP_MAT
            CP_MAT --> UC04
            CP_MAT --> UC05
        end

        subgraph PILAR2["Eixo Estrutura e Alocação"]
            direction TB
            OE_EST["OE.1 e OE.4: Organização e Estrutura Escolar"]
            CP_EST["CP3, CP7:<br/>Consulta de Informações, Turmas e Etapas"]
            UC06["UC06: Gerenciar Estrutura Escolar (MVP)"]
            UC07["UC07: Alocar Alunos (MVP)"]
            UC08["UC08: Consultar Registros - Busca (MVP)"]
            OE_EST --> CP_EST
            CP_EST --> UC06
            CP_EST --> UC07
            CP_EST --> UC08
        end

        subgraph PILAR3["Eixo Segurança e Comunicação"]
            direction TB
            OE_SEG["OE.3 e OE.4: Segurança, LGPD e Comunicação"]
            CP_SEG["CP4, CP6:<br/>Controle de Acesso e Mural de Avisos"]
            UC01["UC01: Gerenciar Autenticação (MVP)"]
            UC02["UC02: Gerenciar Usuários Administrativos (MVP)"]
            UC03["UC03: Gerenciar Quadro de Avisos (Pós-MVP)"]
            OE_SEG --> CP_SEG
            CP_SEG --> UC01
            CP_SEG --> UC02
            CP_SEG --> UC03
        end

        PROB --> OE_MAT
        PROB --> OE_EST
        PROB --> OE_SEG

        classDef node--prob stroke-width:2px;
        classDef node--oe stroke-width:2px;
        classDef node--cp stroke-width:1.5px;
        classDef node--uc stroke-width:2px;
        classDef node--pos stroke-width:2px;

        class PROB node--prob;
        class OE_MAT,OE_EST,OE_SEG node--oe;
        class CP_MAT,CP_EST,CP_SEG node--cp;
        class UC01,UC02,UC04,UC05,UC06,UC07,UC08 node--uc;
        class UC03 node--pos;

        click UC01 href "#uc01" "Ver UC01 no catálogo"
        click UC02 href "#uc02" "Ver UC02 no catálogo"
        click UC03 href "#uc03" "Ver UC03 no catálogo"
        click UC04 href "#uc04" "Ver UC04 no catálogo"
        click UC05 href "#uc05" "Ver UC05 no catálogo"
        click UC06 href "#uc06" "Ver UC06 no catálogo"
        click UC07 href "#uc07" "Ver UC07 no catálogo"
        click UC08 href "#uc08" "Ver UC08 no catálogo"
    ```

=== "Matrículas e Documentos (UC04 e UC05)"

    ```mermaid
    flowchart TD
        subgraph ARVORE_UC04["Árvore UC04: Gerenciar Fichas de Matrícula (MVP)"]
            direction TB
            CP_UC04["Características:<br/>CP1 (Concepção), CP2 (Edição), CP8 (Integridade)"]
            UC04_NODE["UC04: Gerenciar Fichas de Matrícula"]
            CP_UC04 --> UC04_NODE

            subgraph RFS_UC04["Requisitos Funcionais (RF)"]
                direction TB
                RF08["RF08: Cadastrar Card de Matrícula"]
                RF09["RF09: Preencher Fichas dos Alunos"]
                RF10["RF10: Editar Fichas dos Alunos"]
                RF11["RF11: Inativar Card de Matrícula"]
                RF12["RF12: Reativar Card de Matrícula"]
                RF17["RF17: Registrar Histórico de Alterações"]
                RF23["RF23: Exibir Confirmação ao Salvar"]
            end

            subgraph RNFS_UC04["Requisitos Não Funcionais (RNF)"]
                direction TB
                RNF01_4["RNF01: Proteção e Privacidade LGPD"]
                RNF02_4["RNF02: Restrição de Acesso Autenticado"]
                RNF03_4["RNF03: Interface Responsiva"]
                RNF08_4["RNF08: Tempo de Salvamento menor que 5s"]
            end

            UC04_NODE --> RF08
            UC04_NODE --> RF09
            UC04_NODE --> RF10
            UC04_NODE --> RF11
            UC04_NODE --> RF12
            UC04_NODE --> RF17
            UC04_NODE --> RF23

            UC04_NODE -.-> RNF01_4
            UC04_NODE -.-> RNF02_4
            UC04_NODE -.-> RNF03_4
            UC04_NODE -.-> RNF08_4
        end

        subgraph ARVORE_UC05["Árvore UC05: Gerenciar Documentos Digitais (MVP)"]
            direction TB
            CP_UC05["Características:<br/>CP5 (Documentos Digitais), CP8 (Integridade)"]
            UC05_NODE["UC05: Gerenciar Documentos Digitais"]
            CP_UC05 --> UC05_NODE

            subgraph RFS_UC05["Requisitos Funcionais (RF)"]
                direction TB
                RF14["RF14: Anexar Documento Digital"]
                RF15["RF15: Substituir Documento Digital"]
                RF16["RF16: Baixar Documento em PDF"]
            end

            subgraph RNFS_UC05["Requisitos Não Funcionais (RNF)"]
                direction TB
                RNF01_5["RNF01: Proteção e Privacidade LGPD"]
                RNF02_5["RNF02: Restrição de Acesso Autenticado"]
            end

            UC05_NODE --> RF14
            UC05_NODE --> RF15
            UC05_NODE --> RF16

            UC05_NODE -.-> RNF01_5
            UC05_NODE -.-> RNF02_5
        end

        classDef node--cp stroke-width:1.5px;
        classDef node--uc stroke-width:2px;
        classDef node--rf stroke-width:1.5px;
        classDef node--rnf stroke-width:1.5px;

        class CP_UC04,CP_UC05 node--cp;
        class UC04_NODE,UC05_NODE node--uc;
        class RF08,RF09,RF10,RF11,RF12,RF17,RF23,RF14,RF15,RF16 node--rf;
        class RNF01_4,RNF02_4,RNF03_4,RNF08_4,RNF01_5,RNF02_5 node--rnf;

        click UC04_NODE href "#uc04" "Ver UC04 no catálogo"
        click UC05_NODE href "#uc05" "Ver UC05 no catálogo"
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
        click RNF01_4 href "#rnf01" "Abrir modal do RNF01"
        click RNF02_4 href "#rnf02" "Abrir modal do RNF02"
        click RNF03_4 href "#rnf03" "Abrir modal do RNF03"
        click RNF08_4 href "#rnf08" "Abrir modal do RNF08"
        click RNF01_5 href "#rnf01" "Abrir modal do RNF01"
        click RNF02_5 href "#rnf02" "Abrir modal do RNF02"
    ```

=== "Estrutura e Alocação (UC06, UC07 e UC08)"

    ```mermaid
    flowchart TD
        subgraph ARVORE_UC06["Árvore UC06: Gerenciar Estrutura Escolar (MVP)"]
            direction TB
            CP_UC06["Características:<br/>CP7 (Gerenciamento de Turmas e Etapas)"]
            UC06_NODE["UC06: Gerenciar Estrutura Escolar"]
            CP_UC06 --> UC06_NODE

            subgraph RFS_UC06["Requisitos Funcionais (RF)"]
                direction TB
                RF18["RF18: Cadastrar Etapa Escolar"]
                RF19["RF19: Inativar Turma e Etapa"]
                RF20["RF20: Vincular Turma à Etapa"]
                RF24["RF24: Cadastrar Turma"]
            end

            subgraph RNFS_UC06["Requisitos Não Funcionais (RNF)"]
                direction TB
                RNF02_6["RNF02: Restrição de Acesso Autenticado"]
                RNF07_6["RNF07: Tempo de Busca de Turmas menor que 2s"]
            end

            UC06_NODE --> RF18
            UC06_NODE --> RF19
            UC06_NODE --> RF20
            UC06_NODE --> RF24

            UC06_NODE -.-> RNF02_6
            UC06_NODE -.-> RNF07_6
        end

        subgraph ARVORE_UC07["Árvore UC07: Alocar Alunos (MVP)"]
            direction TB
            CP_UC07["Características:<br/>CP1 (Concepção de Cards), CP7 (Turmas e Etapas)"]
            UC07_NODE["UC07: Alocar Alunos"]
            CP_UC07 --> UC07_NODE

            subgraph RFS_UC07["Requisitos Funcionais (RF)"]
                direction TB
                RF13["RF13: Vincular Turma à Ficha"]
                RF21_7["RF21: Buscar Aluno por Nome ou Matrícula"]
                RF22_7["RF22: Buscar Turmas Cadastradas"]
            end

            subgraph RNFS_UC07["Requisitos Não Funcionais (RNF)"]
                direction TB
                RNF02_7["RNF02: Restrição de Acesso Autenticado"]
                RNF06_7["RNF06: Tempo de Busca de Alunos menor que 2s"]
                RNF07_7["RNF07: Tempo de Busca de Turmas menor que 2s"]
            end

            UC07_NODE --> RF13
            UC07_NODE --> RF21_7
            UC07_NODE --> RF22_7

            UC07_NODE -.-> RNF02_7
            UC07_NODE -.-> RNF06_7
            UC07_NODE -.-> RNF07_7
        end

        subgraph ARVORE_UC08["Árvore UC08: Consultar Registros - Busca (MVP)"]
            direction TB
            CP_UC08["Características:<br/>CP3 (Consulta de Cards), CP7 (Turmas e Etapas)"]
            UC08_NODE["UC08: Consultar Registros - Busca"]
            CP_UC08 --> UC08_NODE

            subgraph RFS_UC08["Requisitos Funcionais (RF)"]
                direction TB
                RF21_8["RF21: Buscar Aluno por Nome ou Matrícula"]
                RF22_8["RF22: Buscar Turmas Cadastradas"]
            end

            subgraph RNFS_UC08["Requisitos Não Funcionais (RNF)"]
                direction TB
                RNF02_8["RNF02: Restrição de Acesso Autenticado"]
                RNF06_8["RNF06: Tempo de Busca de Alunos menor que 2s"]
                RNF07_8["RNF07: Tempo de Busca de Turmas menor que 2s"]
            end

            UC08_NODE --> RF21_8
            UC08_NODE --> RF22_8

            UC08_NODE -.-> RNF02_8
            UC08_NODE -.-> RNF06_8
            UC08_NODE -.-> RNF07_8
        end

        classDef node--cp stroke-width:1.5px;
        classDef node--uc stroke-width:2px;
        classDef node--rf stroke-width:1.5px;
        classDef node--rnf stroke-width:1.5px;

        class CP_UC06,CP_UC07,CP_UC08 node--cp;
        class UC06_NODE,UC07_NODE,UC08_NODE node--uc;
        class RF18,RF19,RF20,RF24,RF13,RF21_7,RF22_7,RF21_8,RF22_8 node--rf;
        class RNF02_6,RNF07_6,RNF02_7,RNF06_7,RNF07_7,RNF02_8,RNF06_8,RNF07_8 node--rnf;

        click UC06_NODE href "#uc06" "Ver UC06 no catálogo"
        click UC07_NODE href "#uc07" "Ver UC07 no catálogo"
        click UC08_NODE href "#uc08" "Ver UC08 no catálogo"
        click RF18 href "#rf18" "Abrir modal do RF18"
        click RF19 href "#rf19" "Abrir modal do RF19"
        click RF20 href "#rf20" "Abrir modal do RF20"
        click RF24 href "#rf24" "Abrir modal do RF24"
        click RF13 href "#rf13" "Abrir modal do RF13"
        click RF21_7 href "#rf21" "Abrir modal do RF21"
        click RF22_7 href "#rf22" "Abrir modal do RF22"
        click RF21_8 href "#rf21" "Abrir modal do RF21"
        click RF22_8 href "#rf22" "Abrir modal do RF22"
        click RNF02_6 href "#rnf02" "Abrir modal do RNF02"
        click RNF07_6 href "#rnf07" "Abrir modal do RNF07"
        click RNF02_7 href "#rnf02" "Abrir modal do RNF02"
        click RNF06_7 href "#rnf06" "Abrir modal do RNF06"
        click RNF07_7 href "#rnf07" "Abrir modal do RNF07"
        click RNF02_8 href "#rnf02" "Abrir modal do RNF02"
        click RNF06_8 href "#rnf06" "Abrir modal do RNF06"
        click RNF07_8 href "#rnf07" "Abrir modal do RNF07"
    ```

=== "Segurança e Comunicação (UC01, UC02 e UC03)"

    ```mermaid
    flowchart TD
        subgraph ARVORE_UC01["Árvore UC01: Gerenciar Autenticação (MVP)"]
            direction TB
            CP_UC01["Características:<br/>CP4 (Controle de Acesso de Usuários)"]
            UC01_NODE["UC01: Gerenciar Autenticação"]
            CP_UC01 --> UC01_NODE

            subgraph RFS_UC01["Requisitos Funcionais (RF)"]
                direction TB
                RF06["RF06: Realizar Login"]
                RF07["RF07: Realizar Logout"]
            end

            subgraph RNFS_UC01["Requisitos Não Funcionais (RNF)"]
                direction TB
                RNF01_1["RNF01: Proteção e Privacidade LGPD"]
                RNF02_1["RNF02: Restrição de Acesso Autenticado"]
                RNF05_1["RNF05: Tempo de Resposta de Login menor que 2s"]
            end

            UC01_NODE --> RF06
            UC01_NODE --> RF07

            UC01_NODE -.-> RNF01_1
            UC01_NODE -.-> RNF02_1
            UC01_NODE -.-> RNF05_1
        end

        subgraph ARVORE_UC02["Árvore UC02: Gerenciar Usuários Administrativos (MVP)"]
            direction TB
            CP_UC02["Características:<br/>CP4 (Controle de Acesso), CP8 (Auditoria)"]
            UC02_NODE["UC02: Gerenciar Usuários Administrativos"]
            CP_UC02 --> UC02_NODE

            subgraph RFS_UC02["Requisitos Funcionais (RF)"]
                direction TB
                RF05["RF05: Cadastrar Usuários Administrativos"]
            end

            subgraph RNFS_UC02["Requisitos Não Funcionais (RNF)"]
                direction TB
                RNF01_2["RNF01: Proteção e Privacidade LGPD"]
                RNF02_2["RNF02: Restrição de Acesso Autenticado"]
            end

            UC02_NODE --> RF05

            UC02_NODE -.-> RNF01_2
            UC02_NODE -.-> RNF02_2
        end

        subgraph ARVORE_UC03["Árvore UC03: Gerenciar Quadro de Avisos (Pós-MVP)"]
            direction TB
            CP_UC03["Características:<br/>CP6 (Mural de Avisos Rápidos)"]
            UC03_NODE["UC03: Gerenciar Quadro de Avisos"]
            CP_UC03 --> UC03_NODE

            subgraph RFS_UC03["Requisitos Funcionais (RF)"]
                direction TB
                RF01["RF01: Disponibilizar Quadro de Avisos"]
                RF02["RF02: Lançar Avisos Institucionais"]
                RF03["RF03: Exibir Avisos aos Usuários"]
                RF04["RF04: Apagar Avisos Expirados"]
            end

            subgraph RNFS_UC03["Requisitos Não Funcionais (RNF)"]
                direction TB
                RNF01_3["RNF01: Proteção e Privacidade LGPD"]
                RNF02_3["RNF02: Restrição de Acesso Autenticado"]
            end

            UC03_NODE --> RF01
            UC03_NODE --> RF02
            UC03_NODE --> RF03
            UC03_NODE --> RF04

            UC03_NODE -.-> RNF01_3
            UC03_NODE -.-> RNF02_3
        end

        classDef node--cp stroke-width:1.5px;
        classDef node--uc stroke-width:2px;
        classDef node--pos stroke-width:2px;
        classDef node--rf stroke-width:1.5px;
        classDef node--rnf stroke-width:1.5px;

        class CP_UC01,CP_UC02,CP_UC03 node--cp;
        class UC01_NODE,UC02_NODE node--uc;
        class UC03_NODE node--pos;
        class RF06,RF07,RF05,RF01,RF02,RF03,RF04 node--rf;
        class RNF01_1,RNF02_1,RNF05_1,RNF01_2,RNF02_2,RNF01_3,RNF02_3 node--rnf;

        click UC01_NODE href "#uc01" "Ver UC01 no catálogo"
        click UC02_NODE href "#uc02" "Ver UC02 no catálogo"
        click UC03_NODE href "#uc03" "Ver UC03 no catálogo"
        click RF06 href "#rf06" "Abrir modal do RF06"
        click RF07 href "#rf07" "Abrir modal do RF07"
        click RF05 href "#rf05" "Abrir modal do RF05"
        click RF01 href "#rf01" "Abrir modal do RF01"
        click RF02 href "#rf02" "Abrir modal do RF02"
        click RF03 href "#rf03" "Abrir modal do RF03"
        click RF04 href "#rf04" "Abrir modal do RF04"
        click RNF01_1 href "#rnf01" "Abrir modal do RNF01"
        click RNF02_1 href "#rnf02" "Abrir modal do RNF02"
        click RNF05_1 href "#rnf05" "Abrir modal do RNF05"
        click RNF01_2 href "#rnf01" "Abrir modal do RNF01"
        click RNF02_2 href "#rnf02" "Abrir modal do RNF02"
        click RNF01_3 href "#rnf01" "Abrir modal do RNF01"
        click RNF02_3 href "#rnf02" "Abrir modal do RNF02"
    ```

---

### 8.2.1 Matriz Resumo de Rastreabilidade

A matriz a seguir consolida a rastreabilidade bidirecional completa do sistema. Todos os itens de requisitos e regras de negócio possuem chips interativos que abrem seus respectivos modais detalhados ao serem clicados:

| Caso de Uso | MVP | Características (CP) | Objetivos Específicos (OE) | Requisitos Funcionais (RF) | Requisitos Não Funcionais (RNF) | Regras de Negócio (RN) |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| [UC01: Gerenciar Autenticação](#uc01) | <span class="badge-mvp badge-mvp--sim">Sim</span> | [CP4](2_solucao.md#23-caracteristicas-de-produto) | [OE.3](2_solucao.md#22-objetivos-especificos-oe-do-produto) | <button type="button" class="chip chip--rf" data-modal-id="RF06">RF06</button> <button type="button" class="chip chip--rf" data-modal-id="RF07">RF07</button> | <button type="button" class="chip chip--rnf" data-modal-id="RNF01">RNF01</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF02">RNF02</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF05">RNF05</button> | <button type="button" class="chip chip--rn" data-modal-id="RN16">RN16</button> <button type="button" class="chip chip--rn" data-modal-id="RN17">RN17</button> <button type="button" class="chip chip--rn" data-modal-id="RN18">RN18</button> |
| [UC02: Gerenciar Usuários Administrativos](#uc02) | <span class="badge-mvp badge-mvp--sim">Sim</span> | [CP4](2_solucao.md#23-caracteristicas-de-produto), [CP8](2_solucao.md#23-caracteristicas-de-produto) | [OE.3](2_solucao.md#22-objetivos-especificos-oe-do-produto) | <button type="button" class="chip chip--rf" data-modal-id="RF05">RF05</button> | <button type="button" class="chip chip--rnf" data-modal-id="RNF01">RNF01</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF02">RNF02</button> | <button type="button" class="chip chip--rn" data-modal-id="RN13">RN13</button> <button type="button" class="chip chip--rn" data-modal-id="RN14">RN14</button> <button type="button" class="chip chip--rn" data-modal-id="RN15">RN15</button> |
| [UC03: Gerenciar Quadro de Avisos](#uc03) | <span class="badge-mvp badge-mvp--nao">Não</span> | [CP6](2_solucao.md#23-caracteristicas-de-produto) | [OE.4](2_solucao.md#22-objetivos-especificos-oe-do-produto) | <button type="button" class="chip chip--rf" data-modal-id="RF01">RF01</button> <button type="button" class="chip chip--rf" data-modal-id="RF02">RF02</button> <button type="button" class="chip chip--rf" data-modal-id="RF03">RF03</button> <button type="button" class="chip chip--rf" data-modal-id="RF04">RF04</button> | <button type="button" class="chip chip--rnf" data-modal-id="RNF01">RNF01</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF02">RNF02</button> | <button type="button" class="chip chip--rn" data-modal-id="RN19">RN19</button> <button type="button" class="chip chip--rn" data-modal-id="RN20">RN20</button> <button type="button" class="chip chip--rn" data-modal-id="RN21">RN21</button> <button type="button" class="chip chip--rn" data-modal-id="RN22">RN22</button> |
| [UC04: Gerenciar Fichas de Matrícula](#uc04) | <span class="badge-mvp badge-mvp--sim">Sim</span> | [CP1](2_solucao.md#23-caracteristicas-de-produto), [CP2](2_solucao.md#23-caracteristicas-de-produto), [CP8](2_solucao.md#23-caracteristicas-de-produto) | [OE.1](2_solucao.md#22-objetivos-especificos-oe-do-produto), [OE.2](2_solucao.md#22-objetivos-especificos-oe-do-produto) | <button type="button" class="chip chip--rf" data-modal-id="RF08">RF08</button> <button type="button" class="chip chip--rf" data-modal-id="RF09">RF09</button> <button type="button" class="chip chip--rf" data-modal-id="RF10">RF10</button> <button type="button" class="chip chip--rf" data-modal-id="RF11">RF11</button> <button type="button" class="chip chip--rf" data-modal-id="RF12">RF12</button> <button type="button" class="chip chip--rf" data-modal-id="RF17">RF17</button> <button type="button" class="chip chip--rf" data-modal-id="RF23">RF23</button> | <button type="button" class="chip chip--rnf" data-modal-id="RNF01">RNF01</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF02">RNF02</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF03">RNF03</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF08">RNF08</button> | <button type="button" class="chip chip--rn" data-modal-id="RN01">RN01</button> <button type="button" class="chip chip--rn" data-modal-id="RN02">RN02</button> <button type="button" class="chip chip--rn" data-modal-id="RN03">RN03</button> <button type="button" class="chip chip--rn" data-modal-id="RN04">RN04</button> <button type="button" class="chip chip--rn" data-modal-id="RN05">RN05</button> <button type="button" class="chip chip--rn" data-modal-id="RN06">RN06</button> <button type="button" class="chip chip--rn" data-modal-id="RN07">RN07</button> <button type="button" class="chip chip--rn" data-modal-id="RN08">RN08</button> <button type="button" class="chip chip--rn" data-modal-id="RN12">RN12</button> |
| [UC05: Gerenciar Documentos Digitais](#uc05) | <span class="badge-mvp badge-mvp--sim">Sim</span> | [CP5](2_solucao.md#23-caracteristicas-de-produto), [CP8](2_solucao.md#23-caracteristicas-de-produto) | [OE.2](2_solucao.md#22-objetivos-especificos-oe-do-produto) | <button type="button" class="chip chip--rf" data-modal-id="RF14">RF14</button> <button type="button" class="chip chip--rf" data-modal-id="RF15">RF15</button> <button type="button" class="chip chip--rf" data-modal-id="RF16">RF16</button> | <button type="button" class="chip chip--rnf" data-modal-id="RNF01">RNF01</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF02">RNF02</button> | <button type="button" class="chip chip--rn" data-modal-id="RN09">RN09</button> <button type="button" class="chip chip--rn" data-modal-id="RN10">RN10</button> <button type="button" class="chip chip--rn" data-modal-id="RN11">RN11</button> |
| [UC06: Gerenciar Estrutura Escolar](#uc06) | <span class="badge-mvp badge-mvp--sim">Sim</span> | [CP7](2_solucao.md#23-caracteristicas-de-produto) | [OE.1](2_solucao.md#22-objetivos-especificos-oe-do-produto), [OE.4](2_solucao.md#22-objetivos-especificos-oe-do-produto) | <button type="button" class="chip chip--rf" data-modal-id="RF18">RF18</button> <button type="button" class="chip chip--rf" data-modal-id="RF19">RF19</button> <button type="button" class="chip chip--rf" data-modal-id="RF20">RF20</button> <button type="button" class="chip chip--rf" data-modal-id="RF24">RF24</button> | <button type="button" class="chip chip--rnf" data-modal-id="RNF02">RNF02</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF07">RNF07</button> | <button type="button" class="chip chip--rn" data-modal-id="RN06">RN06</button> <button type="button" class="chip chip--rn" data-modal-id="RN07">RN07</button> |
| [UC07: Alocar Alunos](#uc07) | <span class="badge-mvp badge-mvp--sim">Sim</span> | [CP1](2_solucao.md#23-caracteristicas-de-produto), [CP7](2_solucao.md#23-caracteristicas-de-produto) | [OE.1](2_solucao.md#22-objetivos-especificos-oe-do-produto), [OE.4](2_solucao.md#22-objetivos-especificos-oe-do-produto) | <button type="button" class="chip chip--rf" data-modal-id="RF13">RF13</button> <button type="button" class="chip chip--rf" data-modal-id="RF21">RF21</button> <button type="button" class="chip chip--rf" data-modal-id="RF22">RF22</button> | <button type="button" class="chip chip--rnf" data-modal-id="RNF02">RNF02</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF06">RNF06</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF07">RNF07</button> | <button type="button" class="chip chip--rn" data-modal-id="RN06">RN06</button> <button type="button" class="chip chip--rn" data-modal-id="RN07">RN07</button> <button type="button" class="chip chip--rn" data-modal-id="RN08">RN08</button> |
| [UC08: Consultar Registros - Busca](#uc08) | <span class="badge-mvp badge-mvp--sim">Sim</span> | [CP3](2_solucao.md#23-caracteristicas-de-produto), [CP7](2_solucao.md#23-caracteristicas-de-produto) | [OE.1](2_solucao.md#22-objetivos-especificos-oe-do-produto) | <button type="button" class="chip chip--rf" data-modal-id="RF21">RF21</button> <button type="button" class="chip chip--rf" data-modal-id="RF22">RF22</button> | <button type="button" class="chip chip--rnf" data-modal-id="RNF02">RNF02</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF06">RNF06</button> <button type="button" class="chip chip--rnf" data-modal-id="RNF07">RNF07</button> | <button type="button" class="chip chip--rn" data-modal-id="RN01">RN01</button> <button type="button" class="chip chip--rn" data-modal-id="RN06">RN06</button> <button type="button" class="chip chip--rn" data-modal-id="RN07">RN07</button> |


