import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import orderRoutes from "./routes/order.routes";
import aiRoutes from "./routes/ai.routes";


const app = express();


app.use(
  cors({
    origin:"http://localhost:3000",
    credentials:true
  })
);


app.use(express.json());

app.use(cookieParser());



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

export default app;
