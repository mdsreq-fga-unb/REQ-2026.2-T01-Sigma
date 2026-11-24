from fastapi import Request
from fastapi.responses import JSONResponse


class EmailJaCadastradoError(Exception):
    def __init__(self, mensagem = "Este e-mail já está em uso por outro usuário."):
        self.mensagem = mensagem 
        super().__init__(self.mensagem)


class ErroNegocio(Exception):
    """Base dos erros de regra de negócio que viram resposta HTTP.

    Os services lançam estes erros sem conhecer o HTTP; `tratar_erro_negocio` (registrado em
    `app/main.py`) converte cada um no status e no `detail` corretos. Assim as rotas só
    recebem a requisição, chamam o service e devolvem a resposta.
    """

    status_code: int = 400
    mensagem: str = "Não foi possível concluir a operação."

    def __init__(self, mensagem: str | None = None):
        if mensagem is not None:
            self.mensagem = mensagem
        super().__init__(self.mensagem)

    @property
    def detalhe(self):
        """Conteúdo do campo `detail` da resposta."""
        return self.mensagem


class MatriculaNaoEncontradaError(ErroNegocio):
    status_code = 404
    mensagem = "Matrícula não encontrada."


class DadosInvalidosError(ErroNegocio):
    """Dados recusados por regra que só o service conhece (ex.: `id` de outro termo).

    `erros` segue o mesmo formato dos 422 de validação do FastAPI: lista de
    `{"type", "loc", "msg"}`, para o frontend tratar todos os 422 do mesmo jeito.
    """

    status_code = 422
    mensagem = "Dados inválidos."

    def __init__(self, erros: list[dict]):
        self.erros = erros
        super().__init__()

    @property
    def detalhe(self):
        return self.erros


class FalhaAoSalvarError(ErroNegocio):
    """Falha de banco ao gravar. Nada foi salvo (FE04)."""

    status_code = 503
    mensagem = "Não foi possível salvar. Tente novamente."


class ServidorIndisponivelError(ErroNegocio):
    """Falha de banco ao consultar."""

    status_code = 503
    mensagem = "Não foi possível conectar ao servidor. Tente novamente mais tarde."


class FalhaGeracaoPdfError(ErroNegocio):
    status_code = 500
    mensagem = "Não foi possível gerar o PDF. Tente novamente."


async def tratar_erro_negocio(request: Request, exc: ErroNegocio) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detalhe})
