"use client";

import { useCallback, useEffect, useState } from "react";

type Tema = "light" | "dark";
const STORAGE_KEY = "sigma-tema";

/** Alterna entre tema claro e escuro (item "Modo escuro" da sidebar). */
export function useTheme() {
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => {
    setTema(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const alternar = useCallback(() => {
    setTema((atual) => {
      const novo: Tema = atual === "dark" ? "light" : "dark";
      if (novo === "dark") document.documentElement.dataset.theme = "dark";
      else delete document.documentElement.dataset.theme;
      try {
        localStorage.setItem(STORAGE_KEY, novo);
      } catch {
        // armazenamento indisponível (ex.: navegação privada): o tema vale só para esta sessão
      }
      return novo;
    });
  }, []);

  return { tema, alternar };
}
