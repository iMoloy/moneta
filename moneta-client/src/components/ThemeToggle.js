"use client";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("moneta-theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("moneta-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-circle btn-sm btn-ghost text-indigo-200/50 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer w-8 h-8 flex items-center justify-center"
      title="Toggle Light/Dark Theme"
    >
      <i className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"} text-[11px]`}></i>
    </button>
  );
}
