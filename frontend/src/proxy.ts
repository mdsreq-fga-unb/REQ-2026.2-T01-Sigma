import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/sessao";

/**
 * UC01 FE02 / RNF02: rotas internas exigem sessão.
 * Checagem otimista (presença do cookie); a API valida a sessão e responde 401
 * quando ela é inválida, o que faz o interceptor do Axios redirecionar ao login.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Impede que páginas internas fiquem em cache e reapareçam pelo botão "voltar" após o logout.
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  return response;
}

export const config = {
  matcher: ["/", "/alunos/:path*", "/turmas/:path*", "/usuarios/:path*"],
};
