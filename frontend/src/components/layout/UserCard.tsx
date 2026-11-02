import { inicial } from "@/lib/formatacao";
import styles from "./UserCard.module.css";

interface UserCardProps {
  nome: string;
  email: string;
}

export function UserCard({ nome, email }: UserCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.avatar} aria-hidden="true">
        {inicial(nome)}
      </span>
      <span className={styles.info}>
        <span className={styles.nome}>{nome}</span>
        <span className={styles.email}>{email}</span>
      </span>
    </div>
  );
}
