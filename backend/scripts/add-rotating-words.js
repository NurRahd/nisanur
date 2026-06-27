require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.profile.upsert({
    where: { key: 'hero_rotating_words' },
    update: {},
    create: {
      key: 'hero_rotating_words',
      value: 'Nisa, a Fullstack Dev, an AI Learner, a UI Crafter, a Problem Solver',
    },
  });
  // Remove old hero_title if exists
  await prisma.profile.deleteMany({ where: { key: 'hero_title' } });
  console.log('Done');
}

main().catch(console.error).finally(() => prisma.$disconnect());
