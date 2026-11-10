"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { IconLock } from "@/components/ui/Icons";
import { TextField } from "@/components/ui/TextField";
import { MSG } from "@/lib/mensagens";
import { destinoSeguro } from "@/lib/sessao";
import { emailValido } from "@/lib/validacao";
import { isApiError } from "@/services/api";
import * as authService from "@/services/auth.service";
import type { ApiErrorCode } from "@/types";
import styles from "./LoginForm.module.css";

interface ErrosCampos {
  email?: string;
  senha?: string;
}

// UC01: mensagens dos fluxos de exceção FE01, FE03, FE04 e FE05.
function mensagemDeErro(code: ApiErrorCode): string {
  switch (code) {
    case "CREDENCIAIS_INVALIDAS":
      return MSG.credenciaisInvalidas;
    case "CONTA_BLOQUEADA":
      return MSG.contaBloqueada;
    case "CONTA_INATIVA":
      return MSG.contaInativa;
    case "FALHA_CONEXAO":
      return MSG.falhaConexao;
    default:
      return MSG.erroInesperado;
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<ErrosCampos>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const senhaRef = useRef<HTMLInputElement>(null);

  const encerradaPorInatividade = searchParams.get("motivo") === "inatividade";

  function validar(): ErrosCampos {
    const novos: ErrosCampos = {};
    if (!email.trim()) novos.email = "Informe o e-mail.";
    else if (!emailValido(email)) novos.email = "Informe um e-mail válido.";
    if (!senha) novos.senha = "Informe a senha.";
    return novos;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;

    setErroApi(null);
    const novosErros = validar();
    setErros(novosErros);
    if (novosErros.email) return emailRef.current?.focus();
    if (novosErros.senha) return senhaRef.current?.focus();

    setEnviando(true);
    try {
      await authService.login({ email: email.trim(), senha });
      router.replace(destinoSeguro(searchParams.get("next")));
    } catch (error) {
      setErroApi(mensagemDeErro(isApiError(error) ? error.code : "ERRO_DESCONHECIDO"));
      setSenha("");
      setEnviando(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Boas-vindas</h1>
        <p className={styles.subtitle}>Entre com o e-mail e a senha cadastrados no SIGMA.</p>
      </header>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {encerradaPorInatividade && !erroApi && <Alert variant="info">{MSG.sessaoInatividade}</Alert>}

        <TextField
          ref={emailRef}
          label="E-mail"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          placeholder="secretaria@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={erros.email}
          disabled={enviando}
        />
        <TextField
          ref={senhaRef}
          label="Senha"
          type="password"
          name="senha"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          error={erros.senha}
          disabled={enviando}
        />

        {erroApi && <Alert>{erroApi}</Alert>}

        <Button type="submit" fullWidth loading={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className={styles.notice}>
        <IconLock size={16} className={styles.noticeIcon} />
        Acesso restrito a usuários cadastrados. Os dados das crianças são protegidos pela LGPD.
      </p>
    </div>
  );
}
