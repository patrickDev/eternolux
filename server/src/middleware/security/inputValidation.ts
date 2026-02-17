// middleware/security/inputValidation.ts
import { Request, Response, NextFunction } from "express";

/**
 * SQL Injection patterns
 */
const SQL_PATTERNS = [
  /(\bor\b|\band\b)\s*\d*\s*=\s*\d*/i,
  /union.*select/i,
  /insert\s+into/i,
  /delete\s+from/i,
  /drop\s+(table|database)/i,
  /update\s+.*\s+set/i,
  /exec(\s|\()/i,
  /;.*--/,
  /\/\*.*\*\//,
  /'.*or.*'/i
];

/**
 * XSS patterns
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi
];

/**
 * Check for SQL injection
 */
export function preventSqlInjection(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return SQL_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Check for XSS
 */
export function preventXss(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Sanitize input
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validate required fields middleware
 */
export function validateRequired(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];
    
    fields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missing.push(field);
      }
    });
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        code: 'MISSING_FIELDS',
        missing
      });
    }
    
    next();
  };
}

/**
 * Validate email middleware
 */
export function validateEmail(fieldName: string = 'email') {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body[fieldName];
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} is required`,
        code: 'MISSING_EMAIL'
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }
    
    next();
  };
}

/**
 * Validate password middleware
 */
export function validatePassword(fieldName: string = 'password') {
  return (req: Request, res: Response, next: NextFunction) => {
    const password = req.body[fieldName];
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} is required`,
        code: 'MISSING_PASSWORD'
      });
    }
    
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Must contain lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Must contain number');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        code: 'WEAK_PASSWORD',
        errors
      });
    }
    
    next();
  };
}

/**
 * Validate phone middleware
 */
export function validatePhone(fieldName: string = 'phone') {
  return (req: Request, res: Response, next: NextFunction) => {
    const phone = req.body[fieldName];
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} is required`,
        code: 'MISSING_PHONE'
      });
    }
    
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone format',
        code: 'INVALID_PHONE'
      });
    }
    
    next();
  };
}