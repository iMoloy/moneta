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
    billers,
    depositSources,
    cards,
    loading,
    logout,
    addMoney,
    cashOut,
    transfer,
    payBill,
    claimCoupon,
    updateProfileImage,
    addCard,
    deleteCard,
    setDefaultCard,
  } = useContext(BankContext);

  const router = useRouter();

  // View states: home, history, profile, add, cash, send, bill, bonus, cards, addcard
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
  const [source, setSource] = useState("");
  const [biller, setBiller] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Card form inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardBrand, setCardBrand] = useState("Other");
  
  // Filtering & search
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (depositSources.length > 0 && !source) {
      setSource(depositSources[0].name);
    }
  }, [depositSources, source]);

  useEffect(() => {
    if (billers.length > 0 && !biller) {
      setBiller(billers[0].name);
    }
  }, [billers, biller]);

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
    setCardNumber("");
    setCardHolder("");
    setCardExpiry("");
    setCardBrand("Other");
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

  // Auto-detect card brand from number prefix
  const detectBrand = (num) => {
    const n = num.replace(/\s/g, "");
    if (/^4/.test(n)) return "Visa";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    return "Other";
  };

  // Format card number as groups of 4 (e.g. 1234 5678 9012 3456)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
    setCardBrand(detectBrand(raw));
  };

  // Format expiry as MM/YY
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(raw.slice(0, 2) + "/" + raw.slice(2));
    } else {
      setCardExpiry(raw);
    }
  };

  const handleAddCard = async () => {
    const errors = {};
    const rawNum = cardNumber.replace(/\s/g, "");
    const [mm, yy] = cardExpiry.split("/");
    const expMonth = parseInt(mm);
    const expYear = yy ? 2000 + parseInt(yy) : NaN;

    if (rawNum.length < 16) errors.cardNumber = "Enter a valid 16-digit card number.";
    if (!cardHolder.trim()) errors.cardHolder = "Cardholder name is required.";
    if (!mm || !yy || isNaN(expMonth) || isNaN(expYear) || expMonth < 1 || expMonth > 12) {
      errors.cardExpiry = "Enter a valid expiry date (MM/YY).";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const success = await addCard({
      cardholderName: cardHolder,
      cardNumber,
      expMonth,
      expYear,
      brand: cardBrand,
    });
    if (success) {
      setCardNumber("");
      setCardHolder("");
      setCardExpiry("");
      setCardBrand("Other");
      setFormErrors({});
      setView("cards");
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
                  { id: "cards",   label: "My Cards",   icon: "fa-credit-card",            glow: "bg-violet-500/30",  iconColor: "text-violet-300" },
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

        {/* Cards View */}
        {view === "cards" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4 pl-1">
              <h3 className="text-lg font-black text-indigo-600 tracking-tight">My Cards</h3>
              <button
                onClick={() => { setFormErrors({}); setView("addcard"); }}
                disabled={cards.length >= 5}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                <i className="fa-solid fa-plus text-[9px]" />
                Add Card
              </button>
            </div>

            {cards.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-10 text-center rounded-[2.5rem] border border-white/5 shadow-md flex flex-col items-center gap-3">
                <i className="fa-regular fa-credit-card text-3xl text-indigo-400/40" />
                <p className="text-indigo-200/50 font-bold text-xs">No cards saved yet.</p>
                <button
                  onClick={() => setView("addcard")}
                  className="mt-1 px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Add Your First Card
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cards.map((card) => (
                  <div key={card._id} className={`relative overflow-hidden rounded-[1.8rem] p-5 flex flex-col gap-3.5 shadow-xl border transition-all duration-200 ${
                    card.isDefault
                      ? "bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 border-indigo-500/40 shadow-indigo-500/10"
                      : "bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-white/5"
                  }`}>
                    {/* Glow blobs */}
                    <div className="absolute -top-6 -right-6 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Top row: brand + default badge */}
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-2">
                        {card.brand === "Visa" && (
                          <span className="text-white font-black italic text-base tracking-tight leading-none">VISA</span>
                        )}
                        {card.brand === "Mastercard" && (
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-red-500/80" />
                            <div className="w-5 h-5 rounded-full bg-amber-400/80 -ml-2.5" />
                          </div>
                        )}
                        {card.brand === "Amex" && (
                          <span className="text-cyan-300 font-black text-[11px] tracking-widest">AMEX</span>
                        )}
                        {card.brand === "Other" && (
                          <i className="fa-solid fa-credit-card text-indigo-300/60 text-base" />
                        )}
                      </div>
                      {card.isDefault && (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>

                    {/* Card number */}
                    <p className="text-white font-mono text-sm font-bold tracking-[0.2em] relative z-10">
                      •••• •••• •••• {card.last4}
                    </p>

                    {/* Bottom row: name + expiry */}
                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <p className="text-[7px] text-indigo-200/40 font-black uppercase tracking-widest">Card Holder</p>
                        <p className="text-xs text-white font-bold mt-0.5 truncate max-w-[140px]">{card.cardholderName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[7px] text-indigo-200/40 font-black uppercase tracking-widest">Expires</p>
                        <p className="text-xs text-white font-bold mt-0.5">
                          {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 relative z-10 pt-1 border-t border-white/5">
                      {!card.isDefault && (
                        <button
                          onClick={() => setDefaultCard(card._id)}
                          disabled={loading}
                          className="flex-1 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-400/20 text-indigo-300 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteCard(card._id)}
                        disabled={loading}
                        className="flex-1 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/15 text-rose-400 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can mr-1 text-[8px]" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {cards.length < 5 && (
                  <button
                    onClick={() => setView("addcard")}
                    className="w-full py-4 rounded-[1.8rem] border border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-indigo-400/50 hover:text-indigo-400 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-plus" />
                    Add Another Card ({cards.length}/5)
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 7. Slide-Up Drawer Sheet Panel */}
      <div
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          ["add", "cash", "send", "bill", "bonus", "addcard"].includes(view)
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={resetForm}
      >
        {/* Sliding Panel Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#0C0D14]/98 backdrop-blur-2xl rounded-t-[2.2rem] shadow-2xl p-7 pt-5 transition-transform duration-300 transform z-50 flex flex-col max-h-[80%] border-t border-white/[0.08] ${
            ["add", "cash", "send", "bill", "bonus", "addcard"].includes(view)
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
               view === "bill" ? "Pay Utilities" :
               view === "addcard" ? "Add New Card" : "Enter Coupon"}
            </h3>
            <div className="w-8"></div>
          </div>

          <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
            {/* Conditional inputs */}

            {view === "add" && (
              <div className="mb-4">
                <label className="label pb-1 select-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200/40 pl-1">Deposit Source</span>
                </label>

                {/* Saved Cards — clickable thumbnails */}
                {cards.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {cards.map((card) => {
                      const cardLabel = `${card.brand} Card \u2022\u2022\u2022\u2022 ${card.last4}`;
                      const isSelected = source === cardLabel;
                      return (
                        <button
                          key={card._id}
                          type="button"
                          onClick={() => setSource(cardLabel)}
                          className={`relative overflow-hidden flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                            isSelected
                              ? "bg-indigo-950/60 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                              : "bg-white/5 border-white/[0.08] hover:border-white/20"
                          }`}
                        >
                          {/* Glow when selected */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none rounded-2xl" />
                          )}
                          <div className="flex items-center gap-3 relative z-10">
                            {/* Brand mark */}
                            <div className="w-9 h-6 rounded-md bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                              {card.brand === "Visa" && <span className="text-white font-black italic text-[9px] tracking-tight">VISA</span>}
                              {card.brand === "Mastercard" && (
                                <div className="flex">
                                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                  <div className="w-3 h-3 rounded-full bg-amber-400/80 -ml-1.5" />
                                </div>
                              )}
                              {card.brand === "Amex" && <span className="text-cyan-300 font-black text-[7px] tracking-widest">AMEX</span>}
                              {card.brand === "Other" && <i className="fa-solid fa-credit-card text-indigo-300/60 text-[10px]" />}
                            </div>
                            <div>
                              <p className="text-white font-bold text-xs leading-none">\u2022\u2022\u2022\u2022 {card.last4}</p>
                              <p className="text-[8px] text-indigo-200/40 font-bold mt-0.5">{card.cardholderName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 relative z-10">
                            {card.isDefault && (
                              <span className="text-[7px] font-black uppercase tracking-widest bg-indigo-500/15 border border-indigo-400/20 text-indigo-400 px-1.5 py-0.5 rounded-full">Default</span>
                            )}
                            {isSelected && <i className="fa-solid fa-circle-check text-indigo-400 text-sm" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Other Sources */}
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200/30 pl-1 mb-2">
                  {cards.length > 0 ? "Or Other Source" : "Select Source"}
                </p>
                <select
                  value={cards.some(c => source === `${c.brand} Card \u2022\u2022\u2022\u2022 ${c.last4}`) ? "" : source}
                  onChange={(e) => setSource(e.target.value)}
                  className="select select-bordered w-full rounded-2xl bg-[#131622] border border-white/[0.08] h-12 px-4.5 font-bold text-xs text-white focus:outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                >
                  <option value="" disabled>{cards.length > 0 ? "— choose other source —" : "Select a source"}</option>
                  {depositSources.map((ds) => (
                    <option key={ds._id} value={ds.name}>
                      {ds.name} {ds.details ? `(${ds.details})` : ""}
                    </option>
                  ))}
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
                  {billers.map((b) => (
                    <option key={b._id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
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

            {/* Add Card Form */}
            {view === "addcard" && (
              <div>
                {/* Brand indicator pill */}
                <div className="flex justify-end mb-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    cardBrand === "Visa" ? "bg-blue-500/10 border-blue-400/20 text-blue-300" :
                    cardBrand === "Mastercard" ? "bg-red-500/10 border-red-400/20 text-red-300" :
                    cardBrand === "Amex" ? "bg-cyan-500/10 border-cyan-400/20 text-cyan-300" :
                    "bg-white/5 border-white/10 text-indigo-200/40"
                  }`}>
                    {cardBrand === "Other" ? "Card Brand" : cardBrand}
                  </span>
                </div>

                {/* Card Number */}
                <div className="form-control mb-4 w-full">
                  <label className="label pb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 pl-1">Card Number</span>
                  </label>
                  <div className={`relative w-full rounded-2xl border transition-all duration-300 ${
                    formErrors.cardNumber
                      ? "border-red-500/50 bg-red-950/10"
                      : "border-white/[0.08] hover:border-white/20 bg-white/5"
                  }`}>
                    <i className="fa-solid fa-credit-card absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-transparent h-12.5 text-sm focus:outline-none font-semibold text-white placeholder:text-white/30 pl-11 pr-4.5 tracking-widest"
                    />
                  </div>
                  {formErrors.cardNumber && (
                    <span className="text-[10px] text-red-500 mt-1 font-bold pl-2">
                      <i className="fa-solid fa-circle-exclamation mr-1" />{formErrors.cardNumber}
                    </span>
                  )}
                </div>

                {/* Cardholder Name */}
                <InputGroup
                  label="Cardholder Name"
                  type="text"
                  placeholder="e.g. Moloy Krishna Paul"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  iconClass="fa-solid fa-user"
                  error={formErrors.cardHolder}
                  variant="dark"
                />

                {/* Expiry */}
                <div className="form-control mb-4 w-full">
                  <label className="label pb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 pl-1">Expiry Date</span>
                  </label>
                  <div className={`relative w-full rounded-2xl border transition-all duration-300 ${
                    formErrors.cardExpiry
                      ? "border-red-500/50 bg-red-950/10"
                      : "border-white/[0.08] hover:border-white/20 bg-white/5"
                  }`}>
                    <i className="fa-solid fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className="w-full bg-transparent h-12.5 text-sm focus:outline-none font-semibold text-white placeholder:text-white/30 pl-11 pr-4.5 tracking-widest"
                    />
                  </div>
                  {formErrors.cardExpiry && (
                    <span className="text-[10px] text-red-500 mt-1 font-bold pl-2">
                      <i className="fa-solid fa-circle-exclamation mr-1" />{formErrors.cardExpiry}
                    </span>
                  )}
                </div>

                <div className="mt-6.5">
                  <button
                    onClick={handleAddCard}
                    disabled={loading}
                    className="btn w-full rounded-2xl h-12.5 border-none text-white text-sm font-black tracking-wider uppercase shadow-lg shadow-indigo-500/10 bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 hover:shadow-indigo-500/20 active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                  >
                    {loading ? (
                      <><span className="loading loading-spinner loading-xs" />Saving...</>
                    ) : (
                      <><i className="fa-solid fa-lock text-xs" />Save Card Securely</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {view !== "addcard" && (
              <div className="mt-6.5">
                <ActionButton
                  onClick={() => handleWalletAction(view)}
                  loading={loading}
                >
                  Confirm Transaction
                </ActionButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. Sticky Bottom navigation bar */}
      <BottomNav activeView={view} setView={setView} />
    </div>
  );
}
