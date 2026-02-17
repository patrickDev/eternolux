// middleware/security/password.ts
import bcrypt from "bcryptjs";

/**
 * Hash a password
 * Uses bcryptjs (Cloudflare Workers compatible)
 */
export async function hashPassword(password: string, rounds: number = 10): Promise<string> {
  return await bcrypt.hash(password, rounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Check if password needs rehashing
 */
export function needsRehash(hash: string, rounds: number = 10): boolean {
  try {
    const hashRounds = bcrypt.getRounds(hash);
    return hashRounds < rounds;
  } catch {
    return true;
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  let score = 0;

  // Length
  if (password.length < 8) {
    errors.push('Must be at least 8 characters');
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  // Uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain lowercase letter');
  } else {
    score += 1;
  }

  // Numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain number');
  } else {
    score += 1;
  }

  // Special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  }

  // Common passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
    score = 0;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 3) {
    strength = 'weak';
  } else if (score <= 5) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    valid: errors.length === 0,
    strength,
    errors
  };
}

/**
 * Generate random password
 */
export function generateRandomPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';
  
  const all = uppercase + lowercase + numbers + special;
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}