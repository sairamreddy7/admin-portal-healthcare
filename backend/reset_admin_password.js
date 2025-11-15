const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function resetPassword() {
  try {
    const email = 'admin@healthcare.com';
    const newPassword = 'Admin@123';

    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update the admin user
    const updated = await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword }
    });

    console.log('\n✅ Admin password reset successfully!');
    console.log('Email:', email);
    console.log('Password:', newPassword);
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
