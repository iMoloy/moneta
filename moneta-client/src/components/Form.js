"use client";
import { useState } from "react";

/**
 * Reusable Input Group Component
 * Features dynamic focus states, shifting prefix icon colors, and uppercase headings.
 */
export const InputGroup = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  max,
  required = true,
  iconClass,
  error,
  variant = "light",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const isDark = variant === "dark";

  return (
    <div className="form-control mb-4 w-full">
      {label && (
        <label className="label pb-1 select-none">
          <span className={`text-[10px] font-black uppercase tracking-widest pl-1 ${
            isDark ? "text-white/60" : "text-base-content/50"
          }`}>
            {label}
          </span>
        </label>
      )}

      <div
        className={`relative w-full rounded-2xl border transition-all duration-300 ${
          error
            ? isDark
              ? "border-red-500/50 bg-red-950/10"
              : "border-red-400/60 bg-red-50/30"
            : isFocused
            ? isDark
              ? "border-indigo-400 bg-slate-900/80 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
              : "border-indigo-500 bg-white shadow-[0_0_10px_rgba(79,70,229,0.12)]"
            : isDark
            ? "border-white/[0.08] hover:border-white/20 bg-white/5"
            : "border-base-300 hover:border-indigo-300 bg-base-100 shadow-sm hover:shadow-md"
        }`}
      >
        {/* Shifting Prefix Icon */}
        {iconClass && (
          <div
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 ${
              error 
                ? "text-red-400" 
                : isFocused 
                ? "text-indigo-500" 
                : isDark 
                ? "text-white/30" 
                : "text-base-content/30"
            }`}
          >
            <i className={iconClass}></i>
          </div>
        )}

        <input
          type={inputType}
          placeholder={placeholder}
          className={`w-full bg-transparent h-12.5 text-sm focus:outline-none transition-all font-semibold ${
            isDark ? "text-white placeholder:text-white/30" : "text-base-content placeholder:text-base-content/30"
          } ${
            iconClass ? "pl-11" : "px-4.5"
          } ${isPassword ? "pr-12" : "pr-4.5"}`}
          value={value}
          onChange={onChange}
          maxLength={max}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Password / PIN eye toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors cursor-pointer ${
              isDark ? "text-white/30 hover:text-white/60" : "text-base-content/30 hover:text-base-content/50"
            }`}
          >
            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
          </button>
        )}
      </div>

      {error && (
        <span className="text-[10px] text-red-500 mt-1 font-bold pl-2 tracking-wide animate-in fade-in duration-200">
          <i className="fa-solid fa-circle-exclamation mr-1"></i>
          {error}
        </span>
      )}
    </div>
  );
};

/**
 * Reusable Action Button Component
 * Featuring neon gradients, glow overlays, and scaling micro-interactions.
 */
export const ActionButton = ({ children, type = "submit", onClick, loading }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="btn w-full rounded-2xl h-12.5 border-none text-white text-sm font-black tracking-wider uppercase shadow-lg shadow-indigo-500/10 bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 hover:shadow-indigo-500/20 active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
  >
    {loading ? (
      <>
        <span className="loading loading-spinner loading-xs"></span>
        Processing
      </>
    ) : (
      children
    )}
  </button>
);
