"use client";

import { useEffect, useRef } from "react";

const EVENTOS: (keyof WindowEventMap)[] = ["mousedown", "keydown", "scroll", "wheel", "touchstart"];

/**
 * RN17: executa `onInatividade` após `tempoMs` sem interação do usuário
 * (clique, tecla, rolagem ou toque).
 */
export function useInactivityLogout(onInatividade: () => void, tempoMs: number, ativo = true) {
  const callbackRef = useRef(onInatividade);
  callbackRef.current = onInatividade;

  useEffect(() => {
    if (!ativo) return;

    let timer: ReturnType<typeof setTimeout>;
    const reiniciar = () => {
      clearTimeout(timer);
      timer = setTimeout(() => callbackRef.current(), tempoMs);
    };

    reiniciar();
    // capture: true para registrar também a rolagem de elementos internos (ex.: tabela).
    EVENTOS.forEach((evento) => window.addEventListener(evento, reiniciar, { passive: true, capture: true }));
    return () => {
      clearTimeout(timer);
      EVENTOS.forEach((evento) => window.removeEventListener(evento, reiniciar, { capture: true }));
    };
  }, [tempoMs, ativo]);
}
