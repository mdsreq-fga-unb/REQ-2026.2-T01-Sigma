

class EmailJaCadastradoError(Exception):
    def __init__(self, mensagem = "Este e-mail já está em uso por outro usuário."):
        self.mensagem = mensagem 
        super().__init__(self.mensagem)
