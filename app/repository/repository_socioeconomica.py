from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.aluno import Aluno
from app.models.familiar import Familiar
from app.models.ficha_socioeco import FichaSocioeconomica
from app.models.matricula import Matricula
from app.models.turma import Turma

# Campos que o service pode gravar. Qualquer outro nome é erro de digitação.
CAMPOS_ENDERECO = {"logradouro", "numero", "bairro", "cidade", "uf_residencia", "cep"}
CAMPOS_FICHA = {
    "moradia", "cedido_por", "valor", "transporte",
    "possui_outras_propriedades", "propriedades", "obs_nucleo_familiar",
    "telefone_contato", "celular", "email",
    "declaracao_nome", "declaracao_local", "declaracao_data",
}
CAMPOS_FAMILIAR = {
    "tipo", "profissao", "idade", "estado_civil", "escolaridade", "renda_mensal",
}


def _atribuir(obj, dados: dict, permitidos: set[str]) -> None:
    desconhecidos = set(dados) - permitidos
    if desconhecidos:
        raise ValueError(f"Campos desconhecidos: {sorted(desconhecidos)}")
    for campo, valor in dados.items():
        setattr(obj, campo, valor)


def buscar_matricula(db: Session, id_matricula: int) -> Matricula | None:
    """Matrícula com aluno, turma, etapa, requerimento, ficha e familiares já carregados."""
    stmt = (
        select(Matricula)
        .where(Matricula.id == id_matricula)
        .options(
            joinedload(Matricula.aluno).joinedload(Aluno.turma).joinedload(Turma.etapa),
            joinedload(Matricula.requerimento),
            joinedload(Matricula.ficha_socioeconomica).selectinload(
                FichaSocioeconomica.familiares
            ),
        )
    )
    return db.scalar(stmt)


def atualizar_endereco(db: Session, aluno: Aluno, endereco: dict) -> None:
    """Grava o endereço no Aluno. Sem commit."""
    _atribuir(aluno, endereco, CAMPOS_ENDERECO)
    db.flush()


def salvar_ficha(db: Session, matricula: Matricula, dados: dict) -> FichaSocioeconomica:
    """Cria a ficha da matrícula se não existir; senão atualiza. Sem commit."""
    ficha = matricula.ficha_socioeconomica
    if ficha is None:
        ficha = FichaSocioeconomica(id_matricula=matricula.id)
        db.add(ficha)
        matricula.ficha_socioeconomica = ficha
    _atribuir(ficha, dados, CAMPOS_FICHA)
    db.flush()
    return ficha


def ids_membros_invalidos(ficha: FichaSocioeconomica | None, membros: list[dict]) -> list[int]:
    """Ids enviados que não pertencem a esta ficha (inclui fichas de outros anos)."""
    validos = {f.id for f in ficha.familiares} if ficha is not None else set()
    return [m["id"] for m in membros if m.get("id") is not None and m["id"] not in validos]


def sincronizar_familiares(db: Session, ficha: FichaSocioeconomica, membros: list[dict]) -> None:
    """Lista completa: com id atualiza, sem id cria, ausente da lista remove. Sem commit.
    Valide os ids com ids_membros_invalidos antes de chamar."""
    existentes = {f.id: f for f in ficha.familiares}
    resultado: list[Familiar] = []

    for dados in membros:
        dados = dict(dados)
        id_membro = dados.pop("id", None)
        if id_membro is None:
            familiar = Familiar()
        else:
            familiar = existentes.get(id_membro)
            if familiar is None:
                raise ValueError(f"Membro {id_membro} não pertence a esta ficha.")
        _atribuir(familiar, dados, CAMPOS_FAMILIAR)
        resultado.append(familiar)

    # Quem saiu da lista é apagado (cascade delete-orphan no model)
    ficha.familiares = resultado
    db.flush()
