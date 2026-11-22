from datetime import datetime, timezone

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.ficha_socioeco import (
    MeioTransporte as MeioTransporteModelo,
    SituacaoMoradia as SituacaoMoradiaModelo,
)
from app.models.ops import Operacao, Tipo
from app.models.user import Usuario
from app.repository import repository_socioeconomica as repo
from app.schemas.schema_ficha_socioeconomica import (
    ENDERECO_OBRIGATORIO,
    FichaSocioeconomicaEntrada,
    FichaSocioeconomicaResposta,
    MeioTransporte,
    SituacaoMoradia,
    campos_faltantes,
)

LIMITE_DESCRICAO = 1000  # tamanho da coluna Operacao.descricao
MIN_LINHAS_FAMILIA_PDF = 6


# ---------------------------------------------------------------------------
# Erros de negócio (a rota converte em HTTP: 404 e 422)
# ---------------------------------------------------------------------------
class MatriculaNaoEncontradaError(Exception):
    def __init__(self, mensagem="Matrícula não encontrada."):
        self.mensagem = mensagem
        super().__init__(self.mensagem)


class MembroInvalidoError(Exception):
    def __init__(self, ids: list[int]):
        self.ids = ids
        self.mensagem = "Membro da família informado não pertence a esta ficha."
        super().__init__(self.mensagem)


def _agora() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Rótulos legíveis para o histórico (nomes dos campos, nunca valores)
# ---------------------------------------------------------------------------
ROTULOS_SECOES = {
    "endereco": {campo: f"Endereço – {rotulo}" for campo, rotulo in ENDERECO_OBRIGATORIO},
    "contato": {
        "telefone_contato": "Contato – telefone",
        "celular": "Contato – celular",
        "email": "Contato – e-mail",
    },
    "moradia": {
        "situacao": "Moradia – situação do imóvel",
        "cedido_por": "Moradia – quem cedeu",
        "valor": "Moradia – valor mensal",
    },
    "transporte": {"meio": "Transporte – meio de transporte"},
    "nucleo_familiar": {"observacoes": "Núcleo familiar – observações"},
    "outras_propriedades": {
        "possui": "Outras propriedades – resposta",
        "relacao": "Outras propriedades – relação",
    },
    "declaracao": {
        "nome": "Declaração – nome do responsável",
        "local": "Declaração – local",
        "data": "Declaração – data",
    },
}
ROTULOS_MEMBRO = {
    "tipo": "componente",
    "profissao": "profissão",
    "idade": "idade",
    "estado_civil": "estado civil",
    "escolaridade": "escolaridade",
    "renda_mensal": "renda",
}
CAMPOS_FORA_DO_HISTORICO = {"dados_pessoais", "completa", "created_at", "updated_at"}


# ---------------------------------------------------------------------------
# ORM -> resposta
# ---------------------------------------------------------------------------
def _valor_enum(x):
    return x.value if x is not None else None


def _montar_resposta(matricula) -> FichaSocioeconomicaResposta:
    aluno = matricula.aluno
    ficha = matricula.ficha_socioeconomica
    req = matricula.requerimento
    familiares = ficha.familiares if ficha is not None else []

    dados = {
        "dados_pessoais": {
            "nome": aluno.nome,
            "data_nasc": aluno.data_nasc,
            "sexo": _valor_enum(aluno.sexo),
            "etapa": aluno.turma.etapa.nome,
            "ano_letivo": matricula.ano,
            "nome_mae": req.nome_mae if req is not None else None,
            "nome_pai": req.nome_pai if req is not None else None,
        },
        "endereco": {campo: getattr(aluno, campo) for campo in repo.CAMPOS_ENDERECO},
        "contato": {
            "telefone_contato": ficha.telefone_contato if ficha else None,
            "celular": ficha.celular if ficha else None,
            "email": ficha.email if ficha else None,
        },
        "moradia": {
            "situacao": _valor_enum(ficha.moradia) if ficha else None,
            "cedido_por": ficha.cedido_por if ficha else None,
            "valor": ficha.valor if ficha else None,
        },
        "transporte": {"meio": _valor_enum(ficha.transporte) if ficha else None},
        "nucleo_familiar": {
            "membros": [
                {
                    "id": f.id,
                    "tipo": f.tipo,
                    "profissao": f.profissao,
                    "idade": f.idade,
                    "estado_civil": f.estado_civil,
                    "escolaridade": f.escolaridade,
                    "renda_mensal": f.renda_mensal,
                }
                for f in familiares
            ],
            "observacoes": ficha.obs_nucleo_familiar if ficha else None,
        },
        "outras_propriedades": {
            "possui": ficha.possui_outras_propriedades if ficha else None,
            "relacao": ficha.propriedades if ficha else None,
        },
        "declaracao": {
            "nome": ficha.declaracao_nome if ficha else None,
            "local": ficha.declaracao_local if ficha else None,
            "data": ficha.declaracao_data if ficha else None,
        },
        "created_at": ficha.created_at if ficha else None,
        "updated_at": ficha.updated_at if ficha else None,
    }
    resposta = FichaSocioeconomicaResposta(**dados)
    resposta.completa = not campos_faltantes(resposta)
    return resposta


def _dados_ficha(entrada: FichaSocioeconomicaEntrada) -> dict:
    """Entrada -> colunas da FichaSocioeconomica."""
    m = entrada.moradia
    op = entrada.outras_propriedades
    c = entrada.contato
    d = entrada.declaracao
    return {
        "moradia": SituacaoMoradiaModelo(m.situacao.value) if m.situacao else None,
        "cedido_por": m.cedido_por,
        "valor": m.valor,
        "transporte": (
            MeioTransporteModelo(entrada.transporte.meio.value)
            if entrada.transporte.meio
            else None
        ),
        "possui_outras_propriedades": op.possui,
        "propriedades": op.relacao,
        "obs_nucleo_familiar": entrada.nucleo_familiar.observacoes,
        "telefone_contato": c.telefone_contato,
        "celular": c.celular,
        "email": str(c.email) if c.email else None,
        "declaracao_nome": d.nome,
        "declaracao_local": d.local,
        "declaracao_data": d.data,
    }


# ---------------------------------------------------------------------------
# Histórico: o que mudou (só nomes de campos)
# ---------------------------------------------------------------------------
def _estado(matricula) -> dict:
    """Cópia simples dos dados editáveis, para comparar antes e depois."""
    return _montar_resposta(matricula).model_dump(exclude=CAMPOS_FORA_DO_HISTORICO)


def _campos_alterados(antes: dict, depois: dict) -> list[str]:
    alterados: list[str] = []

    for secao, rotulos in ROTULOS_SECOES.items():
        for campo, rotulo in rotulos.items():
            if antes[secao][campo] != depois[secao][campo]:
                alterados.append(rotulo)

    anteriores = {m["id"]: m for m in antes["nucleo_familiar"]["membros"]}
    atuais = depois["nucleo_familiar"]["membros"]
    ids_atuais = {m["id"] for m in atuais}

    for posicao, membro in enumerate(atuais, start=1):
        antigo = anteriores.get(membro["id"])
        if antigo is None:
            alterados.append("Núcleo familiar – membro adicionado")
            continue
        for campo, rotulo in ROTULOS_MEMBRO.items():
            if antigo[campo] != membro[campo]:
                alterados.append(f"Núcleo familiar – membro {posicao} – {rotulo}")
    if any(id_ not in ids_atuais for id_ in anteriores):
        alterados.append("Núcleo familiar – membro removido")

    return list(dict.fromkeys(alterados))  # sem repetidos, mantendo a ordem


def _descricao_edicao(ano: int, alterados: list[str]) -> str:
    inicio = f"Ficha socioeconômica editada (ano letivo {ano}): "
    texto = inicio + "; ".join(alterados)
    if len(texto) <= LIMITE_DESCRICAO:
        return texto
    # Não cabe: corta e informa quantos campos ficaram de fora
    usados: list[str] = []
    for i, campo in enumerate(alterados):
        resto = len(alterados) - i - 1
        candidato = inicio + "; ".join(usados + [campo]) + f"; e mais {resto}"
        if len(candidato) > LIMITE_DESCRICAO:
            break
        usados.append(campo)
    faltam = len(alterados) - len(usados)
    return inicio + "; ".join(usados) + f"; e mais {faltam}"


# ---------------------------------------------------------------------------
# Casos de uso
# ---------------------------------------------------------------------------
def obter_ficha(db: Session, id_matricula: int) -> FichaSocioeconomicaResposta:
    matricula = repo.buscar_matricula(db, id_matricula)
    if matricula is None:
        raise MatriculaNaoEncontradaError()
    return _montar_resposta(matricula)


def salvar_ficha(
    db: Session,
    id_matricula: int,
    entrada: FichaSocioeconomicaEntrada,
    usuario: Usuario,
) -> FichaSocioeconomicaResposta:
    """Tudo em uma única transação (FE04): ou grava tudo, ou nada."""
    try:
        matricula = repo.buscar_matricula(db, id_matricula)
        if matricula is None:
            raise MatriculaNaoEncontradaError()

        membros = [m.model_dump() for m in entrada.nucleo_familiar.membros]
        invalidos = repo.ids_membros_invalidos(matricula.ficha_socioeconomica, membros)
        if invalidos:
            raise MembroInvalidoError(invalidos)

        primeira_vez = matricula.ficha_socioeconomica is None
        antes = _estado(matricula)  # antes de qualquer alteração

        repo.atualizar_endereco(db, matricula.aluno, entrada.endereco.model_dump())
        ficha = repo.salvar_ficha(db, matricula, _dados_ficha(entrada))
        repo.sincronizar_familiares(db, ficha, membros)

        depois = _estado(matricula)

        if primeira_vez:
            db.add(Operacao(
                id_user=usuario.id,
                id_aluno=matricula.id_aluno,
                tipo=Tipo.PREENCHIMENTO_SOCIOECONOMICA,
                descricao=f"Ficha socioeconômica preenchida (ano letivo {matricula.ano})",
                data_op=_agora(),
            ))
        else:
            alterados = _campos_alterados(antes, depois)
            if alterados:  # nada mudou: sem registro de edição
                db.add(Operacao(
                    id_user=usuario.id,
                    id_aluno=matricula.id_aluno,
                    tipo=Tipo.EDICAO_SOCIOECONOMICA,
                    descricao=_descricao_edicao(matricula.ano, alterados),
                    data_op=_agora(),
                ))

        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise  # a rota converte em 503
    except Exception:
        db.rollback()
        raise

    return obter_ficha(db, id_matricula)


def registrar_exportacao_pdf(db: Session, id_matricula: int, usuario: Usuario) -> None:
    matricula = repo.buscar_matricula(db, id_matricula)
    if matricula is None:
        raise MatriculaNaoEncontradaError()
    try:
        db.add(Operacao(
            id_user=usuario.id,
            id_aluno=matricula.id_aluno,
            tipo=Tipo.EXPORTACAO_PDF,
            descricao=f"Ficha socioeconômica exportada (ano letivo {matricula.ano})",
            data_op=_agora(),
        ))
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise


# ---------------------------------------------------------------------------
# Contexto do PDF: dicionário simples, já formatado (sem objetos ORM)
# ---------------------------------------------------------------------------
ROTULOS_MORADIA = {
    SituacaoMoradia.PROPRIO: "Próprio",
    SituacaoMoradia.CEDIDO: "Cedido",
    SituacaoMoradia.FINANCIADO: "Financiado",
    SituacaoMoradia.ALUGADO: "Alugado",
    SituacaoMoradia.OCUPACAO_IRREGULAR: "Ocupação irregular",
}
ROTULOS_TRANSPORTE = {
    MeioTransporte.NENHUM_A_PE_BICICLETA: "Nenhum (a pé / bicicleta)",
    MeioTransporte.CARONA: "Carona",
    MeioTransporte.TRANSPORTE_COLETIVO: "Transporte coletivo",
    MeioTransporte.CARRO_MOTO_PROPRIO: "Carro / moto próprio",
}


def _fmt_dinheiro(v) -> str:
    if v is None:
        return ""
    texto = f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {texto}"


def _fmt_cep(v) -> str:
    return f"{v[:5]}-{v[5:]}" if v and len(v) == 8 else (v or "")


def _fmt_telefone(v) -> str:
    if not v:
        return ""
    if len(v) == 11:
        return f"({v[:2]}) {v[2:7]}-{v[7:]}"
    if len(v) == 10:
        return f"({v[:2]}) {v[2:6]}-{v[6:]}"
    return v


def _fmt_data(v) -> str:
    return v.strftime("%d/%m/%Y") if v else ""


def _texto(v) -> str:
    return "" if v is None else str(v)


def _opcoes(rotulos: dict, escolhida) -> list[dict]:
    return [{"rotulo": r, "marcado": enum == escolhida} for enum, r in rotulos.items()]


def montar_contexto_pdf(resposta: FichaSocioeconomicaResposta) -> dict:
    p = resposta.dados_pessoais
    e = resposta.endereco
    c = resposta.contato
    m = resposta.moradia
    op = resposta.outras_propriedades
    d = resposta.declaracao

    linhas = [
        {
            "tipo": _texto(f.tipo),
            "profissao": _texto(f.profissao),
            "idade": _texto(f.idade),
            "estado_civil": _texto(f.estado_civil),
            "escolaridade": _texto(f.escolaridade),
            "renda_mensal": _fmt_dinheiro(f.renda_mensal),
        }
        for f in resposta.nucleo_familiar.membros
    ]
    vazia = {k: "" for k in ("tipo", "profissao", "idade", "estado_civil", "escolaridade", "renda_mensal")}
    while len(linhas) < MIN_LINHAS_FAMILIA_PDF:
        linhas.append(dict(vazia))  # linhas em branco para preencher à mão

    return {
        "titulo": "Ficha Socioeconômica",
        "ano_letivo": _texto(p.ano_letivo),
        "dados_pessoais": {
            "nome": _texto(p.nome),
            "data_nasc": _fmt_data(p.data_nasc),
            "sexo": _texto(p.sexo),
            "etapa": _texto(p.etapa),
            "nome_mae": _texto(p.nome_mae),
            "nome_pai": _texto(p.nome_pai),
        },
        "endereco": {
            "logradouro": _texto(e.logradouro),
            "numero": _texto(e.numero),
            "bairro": _texto(e.bairro),
            "cidade": _texto(e.cidade),
            "uf": _texto(e.uf_residencia),
            "cep": _fmt_cep(e.cep),
        },
        "contato": {
            "telefone_contato": _fmt_telefone(c.telefone_contato),
            "celular": _fmt_telefone(c.celular),
            "email": _texto(c.email),
        },
        "moradia": {
            "opcoes": _opcoes(ROTULOS_MORADIA, m.situacao),
            "cedido_por": _texto(m.cedido_por),
            "valor": _fmt_dinheiro(m.valor),
        },
        "transporte": {"opcoes": _opcoes(ROTULOS_TRANSPORTE, resposta.transporte.meio)},
        "familiares": linhas,
        "observacoes_familia": _texto(resposta.nucleo_familiar.observacoes),
        "outras_propriedades": {
            "possui_sim": op.possui is True,
            "possui_nao": op.possui is False,
            "relacao": _texto(op.relacao),
        },
        "declaracao": {
            "nome": _texto(d.nome),
            "local": _texto(d.local),
            "data": _fmt_data(d.data),
        },
    }
