import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import orderRoutes from "./routes/order.routes";
import aiRoutes from "./routes/ai.routes";
import chatRoutes from "./routes/chat.routes";
import productRoutes from "./routes/product.routes";

import { decryptMiddleware } from "./middleware/decrypt.middleware";
import { encryptMiddleware } from "./middleware/encrypt.middleware";

const app = express();

// Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Encryption middlewares
app.use(encryptMiddleware);
app.use(decryptMiddleware);


app.get("/",(req,res)=>{

    res.json({
        message:"AI Shopper Backend Running"
    });

});



app.use(
    "/auth",
    authRoutes
);

app.use(
    "/cart",
    cartRoutes
);

app.use(
"/wishlist",
wishlistRoutes
);

app.use(
"/orders",
orderRoutes
);

app.use(
"/ai",
aiRoutes
);

app.use(
"/chat",
chatRoutes
);

app.use(
"/products",
productRoutes
);

import { errorHandler } from "./middleware/errorHandler";

app.use(errorHandler);

export default app;
