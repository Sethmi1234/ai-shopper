# SmartCart — Microservices Architecture

SmartCart is a modern AI-powered e-commerce platform built on a microservices architecture.

## Services

| Service | Port | Responsibilities |
|---|---|---|
| auth-service | 5001 | Registration, Login, JWT tokens |
| product-service | 5002 | Products, Categories, Cart, Wishlist, Orders |
| ai-service | 5003 | AI Chat, Recommendations, NVIDIA Integration |
| gateway (Nginx) | 5000 | Reverse proxy, CORS, WebSocket routing |

## Routes via Gateway

| Route | Forwarded To |
|---|---|
| /auth/* | auth-service:5001 |
| /products/* | product-service:5002 |
| /categories/* | product-service:5002 |
| /cart/* | product-service:5002 |
| /wishlist/* | product-service:5002 |
| /orders/* | product-service:5002 |
| /ai/* | ai-service:5003 |
| /chat/* | ai-service:5003 |
| /socket.io/* | ai-service:5003 (WebSocket) |

## Getting Started

Run all services with Docker Compose:

    docker compose up --build -d

Run services individually (development):

    cd auth-service && npm install && npm run dev
    cd product-service && npm install && npm run dev
    cd ai-service && npm install && npm run dev
