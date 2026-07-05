"use client";

export default function BottomNav({ activeView, setView }) {
  const navItems = [
    { id: "home", label: "Home", icon: "fa-house" },
    { id: "history", label: "History", icon: "fa-clock-rotate-left" },
    { id: "profile", label: "Profile", icon: "fa-user" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-t-[2.2rem] border-t border-white/10 flex items-center justify-around px-6 z-40 shadow-lg shadow-slate-950/20">
      {navItems.map((item) => {
        const isActive = activeView === item.id || (item.id === "home" && !["history", "profile"].includes(activeView));
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="flex flex-col items-center justify-center w-16 h-16 transition-all duration-200 cursor-pointer"
          >
            <div
              className={`text-xl mb-1 transition-all duration-200 ${
                isActive
                  ? "text-indigo-600 scale-110"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <span
              className={`text-[10px] font-bold tracking-wider ${
                isActive ? "text-indigo-600" : "text-white/40"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
