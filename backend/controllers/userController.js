const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

/**
 * User Controller for Admin Portal
 * Handles direct database operations for user management
 */

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// Get user statistics
async function getUserStats(req, res) {
  try {
    const totalUsers = await prisma.user.count();
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const doctors = await prisma.user.count({ where: { role: 'DOCTOR' } });
    const patients = await prisma.user.count({ where: { role: 'PATIENT' } });

    res.json({
      total: totalUsers,
      admins,
      doctors,
      patients
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

// Create new user
async function createUser(req, res) {
  try {
    const { username, email, password, role } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'PATIENT',
        isActive: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
}

// Update user
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
}

// Delete user
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

module.exports = {
  getAllUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
