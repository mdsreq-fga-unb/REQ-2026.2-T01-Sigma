"use client";

import { useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import formStyles from "@/components/ui/Form.module.css";
import { MSG } from "@/lib/mensagens";
import { emailValido, senhaNoPadrao } from "@/lib/validacao";
import { isApiError } from "@/services/api";
import { criarUsuario } from "@/services/usuarios.service";
import type { Usuario } from "@/types";
import styles from "./UsuarioModais.module.css";

interface NovoUsuarioModalProps {
  onClose: () => void;
  onCriado: (usuario: Usuario) => void;
}

type Campo = "nome" | "email" | "administrador" | "senha" | "confirmar";
type Erros = Partial<Record<Campo, string>>;

const ORDEM_CAMPOS: Campo[] = ["nome", "email", "administrador", "senha", "confirmar"];

// UC02 – FP01 Cadastrar novo usuário (RF05, RN19, RN20)
export function NovoUsuarioModal({ onClose, onCriado }: NovoUsuarioModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [administrador, setAdministrador] = useState<"sim" | "nao" | "">("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const refs = {
    nome: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    administrador: useRef<HTMLInputElement>(null),
    senha: useRef<HTMLInputElement>(null),
    confirmar: useRef<HTMLInputElement>(null),
  };

  function validar(): Erros {
    const novos: Erros = {};
    if (!nome.trim()) novos.nome = "Informe o nome.";
    if (!email.trim()) novos.email = "Informe o e-mail.";
    else if (!emailValido(email)) novos.email = "Informe um e-mail válido.";
    if (!administrador) novos.administrador = "Informe se a conta será de administrador.";
    if (!senha) novos.senha = "Informe a senha provisória.";
    else if (!senhaNoPadrao(senha)) novos.senha = MSG.senhaForaPadrao;
    if (!confirmar) novos.confirmar = "Confirme a senha.";
    else if (senha && confirmar !== senha) novos.confirmar = MSG.senhasNaoCoincidem;
    return novos;
  }

  function focarPrimeiroErro(e: Erros) {
    const campo = ORDEM_CAMPOS.find((c) => e[c]);
    if (campo) refs[campo].current?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;

    setErroGeral(null);
    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      focarPrimeiroErro(novosErros);
      return;
    }

    setEnviando(true);
    try {
      const criado = await criarUsuario({
        nome: nome.trim(),
        email: email.trim(),
        administrador: administrador === "sim",
        senha,
      });
      onCriado(criado);
    } catch (error) {
      const code = isApiError(error) ? error.code : "ERRO_DESCONHECIDO";
      if (code === "EMAIL_EM_USO") {
        const e = { email: MSG.emailEmUso };
        setErros(e);
        focarPrimeiroErro(e);
      } else if (code === "SENHA_FORA_PADRAO") {
        const e = { senha: MSG.senhaForaPadrao };
        setErros(e);
        focarPrimeiroErro(e);
      } else if (code === "SEM_PERMISSAO") {
        setErroGeral(MSG.semPermissao);
      } else if (code === "FALHA_CONEXAO") {
        setErroGeral(MSG.falhaConexao);
      } else {
        setErroGeral(MSG.erroInesperado);
      }
      setEnviando(false);
    }
  }

  return (
    <Modal
      title="Novo usuário"
      description="Preencha os dados de acesso e informe se a nova conta será de administrador."
      onClose={onClose}
      dismissible={!enviando}
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          ref={refs.nome}
          label="Nome"
          required
          name="nome"
          autoComplete="off"
          placeholder="—"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={erros.nome}
          disabled={enviando}
        />
        <TextField
          ref={refs.email}
          label="E-mail"
          required
          type="email"
          name="email"
          autoComplete="off"
          inputMode="email"
          placeholder="nome@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={erros.email}
          disabled={enviando}
        />

        <fieldset
          className={formStyles.fieldset}
          aria-describedby={erros.administrador ? "administrador-erro" : undefined}
          disabled={enviando}
        >
          <legend className={`${formStyles.label} ${formStyles.legend}`}>
            Administrador<span aria-hidden="true"> *</span>
          </legend>
          <div className={formStyles.radios}>
            <label className={formStyles.radio}>
              <input
                ref={refs.administrador}
                type="radio"
                name="administrador"
                value="sim"
                checked={administrador === "sim"}
                onChange={() => setAdministrador("sim")}
                aria-invalid={erros.administrador ? true : undefined}
                required
              />
              Sim
            </label>
            <label className={formStyles.radio}>
              <input
                type="radio"
                name="administrador"
                value="nao"
                checked={administrador === "nao"}
                onChange={() => setAdministrador("nao")}
                aria-invalid={erros.administrador ? true : undefined}
              />
              Não
            </label>
          </div>
          {erros.administrador && (
            <p id="administrador-erro" className={formStyles.error}>
              {erros.administrador}
            </p>
          )}
        </fieldset>

        <TextField
          ref={refs.senha}
          label="Senha provisória"
          required
          type="password"
          name="senha"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          error={erros.senha}
          disabled={enviando}
        />
        <TextField
          ref={refs.confirmar}
          label="Confirmar senha"
          required
          type="password"
          name="confirmar"
          autoComplete="new-password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          error={erros.confirmar}
          hint={MSG.senhaForaPadrao}
          disabled={enviando}
        />

        {erroGeral && <Alert>{erroGeral}</Alert>}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando}>
            {enviando ? "Criando..." : "Criar conta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
