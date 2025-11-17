"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
//import { Pool } from 'pg';
//const pool = new Pool({ connectionString: process.env.DATABASE_URL });
/** ROUTE IMPORTS */
const shopRoutes_1 = __importDefault(require("../routes/shopRoutes"));
const searchRoutes_1 = __importDefault(require("../routes/searchRoutes"));
const registerRoutes_1 = __importDefault(require("../routes/registerRoutes"));
const signinRoutes_1 = __importDefault(require("../routes/signinRoutes"));
/** CONFIGURATION */
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use((0, morgan_1.default)('common'));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
/** ROUTES */
app.use('/shop', shopRoutes_1.default); //http://localhost:8080/shop
app.use('/', searchRoutes_1.default); //http://localhost:8080/products
app.use('/', registerRoutes_1.default); //http://localhost:8080/register
app.use('/', signinRoutes_1.default); //http://localhost:8080/signin
app.get('/', (req, res) => {
    res.send('Welcome to the E-commerce API');
});
/** ERROR HANDLING */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
/** START SERVER */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
