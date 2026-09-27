# REQ-2026.2-T01-Sigma


## Requisitos

- Python 3.12

## Configuração

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
cd meu-projeto
```

Crie um ambiente virtual

```bash
python -m venv .venv
```
**O `-m` é pra referenciar o python do venv;**
Instale as dependências

````bash
python -m pip install -r requirements.txt
````

Para executar 

````bash
fastapi dev app/main.py
````

A API vai ta dísponível em `http://127.0.0.1:8000`
E sua documentação em : `http://127.0.0.1:8000/docs`