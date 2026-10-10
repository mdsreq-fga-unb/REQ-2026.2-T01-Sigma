# 9. Definition of Ready (DoR) e Definition of Done (DoD)

Para apoiar a condução iterativa e incremental do projeto SIGMA, foram definidos critérios de Definition of Ready (DoR) e Definition of Done (DoD). Esses acordos têm como finalidade tornar explícito quando um item está suficientemente preparado para ser selecionado para desenvolvimento e quando uma entrega pode ser considerada efetivamente concluída.

---

## 9.1 Definition of Ready (DoR)

### 9.1.1 Conceito

O Definition of Ready (DoR) estabelece as condições mínimas para que um conjunto de requisitos ou um Caso de Uso esteja pronto para ser selecionado para a iteração. No contexto do SIGMA, um item só será considerado pronto se apresentar informações suficientes para uma implementação segura no sistema, sem depender de informações emergentes oriundas de decisões vitais em aberto.

### 9.1.2 Critérios do DoR

A lista a seguir abrange todas as condições do DoR para que um item seja selecionado para uma iteração:

- **Regras de Negócio compreendidas:** Regras de Negócio relacionadas ao item inteiramente compreendidas e registradas;
- **Análise prévia realizada:** Houve uma análise prévia das dependências técnicas, riscos e impactos;
- **Rastreabilidade verificável:** Há uma relação verificável com pelo menos um objetivo específico, característica de produto e/ou requisito funcional;
- **Critérios de aceitação definidos:** O Caso de Uso está de acordo com os critérios de aceitação e regras de negócio que permitem verificar a conclusão;
- **Validação com o cliente:** O cliente já validou a aplicação do Caso de Uso, atestando o valor de negócio e importância para o projeto;
- **Escopo compatível com a iteração:** O escopo do Caso de Uso ou do conjunto selecionado é proporcional e adequado à duração da iteração;
- **Mensuração técnica completa:** Os conhecimentos acerca da real implementação da funcionalidade relacionada ao item estão bem mensurados e abrangidos, isto é, não há lacunas referentes à utilização e funcionamento;
- **Detalhamento suficiente:** Detalhamento suficiente da funcionalidade para a real implementação.

---

## 9.2 Definition of Done (DoD)

### 9.2.1 Conceito

O Definition of Done (DoD) estabelece as condições a serem atendidas para que uma funcionalidade seja considerada concluída pela equipe. No SIGMA, apenas a implementação do código não será considerada como critério suficiente para tratar a entrega como finalizada. Será necessário, ainda, verificar o atendimento aos requisitos, qualidade técnica, integração com o sistema e conformidade com o escopo definido.

### 9.2.2 Critérios do DoD

Um item será considerado concluído quando os seguintes critérios aplicáveis forem atendidos:

- **Implementação conforme especificação:** A funcionalidade foi implementada de acordo com a especificação aprovada, contemplando o objetivo esperado, as regras de negócio e o escopo definido para o item.
- **Verificação dos critérios de aceitação:** Todos os critérios de aceitação foram verificados.
- **Execução de testes:** Os testes aplicáveis, incluindo testes funcionais, unitários e de integração, foram executados com sucesso.
- **Integração e ausência de regressão:** A implementação foi integrada ao projeto e revisada para verificar se não compromete as funcionalidades existentes.
- **Revisão de código:** O código foi revisado pela equipe e atende aos padrões técnicos acordados pelo grupo.
- **Conformidade com RNFs:** Foram verificados os requisitos não funcionais relacionados à funcionalidade, especialmente segurança, usabilidade, integridade das informações e desempenho, quando aplicáveis e definidos para o item.
- **Conformidade de interface e usabilidade:** Quando houver impacto na interface, os fluxos implementados foram verificados em relação aos protótipos ou às especificações aprovadas, considerando a clareza das informações e a facilidade de utilização.
- **Atualização da documentação:** A documentação pertinente foi atualizada, incluindo o estado do requisito, sua característica de produto relacionada e as evidências dos testes e das revisões realizadas.
- **Demonstração e homologação:** A funcionalidade foi demonstrada e verificada pela equipe. Quando a validação do cliente ou de seu representante for aplicável, o resultado deverá ser registrado. Caso a homologação ainda esteja pendente, isso deverá permanecer explícito, sem apresentar a entrega como aprovada pelo cliente.
- **Alinhamento com o escopo:** A funcionalidade está de acordo com o escopo aprovado, sem incorporar alterações não autorizadas. Mudanças solicitadas durante o desenvolvimento deverão ser registradas e avaliadas antes de serem incorporadas.
- **Tratamento de pendências:** Os problemas não impeditivos que permanecerem deverão ser documentados, classificados por impacto e prioridade e encaminhados para tratamento posterior. Pendências que comprometam critérios de aceitação ou requisitos obrigatórios impedem que o item seja considerado concluído.
