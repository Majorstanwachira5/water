import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { User, UserRole, AuthTokens } from '@michaforge/shared-contracts';

const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'michaforge-jwt-super-secret-key-2026';
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'auth_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface UserRecord extends User {
  passwordHash: string;
  salt: string;
}

interface AuthDatabase {
  users: UserRecord[];
  refreshTokens: string[];
}

function loadDb(): AuthDatabase {
  if (!fs.existsSync(DB_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync('Admin@Michaforge2026!', salt, 1000, 64, 'sha512')
      .toString('hex');
    const defaultAdmin: UserRecord = {
      id: 'usr_admin_01',
      email: 'admin@michaforge.co.ke',
      name: 'Michaforge Administrator',
      role: 'Super Admin',
      isActive: true,
      passwordHash: hash,
      salt: salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const initialDb: AuthDatabase = {
      users: [defaultAdmin],
      refreshTokens: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(data: AuthDatabase) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return checkHash === hash;
}

function generateTokens(user: User): { accessToken: string; refreshToken: string } {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  const refreshToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

const app = express();
app.use(cors());
app.use(express.json());

// Correlation ID & Logger
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.setHeader('x-correlation-id', correlationId);
  next();
});

// Auth Middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization token' },
    });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is expired or invalid' },
    });
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' },
    });
  }

  const db = loadDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  user.lastLoginAt = new Date().toISOString();
  saveDb(db);

  const safeUser: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };

  const { accessToken, refreshToken } = generateTokens(safeUser);
  db.refreshTokens.push(refreshToken);
  saveDb(db);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: safeUser,
    },
  });
});

app.post('/api/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required' },
    });
  }
  const db = loadDb();
  if (!db.refreshTokens.includes(refreshToken)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Refresh token has been revoked' },
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    const user = db.users.find((u) => u.id === decoded.sub);
    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'User no longer active' },
      });
    }

    const safeUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    const tokens = generateTokens(safeUser);
    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Refresh token invalid or expired' },
    });
  }
});

app.get('/api/v1/auth/me', authenticate, (req, res) => {
  const userId = (req as any).user.sub;
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found' },
    });
  }
  const safeUser: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
  res.json({ success: true, data: safeUser });
});

app.post('/api/v1/auth/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const db = loadDb();
    db.refreshTokens = db.refreshTokens.filter((t) => t !== refreshToken);
    saveDb(db);
  }
  res.json({ success: true, data: { message: 'Logged out successfully' } });
});

// Admin Users Endpoints
app.get('/api/v1/admin/users', authenticate, (req, res) => {
  const db = loadDb();
  const safeUsers: User[] = db.users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLoginAt: u.lastLoginAt,
  }));
  res.json({ success: true, data: safeUsers });
});

app.post('/api/v1/admin/users', authenticate, (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'All fields are required' },
    });
  }
  const db = loadDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_USER', message: 'User email already exists' },
    });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');

  const newUser: UserRecord = {
    id: `usr_${crypto.randomUUID().slice(0, 8)}`,
    email,
    name,
    role: role as UserRole,
    isActive: true,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  const safeUser: User = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    isActive: newUser.isActive,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };
  res.status(201).json({ success: true, data: safeUser });
});

app.listen(PORT, () => {
  loadDb(); // Ensure db initialized
  console.log(`[auth-service] Running on port ${PORT}`);
});

export default app;
