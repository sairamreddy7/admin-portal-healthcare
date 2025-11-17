const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');

    const email = process.env.ADMIN_EMAIL || 'admin@healthcare.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        email: email
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        username: email.split('@')[0],
        email: email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 User ID:', admin.id);
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  createAdminUser()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { createAdminUser };
