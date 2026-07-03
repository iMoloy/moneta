# Moneta Mobile Wallet (MFS) 📱

Moneta is a premium, full-stack Mobile Financial Services (MFS) wallet designed to simulate real-world e-banking and digital cash transfers. Built with a Next.js App Router frontend, a Node.js/Express backend API, and a cloud-hosted MongoDB Atlas database, it offers a secure and intuitive user experience encapsulated in a responsive mobile app shell.

---

## ✨ Features

### 🔒 Security & Authentication
*   **Credentials Login:** Secured user sessions using **Better Auth** linked with hashed phone number and password schemas.
*   **Seamless Registration:** Profile sign-up flow requesting Name, Phone, password, and a dedicated 4-digit security PIN.
*   **Mandatory PIN Checks:** Every transaction (deposits, transfers, cashouts, bills) requires 4-digit PIN verification before modifying balances.
*   **Show/Hide PIN Toggle:** Easily switch field character masking for visual reassurance.

### 💸 Wallet & Financial Services
*   **Live Balance Card:** Visually striking balance banner fetching real-time account data from MongoDB.
*   **Add Money:** Deposit credits into your wallet using simulated card networks (Visa/Mastercard) and bank integrations.
*   **Cash Out:** Withdraw funds securely (calculates a standard 1.85% agent fee on withdrawals).
*   **Send Money (Transfer):** Atomically send money to other registered Moneta users using phone number identifiers.
*   **Pay Bill:** Clear utility bills (Electricity, Water, Gas, Internet) with target biller selections and subscriber input validations.
*   **Real-Time Transactions Ledger:** Filter transactions by category (Add, Cashout, Transfer, Bill, Bonus) and search by names or billing references.

### 🎁 Promo Systems
*   **Claim Bonus:** Claim cash rewards using valid promo codes (e.g., `WELCOME50` credits $50 on a one-time use basis), verified and logged in the database.

### 🎨 Visual & UI Highlights
*   **App Shell Mockup:** Styled viewport wrapper mimicking a modern smartphone frame with high-elevation drop shadows.
*   **DaisyUI v5 Light/Dark Themes:** Built-in switcher to toggle between responsive light and dark environments.
*   **Typography by Fontshare:** Premium typography configurations using Satoshi (body text) and Clash Display (heading elements).
*   **Responsive Sliding Action Sheets:** Modern sliding layouts that slide up from the bottom when triggers are clicked, featuring a "Back to Home" cancellation button.

---

## 🛠️ Tech Stack

*   **Frontend Client:** Next.js 16 (App Router, JavaScript), Tailwind CSS v4, DaisyUI v5, React Toastify, FontAwesome Icons.
*   **Backend Server:** Node.js, Express.js, MongoDB Atlas (Mongoose ODM).
*   **Authentication Engine:** Better Auth.

---

## 📂 Directory Layout

```text
moneta/
├── plan.md               # PRD and functional requirements
├── implementation_plan.md# Development milestones roadmap (ignored)
├── README.md             # Project documentation (This file)
├── .gitignore            # Root Git config
├── moneta-client/        # Next.js App Router Frontend
└── moneta-server/        # Express API Server
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+ recommended) and **npm** installed on your system.

### 2. Backend Server Setup
1.  Navigate into `moneta-server`:
    ```bash
    cd moneta-server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
4.  Configure the environment variables:
    *   `MONGODB_URI`: Set your MongoDB Atlas connection string.
    *   `BETTER_AUTH_SECRET`: Generate a cryptographically secure key (e.g. `openssl rand -hex 32`).
5.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will boot on `http://localhost:5000`.

### 3. Frontend Client Setup
1.  Navigate into `moneta-client`:
    ```bash
    cd ../moneta-client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:3000`.
