# Como instalar os registros PDF do DoD no SIGMA

1. Copie a pasta `registros-dod` para `docs/doc-visao/` do repositório.
2. Confirme que a estrutura ficou assim:

```text
docs/doc-visao/registros-dod/
├── index.md
├── modelo.md
└── pdfs/
    ├── UC01_Gerenciar_Autenticar.pdf
    ├── UC02_Gerenciar_Usuarios_Administrativos.pdf
    └── UC06_Gerenciar_Estrutura_Escolar_atualizado.pdf
```

3. No `mkdocs.yml`, adicione uma entrada ao menu dentro de `Visão do Produto e Projeto`, se ainda não existir:

```yaml
      - 12 Registros de DoD: doc-visao/registros-dod/index.md
```

4. Execute `mkdocs serve` e teste os links e as visualizações dos PDFs.
5. Se o iframe não for exibido em algum navegador, o link `Abrir PDF` continuará disponível como alternativa.

Os arquivos PDF são mantidos sem alterações. Para cadastrar outro PDF no futuro, siga as instruções de `modelo.md`.
