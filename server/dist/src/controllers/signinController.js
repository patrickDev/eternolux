"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'DADEM-FOODS';
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(400).json({ error: 'Invalid password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                userId: user.userId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
            }
        });
    }
    catch (error) {
        console.error('Sign-in error:', error);
        res.status(500).json({ error: 'Server error during sign-in' });
    }
});
exports.signin = signin;
