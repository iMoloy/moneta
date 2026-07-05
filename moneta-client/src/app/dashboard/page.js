"use client";
import { useState, useContext, useEffect } from "react";
import { BankContext } from "@/context/BankContext";
import { useRouter } from "next/navigation";
import { InputGroup, ActionButton } from "@/components/Form";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";

export default function Dashboard() {
  const {
    user,
    transactions,
    loading,
    logout,
    fetchTransactions,
    addMoney,
    cashOut,
    transfer,
    payBill,
    claimCoupon,
  } = useContext(BankContext);

  const router = useRouter();

  // Navigation states
  const [view, setView] = useState("home"); // home, history, profile, add, cash, send, bill, bonus
  
  // Balance tap-to-reveal state
  const [showBalance, setShowBalance] = useState(false);

  // Form input states
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [source, setSource] = useState("Visa Card");
  const [biller, setBiller] = useState("DESCO Electricity");
  const [couponCode, setCouponCode] = useState("");
  
  // Local transaction filters
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all"); // all, credit, debit

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading && !user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-gray-50">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  if (!user) return null;

  // Clear inputs when closing sheets
  const resetForm = () => {
    setAmount("");
    setPin("");
    setTargetAccount("");
    setCouponCode("");
    setFormErrors({});
    setView("home");
  };

  // Validate transaction forms
  const validateForm = (type) => {
    const errors = {};
    const val = parseFloat(amount);

    if (type !== "bonus") {
      if (!amount) {
        errors.amount = "Amount is required.";
      } else if (isNaN(val) || val <= 0) {
        errors.amount = "Amount must be a positive number.";
      }

      if (!pin) {
        errors.pin = "Security PIN is required.";
      } else if (!/^\d{4}$/.test(pin)) {
        errors.pin = "PIN must be exactly 4 digits.";
      }
    }

    if (type === "cash") {
      if (!targetAccount) {
        errors.account = "Agent number is required.";
      } else if (!/^01\d{9}$/.test(targetAccount)) {
        errors.account = "Invalid Agent number. Must be 11 digits.";
      }
    }

    if (type === "send") {
      if (!targetAccount) {
        errors.account = "Recipient number is required.";
      } else if (!/^01\d{9}$/.test(targetAccount)) {
        errors.account = "Invalid Recipient number. Must be 11 digits.";
      } else if (targetAccount === user.phone) {
        errors.account = "You cannot transfer to your own number.";
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

  // Filter local transactions list
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.counterParty.toLowerCase().includes(txSearch.toLowerCase());
    
    const matchesType =
      txTypeFilter === "all" || tx.type === txTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col flex-1 h-full min-h-screen bg-base-200 overflow-hidden pb-20 relative select-none">
      {/* 1. Header Profile Banner */}
      <header className="p-6 pt-10 flex justify-between items-center bg-base-100 rounded-b-[2.5rem] shadow-sm border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-base-content/40 font-bold uppercase tracking-wider">Hello,</p>
            <h3 className="font-extrabold text-base-content text-base leading-tight">{user.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={logout}
            className="btn btn-circle btn-ghost text-base-content/40 hover:text-red-500 transition-all border border-base-300 cursor-pointer"
            title="Sign Out"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>

      {/* Main View Scroll Area */}
      <main className="px-6 py-6 overflow-y-auto flex-1 no-scrollbar pb-10">
        {/* 2. Premium Tap-to-Reveal Balance Card */}
        <div 
          onClick={() => setShowBalance(!showBalance)}
          className="w-full bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-6 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden mb-6 cursor-pointer transform active:scale-[0.99] transition-all"
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">
                Moneta Wallet Balance
              </p>
              <h2 className="text-3xl font-black tracking-wider transition-all duration-300">
                {showBalance ? `$${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••••"}
              </h2>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1.5 border border-white/10">
              <i className={`fa-solid ${showBalance ? "fa-eye-slash" : "fa-eye"}`}></i>
              {showBalance ? "Hide" : "Reveal"}
            </div>
          </div>
          
          <div className="mt-8 flex justify-between items-center text-xs text-indigo-200/70 font-semibold z-10 relative">
            <span className="tracking-wide">Acct: {user.phone}</span>
            <span className="uppercase tracking-widest text-[9px] bg-indigo-600/30 px-2 py-0.5 rounded border border-indigo-400/20">Active</span>
          </div>
        </div>

        {/* 3. Grid Services Navigation */}
        {view === "home" && (
          <>
            <div className="mb-6">
              <h4 className="font-extrabold text-base-content text-sm tracking-wider uppercase mb-3">Core Transactions</h4>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setView("add")}
                  className="flex flex-col items-center justify-center p-4 bg-base-100 border border-base-200 rounded-3xl hover:bg-base-200/50 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg mb-2"><i className="fa-solid fa-circle-plus"></i></div>
                  <span className="text-[10px] font-bold text-base-content/80">Add Money</span>
                </button>
                <button
                  onClick={() => setView("cash")}
                  className="flex flex-col items-center justify-center p-4 bg-base-100 border border-base-200 rounded-3xl hover:bg-base-200/50 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg mb-2"><i className="fa-solid fa-money-bill-transfer"></i></div>
                  <span className="text-[10px] font-bold text-base-content/80">Cash Out</span>
                </button>
                <button
                  onClick={() => setView("send")}
                  className="flex flex-col items-center justify-center p-4 bg-base-100 border border-base-200 rounded-3xl hover:bg-base-200/50 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg mb-2"><i className="fa-solid fa-paper-plane"></i></div>
                  <span className="text-[10px] font-bold text-base-content/80">Send Money</span>
                </button>
                <button
                  onClick={() => setView("bill")}
                  className="flex flex-col items-center justify-center p-4 bg-base-100 border border-base-200 rounded-3xl hover:bg-base-200/50 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-lg mb-2"><i className="fa-solid fa-receipt"></i></div>
                  <span className="text-[10px] font-bold text-base-content/80">Pay Bill</span>
                </button>
                <button
                  onClick={() => setView("bonus")}
                  className="flex flex-col items-center justify-center p-4 bg-base-100 border border-base-200 rounded-3xl hover:bg-base-200/50 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg mb-2"><i className="fa-solid fa-gift"></i></div>
                  <span className="text-[10px] font-bold text-base-content/80">Get Bonus</span>
                </button>
                <button
                  onClick={() => setView("history")}
                  className="flex flex-col items-center justify-center p-4 bg-base-100 border border-base-200 rounded-3xl hover:bg-base-200/50 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg mb-2"><i className="fa-solid fa-clock-rotate-left"></i></div>
                  <span className="text-[10px] font-bold text-base-content/80">History</span>
                </button>
              </div>
            </div>

            {/* 4. Latest Payments section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-extrabold text-base-content text-sm tracking-wider uppercase">Latest Transactions</h4>
                <button
                  onClick={() => setView("history")}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="bg-base-100 p-6 text-center rounded-3xl border border-base-200 shadow-sm text-base-content/40 font-semibold text-xs">
                  No transactions logged yet.
                </div>
              ) : (
                transactions.slice(0, 4).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between p-4 bg-base-100 border border-base-200 rounded-3xl shadow-sm mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base ${
                        tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      }`}>
                        <i className={`fa-solid ${
                          tx.category === "add" ? "fa-circle-plus" :
                          tx.category === "cashout" ? "fa-money-bill-transfer" :
                          tx.category === "transfer" ? "fa-paper-plane" :
                          tx.category === "bill" ? "fa-receipt" : "fa-gift"
                        }`}></i>
                      </div>
                      <div>
                        <p className="font-bold text-base-content text-sm leading-snug">{tx.title}</p>
                        <p className="text-[10px] text-base-content/40 font-bold">{new Date(tx.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className={`font-black text-sm ${
                      tx.type === "credit" ? "text-emerald-500" : "text-base-content"
                    }`}>
                      {tx.type === "credit" ? `+$${tx.amount}` : `-$${tx.amount}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* 5. Transactions History Full Ledger View */}
        {view === "history" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-extrabold text-base-content mb-4 font-heading">Transaction Ledger</h3>

            {/* Local Search and Filtering */}
            <div className="mb-5 flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search titles or account IDs..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="input w-full rounded-2xl bg-base-100 border border-base-300 h-11 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none placeholder:text-gray-400 font-medium text-base-content"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              </div>

              {/* Segmented Filter Control */}
              <div className="grid grid-cols-3 bg-base-200/50 p-1.5 rounded-2xl">
                {["all", "credit", "debit"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTxTypeFilter(type)}
                    className={`py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer uppercase ${
                      txTypeFilter === type ? "bg-base-100 text-indigo-500 shadow-sm" : "text-gray-400 hover:text-base-content"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="bg-base-100 p-10 text-center rounded-[2.5rem] border border-base-200 shadow-sm text-base-content/40 font-semibold text-sm">
                No matching transactions found.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 bg-base-100 border border-base-200 rounded-3xl shadow-sm mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base ${
                      tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                      <i className={`fa-solid ${
                        tx.category === "add" ? "fa-circle-plus" :
                        tx.category === "cashout" ? "fa-money-bill-transfer" :
                        tx.category === "transfer" ? "fa-paper-plane" :
                        tx.category === "bill" ? "fa-receipt" : "fa-gift"
                      }`}></i>
                    </div>
                    <div>
                      <p className="font-bold text-base-content text-sm leading-snug">{tx.title}</p>
                      <p className="text-[10px] text-base-content/40 font-bold">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {tx.counterParty && (
                        <p className="text-[9px] text-indigo-500/80 font-extrabold uppercase tracking-wide mt-0.5">
                          ID: {tx.counterParty}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`font-black text-sm ${
                    tx.type === "credit" ? "text-emerald-500" : "text-base-content"
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
          <div className="animate-in fade-in duration-300 bg-base-100 p-8 rounded-[2.5rem] shadow-sm border border-base-200 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-3xl shadow-md mx-auto mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-extrabold text-base-content">{user.name}</h3>
            <p className="text-xs text-base-content/40 font-bold uppercase tracking-widest mt-1">Wallet Member</p>

            <div className="mt-8 border-t border-base-200 pt-6 text-left flex flex-col gap-4">
              <div>
                <p className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider">Associated Phone</p>
                <p className="text-sm text-base-content font-bold mt-0.5">{user.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider">Account ID</p>
                <p className="text-xs text-base-content/50 font-mono mt-0.5">{user.id}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 7. Slide-Up Drawer Sheet Panel */}
      <div
        className={`absolute inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          ["add", "cash", "send", "bill", "bonus"].includes(view)
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={resetForm}
      >
        {/* Sliding Panel Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-[2.5rem] shadow-2xl p-8 pt-6 transition-transform duration-300 transform z-50 flex flex-col max-h-[85%] ${
            ["add", "cash", "send", "bill", "bonus"].includes(view)
              ? "translate-y-0"
              : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()} // Prevent closing when tapping inside the sheet
        >
          {/* Drawer Drag handle visual */}
          <div className="w-12 h-1.5 bg-base-300 rounded-full mx-auto mb-6"></div>

          {/* Drawer Header with back control */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={resetForm}
              className="btn btn-circle btn-sm btn-ghost text-base-content/55 hover:text-indigo-600 transition-all border border-base-200 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h3 className="font-extrabold text-base-content text-lg uppercase tracking-wider font-heading">
              {view === "add" ? "Add Money" :
               view === "cash" ? "Cash Out" :
               view === "send" ? "Send Money" :
               view === "bill" ? "Pay Bill" : "Claim Promo"}
            </h3>
            <div className="w-8"></div> {/* Spacer balance placeholder */}
          </div>

          <div className="overflow-y-auto no-scrollbar flex-1 pb-6">
            {/* Conditional input fields */}
            {view === "add" && (
              <div className="form-control mb-5">
                <label className="label pb-1.5">
                  <span className="label-text font-bold text-base-content/80 text-sm tracking-wide">Deposit Source</span>
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="select select-bordered w-full rounded-2xl bg-base-200 border border-base-300 h-13 px-4 font-semibold text-base-content focus:outline-none focus:border-indigo-500"
                >
                  <option value="Visa Card">Visa Debit Card (*4221)</option>
                  <option value="Mastercard">Mastercard Gold (*8890)</option>
                  <option value="City Bank">City Bank Account</option>
                  <option value="BRAC Bank">BRAC Bank Account</option>
                </select>
              </div>
            )}

            {view === "bill" && (
              <div className="form-control mb-5">
                <label className="label pb-1.5">
                  <span className="label-text font-bold text-base-content/80 text-sm tracking-wide">Utility Provider</span>
                </label>
                <select
                  value={biller}
                  onChange={(e) => setBiller(e.target.value)}
                  className="select select-bordered w-full rounded-2xl bg-base-200 border border-base-300 h-13 px-4 font-semibold text-base-content focus:outline-none focus:border-indigo-500"
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
                      view === "cash" ? "Agent Phone Number" :
                      view === "send" ? "Recipient Phone Number" : "Subscriber Account ID"
                    }
                    type="text"
                    placeholder={view === "bill" ? "e.g. 100988776" : "01XXXXXXXXX"}
                    value={targetAccount}
                    onChange={(e) => setTargetAccount(e.target.value)}
                    max={view !== "bill" ? "11" : undefined}
                    iconClass={view !== "bill" ? "fa-solid fa-phone" : "fa-solid fa-hashtag"}
                    error={formErrors.account}
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
                />

                <InputGroup
                  label="4-Digit Security PIN"
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  max="4"
                  iconClass="fa-solid fa-key"
                  error={formErrors.pin}
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
              />
            )}

            <div className="mt-4">
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
