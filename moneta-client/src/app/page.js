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
    <div className="flex-1 flex flex-col justify-between px-6.5 py-10 relative overflow-y-auto no-scrollbar">
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-0 left-0 right-0 h-60 bg-gradient-to-b from-indigo-500/10 via-violet-500/3 to-transparent blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="flex flex-col items-center mt-12 text-center select-none shrink-0 z-10">
        <div className="w-15 h-15 rounded-[1.4rem] bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/20 flex items-center justify-center mb-5">
          <i className="fa-solid fa-wallet text-white text-2.5xl"></i>
        </div>
        <h1 className="text-3.5xl font-black text-base-content tracking-widest font-heading">
          MONETA
        </h1>
        <p className="text-[10px] text-base-content/40 font-black uppercase tracking-widest mt-1">
          Next-Gen Mobile Wallet
        </p>
      </div>

      {/* Float Forms (No nested card border - mimics native iOS/Android screens) */}
      <div className="flex-1 flex flex-col justify-center my-8 z-10">
        <div className="mb-6.5 text-center">
          <h2 className="text-xl font-black text-base-content tracking-tight">
            Sign In to Wallet
          </h2>
          <p className="text-xs text-base-content/50 font-bold mt-1">
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
            max="11"
            iconClass="fa-solid fa-phone"
            error={errors.phone}
          />
          <InputGroup
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconClass="fa-solid fa-lock"
            error={errors.password}
          />
          
          <div className="mt-8">
            <ActionButton loading={loading}>Sign In</ActionButton>
          </div>
        </form>
      </div>

      {/* Redirect Footer Link */}
      <div className="text-center shrink-0 z-10 mt-auto">
        <p className="text-xs text-base-content/50 font-bold">
          New to Moneta?{" "}
          <Link
            href="/register"
            className="text-indigo-600 hover:text-indigo-500 font-extrabold hover:underline ml-1 transition-all"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
