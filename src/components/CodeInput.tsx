// src/components/CodeInput.tsx
import { useRef, useState } from "react";
import "./CodeInput.css";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

const CodeInput: React.FC<CodeInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  // Keep the caret at the end so the active box always matches what's typed
  const caretToEnd = () => {
    const el = ref.current;
    if (el && el.selectionStart !== el.value.length) {
      el.setSelectionRange(el.value.length, el.value.length);
    }
  };

  return (
    <div className="code-input" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        className="code-input-field"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        onFocus={() => {
          setFocused(true);
          caretToEnd();
        }}
        onBlur={() => setFocused(false)}
        onSelect={caretToEnd}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label="Verification code"
      />
      <div className="code-input-boxes" aria-hidden="true">
        {Array.from({ length }).map((_, i) => {
          const active = focused && i === Math.min(value.length, length - 1);
          return (
            <span
              key={i}
              className={`code-box ${value[i] ? "is-filled" : ""} ${active ? "is-active" : ""}`}
            >
              {value[i] ?? ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CodeInput;