"use client";
import { useState, useContext, useEffect } from "react";
import { BankContext } from "@/context/BankContext";
import { useRouter } from "next/navigation";
import { InputGroup, ActionButton } from "@/components/Form";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "react-toastify";

export default function Dashboard() {
  const {
    user,
    transactions,
    loading,
    logout,
    addMoney,
    cashOut,
    transfer,
    payBill,
    claimCoupon,
    updateProfileImage,
  } = useContext(BankContext);

  const router = useRouter();

  // View states: home, history, profile, add, cash, send, bill, bonus
  const [view, setView] = useState("home");

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    try {
      await updateProfileImage(file);
    } catch (err) {
      console.error(err);
    }
  };
  
  // Balance tap-to-reveal toggle
  const [showBalance, setShowBalance] = useState(false);

  // Form inputs
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [source, setSource] = useState("Visa Card");
  const [biller, setBiller] = useState("DESCO Electricity");
  const [couponCode, setCouponCode] = useState("");
  
  // Filtering & search
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading && !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <span className="loading loading-spinner loading-md text-indigo-600"></span>
      </div>
    );
  }

  if (!user) return null;

  const resetForm = () => {
    setAmount("");
    setPin("");
    setTargetAccount("");
    setCouponCode("");
    setFormErrors({});
    setView("home");
  };

  const validateForm = (type) => {
    const errors = {};
    const val = parseFloat(amount);

    if (type !== "bonus") {
      if (!amount) {
        errors.amount = "Amount is required.";
      } else if (isNaN(val) || val <= 0) {
        errors.amount = "Must be a positive number.";
      }

      if (!pin) {
        errors.pin = "Security PIN is required.";
      } else if (!/^\d{4}$/.test(pin)) {
        errors.pin = "Must be exactly 4 digits.";
      }
    }

    if (type === "cash") {
      if (!targetAccount) {
        errors.account = "Agent number is required.";
      } else if (!/^01\d{9}$/.test(targetAccount)) {
        errors.account = "Invalid 11-digit Agent number.";
      }
    }

    if (type === "send") {
      if (!targetAccount) {
        errors.account = "Recipient number is required.";
      } else if (!/^01\d{9}$/.test(targetAccount)) {
        errors.account = "Invalid 11-digit number.";
      } else if (targetAccount === user.phone) {
        errors.account = "Cannot transfer to yourself.";
      }
    }

    if (type === "bill") {
      if (!targetAccount) {
        errors.account = "Subscriber Account ID is required.";
      }
    }

    if (type === "bonus") {
      if (!couponCode.trim()) {
        errors.coupon = "Coupon code is required.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWalletAction = async (actionType) => {
    if (!validateForm(actionType)) return;

    let success = false;
    if (actionType === "add") {
      success = await addMoney(amount, pin, source);
    } else if (actionType === "cash") {
      success = await cashOut(amount, pin, targetAccount);
    } else if (actionType === "send") {
      success = await transfer(amount, pin, targetAccount);
    } else if (actionType === "bill") {
      success = await payBill(amount, pin, biller, targetAccount);
    } else if (actionType === "bonus") {
      success = await claimCoupon(couponCode);
    }

    if (success) {
      resetForm();
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.counterParty.toLowerCase().includes(txSearch.toLowerCase());
    
    const matchesType =
      txTypeFilter === "all" || tx.type === txTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-base-200 dark:bg-slate-900 overflow-hidden pb-20 relative select-none">
      
      {/* 1. Header Banner */}
      <header className="mx-5.5 px-5.5 pt-7 pb-5 flex justify-between items-center bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-b-[2rem] border-b border-l border-r border-white/10 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-[9px] text-indigo-200/50 font-black uppercase tracking-widest leading-none">Welcome back,</p>
            <h3 className="font-extrabold text-white text-sm leading-tight mt-0.5">{user.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={logout}
            className="btn btn-circle btn-sm btn-ghost text-indigo-200/50 hover:text-red-400 hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer w-8 h-8 flex items-center justify-center"
            title="Sign Out"
          >
            <i className="fa-solid fa-right-from-bracket text-[11px]"></i>
          </button>
        </div>
      </header>

      {/* Main View Scroll Area */}
      <main className="px-5.5 py-4 overflow-y-auto flex-1 no-scrollbar pb-24">
        
        {/* 2. Premium Metallic Credit Card Balance Card */}
        <div className="w-full rounded-[2.2rem] bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 shadow-xl shadow-slate-950/20 text-white relative overflow-hidden mb-6.5 border border-white/5 flex flex-col gap-4">
          {/* Ambient glow blobs */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top row: balance label + chip */}
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-[8px] text-indigo-300/70 font-black uppercase tracking-widest mb-1.5">Available Wallet Balance</p>
              <h2 className="text-3xl font-black tracking-wider transition-all duration-300">
                {showBalance ? `$${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••••"}
              </h2>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <svg className="w-8 h-6 shrink-0 select-none" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="30" height="22" rx="3.5" fill="#EAB308" stroke="#FEF08A" strokeWidth="1"/>
                <path d="M16 1V23M1 12H31M8 6H24V18H8V6Z" stroke="#854D0E" strokeWidth="0.8"/>
              </svg>
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-indigo-300/40 select-none">MONETA</span>
            </div>
          </div>

          {/* Middle: Total In / Out stats */}
          <div className="flex gap-5 z-10 relative">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-arrow-down text-[8px] text-emerald-400" />
              </div>
              <div>
                <p className="text-[7px] text-indigo-200/40 font-bold uppercase tracking-wider leading-none">Total In</p>
                <p className="text-[10px] font-black text-emerald-400 leading-tight mt-0.5">
                  ${transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="w-px bg-white/5 self-stretch" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-arrow-up text-[8px] text-rose-400" />
              </div>
              <div>
                <p className="text-[7px] text-indigo-200/40 font-bold uppercase tracking-wider leading-none">Total Out</p>
                <p className="text-[10px] font-black text-rose-400 leading-tight mt-0.5">
                  ${transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Thin glowing divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 relative" />

          {/* Bottom row: account number + hologram + show/hide */}
          <div className="flex justify-between items-center z-10 relative select-none">
            <div>
              <p className="text-[7.5px] text-indigo-200/40 font-bold uppercase tracking-widest leading-none">Account Number</p>
              <p className="text-sm font-semibold tracking-widest mt-1 text-indigo-200">{user.phone}</p>
            </div>
            {/* Hologram circles — next to account number */}
            <div className="flex items-center select-none mx-auto">
              <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-300/15 -mr-2.5" />
              <div className="w-6 h-6 rounded-full bg-indigo-400/20 border border-indigo-300/15" />
            </div>
            <div
              onClick={() => setShowBalance(!showBalance)}
              className="bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest flex flex-row items-center justify-center gap-1.5 border border-white/5 uppercase select-none whitespace-nowrap cursor-pointer transition-all duration-150"
            >
              <i className={`fa-solid ${showBalance ? "fa-eye-slash" : "fa-eye"} text-[10px] leading-none`} />
              <span className="translate-y-[0.5px] leading-none">{showBalance ? "Hide" : "Show"}</span>
            </div>
          </div>
        </div>

        {/* 3. Grid Services (Home) */}
        {view === "home" && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6.5">
              <h4 className="text-[10px] font-black text-indigo-600 tracking-widest uppercase mb-3 pl-1">Wallet Services</h4>
              
              {/* Mini ATM-card style service buttons — 3 col, compact */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "add",     label: "Add Money",  icon: "fa-circle-plus",           glow: "bg-indigo-500/30",  iconColor: "text-indigo-300" },
                  { id: "cash",    label: "Cash Out",   icon: "fa-arrow-up-from-bracket",  glow: "bg-emerald-500/30", iconColor: "text-emerald-300" },
                  { id: "send",    label: "Send Money", icon: "fa-paper-plane",            glow: "bg-amber-500/30",   iconColor: "text-amber-300" },
                  { id: "bill",    label: "Pay Bill",   icon: "fa-file-invoice-dollar",    glow: "bg-cyan-500/30",    iconColor: "text-cyan-300" },
                  { id: "bonus",   label: "Promo Code", icon: "fa-gift",                   glow: "bg-rose-500/30",    iconColor: "text-rose-300" },
                  { id: "history", label: "History",    icon: "fa-clock-rotate-left",      glow: "bg-purple-500/30",  iconColor: "text-purple-300" },
                ].map((srv) => (
                  <button
                    key={srv.id}
                    onClick={() => setView(srv.id)}
                    className="relative overflow-hidden flex flex-col justify-between p-3 h-[72px] bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-white/5 rounded-2xl shadow-md shadow-black/20 hover:brightness-110 hover:border-white/10 active:scale-95 transition-all duration-200 cursor-pointer text-white"
                  >
                    {/* Colored glow — bottom right */}
                    <div className={`absolute -bottom-3 -right-3 w-16 h-16 ${srv.glow} rounded-full blur-2xl pointer-events-none`} />

                    {/* Icon — top left */}
                    <i className={`fa-solid ${srv.icon} relative z-10 text-base ${srv.iconColor}`} />

                    {/* Label — bottom left */}
                    <span className="relative z-10 text-[7.5px] font-black uppercase tracking-widest text-indigo-100/70 leading-none">
                      {srv.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Latest Payments section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3 pl-1">
                <h4 className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">Latest Activity</h4>
                <button
                  onClick={() => setView("history")}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 text-center rounded-[2.2rem] border border-white/5 shadow-md text-indigo-200/50 font-bold text-xs">
                  No transaction activity logged yet.
                </div>
              ) : (
                transactions.slice(0, 3).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between p-3.5 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-white/5 rounded-2.5xl shadow-md mb-2.5 text-white">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9.5 h-9.5 rounded-1.5rem flex items-center justify-center text-xs bg-white/5 ${
                        tx.type === "credit" ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        <i className={`fa-solid ${
                          tx.category === "add" ? "fa-circle-plus" :
                          tx.category === "cashout" ? "fa-arrow-up-from-bracket" :
                          tx.category === "transfer" ? "fa-paper-plane" :
                          tx.category === "bill" ? "fa-file-invoice-dollar" : "fa-gift"
                        }`}></i>
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-xs leading-none">{tx.title}</p>
                        <p className="text-[9px] text-indigo-200/40 font-bold mt-1.5">{new Date(tx.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className={`font-black text-xs ${
                      tx.type === "credit" ? "text-emerald-400" : "text-white"
                    }`}>
                      {tx.type === "credit" ? `+$${tx.amount}` : `-$${tx.amount}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. Transactions History Full Ledger */}
        {view === "history" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-lg font-black text-indigo-600 mb-4 tracking-tight pl-1">Activity Ledger</h3>

            {/* Local Search and Filtering */}
            <div className="mb-5 flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search activity records..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="input w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-white/10 h-10.5 pl-9 pr-4 text-xs focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 outline-none placeholder:text-indigo-200/30 font-semibold text-white"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-200/40 text-xs"></i>
              </div>

              {/* Segmented Filter Control */}
              <div className="grid grid-cols-3 bg-[#0a0c12] p-1 rounded-2xl border border-white/5">
                {["all", "credit", "debit"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTxTypeFilter(type)}
                    className={`py-1.5 text-[9px] font-black rounded-xl transition-all cursor-pointer uppercase tracking-wider ${
                      txTypeFilter === type 
                        ? "bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-indigo-600 border border-white/10 shadow-md" 
                        : "text-slate-600 dark:text-white/40 hover:text-black dark:hover:text-white font-extrabold"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-10 text-center rounded-[2.5rem] border border-white/5 shadow-md text-indigo-200/50 font-bold text-xs">
                No matching transactions found.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-3.5 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-white/5 rounded-[2.5rem] shadow-md mb-2.5 text-white">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9.5 h-9.5 rounded-1.5rem flex items-center justify-center text-xs ${
                      tx.type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      <i className={`fa-solid ${
                        tx.category === "add" ? "fa-circle-plus" :
                        tx.category === "cashout" ? "fa-arrow-up-from-bracket" :
                        tx.category === "transfer" ? "fa-paper-plane" :
                        tx.category === "bill" ? "fa-file-invoice-dollar" : "fa-gift"
                      }`}></i>
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-xs leading-none">{tx.title}</p>
                      <p className="text-[9px] text-indigo-200/40 font-bold mt-1.5">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {tx.counterParty && (
                        <p className="text-[8px] text-indigo-400/80 font-black uppercase tracking-widest mt-1.5 leading-none">
                          ID: {tx.counterParty}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`font-black text-xs ${
                    tx.type === "credit" ? "text-emerald-400" : "text-white"
                  }`}>
                    {tx.type === "credit" ? `+$${tx.amount}` : `-$${tx.amount}`}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* 6. Profile View */}
        {view === "profile" && (
          <div className="animate-in fade-in duration-300 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-7.5 rounded-[2.2rem] shadow-md border border-white/5 text-center text-white">
            <div className="relative group w-18 h-18 mx-auto mb-3.5">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-18 h-18 rounded-full object-cover shadow-md border-2 border-indigo-500/50"
                />
              ) : (
                <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-2.5xl shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Overlapping camera icon button to choose local image file */}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center border border-slate-950 cursor-pointer shadow-md transition-all duration-200"
                title="Change Profile Picture"
              >
                <i className="fa-solid fa-camera text-[9px]"></i>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h3 className="text-base font-extrabold text-white leading-none">{user.name}</h3>
            <p className="text-[8px] text-indigo-200/50 font-black uppercase tracking-widest mt-1.5">Registered Member</p>

            {/* Balance summary pills */}
            <div className="flex gap-3 mt-4 justify-center">
              <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-center">
                <p className="text-[7px] text-emerald-400/70 font-black uppercase tracking-wider">Total In</p>
                <p className="text-xs font-black text-emerald-400 mt-0.5">${transactions.filter(t=>t.type==="credit").reduce((s,t)=>s+t.amount,0).toFixed(2)}</p>
              </div>
              <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-2.5 text-center">
                <p className="text-[7px] text-indigo-200/50 font-black uppercase tracking-wider">Balance</p>
                <p className="text-xs font-black text-white mt-0.5">${user.balance?.toFixed(2)}</p>
              </div>
              <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-2.5 text-center">
                <p className="text-[7px] text-rose-400/70 font-black uppercase tracking-wider">Total Out</p>
                <p className="text-xs font-black text-rose-400 mt-0.5">${transactions.filter(t=>t.type==="debit").reduce((s,t)=>s+t.amount,0).toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-5 border-t border-white/5 pt-5 text-left flex flex-col gap-3.5">
              <div>
                <p className="text-[8px] text-indigo-200/40 font-black uppercase tracking-widest">Mobile Account</p>
                <p className="text-xs text-white font-semibold mt-1">{user.phone}</p>
              </div>
              <div>
                <p className="text-[8px] text-indigo-200/40 font-black uppercase tracking-widest">Member Since</p>
                <p className="text-xs text-white font-semibold mt-1">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</p>
              </div>
              <div>
                <p className="text-[8px] text-indigo-200/40 font-black uppercase tracking-widest">Unique ID</p>
                <p className="text-[10px] text-indigo-200/50 font-mono mt-1 break-all select-all">{user.id}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 7. Slide-Up Drawer Sheet Panel */}
      <div
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          ["add", "cash", "send", "bill", "bonus"].includes(view)
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={resetForm}
      >
        {/* Sliding Panel Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0C0D14]/98 backdrop-blur-2xl rounded-t-[2.2rem] shadow-2xl p-7 pt-5 transition-transform duration-300 transform z-50 flex flex-col max-h-[80%] border-t border-white/[0.08] ${
            ["add", "cash", "send", "bill", "bonus"].includes(view)
              ? "translate-y-0"
              : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Drag bar visual */}
          <div className="w-11 h-1 bg-white/10 rounded-full mx-auto mb-5 shrink-0"></div>

          {/* Drawer Header with back control */}
          <div className="flex justify-between items-center mb-5 shrink-0 select-none">
            <button
              onClick={resetForm}
              className="btn btn-circle btn-sm btn-ghost text-indigo-200/55 hover:bg-white/5 transition-all border border-white/10 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left text-[11px]"></i>
            </button>
            <h3 className="font-black text-indigo-50 text-sm uppercase tracking-wider font-heading">
              {view === "add" ? "Deposit Money" :
               view === "cash" ? "Withdrawal" :
               view === "send" ? "Transfer Out" :
               view === "bill" ? "Pay Utilities" : "Enter Coupon"}
            </h3>
            <div className="w-8"></div>
          </div>

          <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
            {/* Conditional inputs */}
            {view === "add" && (
              <div className="form-control mb-4">
                <label className="label pb-1 select-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200/40 pl-1">Deposit Source</span>
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="select select-bordered w-full rounded-2xl bg-[#131622] border border-white/[0.08] h-12 px-4.5 font-bold text-xs text-white focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                >
                  <option value="Visa Card">Visa Debit Card (*4221)</option>
                  <option value="Mastercard">Mastercard Gold (*8890)</option>
                  <option value="City Bank">City Bank Account</option>
                  <option value="BRAC Bank">BRAC Bank Account</option>
                </select>
              </div>
            )}

            {view === "bill" && (
              <div className="form-control mb-4">
                <label className="label pb-1 select-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200/40 pl-1">Utility Provider</span>
                </label>
                <select
                  value={biller}
                  onChange={(e) => setBiller(e.target.value)}
                  className="select select-bordered w-full rounded-2xl bg-[#131622] border border-white/[0.08] h-12 px-4.5 font-bold text-xs text-white focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                >
                  <option value="DESCO Electricity">DESCO Electricity</option>
                  <option value="Dhaka WASA Water">Dhaka WASA Water</option>
                  <option value="Karnaphuli Gas">Karnaphuli Gas</option>
                  <option value="Link3 Internet">Link3 Internet</option>
                </select>
              </div>
            )}

            {["add", "cash", "send", "bill"].includes(view) && (
              <>
                {view !== "add" && (
                  <InputGroup
                    label={
                      view === "cash" ? "Agent Phone" :
                      view === "send" ? "Recipient Phone" : "Subscriber Account ID"
                    }
                    type="text"
                    placeholder={view === "bill" ? "e.g. 100988776" : "01XXXXXXXXX"}
                    value={targetAccount}
                    onChange={(e) => setTargetAccount(e.target.value)}
                    maxLength={view !== "bill" ? "11" : undefined}
                    iconClass={view !== "bill" ? "fa-solid fa-phone" : "fa-solid fa-hashtag"}
                    error={formErrors.account}
                    variant="dark"
                  />
                )}

                <InputGroup
                  label="Transaction Amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  iconClass="fa-solid fa-dollar-sign"
                  error={formErrors.amount}
                  variant="dark"
                />

                <InputGroup
                  label="4-Digit Security PIN"
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength="4"
                  iconClass="fa-solid fa-key"
                  error={formErrors.pin}
                  variant="dark"
                />
              </>
            )}

            {view === "bonus" && (
              <InputGroup
                label="Promo / Coupon Code"
                type="text"
                placeholder="e.g. WELCOME50"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                iconClass="fa-solid fa-gift"
                error={formErrors.coupon}
                variant="dark"
              />
            )}

            <div className="mt-6.5">
              <ActionButton 
                onClick={() => handleWalletAction(view)}
                loading={loading}
              >
                Confirm Transaction
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Sticky Bottom navigation bar */}
      <BottomNav activeView={view} setView={setView} />
    </div>
  );
}
