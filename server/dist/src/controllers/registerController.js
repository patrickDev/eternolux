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
exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, phone } = req.body;
    if (!firstName || !lastName || !email || !password || !phone) {
        res.status(400).send('All fields are required');
        return;
    }
    try {
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).send('Email already in use');
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield prisma.user.create({
            data: {
                userId: (0, uuid_1.v4)(),
                firstName,
                lastName,
                email,
                passwordHash: hashedPassword,
                phone
            },
        });
        res.status(201).send('User registered 7889');
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal server error');
    }
});
exports.register = register;
