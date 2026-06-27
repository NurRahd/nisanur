require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await prisma.admin.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: { username: process.env.ADMIN_USERNAME || 'admin', password: hashedPassword },
  });
  console.log('✓ Admin created');

  // Profile
  const profileData = [
    { key: 'hero_greeting', value: "Hello, I'm Nisa Nur Rahmadani" },
    { key: 'hero_rotating_words', value: 'Nisa, a Fullstack Dev, an AI Learner, a UI Crafter, a Problem Solver' },
    { key: 'hero_subtitle', value: "I build responsive websites, scalable web applications, and intuitive digital experiences. Passionate about continuous learning, clean code, and creating technology that solves real-world problems." },
    { key: 'about_subtitle', value: 'Get To Know Me' },
    { key: 'about_description', value: 'I am an informatics student who loves turning ideas into useful digital solutions. I enjoy learning new technologies and building products that can solve real problems.' },
    { key: 'navbar_brand', value: 'Rahd.' },
    { key: 'footer_copy', value: '© 2026 Rahd. All rights reserved.' },
  ];
  for (const item of profileData) {
    await prisma.profile.upsert({ where: { key: item.key }, update: { value: item.value }, create: item });
  }
  console.log('✓ Profile seeded');

  // Social links
  await prisma.socialLink.deleteMany();
  await prisma.socialLink.createMany({
    data: [
      { platform: 'email', label: 'Email', value: 'rahn.capt@gmail.com', href: 'mailto:rahn.capt@gmail.com', iconType: 'lucide', iconName: 'Mail', order: 0 },
      { platform: 'instagram', label: 'Instagram', value: '@nisanurhmadani_', href: 'https://www.instagram.com/nisanurhmadani_/', iconType: 'image', iconImage: 'instagramblue.png', order: 1 },
      { platform: 'linkedin', label: 'LinkedIn', value: 'Nisa Nurrahmadani', href: 'https://www.linkedin.com/in/nisanurrahmadani/', iconType: 'image', iconImage: 'linked.png', order: 2 },
      { platform: 'github', label: 'GitHub', value: 'NurRahd', href: 'https://github.com/NurRahd', iconType: 'image', iconImage: 'githubblue.png', order: 3 },
      { platform: 'youtube', label: 'YouTube', value: '@Rahd_rn', href: 'https://www.youtube.com/@Rahd_rn', iconType: 'image', iconImage: 'Blue-YouTube.png', order: 4 },
      { platform: 'tiktok', label: 'TikTok', value: '@rahd_rn', href: 'https://www.tiktok.com/@rahd_rn', iconType: 'image', iconImage: 'Tik-Tok-Logo-49.png', order: 5 },
    ],
  });
  console.log('✓ Social links seeded');

  // Skill groups
  await prisma.skill.deleteMany();
  await prisma.skillGroup.deleteMany();
  const skillGroupsData = [
    { title: 'Frontend', order: 0, skills: [{ name: 'React', iconType: 'lucide', iconName: 'Code2', order: 0 }, { name: 'Next.js', iconType: 'lucide', iconName: 'Box', order: 1 }, { name: 'HTML', iconType: 'lucide', iconName: 'FileJson', order: 2 }, { name: 'CSS', iconType: 'lucide', iconName: 'PenTool', order: 3 }, { name: 'Tailwind CSS', iconType: 'lucide', iconName: 'Wrench', order: 4 }] },
    { title: 'Backend', order: 1, skills: [{ name: 'Node.js', iconType: 'lucide', iconName: 'Server', order: 0 }, { name: 'Express.js', iconType: 'lucide', iconName: 'Terminal', order: 1 }, { name: 'REST API', iconType: 'lucide', iconName: 'FileJson', order: 2 }] },
    { title: 'Database', order: 2, skills: [{ name: 'MySQL', iconType: 'lucide', iconName: 'Database', order: 0 }, { name: 'PostgreSQL', iconType: 'lucide', iconName: 'Database', order: 1 }, { name: 'Firebase', iconType: 'lucide', iconName: 'Flame', order: 2 }] },
    { title: 'Tools & Others', order: 3, skills: [{ name: 'Git', iconType: 'lucide', iconName: 'GitBranch', order: 0 }, { name: 'Docker', iconType: 'lucide', iconName: 'Box', order: 1 }, { name: 'Figma', iconType: 'lucide', iconName: 'PenTool', order: 2 }, { name: 'Linux', iconType: 'lucide', iconName: 'Terminal', order: 3 }, { name: 'VS Code', iconType: 'lucide', iconName: 'Code2', order: 4 }] },
  ];
  for (const group of skillGroupsData) {
    await prisma.skillGroup.create({ data: { title: group.title, order: group.order, skills: { create: group.skills } } });
  }
  console.log('✓ Skills seeded');

  // Education
  await prisma.education.deleteMany();
  await prisma.education.createMany({
    data: [
      { school: 'Universitas Maritim Raja Ali Haji', degree: 'Bachelor of Informatics', period: '2023 - Present', score: 'GPA: 3.65 / 4.00', logoImage: 'logo_umrah.jpeg', order: 0 },
      { school: 'MAN Karimun', degree: 'Natural Sciences Program', period: '2020 - 2023', score: 'Final Score: 90 / 100', logoImage: 'logo_MAN.jpg', order: 1 },
    ],
  });
  console.log('✓ Education seeded');

  console.log('\n✅ Database seeded! Login: admin / admin123');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
