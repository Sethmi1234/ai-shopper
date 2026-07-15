# 📝 Changes & Architecture Decisions

This document summarizes the key changes made to the original AI Shop project, explaining the architecture decisions, frontend-backend integration, and bug fixes.

---

## 1. Architecture: Frontend → Backend Proxy

### What Changed
The frontend (`ai-shopper-frontend`) now proxies all `/api/*` requests to the Express backend (`ai-shopper-backend`) via Next.js rewrites in `next.config.mjs`:

```js
// next.config.mjs
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${BACKEND_URL}/:path*`,
    },
  ];
}
```

### Why
- **Eliminates CORS issues** — The browser sees all requests as same-origin
- **Simplifies deployment** — Both frontend and backend can be served from the same domain
- **Security** — API keys (NVIDIA) stay server-side, never exposed to the client

### How It Works
1. Frontend calls `/api/ai/recommend` (relative URL)
2. Next.js rewrites it to `http://localhost:5000/ai/recommend`
3. Backend processes the request and returns the response

---

## 2. AI Endpoints: Auth Removed for Public Features

### What Changed
Removed the `protect` (JWT auth) middleware from the `/ai/recommend` route in `ai-shopper-backend/src/routes/ai.routes.ts`.

### Why
The "Ask AI" search bar on the homepage is a **public feature** — users shouldn't need to log in to search for products. The endpoint only uses:
- Server-side NVIDIA API keys (never exposed)
- Public DummyJSON product data

### Routes Affected
| Route | Before | After |
|-------|--------|-------|
| `POST /ai/classify` | No auth | No auth (unchanged) |
| `POST /ai/recommend` | **Auth required** | **No auth** |
| `POST /ai/smart-recommend` | No auth | No auth (unchanged) |
| `POST /ai/filter-products` | Auth required | Auth required (unchanged) |

---

## 3. "Ask AI" vs Chatbot: Behavior Swap

### What Changed
- **"Ask AI"** (homepage search, uses `/ai/recommend`) now gives **direct answers only** — never asks follow-up questions
- **Chatbot** (floating chat, uses `/ai/smart-recommend`) still asks **clarifying questions** when the request is ambiguous

### Implementation
**`ai-shopper-backend/src/controllers/ai.controller.ts`** — The system prompt for `/ai/recommend` was updated to:
- NEVER set `needsMoreInformation` to true
- Always extract what filters it can and attempt a product search
- Make best-guess decisions on vague requests

**`ai-shopper-backend/src/services/ai.service.ts`** — The `smartRecommend` function (used by chatbot) was left unchanged, preserving its clarification flow.

---

## 4. Zustand Stores: Local-First Cart & Wishlist

### What Changed
The `ChatBot.tsx` component was switched from **React Query hooks** (which required JWT auth) to **Zustand stores** (`useWishlist` and `useCart`).

### Why
- The chatbot is a public feature — users may not be logged in
- Zustand stores persist to **localStorage** by default, so cart/wishlist items survive page refreshes
- If the user IS logged in, the stores **also sync to the backend** (see `useWishlist.ts` and `useCart.ts` — they check for an access token and call the API)

### Files Changed
- `ai-shopper-frontend/src/components/ai/ChatBot.tsx` — Replaced React Query hooks with Zustand stores

### How It Works
1. User clicks "Add to Cart" or "Add to Wishlist" in the chatbot
2. Zustand store updates **local state immediately** (optimistic update)
3. If user has a JWT token, the store **also sends the request to the backend**
4. If no token, the item is saved to localStorage only

---

## 5. JSON Parsing: Markdown Code Fence Stripping

### What Changed
Added markdown code fence stripping to `callNvidiaAI()` in `ai-shopper-backend/src/services/ai.service.ts`.

### Why
The NVIDIA Mistral Large 3 model sometimes wraps JSON responses in markdown code blocks (```json ... ```). The JSON parser would fail on these, causing the AI response to be treated as plain text instead of structured data.

### Before
```typescript
const parsed = JSON.parse(content); // Fails on ```json ... ```
```

### After
```typescript
let cleaned = content.trim();
const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
if (jsonMatch) {
  cleaned = jsonMatch[1].trim();
}
const parsed = JSON.parse(cleaned); // Works!
```

---

## 6. Category Navigation: Clickable Cards

### What Changed
The "Explore Categories" section on the homepage (`CategoryGrid.tsx`) now wraps each category card in a `<Link>` tag, navigating to `/dashboard/category/{slug}`.

### Why
Users should be able to click a category image and see all products in that category.

### Files Changed
- `ai-shopper-frontend/src/components/home/CategoryGrid.tsx` — Added `slug` property to all category objects, wrapped cards in `<Link>`

---

## 7. Category Images: Reliable Unsplash URLs

### What Changed
Replaced local `/cat_*.png` images with reliable Unsplash CDN URLs in both:
- `CategoryGrid.tsx` (homepage)
- `/dashboard/category/page.tsx` (category listing page)

### Why
The local PNG files may not exist or may not load properly. Unsplash URLs are guaranteed to work and are already configured in `next.config.mjs` remotePatterns.

---

## 8. Bug Fix: 401 "Access Denied" on Ask AI

### Root Cause
The frontend's `AISearch.tsx` called `/api/ai/recommend` without sending a JWT token, but the backend route required authentication via the `protect` middleware.

### Fix
Removed the `protect` middleware from the `/ai/recommend` route (see #2 above).

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `ai-shopper-backend/src/routes/ai.routes.ts` | Removed `protect` from `/ai/recommend` |
| `ai-shopper-backend/src/controllers/ai.controller.ts` | Updated system prompt for direct answers; logic to always search |
| `ai-shopper-backend/src/services/ai.service.ts` | Added markdown code fence stripping in JSON parser |
| `ai-shopper-frontend/src/components/ai/ChatBot.tsx` | Switched from React Query to Zustand stores |
| `ai-shopper-frontend/src/components/home/CategoryGrid.tsx` | Added navigation links, fixed images |
| `ai-shopper-frontend/src/app/dashboard/category/page.tsx` | Added missing categories, fixed images |
| `ai-shopper/README.md` | Updated with full documentation |
| `ai-shopper/CHANGES.md` | This file |