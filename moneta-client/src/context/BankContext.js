"use client";
import { createContext, useState, useEffect } from "react";
import { createAuthClient } from "better-auth/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Initialize Better Auth Client pointing to Express Server
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
});

export const BankContext = createContext();

// Helper to hash PIN locally using Web Crypto API before sending it to the server
const hashPinSHA256 = async (pin) => {
  const msgBuffer = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const BankProvider = ({ children }) => {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch session reactively using Better Auth Hook
  const { data: sessionData, isPending: authLoading, refetch: refetchSession } =
    authClient.useSession();

  const user = sessionData?.user;

  // Reusable API fetch helper that attaches cookies credentials
  const apiFetch = async (path, options = {}) => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
    const res = await fetch(`${serverUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Ensure session cookies are sent
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "API transaction failed.");
    }
    return data;
  };

  // Log in user via Better Auth
  const login = async (phone, password) => {
    setLoading(true);
    try {
      const email = `${phone.trim()}@moneta.local`;
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || "Invalid phone number or password.");
      }

      toast.success("Welcome back! Login successful.");
      await refetchSession();
      router.push("/dashboard");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up user via Better Auth with custom fields (phone, pin)
  const register = async (name, phone, password, pin) => {
    setLoading(true);
    try {
      if (pin.length !== 4 || isNaN(pin)) {
        throw new Error("Security PIN must be a 4-digit number.");
      }

      const email = `${phone.trim()}@moneta.local`;
      const hashedPin = await hashPinSHA256(pin);

      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: name.trim(),
        phone: phone.trim(),
        pin: hashedPin, // Store securely hashed PIN
      });

      if (error) {
        throw new Error(error.message || "Registration failed. Phone might be in use.");
      }

      toast.success("Registration successful! Please login.");
      router.push("/");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Log out user
  const logout = async () => {
    try {
      await authClient.signOut();
      toast.info("Logged out successfully.");
      await refetchSession();
      setTransactions([]);
      router.push("/");
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

  // Load user transactions list
  const fetchTransactions = async (filters = {}) => {
    if (!user) return;
    try {
      const query = new URLSearchParams(filters).toString();
      const data = await apiFetch(`/api/wallet/transactions?${query}`, {
        method: "GET",
      });
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Failed to load transactions:", err.message);
    }
  };

  // Execute financial transaction helper
  const runTransaction = async (endpoint, payload) => {
    setLoading(true);
    try {
      if (payload.pin) {
        payload.pin = await hashPinSHA256(payload.pin); // Hash input PIN before verifying on server
      }

      const data = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success(data.message || "Transaction processed successfully.");
      await refetchSession(); // Refresh balance
      await fetchTransactions(); // Refresh activities list
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sync transaction logs on user change
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return (
    <BankContext.Provider
      value={{
        user,
        transactions,
        loading: loading || authLoading,
        login,
        register,
        logout,
        fetchTransactions,
        addMoney: (amount, pin, source) => runTransaction("/api/wallet/add-money", { amount, pin, source }),
        cashOut: (amount, pin, agentPhone) => runTransaction("/api/wallet/cashout", { amount, pin, agentPhone }),
        transfer: (amount, pin, receiverPhone) => runTransaction("/api/wallet/transfer", { amount, pin, receiverPhone }),
        payBill: (amount, pin, billerName, subscriberId) => runTransaction("/api/wallet/pay-bill", { amount, pin, billerName, subscriberId }),
        claimCoupon: (code) => runTransaction("/api/wallet/claim-coupon", { code }),
      }}
    >
      {children}
    </BankContext.Provider>
  );
};
