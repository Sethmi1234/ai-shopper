# 🛍️ AI Shop — Smart Shopping Powered by AI

<div align="center">
  <br />
  <img src="https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-433E38?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/React_Query-5-FF4154?style=for-the-badge&logo=react-query" alt="React Query" />
  <br /><br />
</div>

**AI Shop** is a modern, AI-powered e-commerce platform built with Next.js 14. It features intelligent product recommendations, a smart chatbot assistant, real-time search, and a sleek black & lime green (`#ccff00`) design.

---

## ✨ Features

### 🧠 AI-Powered Shopping
- **AI Chatbot** — Floating chat assistant that answers product questions using NVIDIA's Llama 3.3 API with smart fallback responses
- **AI Product Search** — Natural language search that extracts intent (category, price, keywords) via AI and queries the product catalog
- **AI Recommendations** — Personalized product suggestions based on user input

### 🛒 Full E-Commerce
- **Product Catalog** — Browse with category filters, price range, rating filter, and sorting
- **Product Details** — Individual product pages with images, descriptions, reviews, and ratings
- **Shopping Cart** — Add/remove items, update quantities, persisted via Zustand + localStorage
- **Wishlist** — Save favorite products with heart toggle, persisted across sessions
- **Search** — Keyword search across the entire product catalog

### 🎨 Modern UI/UX
- **Black & Lime Green Theme** — Bold, high-contrast design with `#ccff00` accent
- **Animated Hero** — Rotating tagline words ("Be Smart.", "Be Bold.", "Be Swift.", etc.)
- **Responsive Design** — Fully mobile-optimized with hamburger menu
- **Smooth Animations** — Fade-in, slide-up, hover effects throughout
- **Sticky Navigation** — Persistent header with cart/wishlist badges

### 📄 Content Sections
- **Services** — 6 premium services with expandable feature lists and stats
- **About Us** — Company story, timeline, values, and leadership team
- **Blog** — 6 blog posts with featured/recent layout and newsletter CTA

### 🔐 Authentication
- **Login Page** — Styled to match the site theme with demo credentials
- **Auth Guard** — Protected dashboard routes
- **Token Refresh** — Automatic access token refresh via axios interceptors

---

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14.2** (App Router) | React framework with SSR/SSG |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Zustand 5** | State management (cart, wishlist) |
| **TanStack React Query 5** | Server state & caching |
| **Axios** | HTTP client with interceptors |
| **NVIDIA Mistral Large 3 API** | AI chat & product search |
| **DummyJSON API** | Product data source |
| **Lucide React** | Icon library |

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-shopper

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_BASE_URL=https://dummyjson.com
NVIDIA_API_KEY=nvapi-your-key-here
NVIDIA_MODEL=mistralai/mistral-large-3-675b-instruct-2512
NVIDIA_BUILD_URL=https://integrate.api.nvidia.com/v1
```

> **Note:** The NVIDIA API key is optional. Without it, the chatbot and AI search will fall back to keyword-based matching.

### Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🧪 Demo Credentials

| Field | Value |
|-------|-------|
| **Username** | `emilys` |
| **Password** | `emilyspass` |

These credentials work with the DummyJSON authentication API.

---

## 🗂️ Project Structure

```
ai-shopper/
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── api/ai/recommend/  # NVIDIA AI API route
│   │   ├── dashboard/         # Protected pages
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── category/      # Category listing
│   │   │   ├── favorites/     # Wishlist
│   │   │   ├── products/      # Product catalog & details
│   │   │   ├── profile/       # User profile
│   │   │   └── page.tsx       # Home/dashboard
│   │   ├── login/             # Login page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ai/                # ChatBot, AiRecommend
│   │   ├── auth/              # AuthGuard
│   │   ├── cart/              # Cart components
│   │   ├── home/              # Hero, Services, About, Blog, etc.
│   │   ├── layout/            # Navbar, Footer
│   │   └── product/           # ProductCard
│   ├── hooks/                 # Custom React hooks
│   │   └── mutations/         # Auth mutations
│   ├── lib/                   # Axios config
│   ├── providers/             # React Query, Auth providers
│   ├── services/              # API service functions
│   └── store/                 # Zustand stores (cart, wishlist)
├── .env                       # Environment variables
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| **Primary Background** | `#000000` (Black) |
| **Accent Color** | `#ccff00` (Lime Green) |
| **Text** | White / Gray-900 |
| **Typography** | Inter, bold uppercase with tight tracking |
| **Border Radius** | Mostly squared (`rounded-none`) for bold look |
| **Animations** | Fade-in-up, slide-up, scale on hover |

---

## 🔌 API Integration

### DummyJSON (Product Data)
- `GET /products` — List products
- `GET /products/:id` — Product details
- `GET /products/categories` — Category list
- `GET /products/category/:slug` — Products by category
- `GET /products/search?q=...` — Search products
- `POST /auth/login` — User authentication

### NVIDIA AI (Optional)
- `POST /api/ai/recommend` — Proxy to NVIDIA's Mistral Large 3 API for AI-powered chat and search
- **Architecture**: System prompt built on backend, never exposed to frontend
- **Structured Output**: AI always returns JSON for deterministic frontend behavior

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational/demonstration purposes.

---

<div align="center">
  <p>Built with ❤️ using Next.js, TypeScript, and AI</p>
  <p>
    <a href="https://nextjs.org" target="_blank">Next.js</a> •
    <a href="https://tailwindcss.com" target="_blank">Tailwind CSS</a> •
    <a href="https://zustand-demo.pmnd.rs" target="_blank">Zustand</a> •
    <a href="https://tanstack.com/query" target="_blank">React Query</a>
  </p>
</div>