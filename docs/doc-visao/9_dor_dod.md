# 9. Definition of Ready (DoR) e Definition of Done (DoD)

Para apoiar a condução iterativa e incremental do projeto SIGMA, foram definidos critérios de Definition of Ready (DoR) e Definition of Done (DoD). Esses acordos têm como finalidade estabelecer condições claras para determinar quando um Caso de Uso ou conjunto de fluxos está suficientemente preparado para ser selecionado para desenvolvimento e quando uma funcionalidade ou incremento pode ser considerado concluído.

A aplicação desses critérios busca garantir que as atividades de desenvolvimento sejam iniciadas com informações suficientes, decisões importantes previamente estabelecidas e escopo delimitado. Além disso, permite acompanhar a qualidade das entregas, verificar o atendimento aos requisitos e manter a rastreabilidade entre os objetivos específicos, as características do produto, os requisitos, os Casos de Uso e as funcionalidades implementadas.

---

## 9.1 Definition of Ready (DoR)

O Definition of Ready (DoR) estabelece as condições mínimas para que um Caso de Uso ou conjunto de fluxos esteja apto a ser selecionado para uma iteração de desenvolvimento. No contexto do SIGMA, um item será considerado pronto quando apresentar informações suficientes para orientar sua implementação, sem depender de decisões essenciais ou esclarecimentos ainda pendentes.

Para isso, devem ser atendidos os seguintes critérios:

- **Descrição formal do Caso de Uso:** O Caso de Uso está formalmente descrito, contendo de forma clara e sem ambiguidades a identificação dos atores, objetivo, pré-condições, pós-condições, fluxo principal e fluxos alternativos e de exceção aplicáveis.

- **Rastreabilidade verificável:** Há relação identificável com ao menos um objetivo específico, característica de produto ou requisito funcional/não funcional na Matriz de Rastreabilidade.

- **Regras de negócio compreendidas:** As regras de negócio necessárias para a implementação já foram compreendidas, registradas e relacionadas ao Caso de Uso.

- **Protótipo ou wireframe disponível:** Quando houver impacto na interface, existe um protótipo ou wireframe correspondente, suficientemente detalhado e validado para orientar o desenvolvimento.

- **Análise prévia realizada:** As dependências técnicas, os riscos e os impactos arquiteturais relevantes foram identificados e analisados previamente, evitando que decisões essenciais para a implementação permaneçam em aberto.

- **Escopo compatível com a iteração:** O escopo do Caso de Uso ou do conjunto de fluxos selecionado está delimitado e é compatível com a capacidade de desenvolvimento da equipe durante uma iteração.

- **Validação com a representante do projeto:** A representante do projeto validou o entendimento do Caso de Uso, confirmando sua adequação às necessidades do projeto, ao contexto de uso e às expectativas da comunidade atendida.

### Aplicação do DoR nos Casos de Uso

A avaliação do DoR deverá ser registrada individualmente para cada Caso de Uso ou conjunto de fluxos selecionado para desenvolvimento. Para isso, será utilizado um checklist que permita verificar o atendimento de cada critério, apresentando:

- Identificação do Caso de Uso e dos fluxos avaliados;
- Iteração em que o item está planejado para desenvolvimento;
- Situação de cada critério: Atendido, Não atendido ou Não aplicável;
- Evidências ou referências que comprovem o atendimento dos critérios;
- Justificativa para os critérios considerados não aplicáveis;
- Responsáveis e data da avaliação;
- Pendências identificadas e respectivas justificativas;
- Resultado final da avaliação: Ready ou Not Ready.

Um Caso de Uso ou conjunto de fluxos somente será considerado Ready quando todos os critérios aplicáveis estiverem atendidos. Critérios não aplicáveis deverão possuir justificativa registrada, enquanto pendências que impeçam o início seguro do desenvolvimento deverão ser resolvidas antes da seleção do item para a iteração.

---

## 9.2 Definition of Done (DoD)

O Definition of Done (DoD) estabelece as condições que devem ser atendidas para que uma funcionalidade ou incremento seja considerado concluído pela equipe. No SIGMA, apenas a implementação do código não será considerada suficiente para caracterizar uma entrega como finalizada. Será necessário verificar o atendimento aos requisitos, a qualidade técnica, a integração com o sistema e a conformidade com o escopo definido.

Uma funcionalidade ou incremento será considerado tecnicamente concluído quando os seguintes critérios aplicáveis forem atendidos:

- **Implementação conforme especificação:** A funcionalidade foi implementada de acordo com a especificação aprovada, contemplando o objetivo esperado, as regras de negócio e o escopo definido para o item.

- **Execução de testes:** Os testes aplicáveis, incluindo testes funcionais, unitários e de integração, foram executados com sucesso. As evidências dos testes deverão ser registradas, e eventuais testes não aplicáveis deverão possuir justificativa.

- **Integração e ausência de regressão:** A implementação foi integrada à base do projeto e verificada para garantir que não comprometa funcionalidades existentes. Os testes de regressão aplicáveis foram executados.

- **Revisão de código:** O código foi revisado por outro integrante da equipe e atende aos padrões técnicos e às convenções estabelecidas pelo grupo.

- **Conformidade com os requisitos não funcionais:** Foram verificados os requisitos não funcionais relacionados à funcionalidade, especialmente segurança, usabilidade, integridade das informações e desempenho, quando aplicáveis e definidos para o item.

- **Conformidade de interface e usabilidade:** Quando houver impacto na interface, os fluxos implementados foram verificados em relação aos protótipos ou às especificações aprovadas, considerando a clareza das informações e a facilidade de utilização.

- **Atualização da documentação:** A documentação pertinente foi atualizada, incluindo o estado dos requisitos e Casos de Uso relacionados, a Matriz de Rastreabilidade e as evidências dos testes e das revisões realizadas.

- **Demonstração da funcionalidade:** A funcionalidade foi demonstrada à equipe, permitindo verificar seu funcionamento e sua conformidade com o escopo implementado.

- **Alinhamento com o escopo:** A funcionalidade está de acordo com o escopo aprovado, sem incorporar alterações não autorizadas. Mudanças solicitadas durante o desenvolvimento deverão ser registradas e avaliadas antes de serem incorporadas.

- **Tratamento de pendências:** Os problemas identificados foram classificados de acordo com seu impacto e prioridade. Pendências impeditivas, que comprometam regras de negócio ou requisitos obrigatórios, impedem a conclusão do item. Problemas não impeditivos que permanecerem deverão ser documentados e encaminhados para tratamento posterior.

### Aplicação do DoD nas entregas

A aplicação do DoD deverá ser registrada para cada funcionalidade ou incremento desenvolvido, apresentando evidências que permitam verificar o atendimento dos critérios. O registro deverá conter, quando aplicável:

- Identificação do requisito, Caso de Uso e fluxos implementados;
- Iteração e versão da entrega;
- Evidências da implementação e dos testes executados;
- Referência à revisão do código e à integração realizada;
- Responsáveis pela implementação e revisão;
- Registro da demonstração à equipe;
- Resultado da validação pelo cliente ou representante, quando realizada;
- Pendências identificadas e sua classificação;
- Resultado final da avaliação.

A conclusão técnica da funcionalidade deverá ser registrada separadamente da homologação pelo cliente ou representante. Dessa forma, uma entrega que já atenda aos critérios técnicos, mas ainda aguarde avaliação do cliente, poderá ser identificada como tecnicamente concluída e aguardando homologação, sem ser apresentada como aprovada pelo cliente.

Quando realizada, a homologação deverá ter seu resultado registrado, indicando se a entrega foi aprovada, aprovada com ressalvas ou rejeitada. Caso sejam identificados problemas que comprometam os requisitos estabelecidos, deverão ser realizadas as correções necessárias antes de considerar a entrega definitivamente aceita.

Um item somente será considerado tecnicamente concluído quando todos os critérios aplicáveis do DoD estiverem atendidos e suas respectivas evidências estiverem registradas. A aprovação do cliente, quando necessária para a aceitação da entrega, deverá ser acompanhada separadamente.


### Situações utilizadas no acompanhamento das iterações

Para que o [acompanhamento das iterações](4_estrategias.md#45-acompanhamento-das-iteracoes) e o [cronograma](6_cronograma.md) não apresentem como concluída uma funcionalidade da qual só parte foi entregue, a equipe usa as situações abaixo. Cada item acompanhado deve informar a situação, as evidências e o que ainda falta.

| Situação | O que significa | Evidência mínima |
|---|---|---|
| Estrutura criada | Tabelas, migrações, configuração de ambiente ou esqueleto de código, ainda sem fluxo funcional para o usuário. | PR ou migração |
| Interface iniciada | Telas ou mocks existentes, ainda sem integração com o backend. | PR das telas |
| Implementada | Código do fluxo (frontend e backend) escrito, mas sem a verificação completa do DoD. | PR do fluxo |
| Integrada e verificada | Integrada à base do projeto, com os testes funcionais, de integração e de regressão aplicáveis executados. | Registro dos testes |
| Tecnicamente concluída | Todos os critérios aplicáveis do DoD atendidos, com as evidências registradas. | Registro de DoD |
| Aguardando homologação | Tecnicamente concluída, mas ainda sem avaliação da representante do projeto. | Registro de DoD |
| Homologada | Resultado da avaliação registrado: aprovada, aprovada com ressalvas ou rejeitada. | Registro da homologação |

Regras de uso:

- A palavra "concluída", sem qualificação, só é usada para "tecnicamente concluída". Em entregas parciais, informa-se a situação da tabela acima e lista-se o que falta.
- A conclusão técnica e a homologação são registradas separadamente. Uma entrega tecnicamente concluída e ainda sem avaliação da representante é "aguardando homologação", e não "aprovada".
- Uma pendência impeditiva (regra obrigatória ou fluxo essencial ainda não implementado) deve aparecer explicitamente como pendência e não pode ser coberta por uma marcação genérica de conclusão. Pendências não impeditivas podem permanecer abertas, desde que identificadas, classificadas e encaminhadas.
- Checklists de validação funcional, como os PDFs dos [registros de DoD](registros-dod/index.md), registram o escopo e o alinhamento com a cliente. Eles não substituem testes, integração, revisão de código e análise de requisitos não funcionais.


---

## Histórico de Versões

| Versão | Data | Descrição da Alteração | Autor(es) | Revisor(es) |
|---|---|---|---|---|
| [2.0](../versoes/v2/9_dor_dod.md) | 10/10/2026 | Criação da seção de DoR e DoD no Documento de Visão (Unidade 2). | Pedro Luca | Equipe SIGMA |
| [2.1](../versoes/v2_1/9_dor_dod.md) | 02/11/2026 | Reformulação dos critérios e aplicação de DoR e DoD com base nas Issues #29 e #30 ([PR #39](https://github.com/mdsreq-fga-unb/REQ-2026.2-T01-Sigma/pull/39)). | Lucas Peixoto | Gabriel Octacilio |
| **2.2 (Atual)** | 27/11/2026 | Correção da revisão do DoD: definição das situações usadas no acompanhamento das iterações (estrutura criada, interface iniciada, implementada, integrada e verificada, tecnicamente concluída, aguardando homologação, homologada) e das regras de uso da palavra "concluída". | Equipe SIGMA | A definir |
