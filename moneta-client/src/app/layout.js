import "./globals.css";
import { BankProvider } from "@/context/BankContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Moneta | Secure Mobile Wallet",
  description: "Secure, modern mobile wallet for simple financial transactions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-screen flex justify-center bg-base-300">
        <div className="w-full max-w-md bg-base-100 text-base-content shadow-2xl min-h-screen relative flex flex-col">
          <BankProvider>
            {children}
            <ToastContainer position="top-center" autoClose={2000} />
          </BankProvider>
        </div>
      </body>
    </html>
  );
}

