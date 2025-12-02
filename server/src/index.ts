import express from 'express';
import dotenv from 'dotenv';
import shopRouter from './routes/shopRoutes';
import searchRouter from './routes/searchRoutes';

console.log("➡ Loading .env file...");
dotenv.config();

const PORT = Number(process.env.PORT) || 80;

console.log("➡ Initializing app...");
const app = express();

app.use(express.json());

// ⬅ REGISTER YOUR ROUTES HERE
app.use("/", shopRouter);
app.use("/products", searchRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

console.log("➡ Attempting to start server...");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
