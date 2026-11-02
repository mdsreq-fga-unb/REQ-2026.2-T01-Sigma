const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// RN20: mínimo de 8 caracteres, com letras, números e caracteres especiais.
const SENHA_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export function emailValido(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function senhaNoPadrao(senha: string): boolean {
  return SENHA_REGEX.test(senha);
}
