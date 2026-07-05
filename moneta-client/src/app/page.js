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
      tempErrors.phone = "Invalid format. Must be 11 digits (e.g. 01XXXXXXXXX).";
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
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-12 bg-base-200 min-h-screen">
      {/* Brand Logo Container */}
      <div className="flex flex-col items-center mb-10 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md flex items-center justify-center mb-4">
          <i className="fa-solid fa-wallet text-white text-3xl"></i>
        </div>
        <h1 className="text-3xl font-black text-base-content tracking-wider">
          M O N E T A
        </h1>
        <p className="text-xs text-base-content/40 font-bold uppercase tracking-widest mt-1">
          Secure Mobile MFS
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full bg-base-100 p-8 rounded-[2rem] shadow-xl border border-base-200">
        <h2 className="text-xl font-bold text-base-content mb-6 text-center">
          Access Your Wallet
        </h2>
        
        <form onSubmit={handleSubmit}>
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
          
          <div className="mt-6">
            <ActionButton loading={loading}>Sign In</ActionButton>
          </div>
        </form>
      </div>

      {/* Redirect footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-base-content/70 font-medium">
          New to Moneta?{" "}
          <Link
            href="/register"
            className="text-indigo-600 font-bold hover:underline transition-all"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
