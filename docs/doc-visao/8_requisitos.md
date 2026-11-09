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

<div class="catalogo-panel">

  <!-- UC01 -->
  <div class="catalogo-card">
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
  <div class="catalogo-card">
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
  <div class="catalogo-card">
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
  <div class="catalogo-card">
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
  <div class="catalogo-card">
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
  <div class="catalogo-card">
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
  <div class="catalogo-card">
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
  <div class="catalogo-card">
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

---

<span id="83-rastreabilidade-dos-requisitos-funcionais-aos-casos-de-uso"></span>
<span id="82-lista-de-requisitos-nao-funcionais-especificacao-suplementar"></span>
<span id="83-arvore-de-rastreabilidade"></span>
## 8.2 Árvore de Rastreabilidade

A representação gráfica abaixo conecta o problema, objetivos específicos (OEs), características do produto (CPs) e os requisitos no Miro:

<iframe width="100%" height="650" src="https://miro.com/app/live-embed/uXjVEbrie7A=/" frameborder="0" scrolling="no" allow="fullscreen; clipboard-read; clipboard-write" allowfullscreen title="Árvore de Rastreabilidade no Miro"></iframe>

:material-open-in-new: **[Abrir Árvore de Rastreabilidade diretamente no Miro](https://miro.com/app/board/uXjVEbrie7A=/)**

---

### Captura da Árvore de Rastreabilidade

![Árvore de Rastreabilidade](../assets/arvore_rastreabilidade.png)

<p align="center"><em>Registro atualizado da rastreabilidade estrutural dos requisitos do SIGMA.</em></p>
