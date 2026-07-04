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
      className="btn btn-circle btn-ghost text-gray-500 hover:text-indigo-600 transition-all cursor-pointer border border-gray-200 dark:border-gray-800"
      title="Toggle Light/Dark Theme"
    >
      <i className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"} text-lg`}></i>
    </button>
  );
}
