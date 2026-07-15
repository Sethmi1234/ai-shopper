# 🛍️ AI Shopper — AI-Powered E-Commerce Platform

<div align="center">
  <br />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-433E38?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/React_Query-5-FF4154?style=for-the-badge&logo=react-query" alt="React Query" />
  <br /><br />
</div>

**AI Shopper** is a full-stack AI-powered e-commerce platform with a Next.js 14 frontend and an Express.js backend. It features intelligent product recommendations, a smart chatbot assistant, NVIDIA AI-powered product search, user authentication (JWT), and a persistent shopping cart & wishlist backed by MongoDB.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started — Frontend](#-getting-started--frontend)
- [Getting Started — Backend](#-getting-started--backend)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Demo Credentials](#-demo-credentials)
- [Changes from Original](#-changes-from-original)

---

## ✨ Features

### 🧠 AI-Powered Shopping
- **AI Chatbot** — Floating chat assistant that classifies user intent via NVIDIA Mistral Large 3, fetches products from DummyJSON, and returns filtered results with add-to-cart / wishlist support
- **"Ask AI" Home Search** — Natural language search bar on the homepage that extracts intent (category, price, brand, etc.) via AI and returns direct product results (no follow-up questions)
- **AI Smart Recommendations** — `POST /ai/smart-recommend` endpoint provides product recommendations with clarification support (asks follow-up questions when ambiguous)

### 🛒 Full E-Commerce Backend
- **User Authentication** — Register, login, JWT access + refresh tokens, protected routes
- **Shopping Cart** — Full CRUD (add, update quantity, remove, clear) persisted in MongoDB
- **Wishlist** — Full CRUD persisted in MongoDB
- **Orders** — Create and view order history

### 🎨 Modern UI/UX
- Black & Lime Green (`#ccff00`) theme
- Animated hero with rotating taglines
- Fully responsive, mobile-optimized
- Smooth animations throughout
- Sticky navbar with cart/wishlist badges

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** (App Router) | React framework with SSR |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Zustand 5** | Client-side state (cart, wishlist) with localStorage persistence |
| **TanStack React Query 5** | Server state caching |
| **Axios** | HTTP client with JWT interceptors |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express.js 5** | REST API framework |
| **MongoDB + Mongoose** | Database |
| **MongoDB Memory Server** | In-memory DB for tests |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt** | Password hashing |
| **OpenAI SDK** | NVIDIA NIM API integration |
| **Zod** | Input validation |
| **express-rate-limit** | Rate limiting |

### External APIs
| API | Purpose |
|-----|---------|
| **NVIDIA NIM (Mistral Large 3)** | AI intent classification, product filtering, recommendations |
| **DummyJSON** | Product catalog data source (20+ categories, 200+ products) |

---

## 🗂️ Project Structure

```
ai-shopper/
├── ai-shopper-frontend/          # Next.js 14 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/        # Protected pages (cart, category, favorites, products, profile)
│   │   │   ├── login/            # Login page
│   │   │   └── page.tsx          # Landing page
│   │   ├── components/
│   │   │   ├── ai/               # ChatBot, AiRecommend
│   │   │   ├── home/             # AISearch, CategoryGrid, Hero, Services, etc.
│   │   │   ├── layout/           # Navbar, Footer
│   │   │   └── product/          # ProductCard
│   │   ├── hooks/                # Custom React hooks (useCart, useWishlist, useProducts, etc.)
│   │   ├── lib/                  # Axios instance with JWT interceptors
│   │   ├── services/             # API service functions
│   │   └── store/                # Zustand stores (cart, wishlist)
│   ├── next.config.mjs           # Rewrites /api/* → backend
│   └── .env.local                # Frontend environment variables
│
├── ai-shopper-backend/           # Express.js backend
│   ├── src/
│   │   ├── config/               # DB connection, AI client config
│   │   ├── controllers/          # Route handlers (auth, cart, wishlist, orders, ai)
│   │   ├── lib/                  # Category list, helpers
│   │   ├── middleware/           # Auth guard (JWT verify), rate limiter
│   │   ├── models/               # Mongoose schemas (User, Cart, Wishlist, Order)
│   │   ├── routes/               # Express routers
│   │   ├── services/             # AI service (NVIDIA calls), business logic
│   │   ├── utils/                # Utility functions
│   │   └── validators/           # Zod schemas
│   └── .env                      # Backend environment variables
│
└── README.md
```

---

## 📦 Getting Started — Frontend

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation & Setup

```bash
# Navigate to frontend
cd ai-shopper/ai-shopper-frontend

# Install dependencies
npm install

# Set up environment variables (see section below)
# Create .env.local in ai-shopper-frontend/
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The frontend will run without the backend for browsing products (it fetches from DummyJSON directly). For cart, wishlist, authentication, and AI features, the backend must be running.

---

## 📦 Getting Started — Backend

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### Installation & Setup

```bash
# Navigate to backend
cd ai-shopper/ai-shopper-backend

# Install dependencies
npm install

# Create .env file (see environment variables section)
```

### Run Development Server

```bash
npm run dev
```

The backend starts on **http://localhost:5000**.

### Run Tests

```bash
npm test
```

---

## 🔑 Environment Variables

### Frontend (`ai-shopper-frontend/.env.local`)

```env
# Backend API URL — all /api/* calls are proxied here
NEXT_PUBLIC_API_URL=http://localhost:5000

# Fallback DummyJSON URL for direct product data fetching
NEXT_PUBLIC_DUMMYJSON_URL=https://dummyjson.com
```

> The frontend uses Next.js rewrites (`next.config.mjs`) to proxy `/api/*` requests to the backend at `NEXT_PUBLIC_API_URL`. This eliminates CORS issues during development.

### Backend (`ai-shopper-backend/.env`)

```env
PORT=5000

# MongoDB connection string
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# JWT secrets
ACCESS_TOKEN_SECRET=my_access_secret_key
REFRESH_TOKEN_SECRET=my_refresh_secret_key

# NVIDIA NIM API (for AI features)
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NVIDIA_MODEL=mistralai/mistral-large-3-675b-instruct-2512
NVIDIA_BUILD_URL=https://integrate.api.nvidia.com/v1

# Optional: DummyJSON base URL override (defaults to https://dummyjson.com)
DUMMYJSON_BASE_URL=https://dummyjson.com
```

---

## 🌐 API Endpoints

All endpoints are prefixed with their base path as shown below.

### Authentication (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | No | Refresh expired access token |
| GET | `/auth/me` | Yes | Get current user profile |

### Cart (`/cart`) — All require authentication

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cart` | Get all cart items |
| POST | `/cart/items` | Add item to cart |
| PATCH | `/cart/items/:id` | Update cart item quantity |
| DELETE | `/cart/items/:id` | Remove item from cart |
| DELETE | `/cart` | Clear entire cart |

### Wishlist (`/wishlist`) — All require authentication

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wishlist` | Get all wishlist items |
| POST | `/wishlist/items` | Add item to wishlist |
| DELETE | `/wishlist/items/:id` | Remove item from wishlist |
| DELETE | `/wishlist` | Clear entire wishlist |

### Orders (`/orders`) — All require authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/orders` | Create a new order |
| GET | `/orders` | Get user's order history |
| GET | `/orders/:id` | Get order by ID |

### AI (`/ai`)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| POST | `/ai/classify` | No | Standard | Classify user message into a product category |
| POST | `/ai/recommend` | No | Strict | Full AI recommendation pipeline — extracts intent, fetches & filters products. **Direct answers only, no follow-up questions** |
| POST | `/ai/smart-recommend` | No | Strict | Smart recommendation with **clarification support** — asks follow-up questions when ambiguous |
| POST | `/ai/filter-products` | Yes | Strict | AI-powered product relevance filtering |

> **Auth vs No Auth for AI routes:**
> - `/ai/classify`, `/ai/recommend`, and `/ai/smart-recommend` are **public** — they use server-side API keys (NVIDIA) and public data (DummyJSON). No user token needed.
> - `/ai/filter-products` requires auth because it's designed to be called after product search for personalized filtering.

---

## 🧪 Demo Credentials

| Field | Value |
|-------|-------|
| **Name** | `Test User` |
| **Email** | `test@example.com` |
| **Password** | `password123` |

Register a new account at `/login` or via `POST /auth/register`.

---

## 📝 Changes from Original

### `CHANGES.md`

See [`CHANGES.md`](./CHANGES.md) for a detailed breakdown of changes made to the original project, including architecture decisions, frontend-backend integration, and bug fixes.