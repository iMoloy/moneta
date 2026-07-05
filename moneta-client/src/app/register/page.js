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
      tempErrors.name = "Name must be at least 3 characters.";
    }

    if (!cleanPhone) {
      tempErrors.phone = "Mobile number is required.";
    } else if (!/^01\d{9}$/.test(cleanPhone)) {
      tempErrors.phone = "Invalid format. Must be 11 digits (e.g. 01XXXXXXXXX).";
    }

    if (!password) {
      tempErrors.password = "Password is required.";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
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

      {/* Registration Card */}
      <div className="w-full bg-base-100 p-8 rounded-[2rem] shadow-xl border border-base-200">
        <h2 className="text-xl font-bold text-base-content mb-6 text-center">
          Create Your Account
        </h2>
        
        <form onSubmit={handleSubmit}>
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
          
          <div className="mt-6">
            <ActionButton loading={loading}>Sign Up</ActionButton>
          </div>
        </form>
      </div>

      {/* Redirect footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-base-content/70 font-medium">
          Already have an account?{" "}
          <Link
            href="/"
            className="text-indigo-600 font-bold hover:underline transition-all"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
