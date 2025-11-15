const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log('\n=== Admin Users in Database ===\n');
    if (admins.length === 0) {
      console.log('❌ No admin users found!');
    } else {
      admins.forEach(admin => {
        console.log(`✅ Email: ${admin.email}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
