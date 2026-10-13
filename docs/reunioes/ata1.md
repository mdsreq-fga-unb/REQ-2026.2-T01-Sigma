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