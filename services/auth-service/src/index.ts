import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, UserRole, supabaseAuthRepo, UserDbRecord } from '@michaforge/shared-contracts';

const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'michaforge-jwt-super-secret-key-2026';

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
  res.json({ status: 'ok', service: 'auth-service', storage: 'supabase', timestamp: new Date().toISOString() });
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' },
      });
    }

    const user = await supabaseAuthRepo.findUserByEmail(email);
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

    await supabaseAuthRepo.updateLastLogin(user.id);
    const now = new Date().toISOString();

    const safeUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: now,
      lastLoginAt: now,
    };

    const { accessToken, refreshToken } = generateTokens(safeUser);
    await supabaseAuthRepo.saveRefreshToken(refreshToken, user.id);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: safeUser,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: err.message },
    });
  }
});

app.post('/api/v1/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required' },
      });
    }

    const exists = await supabaseAuthRepo.hasRefreshToken(refreshToken);
    if (!exists) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Refresh token has been revoked' },
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    const user = await supabaseAuthRepo.findUserById(decoded.sub);
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

app.get('/api/v1/auth/me', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const user = await supabaseAuthRepo.findUserById(userId);
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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: err.message },
    });
  }
});

app.post('/api/v1/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await supabaseAuthRepo.deleteRefreshToken(refreshToken);
    }
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err: any) {
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  }
});

// Admin Users Endpoints
app.get('/api/v1/admin/users', authenticate, async (req, res) => {
  try {
    const safeUsers = await supabaseAuthRepo.listUsers();
    res.json({ success: true, data: safeUsers });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.post('/api/v1/admin/users', authenticate, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'All fields are required' },
      });
    }
    const existing = await supabaseAuthRepo.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_USER', message: 'User email already exists' },
      });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');

    const newUser: UserDbRecord = {
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

    const safeUser = await supabaseAuthRepo.createUser(newUser);
    res.status(201).json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: err.message },
    });
  }
});

app.listen(PORT, () => {
  console.log(`[auth-service] Running on port ${PORT} (Supabase connected)`);
});

export default app;
