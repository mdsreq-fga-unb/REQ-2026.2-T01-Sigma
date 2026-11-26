# 2. Solução Proposta
 
## 2.1 Objetivo Geral do Produto
 
O objetivo geral do produto é melhorar o sistema atual de organização e recuperação das informações das fichas, substituindo, de forma gradual e a partir das fichas de 2026, o processo atualmente realizado de forma manual e predominantemente física por um sistema digital de gerenciamento de cards de matrícula da Creche Estação Vida, centralizando o cadastro, armazenamento, consulta e atualização de informações.
 
A solução busca facilitar exclusivamente o trabalho da equipe responsável pela secretaria, tornando o acesso e a manutenção dos dados mais rápidos, organizados e seguros. Com isso, espera-se reduzir a dependência de documentos físicos, diminuir os riscos de perda ou deterioração das fichas e melhorar a eficiência dos processos administrativos da instituição, proporcionando uma gestão mais adequada das informações dos alunos.
 
A solução atende uma demanda única, exclusiva e interna do secretariado da Creche Estação Vida, ainda que a instituição use de sistemas da prefeitura para prestar contas e cuidar de outras áreas da creche. Portanto, o nosso projeto/produto de software não depende de qualquer tipo de aprovação municipal, tendo em vista que o cliente vai ser a logística interna da creche, onde as principais usuárias seriam a diretora, coodenadora e as secretárias da instituição. Dessa forma, nossa solução apresenta dois tipos de perfil definidos, o perfil de secretariado, o qual permitirá realizar o cadastro, consulta, atualização e organização das informações dos alunos, e o perfil de administrador, que terá acesso às mesmas funcionalidades do secretariado e com a capacidade adicional de gerenciar as contas de acesso da equipe (cadastrar novos usuários e inativar ou reativar contas existentes, conforme o [UC02](casos-uso/uc02.md)).
 
Os dados armazenados e mantidos pelo nosso sistema serão consumidos exclusivamente pela creche, não tendo vínculo nenhum com a prefeitura, uma vez que a mesma já tem um sistema próprio. Com isso em vista, o vínculo da instituição com a prefeitura não nos limita em nenhum ponto quanto à infraestrutura, uma vez que o sistema funcionará independentemente do sistema da prefeitura.
 
Tendo em vista que são dados pessoais e sensíveis de crianças (ver [3. Intervenção Social](3_intervencao.md)), a solução não depende de uma única medida. A restrição de acesso a usuários autenticados é a primeira barreira, mas, isoladamente, não demonstra que todas as necessidades de privacidade e proteção estejam atendidas. Por isso ela é apresentada como parte de um conjunto de medidas que apoia o atendimento à LGPD:

| Medida | O que está assumido pela equipe | Referências |
|---|---|---|
| Autenticação e perfis de acesso | Login com e-mail e senha, autenticação JWT, senhas criptografadas com Bcrypt e dois perfis (Administrador e Secretaria); rotas internas bloqueadas sem sessão ativa. | CP4, [UC01](casos-uso/uc01.md), [UC02](casos-uso/uc02.md), RNF02, [4.4](4_estrategias.md#44-decisoes-de-arquitetura-seguranca-e-riscos) |
| Encerramento de sessão | Sessão encerrada após 30 minutos de inatividade. | RN17 |
| Rastreabilidade das alterações | Histórico de edições das fichas e confirmação ao salvar. | CP8, RF17, [UC04](casos-uso/uc04.md) |
| Backup e recuperação | Backup diário do banco de dados via volumes do Docker; verificação de backup e recuperação planejada para a Transição. | RNF12, [4.4](4_estrategias.md#44-decisoes-de-arquitetura-seguranca-e-riscos), [Iteração 9](6_cronograma.md) |
| Privacidade de dados (LGPD) | Requisito transversal aplicado a todos os fluxos do MVP. | RNF01, [10.1](10_backlog.md#102-priorizacao-do-backlog-e-mvp) |
| Hospedagem | Sistema em nuvem, com login obrigatório. | [2.6](#26-viabilidade-da-proposta) |

Esta página não afirma que as necessidades de privacidade e proteção dos dados já estejam plenamente atendidas: as verificações de segurança, backup e recuperação estão previstas para a Iteração 9 (Transição).
 
## 2.2 Objetivos Específicos (OE) do Produto

- **OE.1:** Facilitar e agilizar a organização e a continuidade do processo administrativo.
- **OE.2:** Preservar e centralizar o histórico e as informações das matrículas.
- **OE.3:** Controlar o acesso e garantir a segurança das informações do sistema.
- **OE.4:** Facilitar a comunicação interna entre a equipe administrativa.

<span id="23-caracteristicas-de-produto"></span>
## 2.3 Características de Produto (mapeadas com os Objetivos Específicos do Produto)

| ID | OE Principal | Característica | Descrição resumida | Valor de negócio principal |
|---|---|---|---|---|
| CP1 | OE.2 | Concepção de cards de matrícula | Permitir o cadastro das informações dos alunos, centralizando os dados em cards de matrícula. | Redução do tempo de cadastro e de outras atividades da secretaria. |
| CP2 | OE.1 | Edição e Atualização de cards de matrícula | Permitir a edição dos atuais cards. | Garantir a atualização de dados do aluno. |
| CP3 | OE.1 | Consulta de informações dos cards de matrícula | Facilitar a consulta de cards de matrícula, ou um conjunto de tais. | Reduzir o tempo necessário para localizar um card, otimizando o tempo das secretárias. |
| CP4 | OE.3 | Controle de acesso de usuários | Permitir o cadastro de dois tipos de perfil disponíveis: o de Administrador, que possui acesso às mesmas funcionalidades do secretariado com a capacidade adicional de gerenciar as contas de acesso da equipe (cadastrar novos usuários e inativar ou reativar contas existentes, conforme o [UC02](casos-uso/uc02.md)), e o de secretariado, que ativa funções de cadastro, consulta, atualização e organização das informações dos alunos. | Controla o acesso ao sistema, proporcionando segurança e confiabilidade de informações. |
| CP5 | OE.2 | Gerenciamento de documentos | Anexação, substituição e download de documentos vinculados aos cards de matrículas. A exclusão de documentos não faz parte do escopo do MVP (ver nota abaixo). | Permite manter os documentos digitalizados vinculados ao card de matrícula, com correção por substituição e consulta por download. |
| CP6 | OE.4 | Avisos Rápidos | Postagem de avisos administrativos, para todos os usuários do sistema. | Facilita a comunicação entre as secretárias, facilitando o trabalho em equipe e coordenação no time. |
| CP7 | OE.1 | Gerenciamento de turmas e etapas | Criação, edição e inativação de turmas e etapas; vínculo de cards em turmas e etapas. | Facilita a organização dos cards de alunos, ajudando a logística entre as secretárias e otimizando o tempo de busca de um card. |
| CP8 | OE.3 | Auditoria e Integridade | Registrar o histórico de edições e exigir confirmação em operações de salvamento. | Garantir total rastreabilidade e segurança contra alterações indevidas ou perdas acidentais de dados. |
| CP9 | OE.4 | Gestão de Notificações e Alertas | Garantir que os alertas e notificações emitidos pelo sistema após operações realizadas pelos usuários possam ser administrados livremente em seus respectivos ambientes. | Garantir total liberdade na administração de configurações de alertas e notificações. |

**Nota sobre CP5 (exclusão de documentos):** versões anteriores desta página citavam a "deleção" de documentos. O [UC05](casos-uso/uc05.md), o [Catálogo Unificado de Requisitos](8_requisitos.md) (RF14 a RF16) e o recorte do MVP tratam apenas de anexar, substituir e baixar documentos; não há requisito de exclusão. Portanto, **a exclusão de documentos não está no escopo do MVP**, e um documento anexado por engano é corrigido por substituição (RF15). O tratamento do arquivo anterior na substituição continua como decisão pendente registrada no UC05. Se a cliente solicitar a exclusão, ela deve entrar como novo requisito, com perfil autorizado, confirmação e regra de preservação das informações definidos antes de ser planejada.



 
## 2.4 Tecnologias a Serem Utilizadas
 
| Camada / Categoria | Tecnologias & Ferramentas |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy |
| Frontend | Next.js, Axios |
| Banco de Dados | PostgreSQL |
| Versionamento | Git e GitHub |
| Conteinerização | Docker |
| Prototipação | Figma |
| Hospedagem | Nuvem (decisão de 06/10/2026); provedor a definir na Iteração 8 (Construção, 20/11 a 26/11), quando o ambiente de pré-produção é provisionado (suporte a Docker/PostgreSQL, até 20 GB e ~US$ 5/mês) |
 
## 2.5 Pesquisa de Mercado e Análise Competitiva
 
O mercado de soluções para gestão de instituições de ensino e creches possui diversas plataformas voltadas ao cadastro e gerenciamento de informações de alunos. Entre as soluções existentes, destacam-se:
 
- **Sistemas de gestão escolar**, como o Sponte, que oferecem recursos para matrícula, cadastro de alunos, documentos escolares, frequência e outros processos administrativos e pedagógicos. Essas plataformas possuem uma ampla variedade de funcionalidades, mas podem apresentar recursos que não são necessários para a realidade específica da Creche Estação Vida.
- **Sistemas de gestão educacional de código aberto**, como o i-Educar, que permitem o gerenciamento de informações escolares e são utilizados principalmente por redes públicas de ensino. Apesar de oferecerem possibilidades de adaptação, possuem uma estrutura voltada para uma gestão educacional mais ampla.
- **Documentos e fichas físicas**, que ainda representam uma alternativa utilizada pela instituição para armazenar as informações dos alunos. Embora permitam o registro dos dados, esse modelo dificulta a consulta, atualização e organização das informações, além de exigir espaço físico e aumentar os riscos de perda ou deterioração dos documentos.
A proposta se diferencia por ser uma solução enxuta e desenvolvida de acordo com as necessidades da Creche Estação Vida, tendo como foco principal o cadastro, armazenamento, consulta e manutenção dos cards de matrícula a partir de 2026. Em vez de oferecer uma grande quantidade de funcionalidades que não fazem parte da necessidade atual da instituição, o sistema será direcionado aos processos que atualmente geram maior dificuldade para a equipe administrativa.
 
Dessa forma, a solução busca oferecer uma ferramenta voltada aos processos de cadastro, consulta, atualização e organização dos cards de matrícula, com interface que possa ser utilizada pelas profissionais da secretaria sem conhecimentos técnicos específicos, considerando principalmente o número reduzido de profissionais responsáveis pela secretaria e a grande quantidade de documentos físicos acumulados ao longo dos anos. A proposta pretende, portanto, digitalizar as fichas a partir de 2026, mantendo a possibilidade de aumentar o escopo gradualmente, permitindo estabelecer uma forma mais organizada e eficiente de gerenciamento das informações dos alunos.
 
## 2.6 Viabilidade da Proposta
 
Após a análise inicial, o cliente apresentou informações suficientes para o levantamento inicial de requisitos e para a definição de uma proposta de solução viável no contexto da disciplina. A equipe possui conhecimento técnico suficiente para desenvolver as principais funcionalidades previstas dentro do prazo estipulado, utilizando tecnologias compatíveis com sua capacidade técnica. Ademais, o acesso ao cliente é viável ao longo do período de desenvolvimento do projeto, possibilitando esclarecimento de dúvidas e validação das entregas.
 
A infraestrutura da instituição também não é um impedimento para o uso do nosso produto, tendo em vista que é um lugar com conectividade estável e conta com um acervo de computadores disponível maior do que o necessário. Sobre o nível de conhecimento tecnológico das secretárias, por já terem usado sistemas digitais antes, tais profissionais não declararam ser uma dificuldade usar o nosso produto. A digitalização do acervo é plenamente concebível: a cliente declarou que não espera que todas as fichas sejam digitalizadas para o sistema, e que planeja começar a usar o produto no primeiro semestre de 2027, o que faz com que nosso sistema seja usado paralelamente com as fichas antigas, substituindo-as pouco a pouco.

### Transição gradual e uso do papel

A solução reduz a dependência do papel de forma gradual; o MVP não elimina o uso de documentos físicos. O tratamento assumido para cada situação é:

| Situação | Tratamento | Referência |
|---|---|---|
| Fichas anteriores a 2026 (acervo e "arquivo morto") | Fora do escopo de migração; permanecem em papel, arquivadas como hoje. | [1.5](1_cenarioAtual.md), ata (decisão 3) |
| Piloto (Iteração 9, até 01/12/2026) | 5 fichas selecionadas são digitalizadas e digitadas no sistema e conferidas com as secretárias; os documentos físicos de origem permanecem arquivados, pois servem de base para a conferência. | [6. Cronograma](6_cronograma.md) |
| Fichas de 2026 fora do piloto, até a operação em larga escala | Continuam em papel; sistema e fichas antigas são usados em paralelo. | 2.6, [6. Cronograma](6_cronograma.md) |
| Operação em larga escala (início de uso planejado pela cliente para o 1º semestre de 2027, com as novas turmas) | Fichas novas passam a ser cadastradas no sistema; o papel é substituído gradualmente, sem garantia de substituição total. | 2.6, [6. Cronograma](6_cronograma.md) |
| Documentos que continuarem fora do sistema | Mantidos em papel e guardados pela secretaria; o procedimento de guarda e consulta, e a convivência com o sistema, devem ser combinados com a cliente durante a homologação. | [4.1.3](4_estrategias.md) |

Com relação ao serviço de hospedagem em nuvem, a equipe teve uma reunião com a secretária Letícia Pretto na data de 06/10/2026 abordando o tema, onde foram apresentadas as opções de manter um servidor local ou serviço na nuvem. Levando em conta que a cliente realiza viagens para São Paulo em certos períodos, um serviço na nuvem que permite o acesso em qualquer lugar oferece mais valor neste contexto, tendo sido avaliado um valor estimado de US$ 5/mês e plano de até 20 GB. A decisão definitiva da plataforma de hospedagem será realizada na **Iteração 8 (Construção)**, quando o ambiente de pré-produção será provisionado ([6. Cronograma](6_cronograma.md)), utilizando como critérios de escolha o suporte à arquitetura conteinerizada do sistema (Docker, Next.js, FastAPI e PostgreSQL), armazenamento mínimo de 20 GB, facilidade de backup e adequação ao orçamento de até US$ 5/mês.

Quanto ao custeio e à manutenção da infraestrutura, durante a fase de testes, homologação e piloto (até o encerramento da disciplina), serão utilizados planos gratuitos ou créditos estudantis; a partir do início da operação em produção, a Creche Estação Vida passará a arcar com os custos mensais da assinatura em nuvem. Para garantir a continuidade e a manutenção do sistema após a entrega, a equipe disponibilizará toda a documentação técnica necessária para uma futura equipe de TI. O responsável pela manutenção após o encerramento da disciplina **ainda não está formalmente definido**: quem assumirá correções, atualizações e suporte deve ser confirmado com a cliente e registrado até a Iteração 9 (aceite), e este ponto segue como risco em [3. Intervenção Social](3_intervencao.md).
 
Dado o prazo estabelecido, conhecimento técnico disponível e a proximidade com o cliente, considera-se viável a entrega de um MVP funcional, cobrindo as principais funcionalidades estabelecidas. Portanto, a proposta é técnica e operacionalmente viável dentro do contexto da disciplina.
 
## 2.7 Benefícios Esperados
 
### 2.7.1 Benefícios para o Cliente
 
Dentre os benefícios previstos para o cliente em questão, podemos incluir:
 
- Facilidade na gestão das matrículas dos alunos da instituição, dado o maior controle operacional que a solução visa implementar;
- Redução do custo da emissão de matrículas devido ao processo integrado e digital;
- Diminuição do tempo para localizar uma ficha criada desde 2026 (referência relatada pelas funcionárias: de 4 a 10 minutos com fichas em papel);
- Redução do risco de perda e deterioração das fichas cadastradas no sistema, em comparação com o papel (referência relatada: 4 a 6 fichas perdidas ou deterioradas por ano). É um benefício esperado, e não uma garantia: o armazenamento digital também apresenta riscos (falhas, perda de acesso, backup e recuperação), e a redução depende de condições como o backup diário do banco, a verificação de backup e restauração na Transição (RNF12), o controle de acesso e as fichas estarem de fato cadastradas (no piloto, apenas 5 fichas);
### 2.7.2 Benefícios para os Usuários
 
Dentre os benefícios previstos para os usuários do sistema, podemos incluir:
 
- Facilidade no preenchimento de matrículas, exigindo menos esforço e aumentando a praticidade;
- Praticidade na busca por informações com um banco de dados integrado;
- Informações dos alunos mais protegidas e confiáveis, por meio das medidas descritas em 2.1 (controle de acesso, rastreabilidade das alterações e backup).


---

## Histórico de Versões

| Versão | Data | Descrição da Alteração | Autor(es) | Revisor(es) |
|---|---|---|---|---|
| [1.0](../versoes/v1/2_solucao.md) | 07/09/2026 | Criação inicial da solução proposta (Unidade 1). | Gabriel Octacilio | Equipe SIGMA |
| [2.0](../versoes/v2/2_solucao.md) | 12/10/2026 | Atualização dos OEs, CPs (CP1–CP8) e correções da Unidade 2. | Pedro Luca, Gabriel Octacilio | Equipe SIGMA |
| [2.1](../versoes/v2_1/2_solucao.md) | 06/11/2026 | Separação dos perfis (secretariado/administrador) e inclusão de viabilidade em nuvem (Issue #22). | Jorge Vásquez | Gabriel Octacilio |
| [2.2](../versoes/v2_2/2_solucao.md) | 16/11/2026 | Detalhamento das permissões do perfil Administrador e definição de prazo/critérios de hospedagem, custeio e manutenção (Issue #22 / PR #72). | Pedro Luca | Equipe SIGMA |
| **2.3 (Atual)** | 26/11/2026 | Correções da revisão da Visão: CP5 sem exclusão de documentos, benefícios sem promessas absolutas, transição gradual e papel físico, segurança como conjunto de medidas, perfis alinhados ao UC02, hospedagem (Iteração 8 é Construção) e responsável pela manutenção marcado como não definido. | Equipe SIGMA | A definir |