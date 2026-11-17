Tópico referente às reuniões que aconteceram durante o período da segunda unidade da matéria.


=== "18/9/2026 - levantamento de requisitos pt2"
    # Reunião 1

    >24/08/2026 · 19:00–20:30 · Microsoft Teams · Com Cliente
    
    >Link da reunião: [link da reunião ](https://drive.google.com/file/d/1EugRqtDabhgezjH6jpZ7e9RNyV-RaA_2/view?usp=drive_link)

    ## Pauta
    - Levantamento do contexto, histórico e setor de atuação da creche.
    - Identificação dos problemas e gargalos operacionais/negociais vivenciados pelo instituição.
    - Elicitação de requisitos para a nova solução de software.

    ##  Participantes

    |Nome|Papel|
    |-|-|
    |Cirlene Silva | Cliente- diretora da instituição |
    |Gabriel Vieira e equipe|Representante de desenvolvimento e time |



===  "23/9/2026 - Ata da Reunião: Engenharia de Requisitos"

    # Ata: Engenharia de Requisitos
 
    **Tema:** priorização de requisitos (valor de negócio, esforço técnico e matriz valor × esforço) para definir o MVP.
    **Duração:** ~3h30 · **Prazo:** apresentação/entrega no dia seguinte, às 8h.
    
    ## Participantes
    Gabriel Vieira Octacilio Pinheiro (condutor), Pedro Luca Rocha Manera, Joao Gabriel Rolim Veiga, Lucas Peixoto Rodrigues, Bryan Smith Rodrigues Cavalcante, Jorge Andres Vasquez Vega e Lucas Oliveira Meireles (monitor).
    
    ## Pautas
    - **Valor de negócio:** cliente ausente, dados vindos de formulário; o monitor orientou que a equipe também interprete e justifique, e confirme com o cliente depois.
    - **Esforço técnico:** três critérios (esforço/tempo, complexidade, capacidade da equipe), diferença entre complexidade e capacidade, e definição de "esforço".
    - **Matriz:** formato 2x2 vs 4x4, cores dos quadrantes, duplicados e conflitos de edição.
    - **Texto de justificativa:** revisão pelo monitor (uso indevido de "stakeholders", repetição, inconsistência no RNF8).
    - **Validação com a cliente**, prazos atrasados, MVP e início da codificação.
    ## Decisões
    1. Valor de negócio = formulário + reuniões anteriores, com a limitação explícita no texto e compromisso de atualizar após validação do cliente.
    2. Trocar "stakeholders" por "diretora e coordenadora / representante da creche" e cortar repetições do texto.
    3. Esforço avaliado em escala de 1 a 4 nos três critérios, com **média simples** (sem arredondar).
    4. Esforço = do início do desenvolvimento até a realização dos testes (sem validação do cliente).
    5. Capacidade da equipe é decidida em conjunto; complexidade em seguida; tempo por último.
    6. RF5 corrigido (cadastro de contas administrativas) e RF24 mantido só como "cadastrar etapa". Total: **34 requisitos**, com IDs fixos.
    7. Matriz com quadrantes coloridos (verde, azul, vermelho); só uma pessoa edita por vez.
    8. Não fingir validação: registrar que o cruzamento reuniões + formulário não substitui validação real; marcar reunião com a cliente.
    9. No MVP, considerar também requisitos do quadrante azul (principalmente não funcionais), começando pelos funcionais.
    10. Começar a codar assim que o MVP for aprovado (ambiente já pronto).
    ## Tarefas realizadas
    - **Gabriel:** tabela de valor de negócio, texto de justificativa, avaliação de esforço e visual da matriz.
    - **Lucas Peixoto:** base da matriz, inserção dos RF 1–17, limpeza de duplicados.
    - **João:** estrutura da tabela de esforço técnico, conferência dos funcionais na matriz.
    - **Pedro:** justificativa do cliente na consolidação.
    - **Jorge e Bryan:** preenchimento e conferência da matriz, avaliação de capacidade.
    - **Lucas Meireles:** revisão e feedback do texto.
    **Concluído:** avaliação de esforço dos 34 requisitos, consolidação e matriz conferida.
    
    ## Pendências
    - Pedro: ajustar justificativa vs. valor de negócio (ex.: RNF8).
    - Gabriel: marcar reunião com a cliente e enxugar o texto.
    - Lucas Meireles: enviar feedback detalhado sobre as correções do professor.
    - Equipe: definir MVP e quem faz a prototipação; preparar a apresentação das 8h.
    *Obs.: transcrição ruidosa. Data da reunião, notas por requisito e responsável pela prototipação não aparecem com clareza.*


=== " 6/10/2026 - Reunião com o Cliente pra validação do MVP "
    ## Ata: Apresentação do MVP à cliente e alinhamento da equipe
    [link do vídeo](https://unbbr-my.sharepoint.com/:v:/g/personal/242004706_aluno_unb_br/IQBXti2dM-CuR44I9bXe8Ka9AedalX9A8_pG9i43LaH3-cA?e=P1HCHE&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)
    
    **Tema:** validação do MVP com a cliente e combinados internos para a entrega do módulo 2.
    **Duração:** ~24 min (≈17 min com a cliente + ≈7 min só com a equipe).
    **Prazo citado:** entrega na terça-feira.
    
    ## Participantes
    Gabriel Vieira Octacilio Pinheiro (condutor), Letícia Pretto (cliente/representante da creche, participou só da primeira parte), Joao Gabriel Rolim Veiga, Bryan Smith Rodrigues Cavalcante e Jorge Andres Vasquez Vega.
    
    ## Pautas
    - **Apresentação do MVP** organizada em objetivos → características de produto → requisitos:
    1. Gerenciamento de cards (cadastrar usuários da secretaria, cadastrar card de aluno, preencher fichas com exportação em PDF).
    2. Edição e atualização de cards (editar fichas, histórico, salvar com confirmação "tem certeza?").
    3. Documentos (baixar/anexar PDFs, buscar aluno pelo nome).
    4. Controle de acesso (login/logout e bloqueio por inatividade).
    - Requisitos não funcionais: privacidade/LGPD, acesso autenticado, disponibilidade, tempo de resposta. Também entram turmas, etapas e vínculos.
    - **Hospedagem em nuvem:** acesso de qualquer lugar (a cliente está em São Paulo), custo estimado de ~US$ 5/mês e plano de até 20 GB.
    - **Feedback da cliente:** nada urgente faltando, mas ela pediu histórico/versões de dados alterados.
    - **Prototipação e próximos passos**, com entrega funcional prevista para dezembro.
    - **Alinhamento interno:** proatividade, correção das issues do monitor, uso de branches e atividade nova do professor.
    ## Decisões
    1. **MVP aprovado pela cliente**, sem pendências urgentes. Ficam **fora do MVP** o chat e o quadro de avisos.
    2. Sistema hospedado **na nuvem**, com login obrigatório e bloqueio após período de inatividade (tempo a definir).
    3. Migrar apenas as fichas de **2026**, não o acervo antigo, o que reduz o custo.
    4. Novo requisito da cliente: ao editar uma ficha, **manter os dados antigos como inativos**, consultáveis por busca específica (ex.: telefones anteriores). A busca padrão mostra só o dado atual.
    5. Próxima etapa: **prototipação** das telas para aprovação da cliente, depois desenvolvimento com reuniões de acompanhamento. Meta: produto funcional em dezembro.
    6. Alterações em requisitos: criar uma **branch** a partir do repositório de docs (ex.: `docs: ajuste…`) e abrir **PR**, em vez de editar o documento compartilhado.
    7. Corrigir as issues devolvidas pelo monitor e **avisar no grupo** a cada correção, para ele rever. Prazo: terça.
    8. Começar a codar após fechar o módulo 2.
    ## Tarefas realizadas
    - **Gabriel:** apresentou o MVP à cliente, coletou feedback e confirmou escopo e hospedagem; pesquisou preços e opções de nuvem.
    - **Bryan:** compartilhou experiência prévia com nuvem (Google Cloud) e comentou que o custo depende da RAM.
    - **Equipe:** o MVP foi validado, o que fecha a pendência de validação da reunião anterior.
    - Observação do Gabriel: o documento do MVP tinha falhas de organização, mas a apresentação oral cobriu os itens que faltavam (como turmas e etapas).
    ## Pendências
    - **Todos:** ler e corrigir as issues do monitor (arquivo `.txt` sem extensão: renomear com `.txt` para abrir) e comunicar no grupo.
    - **Gabriel:** fechar o levantamento de custo da nuvem e responder à cliente; verificar o e-mail do professor sobre a atividade do dia 8.
    - **Equipe:** declarar o nível de abstração de cada requisito (atividade do dia 8, apontada pelo João).
    - **Equipe:** incluir o histórico/versões de dados como requisito, fazer a prototipação e definir a escolha do provedor de nuvem.
    - **Equipe:** ser proativa na divisão das tarefas, sem esperar mensagem do Gabriel, para evitar "pernoitada" na véspera da entrega.
    *Obs.: transcrição ruidosa. Datas e nomes de terceiros mencionados (funcionárias da creche) foram omitidos por falta de clareza.*




=== " 11/10/2026 - Reunião de montagem de casos de uso e de backlog "
    ## Ata: Ajustes do MVP, rastreabilidade e site (Pages)
    
    **Tema:** padronização da documentação do MVP, ligação entre características de produto e requisitos, e preparação da entrega.
    **Duração:** ~56 min (parte do tempo foi conversa informal, omitida desta ata).
    
    ## Participantes
    Gabriel Vieira Octacilio Pinheiro (condutor), Joao Gabriel Rolim Veiga e Lucas Peixoto Rodrigues.
    
    ## Pautas
    - **Rastreabilidade e vídeos:** o Gabriel cobrou os vídeos de quem gravou reuniões. Ficou confuso quem gravou: a reunião de sexta não foi gravada e o João só tinha um vídeo de ~10 min do fim de uma reunião.
    - **Árvore de requisitos:** o Lucas notou que o **RF7** não aparecia. O João lembrava de ter colocado todos; o Gabriel considerou fácil de corrigir.
    - **Site (Pages/MkDocs):** o Gabriel fez deploy e o João viu as abas "Entrega de vídeos", "Referências" e "Atividades" quebradas (404). A aba de referências está vazia. O problema se mostrou específico do navegador do João (Firefox), e depois ele conseguiu abrir.
    - **Características de produto (CP) × requisitos do MVP**, feita pelo Lucas:
    - CP de gerenciamento de matrícula, controle de acesso e edição/atualização de cards: completas no MVP.
    - **RF11 e RF12** (inativar e reativar card): fora do MVP.
    - **CP6** (quadro de avisos, RF1 a RF4): fora do MVP.
    - **CP7** (RF19 e RF20): fora do MVP.
    - RNFs 3, 4, 9 e 10 aparecem em todas as CPs (3, 4 e 10 são evolutivos).
    - **Definição dos RFs do MVP:** a lista estava fora de ordem (10, 21, 14, 15, 16, 23...) e sem nome ao lado do ID.
    - **Critério de montagem do MVP:** o professor pediu que fique claro por que cada item entrou ou não. O João lembrou que o critério adotado foi **baixo esforço técnico e alto valor de negócio**, além da contribuição para o problema e os objetivos do projeto.
    - **Monitor:** o Gabriel reclamou da falta de retorno e do tempo de resposta às issues, que a equipe corrigiu há tempos. Durante a reunião o João viu que o monitor respondeu.
    ## Decisões
    1. Para a ligação CP × requisitos, listar apenas **o que está e o que não está no MVP**, sem repetir os RNFs evolutivos em cada CP.
    2. Incluir o **nome do requisito** ao lado do ID na tabela de definição dos RFs do MVP.
    3. Explicitar na documentação que a cliente dispensou alguns itens e que foram escolhidos os mais necessários, e detalhar o critério depois.
    4. Observar na documentação que certas funcionalidades fora dos quadrantes selecionados estão no MVP, com o motivo.
    5. Colocar as **regras de negócio** no Pages (o modo escuro ficou bem avaliado).
    6. Nova reunião **amanhã às 10h**, bem cedo, para ajustes e para sobrar tempo de estudar a apresentação. O Gabriel avisa no grupo.
    7. Se o monitor não responder e as issues não forem fechadas até terça, o Gabriel vai pedir ao professor a troca do monitor. A equipe teme perder pontos por correções já feitas.
    ## Tarefas realizadas
    - **Gabriel:** deploy do site, regras de negócio no Pages, anotações do que falta.
    - **Lucas:** levantamento CP × requisitos do MVP (até a CP7) e verificação da árvore.
    - **João:** teste do site, identificação do problema no navegador e explicação do critério do MVP.
    ## Pendências
    - **Corrigir** o RF7 na árvore de requisitos.
    - **Lucas:** enviar ao Gabriel a lista de quais CPs estão completas e quais têm só alguns requisitos no MVP.
    - **Gabriel:** passar os ajustes combinados ao Pages, incluir na tabela do MVP os fatores que levaram à escolha das declarações e o nome dos requisitos, ajustar o README e montar o **backlog com as atividades** para o vídeo.
    - **Equipe:** reunião de amanhã às 10h, depois estudar para a apresentação.
    - **Equipe:** reorganizar a ordem dos RFs na definição do MVP e deixar clara a justificativa de inclusão/exclusão.
    *Obs.: transcrição ruidosa, com muitos trechos em inglês fora de contexto. Data não informada, e uma palavra do resumo final do Gabriel ("caju") não ficou clara, então fui conservador no que ela representa.*

=== " [12/10/2026] - Reunião de priorização do backlog e casos de uso "
    ## Ata: Priorização dos casos de uso, backlog geral e montagem do MVP

    *Tema:* cálculo das médias dos casos de uso, priorização, definição do MVP e estrutura da seção 10 (backlog) no Pages.
    *Duração:* ~1h50 (pela transcrição; parte do tempo foi conversa informal, omitida desta ata).
    **Link do vídeo:** [Gravação da reunião](https://unbbr-my.sharepoint.com/personal/242004706_aluno_unb_br/Documents/Grava%C3%A7%C3%B5es/Call%20with%20Bryan%20and%205%20others-20261012_170133-Meeting%20Recording.mp4?web=1&referrer=Teams.TEAMS-ELECTRON&referrerScenario=RecapOpenInStreamButton.view)


    ## Participantes
    Gabriel Vieira Octacilio Pinheiro (condutor), Joao Gabriel Rolim Veiga, Lucas Peixoto Rodrigues, Pedro Luca Rocha Manera, Bryan Smith Rodrigues Cavalcante e Jorge Andres Vasquez Vega.

    ## Pautas
    - *Acesso à árvore de rastreabilidade:* o Jorge não conseguiu abrir pelo link. Lucas, Bryan e Pedro acessaram pelo Pages. O João sugeriu problema de internet (antes ele só abriu o Miro trocando para dados móveis).
    - *Checklist da entrega:* o João mandou um checklist no grupo com o que acha que já foi feito. Nem ele nem o Gabriel entenderam o que o professor quer com *mapa* e *itens de trabalho*. Segundo o João, falta isso e o vídeo de apresentação da entrega, que precisa ser gravado hoje.
    - *Médias dos casos de uso:* o Lucas criou o documento e a tabela. Ficou combinado usar a média normal, sem arredondar. O Lucas mostrou que a média da matriz de avaliação dá só o esforço técnico, e que é preciso também o valor de negócio (tabela "Consolidação das avaliações", atividade 4). O Pedro viu que o primeiro caso de uso estava com média 2.60 quando deveria ser 2.
    - *Backlog por casos de uso × lista de requisitos:* o Pedro sugeriu usar casos de uso, como no grupo Nativo, usado como referência (o exemplo do professor usa histórias de usuário). O Gabriel lembrou que caso de uso tem nível de abstração alto e que não dá tempo de refazer a matriz do zero. A ideia é usar as médias dos requisitos que compõem cada caso de uso. O Pedro observou que, no exemplo, a priorização foi impacto (MoSCoW) sobre esforço técnico.
    - *Justificativa do corte do MVP:* segundo o Gabriel, foi a posição na tabela e a completude das características de produto. Há um parágrafo sobre isso no Pages (atividade 4).
    - *Árvore de rastreabilidade:* o Pedro viu que o grupo Nativo coloca o caso de uso abaixo da CP e os requisitos abaixo dele. Ele concluiu que isso não funciona para o projeto (8 CPs e 8 casos de uso) e preferiu manter como está.
    - *RFs dos casos de uso do MVP:* o Jorge confirmou que só o caso de uso 3 fica fora do MVP e sugeriu colocá-lo no fim da tabela. O Bryan comparou os RFs dos casos de uso com a definição dos RFs do MVP (que passou de 24 para 15 RFs). Ficam fora do MVP o RF11, RF12 e RF17 (caso de uso 4) e o RF19 e RF20 (caso de uso 6). O Jorge apontou que o caso de uso 6 tem o RF18, RF19, RF20 e RF24.
    - *RF16:* não aparecia em nenhuma lista. É o de baixar documento, segundo o Bryan. O Gabriel assumiu o erro no caso de uso que ele escreveu.
    - *RF21 e RF22 em dois casos de uso:* aparecem no caso de uso 7 (alocar alunos) e no 8 (consultar registros). O Lucas explicou que os incluiu no 7 porque servem para validar a alocação. O Gabriel quer rever os fluxos de alocação (no cadastro do aluno e em outro momento) e sentiu falta de prototipação. Ele chegou a propor tirar os dois do 7, mas depois ele e o Pedro concluíram que dois casos de uso podem compartilhar um requisito.
    - *Coluna "compõe a entrega" e quadrantes:* o João preencheu a coluna e escreveu o critério abaixo da tabela de médias. O Lucas notou que o caso de uso 4 entrou mais pelo valor de negócio do que pelo esforço. A pedido do Gabriel, o João classificou os casos de uso em quadrantes: todos ficaram no quadrante 1, menos o caso de uso 3.
    - *Priorização por casos de uso descartada:* o Gabriel achou redundante e contraditório. Pelos requisitos, alguns ficam fora do MVP; pelos casos de uso, quase todos entram.
    - *Estrutura da seção 10 (Pages):* o Gabriel mostrou a 10.1 (backlog geral com os 8 casos de uso, links e status), a lista de requisitos e a priorização. Ele comparou com o template do professor (10.2, com valor de negócio, esforço, complexidade e lacuna de capacidade).
    - *Backlog geral:* o Gabriel deixou claro que o backlog geral inclui todos os requisitos, mesmo os que estão fora do MVP (o Bryan achava que seriam retirados). O João sugeriu uma tabela com todos os requisitos e seus casos de uso vinculados, e o Gabriel aprovou.

    ## Decisões
    1. Usar a *média normal* (sem arredondamento) nas tabelas de casos de uso.
    2. Considerar *valor de negócio e esforço técnico* (consolidação das avaliações), e não só a média da matriz de avaliação.
    3. Não refazer a matriz do zero: aproveitar as médias dos requisitos já avaliados.
    4. Manter a árvore de rastreabilidade no formato atual.
    5. O MVP inclui *todos os casos de uso, menos o 3*.
    6. A *montagem do MVP será apresentada pelos requisitos. Os casos de uso ficam como lista e numa tabela auxiliar (sem a coluna de quadrante, com o texto do critério de composição da entrega). A definição do MVP ganha uma coluna de **casos de uso vinculados*.
    7. Retirar a coluna de quadrante.
    8. O backlog geral terá *todos os requisitos* com descrição, caso de uso vinculado e CP vinculada. A classificação extra dos RNFs não entra (quem quiser consulta a lista de requisitos).
    9. Quando um requisito pertencer a dois casos de uso, separar os casos por barra ou vírgula.
    10. Fazer uma pausa para o almoço e voltar por volta de 13h30–14h, em uma nova reunião, para terminar a seção 10 e gravar o vídeo.

    ## Tarefas realizadas
    - *Gabriel:* conduziu a reunião, adicionou a coluna de casos de uso vinculados na definição do MVP e apresentou a estrutura da seção 10.
    - *João:* mandou o checklist, preencheu a coluna "compõe a entrega", escreveu o critério de composição da entrega e classificou os quadrantes.
    - *Lucas:* criou o documento e a tabela de médias dos casos de uso e começou a copiar a tabela de requisitos para o backlog geral.
    - *Pedro:* subiu os casos de uso no modelo do grupo Nativo, passou os casos de uso para o Pages, trabalhou na árvore, começou o README e abriu um PR.
    - *Bryan:* levantou os RFs dos casos de uso do MVP e as divergências em relação à definição do MVP, e começou a preencher a tabela do backlog geral.
    - *Jorge:* confirmou a exclusão do caso de uso 3, apontou os RFs do caso de uso 6 e ajudou na tabela de priorização com João e Lucas.

    ## Pendências
    - *Jorge:* *resolver* o acesso à árvore de rastreabilidade (testar outra rede ou pedir acesso).
    - *Gabriel:* *corrigir* o caso de uso que deveria conter o RF16, *revisar* o caso de uso 7 do Lucas (fluxos de alocação), *incluir* o nome dos requisitos na definição do MVP e *abrir* o PR com os ajustes da seção 10.
    - *Lucas e Bryan:* *terminar* a tabela do backlog geral com caso de uso e CP vinculados.
    - *João:* *remover* a coluna de quadrante e *adaptar* a 10.2 ao conteúdo da atividade 4.
    - *Equipe:* *resumir* as colunas da tabela "Consolidação das avaliações" no formato do template do professor.
    - *Equipe:* *fechar* a situação do RF21 e RF22 (casos de uso 7 e 8) e *refazer* o cálculo, se mudar.
    - *Equipe:* *conferir* se a média do primeiro caso de uso (2.60 → 2) foi corrigida.
    - *Equipe:* *descobrir* o que o professor espera de "mapa" e "itens de trabalho".
    - *Equipe:* *retomar* a reunião depois do almoço, terminar a seção 10 e *gravar* o vídeo de apresentação da entrega.

=== " 30/10/2026 - Reunião de validação do protótipo do sistema "
# Ata: Alinhamento Técnico e Início do Desenvolvimento (Ciclo 5)

**Tema:** definição de tecnologias (exportação PDF, ORM), modelagem de dados inicial, perfis de acesso e fluxo de desenvolvimento (branches/PRs) para o início da codificação do backend e frontend.
**Data:** 30/10/2026 · **Duração:** ~1h08min.
**Link do vídeo:** [Gravação da reunião](https://unbbr-my.sharepoint.com/personal/242004706_aluno_unb_br/_layouts/15/stream.aspx?id=%2Fpersonal%2F242004706%5Faluno%5Funb%5Fbr%2FDocuments%2FGrava%C3%A7%C3%B5es%2FCall%20with%20Bryan%20and%205%20others-20261030_093246-Meeting%20Recording%2Emp4&referrer=Teams%2ETEAMS-ELECTRON&referrerScenario=RecapOpenInStreamButton%2Eview)

## Participantes

| Nome | Papel |
|-|-|
| Gabriel Vieira Octacilio Pinheiro (condutor) | Representante de desenvolvimento e time |
| Pedro Luca Rocha Manera | Equipe de desenvolvimento |
| Lucas Peixoto Rodrigues | Equipe de desenvolvimento |
| João Gabriel Rolim Veiga | Equipe de desenvolvimento |
| Jorge Andres Vasquez Vega | Equipe de desenvolvimento (prototipação) |
| Bryan Smith Rodrigues Cavalcante | Equipe de desenvolvimento |

## Pautas

- **Exportação de PDF (Jinja2 + WeasyPrint):** Gabriel apresentou a solução técnica para a exportação das fichas em PDF. A abordagem utiliza Jinja2 para renderizar templates HTML com dados dinâmicos e WeasyPrint para converter o HTML em PDF. Foram discutidas rotas para visualização e download do arquivo, além da possibilidade de assinatura via Gov.br (ou impressão e digitalização para quem não tem acesso digital). O protótipo de template foi validado.
- **Validação da prototipação (Figma):** Jorge apresentou a primeira versão da prototipação. A equipe elogiou o resultado. Foram levantadas decisões provisórias a validar: login via e-mail/senha, perfil único vs. múltiplos perfis, e a necessidade de adicionar um campo para escolha do tipo de usuário (Administrador ou Secretaria) no fluxo de cadastro.
- **Definição de perfis de acesso:** A equipe decidiu que haverá **dois perfis**: **Administrador** (pode criar/excluir outros perfis e realizar todos os fluxos) e **Secretaria** (apenas funções operacionais, sem gerenciar usuários). O perfil de "Coordenação" citado no Figma será tratado como sinônimo de Administrador. A modelagem será feita com um campo booleano (`is_admin`) na entidade `Usuario`.
- **Modelagem de dados (Entidade Usuário):** Definiu-se que a entidade `Usuario` terá os campos: `id` (PK sequencial), `nome`, `email` (único), `senha` e `is_admin` (booleano). O `id` foi incluído para facilitar buscas e o histórico de edições. Não será utilizado CPF.
- **Tecnologia de ORM e Banco de Dados:** A equipe utilizará **SQLAlchemy** como ORM, com migrations (provavelmente Alembic) para criação e alteração das tabelas. Discutiu-se que a modelagem será feita via código Python (classes), e não por um SGBD externo. A conexão com o banco será configurada via variáveis de ambiente (`.env`).
- **Casos de Uso priorizados (Ciclo 5):** A equipe alinhou que o foco inicial será o **UC01 (Gerenciar Autenticação)** e o **UC02 (Gerenciar Usuários Administrativos)** . O backend desses casos é considerado simples e pode ser iniciado imediatamente. Como o backend é rápido, a equipe também pretende adiantar o **UC06 (Gerenciar Estrutura Escolar - Turmas e Etapas)** , que não depende de outros cadastros. O **UC04 (Gerenciar Fichas de Matrícula)** também foi citado como parte do escopo do ciclo.
- **Aplicação do DoD (Definition of Done):** Revisou-se o DoD acordado. Alguns critérios não se aplicam a casos de uso (ex.: "critérios de aceitação" são do caso de uso, não do DoD). A validação com a cliente será feita em reunião específica. A equipe se comprometeu a aplicar o DoD aos casos de uso desenvolvidos.
- **Fluxo de desenvolvimento (Git):** Ficou definido que:
    1. Cada desenvolvedor criará uma **branch** a partir da `developer` com nome autoexplicativo (ex.: `feat/usuarios-turmas-etapas`).
    2. O desenvolvimento ocorrerá nessa branch.
    3. Ao final do ciclo, será aberto um **PR (Pull Request)** para a `developer`.
    4. Após testes, a `developer` será mergeada na `main` (ou branch principal) por Gabriel.
- **Testes unitários:** Gabriel solicitou que os desenvolvedores backend já escrevam **testes unitários** usando **Pytest**. A meta é cobrir 100% das funções, conforme orientação do professor. A equipe pode usar IA para auxiliar na geração dos testes.
- **Prazos e cronograma:** A equipe está no **Ciclo 5**, com prazo até **05/11**. A meta é concluir os casos de uso 1, 2 e 4 até essa data. Para as **issues do monitor** (correções), a meta é **07/11** (sábado), com cada membro pegando no mínimo 2 issues para revisar.

## Decisões

1. **Exportação de PDF:** adotar a stack **Jinja2 + WeasyPrint**, com templates HTML customizados para cada ficha. A assinatura será via Gov.br ou impressão/digitalização.
2. **Perfis de acesso:** implementar **dois perfis** (Administrador e Secretaria), modelados como um campo booleano `is_admin` na entidade `Usuario`. O Administrador pode gerenciar usuários; a Secretaria, não.
3. **Modelagem da entidade `Usuario`:** campos `id` (PK), `nome`, `email` (único), `senha` e `is_admin`. CPF não será utilizado.
4. **ORM e banco:** utilizar **SQLAlchemy** com migrations para o banco de dados. A modelagem é feita via classes Python, sem necessidade de desenhar tabelas manualmente em SGBD.
5. **Escopo do Ciclo 5:** focar no backend do **UC01 (Autenticação)** e **UC02 (Gerenciar Usuários)** , e adiantar o **UC06 (Turmas e Etapas)** , que é independente. O **UC04 (Fichas)** também integra o escopo.
6. **Fluxo de Git:** branches por funcionalidade a partir da `developer`, PRs ao final do ciclo, e merge para a branch principal somente após testes.
7. **Testes unitários:** obrigatórios para o backend, com **Pytest** e meta de 100% de cobertura.
8. **Issues do monitor:** cada membro deve pegar no mínimo **2 issues** para corrigir até **07/11**. As correções devem ser comunicadas no grupo.
9. **DoD:** aplicar o Definition of Done acordado, desconsiderando critérios que não se aplicam a casos de uso. A validação com a cliente será feita em reunião separada.
10. **Reunião de validação com a cliente:** Gabriel agendará uma reunião com a Letícia para validar a prototipação e os casos de uso de forma justificativa (não apenas "gostei/não gostei"), conforme orientação do professor.

## Tarefas realizadas

- Foi apresentada a solução de exportação de PDF (Jinja2 + WeasyPrint), conduziu as decisões de modelagem e fluxo de Git, e organizará as issues no GitHub.
- Foi apresentado a prototipação no Figma e concedeu acesso de edição à equipe; ficou responsável por adicionar o campo de tipo de usuário no fluxo de cadastro.
- Também teve contribuição com a definição do ORM (SQLAlchemy), explicou o funcionamento de migrations e reforçou a necessidade de testes unitários.
- João informou que já está trabalhando no diagrama de banco (Draw.io) e se comprometeu a declarar as entidades `Usuario`, `Turma` e `Etapa` no código.
- Lucas participou das decisões e confirmou que iniciará o desenvolvimento no dia seguinte (31/10).

## Pendências

- **Gabriel:** criar as issues de backend e frontend no GitHub (incluindo a lista de issues do professor para escolha da equipe), organizar a estrutura de pastas do repositório, e enviar o arquivo `.zip` com o exemplo de backend (modelagem, schemas, rotas) para João.
- **Jorge:** adicionar o campo de seleção de perfil (Administrador/Secretaria) no modal de cadastro de usuário no Figma.
- **João:** finalizar o diagrama de banco e iniciar a declaração das entidades `Usuario`, `Turma` e `Etapa` no código (SQLAlchemy).
- **Pedro Lucas e Lucas Peixoto:** iniciar o desenvolvimento do backend do UC01 e UC02 (autenticação e gerenciamento de usuários) assim que o repositório for liberado.
- **Bryan e Jorge:** iniciar o desenvolvimento do frontend das telas de login e cadastro de usuário, seguindo o Figma.
- **Equipe:** corrigir as issues do monitor até **07/11** (mínimo de 2 por membro) e comunicar no grupo.
- **Equipe:** escrever testes unitários (Pytest) para todas as funções backend desenvolvidas.
- **Gabriel:** agendar reunião com a cliente para validação da prototipação e dos casos de uso.


=== " 04/11/2026 - Reunião de validação do protótipo do sistema "
    ## Ata: Alinhamento para Início do Desenvolvimento Backend

**Tema:** alinhamento interno sobre prototipação concluída e início do desenvolvimento do backend.  
**Data:** 04/11/2026 · **Duração:** ~55 min (parte do tempo foi conversa informal, omitida desta ata).  
**Link do vídeo:** [Gravação da reunião](https://unbbr-my.sharepoint.com/personal/242004706_aluno_unb_br/_layouts/15/stream.aspx?id=%2Fpersonal%2F242004706%5Faluno%5Funb%5Fbr%2FDocuments%2FGrava%C3%A7%C3%B5es%2FMeeting%20with%20Gabriel%20Vieira%20Octacilio%20Pinheiro%2D20261104%5F194626%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Efee94704%2D3f9c%2D4bf6%2Db694%2Deb1c112b5345)

## Participantes

| Nome | Papel |
|-|-|
| Gabriel Vieira Octacilio Pinheiro (condutor) | Representante de desenvolvimento e time |
| Letícia Pretto | Cliente/representante da creche |
| Lucas Peixoto Rodrigues | Equipe de desenvolvimento |
| João Gabriel Rolim Veiga | Equipe de desenvolvimento |
| Jorge Vasquez | Equipe de desenvolvimento |

## Pautas

- **Prototipação concluída:** Gabriel informou que as telas do sistema já foram desenhadas e apresentou a prototipação à cliente.
- **Início do backend:** Gabriel perguntou se a equipe (Pedro Lucas e Lucas Peixoto) já pode iniciar o desenvolvimento do backend com base nos tipos de dados definidos.
- **Compartilhamento de material técnico:** Gabriel mencionou que enviará um arquivo `.zip` (já compartilhado anteriormente com João no grupo) contendo modelagem do banco, esquemas e rotas até a controller — o processo completo do backend. Também há dois arquivos Markdown explicando como foi feito.
- **Prazo:** meta de entregar o produto funcional até o dia 10.
- **Canal de comunicação:** Gabriel reforçou que dúvidas sobre desenvolvimento podem ser enviadas no WhatsApp ou no grupo.

## Decisões

1. **Backend pode ser iniciado** com base nos tipos de dado já definidos na prototipação.
2. **Gabriel enviará o `.zip`** com modelagem de banco, esquemas e rotas para Lucas Peixoto e Pedro Lucas, acompanhado de dois Markdowns explicativos.
3. **Lucas Peixoto e Pedro Lucas** ficam responsáveis por iniciar o backend.
4. **Prazo de entrega:** dia 10/11.
5. **Comunicação de dúvidas** deve ser feita no WhatsApp ou no grupo, para que todos possam opinar.

## Tarefas realizadas

- Foi concluida a prototipação das telas, apresentou à cliente e alinhou o início do backend com a equipe; comprometeu-se a enviar o `.zip` com o processo completo do backend.
- A cliente validou o prototipo apresentado.
- Os demais membros responsáveis pelo backend confirmaram o início do backend.

## Pendências

- **Gabriel:** enviar o `.zip` com modelagem do banco, esquemas e rotas para Lucas Peixoto (e Pedro Lucas).
- **Lucas Peixoto e Pedro Lucas:** iniciar o desenvolvimento do backend com base no material compartilhado.
- **Equipe:** entregar o produto funcional até o dia 10.
- **Equipe:** comunicar dúvidas de desenvolvimento no WhatsApp ou no grupo.

=== " 11/11/2026 - Reunião de validação do protótipo do sistema "

# Ata: Ensaio/Apresentação da Unidade 2 — Requisitos, DoR/DoD, Backlog e Casos de Uso

**Tema:** gravação/apresentação das entregas da Unidade 2 do Sistema Sigma: lista de requisitos, técnicas de declaração, DoR/DoD, backlog, casos de uso e priorização do MVP.  
**Data:** 12/10/2026 · **Duração:** ~23 min (transcrição).  
**Link do vídeo:** [Gravação da reunião](https://unbbr-my.sharepoint.com/personal/242004706_aluno_unb_br/_layouts/15/stream.aspx?id=%2Fpersonal%2F242004706%5Faluno%5Funb%5Fbr%2FDocuments%2FGrava%C3%A7%C3%B5es%2FCall%20with%20Bryan%20and%205%20others%2D20261012%5F170133%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E8818a99d%2D2ab8%2D4f3c%2Dbac3%2D58b16fbc23c7)

## Participantes

| Nome | Papel |
|-|-|
| Pedro Luca Rocha Manera | Apresentação/equipe de desenvolvimento |
| João Gabriel Rolim Veiga | Apresentação (DoR/DoD) |
| Jorge Andres Vasquez Vega | Apresentação (técnicas de declaração) |
| Gabriel Vieira Octacilio Pinheiro | Apresentação (backlog) e apoio técnico |
| Bryan Smith Rodrigues Cavalcante | Apresentação (casos de uso) |
| Lucas Peixoto Rodrigues | Apresentação (priorização dos casos de uso no MVP) |

## Pautas

- **Apresentação do grupo 7 e do sistema:** Pedro Luca abriu confirmando o Grupo 7 e apresentou o **Sigma**, sistema integrado de gestão de matrículas desenvolvido para a **Creche Estação Ação Vida**, instituição filantrópica que atende em Águas Lindas de Goiás (conforme transcrição).
- **Estrutura de requisitos:** a equipe organizou o projeto em **4 objetivos específicos**, **8 características de produto** (2 por objetivo) e requisitos funcionais derivados. Os RNFs foram tratados como transversais, com classificação de qualidade (segurança, usabilidade, desempenho e confiabilidade/disponibilidade). A árvore de rastreabilidade foi apresentada no Miro, com print como evidência.
- **Técnicas de declaração:** Jorge apresentou três técnicas utilizadas: **lista de requisitos** (simples, com ID, nome curto e descrição), **declarações textuais estruturadas** (usadas na validação do MVP, com fator/ação/condição) e **casos de uso** (nível mais detalhado, com fluxos principal, alternativos e de exceção). Discutiu-se se declarações de negócio deveriam aparecer; a equipe optou por manter apenas as três técnicas por questão de tempo.
- **DoR e DoD:** João apresentou o **Definition of Ready** (regras de negócio compreendidas, análise técnica de riscos, rastreabilidade verificável, critérios de aceitação, validação com cliente, escopo compatível com a interação, mensuração técnica e detalhamento suficiente) e o **Definition of Done** (implementação conforme especificação, critérios de aceitação cumpridos, testes implementados, integração sem falhas, código revisado, conformidade com RNFs, acessibilidade, documentação atualizada, demonstração/verificação e validação com cliente quando aplicável). Houve queda de áudio e ele repetiu o trecho.
- **Backlog e MVP:** Gabriel apresentou a estrutura do backlog: requisitos derivados das características de produto, cerca de **24 requisitos funcionais e 10 não funcionais**, cada um vinculado a casos de uso. A priorização usou matriz **valor de negócio × esforço técnico**. O MVP concentrou requisitos do quadrante de **alto valor e baixo esforço**, incluindo também itens de outros quadrantes quando necessários para completude das características de produto.
- **Casos de uso:** Bryan explicou que o Sigma possui **8 casos de uso** derivados dos requisitos funcionais e complementados por regras de negócio. A estrutura padronizada contém atores, objetivo, pré-condições, fluxo principal, fluxos alternativos, fluxos de exceção, regras de negócio e requisitos relacionados. Exemplo citado: **UC4** vinculado ao **RF8** e à **RN3** (preenchimento completo das fichas para ativar a matrícula).
- **Priorização dos casos de uso no MVP:** Lucas apresentou tabela com valor de negócio e esforço técnico por caso de uso, calculando médias a partir dos requisitos relacionados. Em seguida, apresentou a tabela de priorização, dividindo valor de negócio por esforço técnico para obter o valor resultante. Os critérios citados envolveram valores **≥ 3** e **≥ 1,9**, além da análise de importância de cada caso de uso para viabilizar um protótipo minimamente funcional. Houve ambiguidade na transcrição entre “valor de negócio”, “esforço técnico” e “valor resultante”.
- **Problemas técnicos durante a gravação:** o compartilhamento de tela exigiu atualização forçada (`Ctrl+Shift+R`) para exibir a versão atualizada do Pages; o texto de Lucas não apareceu de imediato. João teve queda de áudio/interfone e repetiu sua fala. Ao final, Pedro perguntou sobre a conclusão da gravação, que não ficou clara na transcrição.

## Decisões

1. **Manter apenas três técnicas de declaração na apresentação:** lista de requisitos, declarações textuais estruturadas e casos de uso, sem incluir declarações de negócio, para preservar o tempo.
2. **Repetir os trechos com problemas** de áudio e de compartilhamento de tela para garantir a gravação.
3. **Usar atualização forçada do navegador** (`Ctrl+Shift+R`) quando a versão do Pages não refletir as alterações.
4. **Editar a gravação depois**, cortando trechos problemáticos e conversas paralelas.
5. **Manter a estrutura de priorização do MVP** baseada na matriz valor de negócio × esforço técnico, complementada pela análise de completude das características de produto e pela viabilidade de um protótipo minimamente funcional.

## Tarefas realizadas

- **Pedro Luca:** abriu a apresentação, contextualizou o Grupo 7 e o Sistema Sigma, e apresentou a estrutura de objetivos específicos, características de produto, requisitos funcionais e RNFs.
- **Jorge:** apresentou as técnicas de declaração e suas limitações.
- **João:** apresentou DoR e DoD; repetiu o trecho após queda de áudio.
- **Gabriel:** apresentou o backlog, a matriz valor de negócio × esforço e a composição do MVP; auxiliou na correção do compartilhamento de tela.
- **Bryan:** apresentou os 8 casos de uso, sua estrutura padronizada e o exemplo do UC4 com RF8 e RN3.
- **Lucas:** apresentou a priorização dos casos de uso no MVP; repetiu o trecho após ajuste de cache na página.

## Pendências

- **Equipe:** editar a gravação, cortando trechos com queda de áudio, interfone e problemas de compartilhamento de tela.
- **Gabriel/Lucas:** verificar se o deploy do Pages está atualizado e se os textos da priorização aparecem corretamente.
- **Equipe:** ensaiar os tempos de fala, pois alguns trechos precisaram ser repetidos.
- **Equipe:** confirmar e registrar a conclusão da apresentação, que não ficou clara na transcrição.
- **Equipe:** revisar a redação dos critérios de priorização dos casos de uso para eliminar a ambiguidade entre “valor de negócio”, “esforço técnico” e “valor resultante”.

---

**Resumo do que foi sintetizado das atas anteriores e do site de casos de uso:**

- **Contexto:** esta gravação ocorre após a montagem de casos de uso e backlog (reunião de 11/10/2026) e antes do alinhamento técnico de 30/10/2026. Ela consolida a apresentação da Unidade 2, com requisitos, técnicas de declaração, DoR/DoD, backlog e priorização do MVP.
- **Casos de uso citados:** o site de casos de uso confirma que o Sigma possui 8 casos de uso. A transcrição cita explicitamente o **UC4** vinculado ao **RF8** e à **RN3**, o que é coerente com a documentação de visão de produto e casos de uso.
- **Relação com atas anteriores:** a matriz valor de negócio × esforço e a priorização do MVP já haviam sido discutidas na reunião de 23/09/2026; a ligação CP × requisitos e os ajustes de documentação foram tratados em 11/10/2026. Esta gravação é a apresentação oral desses artefatos.
