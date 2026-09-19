## 7 Interação entre Equipe e Cliente

### 7.1 Composição da Equipe

| Papel | Descrição | Responsáveis |
|---|---|---|
| Gerente de projeto | Coordenar as atividades do projeto, gerenciar o cronograma das sprints e facilitar a comunicação entre a equipe e os stakeholders. | Gabriel Vieira |
| Desenvolvedor Frontend | Implementar as interfaces do sistema a partir dos protótipos validados. | Bryan Rodrigues, Jorge Vásquez |
| Desenvolvedor Backend | Responsável por desenvolver as regras de negócio, estruturar a comunicação com o banco de dados e APIs. | Lucas Peixoto, João Rolim, Pedro Rocha |
| Analista de Requisitos | Conduzir elicitação, análise, declaração e representação dos requisitos. | Bryan, Gabriel, Lucas, João, Pedro, Jorge |
| Analista de Qualidade | Escrever e executar os casos de teste, verificar os critérios de aceitação, controlar o DoR/DoD e registrar defeitos. | Gabriel Vieira, Pedro Rocha |
| Designer / Prototipação | Produzir os protótipos no Figma, conduzir os testes de usabilidade e aplicar os ajustes necessários na interface. | Bryan Rodrigues, Jorge Vásquez |

### 7.2 Comunicação

**Ferramentas de comunicação**

- **Google Meet**: Será a ferramenta utilizada pela equipe para as reuniões semanais por meio de videoconferência, bem como para o contato formal com o cliente. As reuniões com a instituição contarão com a presença do Gerente de Projeto e desenvolvedores da equipe, juntamente com as representantes da creche (a diretora Cirlene Sena, a coordenadora Kananda Sena, ou as secretárias, dependendo da pauta). Todas as reuniões realizadas terão suas evidências disponibilizadas no site/repositório do projeto.
- **Whatsapp**: Será utilizado para interações rápidas diárias entre a equipe técnica e para contato direto com a diretora e secretárias. Para garantir a rastreabilidade, quaisquer definições, validações ou decisões importantes recebidas pelo WhatsApp serão formalmente registradas e documentadas em atas de reunião ou dentro do repositório.

**Métodos e frequência de reuniões**

- **Reunião de planejamento de Sprint (Interna)**: A equipe realizará uma reunião de planejamento após a conclusão do sprint anterior para organizar e priorizar as atividades a serem feitas para o próximo sprint, levando em conta o progresso do projeto em atendimento ao cronograma definido.
- **Reunião de revisão de Sprint (Interna)**: Para finalizar um sprint, a equipe técnica realizará uma reunião interna com o objetivo de apresentar e revisar entre os desenvolvedores as funcionalidades construídas, identificar pontos de melhoria no código e atualizar o cronograma.

**Frequência de interações com o cliente**

- **Reunião de validação com o cliente (Externa)**: Após a revisão interna, a equipe fará uma reunião específica para apresentar o estado atual do projeto e as funcionalidades entregues para a diretora Cirlene Sena e as secretárias. Nesta reunião, os clientes poderão avaliar as entregas e fornecer o feedback necessário.

### 7.3 Processo de Validação

O processo de validação deve garantir que o sistema atende com sucesso às necessidades da Creche Estação Vida. A validação ocorrerá através das seguintes etapas e definições:

- **Validação contínua**: Desde o início do projeto, protótipos de tela e fluxos de navegação serão validados continuamente com as secretárias (principais usuárias) para garantir o alinhamento com a rotina administrativa antes da implementação final.
- **Testes de usabilidade**: Focados na experiência de uso. Serão realizados com as secretárias para garantir que a solução seja clara, intuitiva e não exija conhecimentos técnicos avançados para ser operada no dia a dia.
- **Testes de aceitação**: Os testes de aceitação são focados nas regras de negócio, ocorrem para garantir que as funcionalidades implementadas (como o cadastro, busca e edição de alunos) cumpram rigorosamente com os critérios de aceitação estabelecidos junto à diretora e às secretarias.

#### 7.3.1 Definition of Ready (DoR)

Um item só entra em uma iteração quando:

- Está escrito como história de usuário ou caso de uso e vinculado a um objetivo específico (OE) e a uma característica de produto (CP);
- Possui critérios de aceitação escritos no formato Dado / Quando / Então, cobrindo no mínimo o fluxo principal e um fluxo alternativo ou de erro;
- Tem as regras de negócio e os campos obrigatórios da ficha confirmados com a coordenação ou a secretaria;
- Tem protótipo de tela validado, quando envolver interface;
- Tem o perfil de acesso definido (quem pode visualizar, cadastrar ou editar);

#### 7.3.2 Definition of Done (DoD)

Uma funcionalidade é considerada concluída quando:

- O código foi revisado e aprovado em pull request por ao menos um membro que não seja o autor, e integrado à branch principal;
- Os testes automatizados da funcionalidade passam e o pipeline está verde;
- Todos os critérios de aceitação foram verificados e não possuem defeitos críticos;
- A documentação e o requisito correspondente foram atualizados, com a issue vinculada e fechada;
- A funcionalidade foi registrada e demonstrada ao cliente na reunião de validação;
