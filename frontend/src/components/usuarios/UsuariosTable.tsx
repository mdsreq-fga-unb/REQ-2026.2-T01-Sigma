import { Button } from "@/components/ui/Button";
import { formatarData, rotuloPerfil } from "@/lib/formatacao";
import type { Usuario } from "@/types";
import styles from "./UsuariosTable.module.css";

interface UsuariosTableProps {
  usuarios: Usuario[];
  usuarioLogadoId: string;
  isAdmin: boolean;
  onInativar: (usuario: Usuario) => void;
  onReativar: (usuario: Usuario) => void;
}

const COLUNAS = ["Nome", "E-mail", "Perfil", "Status", "Criado em", "Criado por"];

export function UsuariosTable({ usuarios, usuarioLogadoId, isAdmin, onInativar, onReativar }: UsuariosTableProps) {
  return (
    <TableFrame isAdmin={isAdmin}>
      <tbody>
        {usuarios.map((usuario) => {
          const ehVoce = usuario.id === usuarioLogadoId;
          return (
            <tr key={usuario.id} className={usuario.ativo ? undefined : styles.inativo}>
              <td className={styles.nome}>
                {usuario.nome}
                {ehVoce && " (você)"}
              </td>
              <td className={styles.muted}>{usuario.email}</td>
              <td className={styles.muted}>{rotuloPerfil(usuario.perfil)}</td>
              <td>
                <span className={`${styles.badge} ${usuario.ativo ? styles.badgeAtivo : styles.badgeInativo}`}>
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className={styles.muted}>{formatarData(usuario.criadoEm)}</td>
              <td className={styles.muted}>{usuario.criadoPor ?? "—"}</td>
              {isAdmin && (
                <td className={styles.acoes}>
                  {ehVoce ? (
                    <span className={styles.muted} aria-hidden="true">
                      —
                    </span>
                  ) : usuario.ativo ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onInativar(usuario)}
                      aria-label={`Inativar a conta de ${usuario.nome}`}
                    >
                      Inativar
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onReativar(usuario)}
                      aria-label={`Reativar a conta de ${usuario.nome}`}
                    >
                      Reativar
                    </Button>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </TableFrame>
  );
}

/** Estado de carregamento: esqueleto da tabela. */
export function UsuariosTableSkeleton({ isAdmin }: { isAdmin: boolean }) {
  const colunas = COLUNAS.length + (isAdmin ? 1 : 0);
  return (
    <TableFrame isAdmin={isAdmin} busy>
      <tbody>
        {Array.from({ length: 3 }, (_, linha) => (
          <tr key={linha}>
            {Array.from({ length: colunas }, (_, coluna) => (
              <td key={coluna}>
                <span className={styles.skeleton} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}

function TableFrame({ isAdmin, busy, children }: { isAdmin: boolean; busy?: boolean; children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table} aria-busy={busy || undefined}>
        <caption className="sr-only">Usuários com acesso ao SIGMA</caption>
        <thead>
          <tr>
            {COLUNAS.map((coluna) => (
              <th key={coluna} scope="col">
                {coluna}
              </th>
            ))}
            {isAdmin && (
              <th scope="col" className={styles.acoes}>
                Ações
              </th>
            )}
          </tr>
        </thead>
        {children}
      </table>
    </div>
  );
}
