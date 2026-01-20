/**
 * Password Policy for VisionDrive Smart Kitchen
 * 
 * 🔐 Security: Enforces strong password requirements (VD-2026-005)
 * 
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*(),.?":{}|<>)
 * - No common passwords
 * - No sequential characters (123, abc)
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number; // 0-100
}

// Common passwords to block (top 100 most common)
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456', '12345678', '123456789',
  'qwerty', 'abc123', 'monkey', 'master', 'dragon', 'letmein', 'login',
  'welcome', 'admin', 'administrator', 'root', 'toor', 'pass', 'test',
  'guest', 'master', 'changeme', 'passw0rd', 'password1!', 'qwerty123',
  'iloveyou', 'princess', 'sunshine', 'football', 'baseball', 'soccer',
  'hockey', 'batman', 'trustno1', 'hunter', 'ranger', 'harley', 'thomas',
  'charlie', 'robert', 'daniel', 'michael', 'jessica', 'jennifer', 'michelle',
]);

// Sequential patterns to detect
const SEQUENTIAL_PATTERNS = [
  '012', '123', '234', '345', '456', '567', '678', '789', '890',
  'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk',
  'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst',
  'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz',
  'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop', // keyboard rows
  'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl',
  'zxc', 'xcv', 'cvb', 'vbn', 'bnm',
];

/**
 * Validate password against security policy
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Check minimum length (12 characters)
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else {
    score += 20;
    // Bonus for longer passwords
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 5;
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  } else {
    score += 15;
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  } else {
    score += 15;
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  } else {
    score += 15;
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\;'\/`~]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  } else {
    score += 20;
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
    score = Math.max(0, score - 30);
  }

  // Check for sequential patterns
  const lowerPassword = password.toLowerCase();
  for (const pattern of SEQUENTIAL_PATTERNS) {
    if (lowerPassword.includes(pattern)) {
      errors.push('Password contains sequential characters (e.g., 123, abc). Please avoid predictable patterns');
      score = Math.max(0, score - 15);
      break;
    }
  }

  // Check for repeated characters (e.g., aaa, 111)
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password contains repeated characters. Please avoid patterns like "aaa" or "111"');
    score = Math.max(0, score - 10);
  }

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 40) {
    strength = 'weak';
  } else if (score < 60) {
    strength = 'fair';
  } else if (score < 80) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(100, score),
  };
}

/**
 * Get password requirements as human-readable list
 */
export function getPasswordRequirements(): string[] {
  return [
    'At least 12 characters long',
    'At least one uppercase letter (A-Z)',
    'At least one lowercase letter (a-z)',
    'At least one number (0-9)',
    'At least one special character (!@#$%^&*)',
    'No common passwords (e.g., "password123")',
    'No sequential patterns (e.g., "123", "abc")',
  ];
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each required character type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
