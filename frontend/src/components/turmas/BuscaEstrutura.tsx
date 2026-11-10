"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { IconChevronDown, IconSearch } from "@/components/ui/Icons";
import type { FiltroStatus } from "./useTurmasEtapas";
import styles from "./BuscaEstrutura.module.css";

interface BuscaEstruturaProps {
  termo: string;
  onTermoChange: (valor: string) => void;
  filtroStatus: FiltroStatus;
  onFiltroStatusChange: (valor: FiltroStatus) => void;
  onBuscar: () => void;
}

// UC08 FP02 – campo de busca + filtro de status. Enter no campo ou "Buscar" dispara a busca.
export function BuscaEstrutura({
  termo,
  onTermoChange,
  filtroStatus,
  onFiltroStatusChange,
  onBuscar,
}: BuscaEstruturaProps) {
  const buscaId = useId();
  const statusId = useId();

  return (
    <form
      role="search"
      className={styles.busca}
      onSubmit={(event) => {
        event.preventDefault();
        onBuscar();
      }}
    >
      <div className={styles.campo}>
        <label htmlFor={buscaId} className="sr-only">
          Buscar turma ou etapa
        </label>
        <IconSearch size={18} className={styles.iconeBusca} />
        <input
          id={buscaId}
          type="search"
          className={styles.input}
          placeholder="Buscar turma ou etapa pelo nome completo ou parcial..."
          autoComplete="off"
          value={termo}
          onChange={(event) => onTermoChange(event.target.value)}
        />
      </div>

      <div className={styles.status}>
        <label htmlFor={statusId}>Status:</label>
        <select
          id={statusId}
          value={filtroStatus}
          onChange={(event) => onFiltroStatusChange(event.target.value as FiltroStatus)}
        >
          <option value="TODOS">Todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </select>
        <IconChevronDown size={14} className={styles.chevron} />
      </div>

      <Button type="submit">Buscar</Button>
    </form>
  );
}
