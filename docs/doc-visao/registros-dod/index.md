# Registros de Validação e Evidências do DoD

Esta seção reúne os checklists de funcionalidades elaborados pela liderança da equipe e validados com a representante da Creche Estação Vida. Os documentos são apresentados em PDF para preservar o registro validado e facilitar sua consulta pela equipe.

Os PDFs disponíveis registram os fluxos e comportamentos funcionais contemplados na validação de cada Caso de Uso. Eles constituem evidências de validação funcional e de alinhamento do escopo com a cliente. **Não substituem, isoladamente, os demais registros técnicos previstos no DoD**, como evidências de testes, integração, revisão de código, análise de requisitos não funcionais e atualização da documentação.

## Registros disponíveis

| Caso de Uso | Documento | Conteúdo resumido | Acesso |
|---|---|---|---|
| **UC01 — Gerenciar Autenticação** | Checklist de funcionalidades | Login, logout, tratamento de credenciais inválidas, acesso não autenticado, falha de conexão, bloqueio temporário e conta inativa. | [Abrir PDF](pdfs/UC01_Gerenciar_Autenticar.pdf) |
| **UC02 — Gerenciar Usuários Administrativos** | Checklist de funcionalidades | Cadastro, cancelamento, inativação e reativação de usuários, validação de e-mail, campos obrigatórios, senha e conectividade. | [Abrir PDF](pdfs/UC02_Gerenciar_Usuarios_Administrativos.pdf) |
| **UC06 — Gerenciar Estrutura Escolar** | Checklist de funcionalidades (versão atualizada) | Cadastro de etapas e turmas, cancelamento, fluxos pós-MVP, exceções e requisitos não funcionais de acesso e desempenho. | [Abrir PDF](pdfs/UC06_Gerenciar_Estrutura_Escolar_atualizado.pdf) |

## Visualização dos documentos

### UC01 — Gerenciar Autenticação

<details>
<summary>Visualizar checklist validado do UC01</summary>

<iframe src="pdfs/UC01_Gerenciar_Autenticar.pdf" width="100%" height="650" title="Checklist de funcionalidades do UC01" loading="lazy"></iframe>

Caso a visualização incorporada não esteja disponível no navegador, <a href="pdfs/UC01_Gerenciar_Autenticar.pdf" target="_blank" rel="noopener">abra o PDF em uma nova aba</a>.

</details>

### UC02 — Gerenciar Usuários Administrativos

<details>
<summary>Visualizar checklist validado do UC02</summary>

<iframe src="pdfs/UC02_Gerenciar_Usuarios_Administrativos.pdf" width="100%" height="650" title="Checklist de funcionalidades do UC02" loading="lazy"></iframe>

Caso a visualização incorporada não esteja disponível no navegador, <a href="pdfs/UC02_Gerenciar_Usuarios_Administrativos.pdf" target="_blank" rel="noopener">abra o PDF em uma nova aba</a>.

</details>

### UC06 — Gerenciar Estrutura Escolar

<details>
<summary>Visualizar checklist atualizado do UC06</summary>

<iframe src="pdfs/UC06_Gerenciar_Estrutura_Escolar_atualizado.pdf" width="100%" height="650" title="Checklist de funcionalidades do UC06" loading="lazy"></iframe>

Caso a visualização incorporada não esteja disponível no navegador, <a href="pdfs/UC06_Gerenciar_Estrutura_Escolar_atualizado.pdf" target="_blank" rel="noopener">abra o PDF em uma nova aba</a>.

</details>

## Inclusão de novos registros

Quando um novo checklist em PDF for elaborado e validado:

1. Salve o PDF na pasta `pdfs/`, utilizando um nome que identifique o Caso de Uso e, quando necessário, a versão ou data do documento.
2. Acrescente uma linha correspondente na tabela **Registros disponíveis**.
3. Inclua uma subseção de visualização, copiando o bloco `<details>` de um registro existente e ajustando o nome e o caminho do arquivo.
4. Registre somente informações confirmadas, como responsável pela elaboração, data e resultado da validação. Não presuma datas ou aprovações que não estejam documentadas.
5. Confira a página localmente com `mkdocs serve` e confirme que o link abre o PDF.

O arquivo [modelo de registro](modelo.md) contém um bloco reutilizável para cadastrar os próximos documentos.
