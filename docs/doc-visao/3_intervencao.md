# 3. Intervenção Social

A implementação do sistema na Creche Estação Vida busca **melhorar a rotina dos profissionais e, consequentemente, o atendimento oferecido às crianças e suas famílias.** Ao substituir parte do trabalho manual por um sistema digital, as secretárias poderão encontrar e atualizar informações com mais facilidade, reduzindo o tempo gasto procurando fichas e organizando documentos.

## Impactos Positivos Esperados

- Facilitar o trabalho diário das secretárias;
- Diminuir o acúmulo e a dependência de documentos físicos;
- Reduzir os riscos de perda das informações dos alunos;
- Tornar o atendimento às famílias mais rápido e organizado;
- Facilitar o acesso às informações necessárias pelas profissionais da creche;
- Contribuir para uma instituição mais organizada e preparada para atender a comunidade.

## Riscos e Desafios da Intervenção

Apesar dos benefícios esperados, a digitalização das fichas de matrícula introduz riscos que não existiam (ou existiam de outra forma) no processo manual. Esses riscos foram organizados em três frentes: privacidade e segurança da informação, operação e infraestrutura, e impacto organizacional sobre as pessoas envolvidas.

### Privacidade e segurança da informação

- **Exposição indevida de dados de crianças e famílias:** a centralização das fichas em um único sistema aumenta o impacto de um eventual vazamento ou acesso indevido, já que dados sensíveis (de crianças em situação de vulnerabilidade social) passam a estar concentrados digitalmente.
- **Ampliação do número de pessoas com acesso às informações:** diferente das fichas físicas, cujo acesso é naturalmente restrito pelo local de armazenamento, um sistema digital pode facilitar o acesso simultâneo por mais pessoas, exigindo controle explícito sobre quem pode ver o quê.
- **Impactos da consulta mais fácil sobre privacidade e vigilância:** a agilidade trazida pelo sistema pode ser percebida (ou efetivamente utilizada) como uma forma de vigilância sobre crianças e famílias, o que exige cuidado na forma como o acesso às informações dos alunos e o rastreamento de consultas são implementados e comunicados.

### Operação e infraestrutura

- **Dependência de internet e infraestrutura:** ao contrário das fichas físicas, o sistema depende de conectividade e equipamentos, o que representa um risco em uma instituição com histórico de infraestrutura de TI limitada.
- **Indisponibilidade do sistema durante o atendimento:** falhas técnicas ou quedas de conexão durante o atendimento às famílias podem interromper processos que hoje são resolvidos manualmente.
- **Erros durante a migração:** a transferência dos dados das fichas físicas acumuladas ao longo de mais de 20 anos para o sistema digital está sujeita a erros de digitação, duplicidade ou inconsistência de dados.
- **Perda de informações no processo de digitalização:** documentos antigos, deteriorados ou incompletos podem resultar em perda definitiva de informações caso não sejam tratados com cuidado durante a digitalização.
- **Coexistência entre fichas físicas e digitais:** durante o período de transição, a instituição precisará manter os dois formatos em paralelo, o que pode gerar divergências entre os registros físico e digital.
- **Manutenção após o encerramento do projeto:** como o desenvolvimento ocorre no contexto de uma disciplina, com prazo definido, é necessário considerar como a equipe vai se responsabilizar por correções, atualizações e suporte ao sistema após a entrega final.

### Impacto organizacional e humano

- **Aumento temporário da carga das secretárias:** no período de transição, as secretárias precisarão conduzir a migração e a digitalização dos dados junto com suas atividades rotineiras, o que pode sobrecarregar a equipe reduzida (apenas duas secretárias).
- **Resistência ou dificuldade de uso:** funcionárias com pouca familiaridade com tecnologia podem ter dificuldade de adaptação, gerando resistência ao novo processo caso não haja apoio adequado.
- **Alteração das atribuições entre direção, coordenação, secretaria e equipe pedagógica:** o novo sistema pode redistribuir responsabilidades sobre quem cadastra, quem consulta e quem valida informações, exigindo que esses papéis sejam redefinidos junto à instituição.

## Requisitos e Decisões Decorrentes

Os riscos identificados foram convertidos em requisitos e decisões de projeto, de modo que a intervenção social seja considerada desde a concepção da solução:

- **Acesso mínimo conforme o papel (least privilege):** cada perfil de usuário (direção, coordenação, secretaria, equipe pedagógica) terá acesso apenas às informações necessárias para suas funções, mitigando a exposição indevida de dados.
- **Backup e recuperação:** deverão existir rotinas de backup, de forma a mitigar perdas de informação em caso de falhas técnicas, indisponibilidade do sistema ou erros durante a migração.
- **Implantação gradual:** a transição do processo manual para o digital ocorrerá de forma progressiva, permitindo a coexistência controlada entre fichas físicas e digitais e reduzindo o impacto da mudança sobre a rotina da secretaria.
- **Validação da migração:** os dados migrados das fichas físicas para o sistema deverão passar por um processo de validação, reduzindo o risco de erros e perda de informações durante a digitalização.
- **Treinamento:** será oferecido treinamento às profissionais responsáveis pelo uso do sistema, buscando reduzir a resistência e a dificuldade de adaptação à nova ferramenta.

Dessa forma, a intervenção não beneficia apenas a administração da creche. Ao melhorar a organização interna — de forma consciente dos riscos envolvidos e das decisões necessárias para mitigá-los — o sistema pode **refletir na rotina de toda a comunidade atendida,** proporcionando um atendimento mais eficiente às famílias e permitindo que as profissionais dediquem menos tempo à procura e organização de documentos e mais tempo às atividades relacionadas às crianças.
