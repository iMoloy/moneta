<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,50:0f2027,100:1a3a2a&height=180&section=header&text=Moneta&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=Mobile%20Financial%20Services%20(MFS)%20Wallet&descAlignY=58&descSize=18&descColor=4ade80&animation=fadeIn" width="100%" alt="Moneta MFS Wallet banner" />

  <br />

  [![Live App](https://img.shields.io/badge/🌐%20Live%20App-moneta--topaz.vercel.app-4ade80?style=for-the-badge&logo=vercel&logoColor=white)](https://moneta-topaz.vercel.app)
  [![GitHub](https://img.shields.io/badge/GitHub-iMoloy%2Fmoneta-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/iMoloy/moneta)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://github.com/iMoloy/moneta)

</div>

---

## 📖 Overview

**Moneta** is a premium, full-stack Mobile Financial Services (MFS) wallet that simulates real-world e-banking and digital cash transfers. Built with a **Next.js 16 App Router** frontend, a **Node.js / Express** backend API, and **MongoDB Atlas** for cloud persistence — it delivers a secure and intuitive digital banking experience in a responsive mobile-app shell.

> **Live at** → [https://moneta-topaz.vercel.app](https://moneta-topaz.vercel.app)

---

## 🛠️ Technologies Used

### Frontend (moneta-client)

| Technology | Version | Role |
|---|---|---|
| [Next.js](https://nextjs.org/) | `16.2.10` | React framework (App Router) |
| [React](https://react.dev/) | `19.2.4` | Core UI library |
| [Tailwind CSS](https://tailwindcss.com/) | `^4` | Utility-first CSS |
| [DaisyUI](https://daisyui.com/) | `^5.6.10` | Component library with light/dark themes |
| [Better Auth](https://www.better-auth.com/) | `^1.6.23` | Authentication client |
| [React Toastify](https://fkhadra.github.io/react-toastify/) | `^11.1.0` | Toast notifications |
| [Fontshare](https://www.fontshare.com/) | — | Premium typography (Satoshi + Clash Display) |

### Backend (moneta-server)

| Technology | Version | Role |
|---|---|---|
| [Node.js](https://nodejs.org/) | `≥18` | Runtime |
| [Express.js](https://expressjs.com/) | `^4.21.2` | HTTP server & routing |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | — | Cloud-hosted database |
| [Mongoose](https://mongoosejs.com/) | `^8.9.5` | MongoDB ODM |
| [Better Auth](https://www.better-auth.com/) | `^1.6.23` | Authentication engine |
| [dotenv](https://github.com/motdotla/dotenv) | `^16.4.5` | Environment variable loader |
| [cors](https://github.com/expressjs/cors) | `^2.8.5` | Cross-origin request handling |

---

## ✨ Core Features

### 🔒 Security & Authentication
- **Credentials Login** — session-based auth via Better Auth with hashed phone + password
- **Secure Registration** — Name, Phone, Password, and 4-digit security PIN sign-up flow
- **Mandatory PIN Checks** — every financial action (deposit, transfer, cashout, bills) requires PIN verification
- **Show/Hide PIN Toggle** — visual masking control for field reassurance

### 💸 Wallet & Financial Services
- **Live Balance Card** — real-time account balance fetched from MongoDB
- **Add Money** — simulated card (Visa/Mastercard) and bank deposit integrations
- **Cash Out** — withdraw funds with a standard 1.85% agent fee calculation
- **Send Money** — atomic peer-to-peer transfers using phone number identifiers
- **Pay Bill** — settle utility bills (Electricity, Water, Gas, Internet) with biller and subscriber validation
- **Transaction Ledger** — full history with category filters (Add, Cashout, Transfer, Bill, Bonus) and name/reference search

### 🎁 Promo System
- **Claim Bonus** — redeem promo codes (`WELCOME50` → +$50) verified against database, one-time use enforced

### 🎨 UI & Visual
- **Mobile App Shell** — styled viewport wrapper mimicking a modern smartphone frame with elevation shadows
- **DaisyUI v5 Themes** — built-in light/dark mode switcher
- **Responsive Sliding Action Sheets** — bottom-slide modal panels for all financial actions

---

## 📂 Repository Layout

```text
moneta/
├── README.md               # This file
├── .gitignore              # Root Git config
├── moneta-client/          # Next.js App Router frontend
│   ├── src/
│   │   ├── app/            # Routes, layouts, pages
│   │   └── components/     # UI components
│   ├── public/
│   ├── package.json
│   └── next.config.mjs
└── moneta-server/          # Express.js REST API
    ├── routes/wallet.js    # All wallet API endpoints
    ├── models/             # Mongoose schemas
    ├── middleware/         # Auth middleware
    ├── auth.js             # Better Auth config
    ├── db.js               # MongoDB connection
    ├── server.js           # Entry point
    ├── seed.js             # Database seeder
    └── package.json
```

---

## 🚀 Run Locally

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** account (free tier works)

---

### 1 — Clone the Repository

```bash
git clone https://github.com/iMoloy/moneta.git
cd moneta
```

---

### 2 — Backend Server Setup

```bash
cd moneta-server
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/moneta

# Better Auth — generate with: openssl rand -hex 32
BETTER_AUTH_SECRET=your_secret_key_here

# URL of the running frontend (for CORS)
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

> Server runs on **http://localhost:5000**

*(Optional)* Seed the database with demo billers and deposit sources:

```bash
npm run seed
```

---

### 3 — Frontend Client Setup

```bash
cd ../moneta-client
npm install
```

Create your environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and set the backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_secret_key_here   # must match server
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

> App runs on **http://localhost:3000**

---

### Available Scripts

#### moneta-client

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build production bundle |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

#### moneta-server

| Command | Description |
|---|---|
| `npm run dev` | Start server with `--watch` (auto-restart) |
| `npm run start` | Start production server |
| `npm run seed` | Seed MongoDB with demo data |

---

## 🔗 Resources

- 🌐 **Live App** → [https://moneta-topaz.vercel.app](https://moneta-topaz.vercel.app)
- 🐙 **GitHub** → [github.com/iMoloy/moneta](https://github.com/iMoloy/moneta)
- 💼 **Author** → [linkedin.com/in/iMoloy](https://linkedin.com/in/iMoloy)

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a3a2a,50:0f2027,100:0d1117&height=100&section=footer&animation=fadeIn" width="100%" alt="Footer" />
  <sub>Made with ❤️ by <strong>Moloy Krishna Paul</strong></sub>
</div>
