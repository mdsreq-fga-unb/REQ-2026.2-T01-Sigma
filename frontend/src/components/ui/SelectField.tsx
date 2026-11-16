import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { IconChevronDown } from "./Icons";
import styles from "./Form.module.css";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  /** Texto da opção vazia ("Selecione"). */
  placeholder?: string;
  options: { valor: string; rotulo: string }[];
}

/** Select nativo com o mesmo visual do TextField. */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, placeholder, options, required, id, className, value, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-erro`;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <div className={styles.selectWrap}>
        <select
          ref={ref}
          id={selectId}
          className={`${styles.input} ${styles.select} ${!value ? styles.selectVazio : ""}`}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? errorId : undefined}
          value={value}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
        <IconChevronDown size={18} className={styles.selectChevron} />
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
});
