import { useId } from "react";
import styles from "./Form.module.css";

interface RadioGroupProps<T extends string> {
  label: string;
  /** Nome do grupo; também é usado como âncora para focar o campo com erro. */
  name: string;
  value: T | null;
  options: { valor: T; rotulo: string }[];
  onChange: (valor: T) => void;
  required?: boolean;
  error?: string;
  className?: string;
  /** Rótulo visualmente oculto (quando o título da seção já descreve o grupo). */
  labelOculto?: boolean;
}

/** Grupo de radios acessível (fieldset + legend). */
export function RadioGroup<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
  required,
  error,
  className,
  labelOculto,
}: RadioGroupProps<T>) {
  const errorId = useId();
  return (
    <fieldset
      className={[styles.fieldset, className].filter(Boolean).join(" ")}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      aria-required={required || undefined}
    >
      <legend className={labelOculto ? "sr-only" : `${styles.label} ${styles.legend}`}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </legend>
      <div className={styles.radios}>
        {options.map((opcao) => (
          <label key={opcao.valor} className={styles.radio}>
            <input
              type="radio"
              name={name}
              value={opcao.valor}
              checked={value === opcao.valor}
              onChange={() => onChange(opcao.valor)}
            />
            {opcao.rotulo}
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
