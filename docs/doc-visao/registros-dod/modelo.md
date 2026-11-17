# Modelo de apresentação de checklist DoD em PDF

Este modelo deve ser utilizado quando a equipe receber um novo checklist de funcionalidades em PDF elaborado pela liderança e validado com a representante do projeto. O PDF deve ser mantido como documento original da validação; este arquivo organiza sua identificação e apresentação no site.

**Não substitua nem edite o PDF validado para preencher este modelo.** Copie os blocos abaixo para o `index.md`, preencha os dados confirmados e mantenha o arquivo PDF na pasta `pdfs/`.

## 1. Identificação do registro

| Campo | Informação |
|---|---|
| Caso de Uso | UCXX — Nome do Caso de Uso |
| Documento | Nome do checklist de funcionalidades |
| Arquivo PDF | `pdfs/arquivo_do_checklist.pdf` |
| Responsável pela elaboração | A preencher, se registrado |
| Data do documento | A preencher, se registrada |
| Validação com a representante | A preencher conforme registro disponível |
| Observações | A preencher, se necessário |

## 2. Link para o PDF

Substitua o nome do arquivo pelo PDF correspondente:

[**Abrir checklist em PDF**](pdfs/arquivo_do_checklist.pdf)

## 3. Bloco para visualizar o PDF na página

Copie o bloco HTML abaixo para o `index.md`. Atualize o texto do resumo, o título e os dois caminhos para que correspondam ao arquivo real.

```html
<details>
<summary>Visualizar checklist validado do UCXX</summary>

<iframe
  src="pdfs/arquivo_do_checklist.pdf"
  width="100%"
  height="650"
  title="Checklist de funcionalidades do UCXX"
  loading="lazy">
</iframe>

<p>
  Caso a visualização incorporada não esteja disponível,
  <a href="pdfs/arquivo_do_checklist.pdf" target="_blank" rel="noopener">abra o PDF em uma nova aba</a>.
</p>

</details>
```

## 4. Resumo do conteúdo

Descreva brevemente quais fluxos, funcionalidades ou requisitos aparecem no documento. Não acrescente ao resumo comportamentos que não estejam registrados no PDF.

- Fluxos / funcionalidades contemplados: A preencher.
- Requisitos relacionados identificados no documento: A preencher.
- Observações relevantes: A preencher.

## 5. Relação com o DoD

O checklist em PDF pode servir como evidência de validação funcional e de alinhamento do escopo com a cliente. A conclusão técnica pelo DoD continua dependendo das demais evidências aplicáveis, como execução de testes, integração, revisão de código, verificação de requisitos não funcionais e atualização da documentação.

Quando esses itens forem registrados em outro artefato, inclua a referência correspondente, sem duplicar ou afirmar resultados que não tenham sido verificados.

---

## Exemplo de inclusão no índice

No `index.md`, acrescente uma linha à tabela de **Registros disponíveis** e uma subseção de visualização seguindo o padrão dos PDFs já cadastrados.
