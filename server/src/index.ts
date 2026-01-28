// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

// middleware
//app.use(cors());
//app.use(express.json());


app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());


// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});


const port = Number(process.env.SERVER_PORT || 4000);
app.listen(port, "0.0.0.0");


