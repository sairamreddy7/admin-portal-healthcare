const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with ADMIN role
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: 'ADMIN'
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.role, user.email);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

async function createAdmin(req, res) {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate username from email if not provided
    const adminUsername = username || email.toLowerCase().split('@')[0];

    // Check if username is taken
    const existingUsername = await prisma.user.findUnique({
      where: { username: adminUsername }
    });

    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists. Please provide a unique username.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username: adminUsername,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
}

async function verifyToken(req, res) {
  try {
    // The authenticateAdmin middleware already verified the token
    // and added user info to req.user
    res.json({
      valid: true,
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
}

module.exports = { login, createAdmin, verifyToken };
