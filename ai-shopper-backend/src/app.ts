import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";


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

export default app;
