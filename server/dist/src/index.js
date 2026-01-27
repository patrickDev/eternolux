"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const shopRoutes_1 = __importDefault(require("./routes/shopRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
console.log("➡ Loading .env file...");
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 3001;
console.log("➡ Initializing app...");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// ⬅ REGISTER YOUR ROUTES HERE
app.use("/", shopRoutes_1.default);
app.use("/products", searchRoutes_1.default);
app.get("/", (req, res) => {
    res.send("API is running");
});
console.log("➡ Attempting to start server...");
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
