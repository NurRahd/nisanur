import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('🌱 Seeding database with Supabase Client...');

  // 1. Admin
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  const username = process.env.ADMIN_USERNAME || 'admin';
  const { data: existingAdmin } = await supabase.from('Admin').select().eq('username', username).single();

  if (existingAdmin) {
    await supabase.from('Admin').update({ password: hashedPassword }).eq('id', existingAdmin.id);
  } else {
    await supabase.from('Admin').insert({ username, password: hashedPassword, createdAt: new Date().toISOString() });
  }
  console.log('✓ Admin created');

  // 2. Profile
  const profileData = [
    { key: 'hero_greeting', value: "Hello, I'm Nisa Nur Rahmadani" },
    { key: 'hero_rotating_words', value: 'Nisa, a Fullstack Dev, an AI Learner, a UI Crafter, a Problem Solver' },
    { key: 'hero_subtitle', value: "I build responsive websites, scalable web applications, and intuitive digital experiences." },
    { key: 'about_subtitle', value: 'Get To Know Me' },
    { key: 'about_description', value: 'I am an informatics student who loves turning ideas into useful digital solutions.' },
    { key: 'navbar_brand', value: 'Rahd.' },
    { key: 'footer_copy', value: '© 2026 Rahd. All rights reserved.' },
  ];
  for (const item of profileData) {
    await supabase.from('Profile').upsert({ ...item, updatedAt: new Date().toISOString() }, { onConflict: 'key' });
  }
  console.log('✓ Profile seeded');

  // 3. Social Links
  await supabase.from('SocialLink').delete().neq('id', 0); // Delete all
  await supabase.from('SocialLink').insert([
    { platform: 'email', label: 'Email', value: 'rahn.capt@gmail.com', href: 'mailto:rahn.capt@gmail.com', iconType: 'lucide', iconName: 'Mail', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { platform: 'instagram', label: 'Instagram', value: '@nisanurhmadani_', href: 'https://www.instagram.com/nisanurhmadani_/', iconType: 'image', iconImage: 'instagramblue.png', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { platform: 'linkedin', label: 'LinkedIn', value: 'Nisa Nurrahmadani', href: 'https://www.linkedin.com/in/nisanurrahmadani/', iconType: 'image', iconImage: 'linked.png', order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { platform: 'github', label: 'GitHub', value: 'NurRahd', href: 'https://github.com/NurRahd', iconType: 'image', iconImage: 'githubblue.png', order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { platform: 'youtube', label: 'YouTube', value: '@Rahd_rn', href: 'https://www.youtube.com/@Rahd_rn', iconType: 'image', iconImage: 'Blue-YouTube.png', order: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { platform: 'tiktok', label: 'TikTok', value: '@rahd_rn', href: 'https://www.tiktok.com/@rahd_rn', iconType: 'image', iconImage: 'Tik-Tok-Logo-49.png', order: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]);
  console.log('✓ Social links seeded');

  // 4. Skills
  await supabase.from('Skill').delete().neq('id', 0);
  await supabase.from('SkillGroup').delete().neq('id', 0);

  const groups = [
    { title: 'Frontend', order: 0, skills: [{ name: 'React', iconType: 'lucide', iconName: 'Code2', order: 0 }, { name: 'Next.js', iconType: 'lucide', iconName: 'Box', order: 1 }, { name: 'HTML', iconType: 'lucide', iconName: 'FileJson', order: 2 }, { name: 'CSS', iconType: 'lucide', iconName: 'PenTool', order: 3 }, { name: 'Tailwind CSS', iconType: 'lucide', iconName: 'Wrench', order: 4 }] },
    { title: 'Backend', order: 1, skills: [{ name: 'Node.js', iconType: 'lucide', iconName: 'Server', order: 0 }, { name: 'Express.js', iconType: 'lucide', iconName: 'Terminal', order: 1 }, { name: 'REST API', iconType: 'lucide', iconName: 'FileJson', order: 2 }] },
    { title: 'Database', order: 2, skills: [{ name: 'MySQL', iconType: 'lucide', iconName: 'Database', order: 0 }, { name: 'PostgreSQL', iconType: 'lucide', iconName: 'Database', order: 1 }, { name: 'Firebase', iconType: 'lucide', iconName: 'Flame', order: 2 }] },
    { title: 'Tools & Others', order: 3, skills: [{ name: 'Git', iconType: 'lucide', iconName: 'GitBranch', order: 0 }, { name: 'Docker', iconType: 'lucide', iconName: 'Box', order: 1 }, { name: 'Figma', iconType: 'lucide', iconName: 'PenTool', order: 2 }, { name: 'Linux', iconType: 'lucide', iconName: 'Terminal', order: 3 }, { name: 'VS Code', iconType: 'lucide', iconName: 'Code2', order: 4 }] },
  ];

  for (const g of groups) {
    const { data: group } = await supabase.from('SkillGroup').insert({ title: g.title, order: g.order }).select().single();
    if (group) {
      const skillsToInsert = g.skills.map(s => ({ ...s, skillGroupId: group.id }));
      await supabase.from('Skill').insert(skillsToInsert);
    }
  }
  console.log('✓ Skills seeded');

  // 5. Education
  await supabase.from('Education').delete().neq('id', 0);
  await supabase.from('Education').insert([
    { school: 'Universitas Maritim Raja Ali Haji', degree: 'Bachelor of Informatics', period: '2023 - Present', score: 'GPA: 3.65 / 4.00', logoImage: 'logo_umrah.jpeg', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { school: 'MAN Karimun', degree: 'Natural Sciences Program', period: '2020 - 2023', score: 'Final Score: 90 / 100', logoImage: 'logo_MAN.jpg', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]);
  console.log('✓ Education seeded');

  console.log('\n✅ Done! Login: admin / admin123');
}

main().catch((e) => { console.error(e); process.exit(1); });
