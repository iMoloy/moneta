"use client";
import { useState } from "react";

/**
 * Reusable Input Group Component
 * Features validation feedback, clear styling, and optional icon mapping.
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
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="form-control mb-5 w-full">
      <label className="label pb-1.5">
        <span className="label-text font-bold text-gray-700 text-sm tracking-wide">
          {label}
        </span>
      </label>

      <div className="relative w-full">
        {/* Optional input prefix icon */}
        {iconClass && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <i className={iconClass}></i>
          </div>
        )}

        <input
          type={inputType}
          placeholder={placeholder}
          className={`input w-full rounded-2xl bg-gray-50 border border-gray-200 h-13 ${
            iconClass ? "pl-11" : "px-5"
          } ${
            isPassword ? "pr-12" : "pr-5"
          } focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-gray-800 placeholder:text-gray-400 font-medium`}
          value={value}
          onChange={onChange}
          maxLength={max}
          required={required}
        />

        {/* Password or PIN show/hide toggle button */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
          </button>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-500 mt-1 font-semibold pl-1">
          {error}
        </span>
      )}
    </div>
  );
};

/**
 * Reusable Action Button Component
 * Supports custom clicking triggers, standard types, and is loading-state aware.
 */
export const ActionButton = ({ children, type = "submit", onClick, loading }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="btn w-full rounded-2xl h-13 border-none text-white text-base font-bold shadow-lg shadow-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
  >
    {loading ? (
      <>
        <span className="loading loading-spinner loading-sm"></span>
        Processing...
      </>
    ) : (
      children
    )}
  </button>
);
