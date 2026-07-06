"use client";
import { useState, useContext } from "react";
import { BankContext } from "@/context/BankContext";
import { InputGroup, ActionButton } from "@/components/Form";
import Link from "next/link";

export default function Login() {
  const { login, loading } = useContext(BankContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      tempErrors.phone = "Phone number is required.";
    } else if (!/^01\d{9}$/.test(cleanPhone)) {
      tempErrors.phone = "Must be 11 digits (starts with 01).";
    }

    if (!password) {
      tempErrors.password = "Password is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      await login(phone, password);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6.5 py-10 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white relative overflow-y-auto no-scrollbar">

      {/* Glow blobs */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 right-0 w-48 h-48 bg-violet-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 left-0 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="flex flex-col items-center mt-12 text-center select-none shrink-0 z-10">
        {/* Animated ring around logo */}
        <div className="relative mb-5">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-indigo-500/30 to-violet-500/30 blur-xl animate-pulse"></div>
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center">
            <i className="fa-solid fa-wallet text-white text-5xl"></i>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-[0.25em] bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent font-heading select-none drop-shadow-sm">
          MONETA
        </h1>
        <p className="text-[10px] text-indigo-200/40 font-black uppercase tracking-widest mt-1">
          Next-Gen Mobile Wallet
        </p>
        {/* Trust badge */}
        <div className="flex items-center gap-1.5 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
          <i className="fa-solid fa-shield-halved text-[9px] text-emerald-400"></i>
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Bank-Grade Security</span>
        </div>
      </div>

      {/* Forms */}
      <div className="flex-1 flex flex-col justify-center my-8 z-10">
        <div className="mb-6.5 text-center">
          <h2 className="text-xl font-black text-white tracking-tight">
            Sign In to Wallet
          </h2>
          <p className="text-xs text-indigo-200/50 font-bold mt-1">
            Access your secure MFS account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <InputGroup
            label="Mobile Number"
            type="text"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength="11"
            iconClass="fa-solid fa-phone"
            error={errors.phone}
            variant="dark"
          />
          <InputGroup
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconClass="fa-solid fa-lock"
            error={errors.password}
            variant="dark"
          />
          
          <div className="mt-8">
            <ActionButton loading={loading}>Sign In</ActionButton>
          </div>
        </form>
      </div>

      {/* Feature pills */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap z-10">
        {[
          { icon: "fa-bolt", label: "Instant Transfer" },
          { icon: "fa-lock", label: "Encrypted" },
          { icon: "fa-clock-rotate-left", label: "24/7 Access" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-full px-2.5 py-1">
            <i className={`fa-solid ${f.icon} text-[8px] text-indigo-400`}></i>
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200/50">{f.label}</span>
          </div>
        ))}
      </div>

      {/* Redirect Footer Link */}
      <div className="text-center shrink-0 z-10">
        <p className="text-xs text-indigo-200/40 font-bold">
          New to Moneta?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-extrabold hover:underline ml-1 transition-all"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
