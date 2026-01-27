import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
) {
  return bcrypt.compare(plainPassword, passwordHash);
}
