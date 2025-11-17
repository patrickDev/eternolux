import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, phone } = req.body;

  if (!firstName || !lastName || !email || !password || !phone) {
    res.status(400).send('All fields are required');
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).send('Email already in use');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        userId: uuidv4(),
        firstName,
        lastName,
        email, 
        passwordHash: hashedPassword,
        phone
      },
    });

    res.status(201).send('User registered 7889');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal server error');
  }
};
