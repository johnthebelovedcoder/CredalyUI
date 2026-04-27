import React, { useCallback, useMemo } from "react";

const C = {
  amber: "#F5A623",
  amberFaint: "rgba(245,166,35,0.1)",
  teal: "#00C9A7",
  tealFaint: "rgba(0,201,167,0.1)",
  red: "#EF4444",
  border: "rgba(100,140,200,0.12)",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
  s1: "#0F1D32",
};

/* ──────────────────────────────────────────────────────────────────
 * Utility: format a number string with commas (Nigeria locale)
 * ────────────────────────────────────────────────────────────────── */
function formatNumberWithCommas(value: string): string {
  if (!value) return "";
  // Strip existing commas
  const cleaned = value.replace(/,/g, "");
  if (!/^\d+$/.test(cleaned)) return value;
  return Number(cleaned).toLocaleString("en-NG");
}

function stripCommas(value: string): string {
  return value.replace(/,/g, "");
}

/* ──────────────────────────────────────────────────────────────────
 * DigitsInput — phone, BVN, and similar fields
 * Only accepts digits and an optional leading '+' for phone numbers.
 * ────────────────────────────────────────────────────────────────── */
interface DigitsInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  id?: string;
  maxLength?: number;
  /** Allow a leading '+' character (for phone numbers) */
  allowPlus?: boolean;
  /** Input mode hint for mobile keyboards */
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  disabled?: boolean;
}

export const DigitsInput = React.memo(function DigitsInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  id,
  maxLength,
  allowPlus = false,
  inputMode = "numeric",
  disabled,
}: DigitsInputProps) {
  const inputId = id || `digits-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Strip everything except digits (and optional leading '+')
      let filtered = "";
      for (const ch of raw) {
        if (/\d/.test(ch)) filtered += ch;
        else if (allowPlus && ch === "+" && filtered.length === 0) filtered += ch;
      }
      if (maxLength && filtered.length > maxLength) {
        filtered = filtered.slice(0, maxLength);
      }
      onChange(filtered);
    },
    [onChange, maxLength, allowPlus]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
      if (allowPlus && e.key === "+" && (e.target as HTMLInputElement).selectionStart === 0) return;
      if (allowed.includes(e.key)) return;
      if (!/[\d]/.test(e.key)) e.preventDefault();
    },
    [allowPlus]
  );

  // Handle paste to also strip non-digits
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const paste = e.clipboardData.getData("text");
      let filtered = "";
      for (const ch of paste) {
        if (/\d/.test(ch)) filtered += ch;
        else if (allowPlus && ch === "+" && filtered.length === 0) filtered += ch;
      }
      if (maxLength && filtered.length > maxLength) {
        filtered = filtered.slice(0, maxLength);
      }
      onChange(filtered);
    },
    [onChange, maxLength, allowPlus]
  );

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="text-[11px] text-credaly-muted block mb-1.5 tracking-[0.05em] uppercase">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        disabled={disabled}
        className="w-full bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-lg px-[14px] py-[10px] text-credaly-text text-[13px] outline-none box-border font-sans focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {hint && <p className="text-[10px] text-credaly-faint m-0 mt-1">{hint}</p>}
    </div>
  );
});

/* ──────────────────────────────────────────────────────────────────
 * CurrencyInput — naira amounts with comma formatting
 * Displays with commas but stores raw digit string.
 * ────────────────────────────────────────────────────────────────── */
interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (rawDigits: string) => void;
  placeholder?: string;
  hint?: string;
  id?: string;
  maxDigits?: number;
  currency?: string;
  disabled?: boolean;
}

export const CurrencyInput = React.memo(function CurrencyInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  id,
  maxDigits = 8,
  currency = "₦",
  disabled,
}: CurrencyInputProps) {
  const inputId = id || `currency-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const displayValue = useMemo(() => {
    if (!value) return "";
    return `${currency}${formatNumberWithCommas(value)}`;
  }, [value, currency]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Extract only the digit portion
      let digits = "";
      for (const ch of raw) {
        if (/\d/.test(ch)) digits += ch;
        if (digits.length > maxDigits) break;
      }
      onChange(digits);
    },
    [onChange, maxDigits]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
      if (allowed.includes(e.key)) return;
      if (!/[\d]/.test(e.key)) e.preventDefault();
    },
    []
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const paste = e.clipboardData.getData("text");
      let digits = "";
      for (const ch of paste) {
        if (/\d/.test(ch)) digits += ch;
        if (digits.length > maxDigits) break;
      }
      onChange(digits);
    },
    [onChange, maxDigits]
  );

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="text-[11px] text-credaly-muted block mb-1.5 tracking-[0.05em] uppercase">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder ? `${currency}${placeholder}` : undefined}
        maxLength={maxDigits + currency.length + 3 /* commas */}
        inputMode="numeric"
        disabled={disabled}
        className="w-full bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-lg px-[14px] py-[10px] text-credaly-text text-[13px] outline-none box-border font-sans focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
      />
      {hint && <p className="text-[10px] text-credaly-faint m-0 mt-1">{hint}</p>}
    </div>
  );
});

/* ──────────────────────────────────────────────────────────────────
 * ScoreInput — credit score (300-850) with 3-digit limit
 * ────────────────────────────────────────────────────────────────── */
interface ScoreInputProps {
  label: string;
  value: string;
  onChange: (rawDigits: string) => void;
  placeholder?: string;
  hint?: string;
  id?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const ScoreInput = React.memo(function ScoreInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  id,
  min = 300,
  max = 850,
  disabled,
}: ScoreInputProps) {
  const inputId = id || `score-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      let digits = "";
      for (const ch of raw) {
        if (/\d/.test(ch)) digits += ch;
      }
      // Cap at 3 digits
      if (digits.length > 3) digits = digits.slice(0, 3);
      // If the value would exceed max, reject it
      const num = Number(digits);
      if (digits.length === 3 && num > max) return;
      onChange(digits);
    },
    [onChange, max]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (allowed.includes(e.key)) return;
    if (!/[\d]/.test(e.key)) e.preventDefault();
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const paste = e.clipboardData.getData("text");
      let digits = "";
      for (const ch of paste) {
        if (/\d/.test(ch)) digits += ch;
      }
      if (digits.length > 3) digits = digits.slice(0, 3);
      const num = Number(digits);
      if (digits.length === 3 && num > max) return;
      onChange(digits);
    },
    [onChange, max]
  );

  const isValid = value === "" || (Number(value) >= min && Number(value) <= max);

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="text-[11px] text-credaly-muted block mb-1.5 tracking-[0.05em] uppercase">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        maxLength={3}
        inputMode="numeric"
        disabled={disabled}
        style={{
          borderColor: !isValid && value ? C.red : undefined,
        }}
        className="w-full bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-lg px-[14px] py-[10px] text-credaly-text text-[13px] outline-none box-border font-sans focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
      />
      {hint && <p className="text-[10px] text-credaly-faint m-0 mt-1">{hint}</p>}
      {!isValid && value && (
        <p className="text-[10px] text-credaly-red m-0 mt-1">Score must be between {min} and {max}</p>
      )}
    </div>
  );
});

/* ──────────────────────────────────────────────────────────────────
 * TenureInput — loan tenure with presets + custom input
 * ────────────────────────────────────────────────────────────────── */
interface TenureInputProps {
  label?: string;
  value: string;
  onChange: (days: string) => void;
  id?: string;
  disabled?: boolean;
}

const PRESETS = [
  { label: "30 days", value: "30" },
  { label: "60 days", value: "60" },
  { label: "90 days", value: "90" },
  { label: "180 days", value: "180" },
  { label: "1 year", value: "365" },
];

export const TenureInput = React.memo(function TenureInput({
  label = "Loan Tenure",
  value,
  onChange,
  id,
  disabled,
}: TenureInputProps) {
  const inputId = id || "tenure-input";
  const isCustom = !PRESETS.find((p) => p.value === value);

  return (
    <div className="mb-4">
      <label className="text-[11px] text-credaly-muted block mb-1.5 tracking-[0.05em] uppercase">
        {label}
      </label>
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Tenure presets">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            disabled={disabled}
            className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors font-semibold disabled:opacity-50 ${
              value === p.value
                ? "bg-[rgba(245,166,35,0.1)] border-[rgba(245,166,35,0.3)] text-credaly-amber"
                : "bg-credaly-s1 border-[rgba(100,140,200,0.12)] text-credaly-muted hover:text-credaly-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* Custom days input */}
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="text"
          value={isCustom ? value : ""}
          onChange={(e) => {
            let digits = "";
            for (const ch of e.target.value) {
              if (/\d/.test(ch)) digits += ch;
            }
            if (digits.length <= 4 && Number(digits) <= 3650) {
              onChange(digits);
            }
          }}
          onKeyDown={(e) => {
            const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"];
            if (allowed.includes(e.key)) return;
            if (!/[\d]/.test(e.key)) e.preventDefault();
          }}
          placeholder="Custom days…"
          maxLength={4}
          inputMode="numeric"
          disabled={disabled}
          className="flex-1 bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-lg px-[14px] py-[10px] text-credaly-text text-[13px] outline-none box-border font-sans focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        />
        <span className="text-[11px] text-credaly-faint whitespace-nowrap">
          (max 3650)
        </span>
      </div>
    </div>
  );
});
