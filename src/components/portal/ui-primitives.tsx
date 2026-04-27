"use client";

import React, { useCallback } from "react";

const C = {
  amber: "#F5A623",
  amberFaint: "rgba(245,166,35,0.1)",
  teal: "#00C9A7",
  tealFaint: "rgba(0,201,167,0.1)",
  red: "#EF4444",
  redFaint: "rgba(239,68,68,0.1)",
  border: "rgba(100,140,200,0.12)",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
  s1: "#0F1D32",
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export const Badge = React.memo(function Badge({ label, color = C.amber, bg }: BadgeProps) {
  const bgColor = bg || `rgba(${hexToRgb(color)},0.12)`;

  return (
    <span
      className="text-[10px] font-semibold tracking-[0.06em] rounded-sm px-[6px] py-[2px] inline-block"
      style={{
        color,
        backgroundColor: bgColor,
      }}
    >
      {label}
    </span>
  );
});

interface KpiCardProps {
  label: string;
  value: string;
  delta?: { up: boolean; text: string };
  color?: string;
  icon?: React.ReactNode;
}

export const KpiCard = React.memo(function KpiCard({
  label,
  value,
  delta,
  color = C.amber,
  icon,
}: KpiCardProps) {
  return (
    <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-[18px_20px] flex-1 min-w-[140px]">
      <div className="flex justify-between items-start">
        <p className="text-[11px] text-credaly-muted m-0 tracking-[0.05em] uppercase">
          {label}
        </p>
        <span className="text-credaly-amber">{icon}</span>
      </div>
      <p className="text-[28px] font-bold mt-2 mb-1" style={{ color }}>
        {value}
      </p>
      {delta && (
        <p className="text-[11px] m-0" style={{ color: delta.up ? C.teal : C.red }}>
          {delta.up ? "\u25B2" : "\u25BC"} {delta.text}
        </p>
      )}
    </div>
  );
});

interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  id?: string;
  /** Maximum number of characters */
  maxLength?: number;
  /** Minimum value (for type="number") */
  min?: number;
  /** Maximum value (for type="number") */
  max?: number;
  /** Step value (for type="number") */
  step?: number | string;
  /** Hint for mobile keyboard type */
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  /** Regex pattern for validation */
  pattern?: string;
  /** Handler for key down events */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  /** Make input read-only */
  readOnly?: boolean;
}

export const Input = React.memo(function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  id,
  maxLength,
  min,
  max,
  step,
  inputMode,
  pattern,
  onKeyDown,
  readOnly,
}: InputProps) {
  const inputId = id || `input-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="text-[11px] text-credaly-muted block mb-1.5 tracking-[0.05em] uppercase">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        inputMode={inputMode}
        pattern={pattern}
        readOnly={readOnly}
        className="w-full bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-lg px-[14px] py-[10px] text-credaly-text text-[13px] outline-none box-border font-sans focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {hint && (
        <p className="text-[10px] text-credaly-faint m-0 mt-1">{hint}</p>
      )}
    </div>
  );
});

interface SelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  id?: string;
}

export const Select = React.memo(function Select({ label, value, onChange, options, id }: SelectProps) {
  const selectId = id || `select-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="mb-4">
      <label htmlFor={selectId} className="text-[11px] text-credaly-muted block mb-1.5 tracking-[0.05em] uppercase">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-lg px-[14px] py-[10px] text-credaly-text text-[13px] outline-none font-sans"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
});

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "teal";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  ariaLabel?: string;
}

export const Btn = React.memo(function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  icon,
  ariaLabel,
}: BtnProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: C.amber, color: "#06101E", border: "none" },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    danger: { background: C.redFaint, color: C.red, border: `1px solid ${C.redFaint}` },
    teal: { background: C.tealFaint, color: C.teal, border: `1px solid rgba(0,201,167,0.2)` },
  };
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 14px", fontSize: 12 },
    md: { padding: "10px 20px", fontSize: 13 },
    lg: { padding: "12px 28px", fontSize: 14 },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === "string" ? children : undefined)}
      className="font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-opacity duration-150 font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credaly-amber/50"
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
});

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const Pill = React.memo(function Pill({ label, active, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-semibold rounded-full px-[14px] py-[5px] transition-all duration-150 font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credaly-amber/50"
      style={{
        background: active ? C.amberFaint : "transparent",
        border: `1px solid ${active ? C.amber : C.border}`,
        color: active ? C.amber : C.muted,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
});
