

class EmailJaCadastradoError(Exception):
    def __init__(self, mensagem = "Email já está cadastrado no nosso sistema"):
        self.mensagem = mensagem 
        super().__init__(self.mensagem)
