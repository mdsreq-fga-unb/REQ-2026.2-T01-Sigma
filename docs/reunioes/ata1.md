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



=== "06/09/2026 - Reunião com o Cliente"
    # Reunião 3

    >06/09/2026 · 19:00–20:30 · Microsoft Teams · Com Cliente

    >[Link da reunião](https://youtu.be/RdfKNv9UFqM)

    ## 1. Pauta
    - Entendimento das dores atuais e do modelo de atuação do IBRADA no momento presente.
    - Expectativas para o MVP[cite: 4].
    - Mapeamento dos fluxos de comunicação prioritários com os diferentes públicos-alvo.
    - Alinhamento sobre hospedagem e custos de manutenção futura do software.

    ## 2. Assuntos debatidos
    * Momento Atual e Foco de Atuação: O IBRADA está focado em projetos que unem a recuperação de áreas degradadas (reflorestamento nas margens de rios/APP) com a inclusão socio-produtiva e o turismo de base comunitária.
    * Técnicas de Reflorestamento e Ecoturismo:
        * Técnicas adotadas: Recomposição vegetal por meio de RNA (Recuperação Natural Assistida), Nendo Dango (bolas de semente com argila/composto) e nucleação
        * Envolvimento comunitário: Capacitação e compra de mudas/esferas de sementes preparadas pelos próprios moradores e pequenos agricultores familiares
        * Trilhas ecológicas: Criação de rotas curtas (ex: 13 km) com pontos de descanso e sinalização com QR Code para rota de fuga, apoio de saúde (UBS/postinho) e ofertas de serviços da comunidade (hospedagem rústica, refeições, aluguel de cavalos e bicicletas)
    * Gargalos Operacionais e de Comunicação: Perda excessiva de tempo com explicações manuais repetitivas. O site precisa atuar como uma vitrine explicativa direta para evitar conversas iniciais extensas.
    * Adequação de Comunicação por Público-Alvo
    * Equipe do IBRADA: Formada por profissionais multidisciplinares (sociólogo, agrônomo, geógrafa, geólogo, economista e técnica em agroecologia).

    ## 3. Participantes

    >Somente equipe interna 

    | Nome |
    | --- |
    | Zayra Moraes |
    | Filipe Brito  | 
    | Vinicius Dos Santos  |
    | ArthurScartezini |
    | Cauã Mendes Coelho | 
    | Gabriel Guedes Fernandes |

    ## 4. Decisões/Revisões

    |Tipo|Descrição|
    |-|-|
    |Decisão|A prioridade máxima (MVP) será a construção de uma **Vitrine Interativa/Visual** (explicando o antes, durante e depois dos projetos) e a centralização dos canais de contato direcionados a cada público.|
    |Decisão|O WhatsApp será mantido como o principal canal de comunicação de entrada para beneficiários rurais e comunitários devido à facilidade de uso por mensagens de áudio.|
    |Decisão|A listagem detalhada de pacotes de trilhas para turistas fica categorizada como prioridade secundária no lançamento inicial.|
    |Revisão|Agora usaremos o RAD, por se encaixar melhor no que queremos apresentar ao cliente.|

    ## 5. Tarefas 

    * Estruturar a linguagem visual e o fluxo da "Vitrine do Projeto" cobrindo o ciclo de recuperação ambiental e impacto comunitário.
    * Consolidar os requisitos elicitados para elaborar a proposta formal de escopo do MVP e submeter à aprovação do cliente.



