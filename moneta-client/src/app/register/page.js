"use client";
import { useState, useContext } from "react";
import { BankContext } from "@/context/BankContext";
import { InputGroup, ActionButton } from "@/components/Form";
import Link from "next/link";

export default function Register() {
  const { register, loading } = useContext(BankContext);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    if (!cleanName) {
      tempErrors.name = "Full Name is required.";
    } else if (cleanName.length < 3) {
      tempErrors.name = "Must be at least 3 characters.";
    }

    if (!cleanPhone) {
      tempErrors.phone = "Mobile number is required.";
    } else if (!/^01\d{9}$/.test(cleanPhone)) {
      tempErrors.phone = "Must be 11 digits (starts with 01).";
    }

    if (!password) {
      tempErrors.password = "Password is required.";
    } else if (password.length < 6) {
      tempErrors.password = "Must be at least 6 characters.";
    }

    if (!pin) {
      tempErrors.pin = "4-digit security PIN is required.";
    } else if (!/^\d{4}$/.test(pin)) {
      tempErrors.pin = "PIN must be exactly 4 digits.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      await register(name, phone, password, pin);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6.5 py-10 relative overflow-y-auto no-scrollbar">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-60 bg-gradient-to-b from-indigo-500/10 via-violet-500/3 to-transparent blur-3xl pointer-events-none"></div>

      {/* Title Header */}
      <div className="flex flex-col items-center mt-6 text-center select-none shrink-0 z-10">
        <div className="w-13 h-13 rounded-[1.3rem] bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/20 flex items-center justify-center mb-4">
          <i className="fa-solid fa-wallet text-white text-2.2xl"></i>
        </div>
        <h1 className="text-3xl font-black text-base-content tracking-widest font-heading">
          MONETA
        </h1>
        <p className="text-[9px] text-base-content/40 font-black uppercase tracking-widest mt-1">
          Next-Gen Mobile Wallet
        </p>
      </div>

      {/* Float forms container */}
      <div className="flex-1 flex flex-col justify-center my-6 z-10">
        <div className="mb-5 text-center shrink-0">
          <h2 className="text-xl font-black text-base-content tracking-tight">
            Create Account
          </h2>
          <p className="text-xs text-base-content/50 font-bold mt-0.5">
            Register your MFS wallet details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <InputGroup
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            iconClass="fa-solid fa-user"
            error={errors.name}
          />
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
            label="Login Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconClass="fa-solid fa-lock"
            error={errors.password}
          />
          <InputGroup
            label="4-Digit Security PIN"
            type="password"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            max="4"
            iconClass="fa-solid fa-key"
            error={errors.pin}
          />
          
          <div className="mt-7">
            <ActionButton loading={loading}>Sign Up</ActionButton>
          </div>
        </form>
      </div>

      {/* Bottom Redirect link */}
      <div className="text-center shrink-0 z-10 mt-auto">
        <p className="text-xs text-base-content/50 font-bold">
          Already have an account?{" "}
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-500 font-extrabold hover:underline ml-1 transition-all"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
