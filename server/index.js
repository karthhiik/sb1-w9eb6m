import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// Security configurations
const JWT_SECRET = crypto.randomBytes(64).toString('hex');
const SALT_ROUNDS = 12;
const MAX_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// In-memory storage
const users = new Map();
const loginAttempts = new Map();
const blacklistedTokens = new Set();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ error: 'Token has been invalidated' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Password validation
const isPasswordStrong = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
      });
    }

    if (users.has(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    users.set(email, {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if account is locked
    const attempts = loginAttempts.get(email) || { count: 0, lockUntil: null };
    if (attempts.lockUntil && attempts.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((attempts.lockUntil - Date.now()) / 1000 / 60);
      return res.status(403).json({
        error: `Account is locked. Try again in ${remainingTime} minutes`
      });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      attempts.count += 1;
      if (attempts.count >= MAX_ATTEMPTS) {
        attempts.lockUntil = Date.now() + LOCK_TIME;
      }
      loginAttempts.set(email, attempts);

      const remainingAttempts = MAX_ATTEMPTS - attempts.count;
      return res.status(400).json({
        error: `Invalid password. ${remainingAttempts} attempts remaining before lock`
      });
    }

    // Reset attempts on successful login
    loginAttempts.delete(email);

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { email, firstName: user.firstName, lastName: user.lastName } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/logout', authenticateToken, (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    blacklistedTokens.add(token);
    res.json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});