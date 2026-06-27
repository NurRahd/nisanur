const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await prisma.admin.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: hashedPassword,
    },
  });
  console.log('✓ Admin user created');

  // Profile settings
  const profileData = [
    { key: 'hero_greeting', value: "Hello, I'm Ryn" },
    { key: 'hero_rotating_words', value: 'Nisa, a Fullstack Dev, an AI Learner, a UI Crafter, a Problem Solver' },
    { key: 'hero_subtitle', value: "I'm an Informatics student passionate about building modern web and mobile applications, machine learning, and creating meaningful digital experiences." },
    { key: 'about_subtitle', value: 'Get To Know Me' },
    { key: 'about_description', value: 'I am an informatics student who loves turning ideas into useful digital solutions. I enjoy learning new technologies and building products that can solve real problems.' },
    { key: 'navbar_brand', value: 'Rahd.' },
    { key: 'footer_copy', value: '© 2026 Rahd. All rights reserved.' },
  ];
  for (const item of profileData) {
    await prisma.profile.upsert({ where: { key: item.key }, update: { value: item.value }, create: item });
  }
  console.log('✓ Profile settings seeded');

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
    await prisma.skillGroup.create({
      data: {
        title: group.title,
        order: group.order,
        skills: { create: group.skills },
      },
    });
  }
  console.log('✓ Skill groups seeded');

  // Experiences
  await prisma.experience.deleteMany();
  await prisma.experience.createMany({
    data: [
      {
        period: 'Feb 2026 - Present',
        duration: '5 mos',
        title: 'AI Engineer Cohort - Seasonal at Coding Camp powered by DBS Foundation',
        institution: 'Coding Camp powered by DBS Foundation',
        bullets: [
          'Completed an intensive training program consisting of 934 hours of study focused on mastering Artificial Intelligence (AI) technology with industry standards.',
          'Developed advanced Machine Learning (Classification, Regression, Clustering) and Deep Learning models using TensorFlow and Keras to solve complex problems.',
          'Apply Natural Language Processing (NLP), Computer Vision, and Time Series Forecasting techniques in digital solution development.',
          'Collaborate in a cross-disciplinary team (AI, Data Science, Full-Stack) to complete a Capstone Project (250 hours) using Design Thinking and Problem Solving methodologies to solve real-world issues in society.',
          'Manage project planning and execution professionally through the preparation of Project Plans and Project Briefs.',
          'Hone non-technical skills through Instructor-Led Training (ILT) sessions covering Project Management, Persuasive Communication, Growth Mindset, and Financial Literacy.',
        ],
        skills: ['Machine Learning', 'Project-based Learning', 'English', 'Cross-team Collaboration'],
        logoImage: 'DBS.png',
        order: 0,
      },
      {
        period: '2026',
        duration: 'Short program',
        title: 'Teaching Assistant at SMK Negeri 3 Tanjungpinang',
        institution: 'SMK Negeri 3 Tanjungpinang',
        bullets: [
          'Supported teachers in delivering lessons and guiding students in learning activities.',
          'Assisted students during practical sessions and helped explain technical materials.',
          'Built communication, patience, and mentoring skills through classroom activities.',
        ],
        skills: ['Teaching', 'Communication', 'Mentoring'],
        order: 1,
      },
    ],
  });
  console.log('✓ Experiences seeded');

  // Education
  await prisma.education.deleteMany();
  await prisma.education.createMany({
    data: [
      { school: 'Universitas Maritim Raja Ali Haji', degree: 'Bachelor of Informatics', period: '2023 - Present', score: 'GPA: 3.65 / 4.00', logoImage: 'logo_umrah.jpeg', order: 0 },
      { school: 'MAN Karimun', degree: 'Natural Sciences Program', period: '2020 - 2023', score: 'Final Score: 90 / 100', logoImage: 'logo_MAN.jpg', order: 1 },
    ],
  });
  console.log('✓ Education seeded');

  // Certificates
  await prisma.certificate.deleteMany();
  await prisma.certificate.createMany({
    data: [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services (AWS)', certificateId: 'AWS-CCP-2025-003', issued: 'Issued: 2025', expires: 'Expires: 2028', image: 'beljaraaws-1.png', imagePos: '50% 50%', imageFit: 'contain', imageZoom: 1.15, file: 'https://www.dicoding.com/certificates/98XW016Y9XM3', order: 0 },
      { name: 'Database Foundations', issuer: 'Oracle', certificateId: 'ORA-DB-2024-001', issued: 'Issued: 2024', expires: 'Expires: No expiration', image: 'portfolio-collage.png', imagePos: '70% 80%', imageFit: 'cover', order: 1 },
    ],
  });
  console.log('✓ Certificates seeded');

  // Activities
  await prisma.activityImage.deleteMany();
  await prisma.activity.deleteMany();

  const activitiesData = [
    {
      title: 'Development Journey: UMRAH Student Information System',
      date: 'November 10, 2025',
      description: 'Bagaimana saya memadukan native PHP dan JavaScript untuk membangun sistem informasi akademik kampus, mengatasi tantangan arsitektur data, dan merancang UI yang fungsional.',
      longDesc: 'Merancang dan membangun Sistem Informasi Akademik (SIAKAD) Mahasiswa UMRAH dari nol. Sistem ini mengintegrasikan basis data akademik dengan antarmuka web interaktif yang mempercepat akses mahasiswa ke KHS, KRS, serta informasi jadwal kuliah.',
      details: ['Menerapkan arsitektur MVC sederhana menggunakan native PHP untuk performa yang stabil.', 'Membangun modul dynamic filtering jadwal kuliah menggunakan Vanilla JS fetch API.', 'Mengoptimalkan query database relasional MySQL untuk kebutuhan request akademik.', 'Merancang UI responsif agar mudah diakses melalui perangkat seluler.'],
      tags: ['PHP', 'JavaScript', 'System Design'],
      order: 0,
      images: [{ src: 'portfolio-collage.png', pos: '67% 80%', order: 0 }, { src: 'foto2.jpeg', pos: '50% 40%', order: 1 }, { src: 'foto3.JPG', pos: '50% 40%', order: 2 }],
    },
    {
      title: 'Google Developer Student Clubs',
      date: '2024 - Present',
      description: 'Berpartisipasi dalam kegiatan komunitas teknologi, sesi belajar, dan kolaborasi project bersama mahasiswa lintas minat.',
      longDesc: 'Bergabung aktif dalam kegiatan Google Developer Student Clubs chapter kampus. Di sini, saya berkolaborasi untuk mengikuti workshop, tech talks, dan kegiatan belajar yang membantu mengasah skill pengembangan web dan cloud.',
      details: ['Mengikuti workshop mengenai Google Cloud Platform dan Firebase integrations.', 'Mengembangkan project kolaborasi bersama tim frontend developer.', 'Mendukung sesi belajar mingguan HTML, CSS, dan dasar JavaScript.'],
      tags: ['Community', 'Workshop', 'Collaboration'],
      order: 1,
      images: [{ src: 'portfolio-collage.png', pos: '17% 78%', order: 0 }, { src: 'foto2.jpeg', pos: '50% 40%', order: 1 }],
    },
    {
      title: 'Informatics Student Association',
      date: '2024 - Present',
      description: 'Mengikuti kegiatan organisasi mahasiswa informatika dan mendukung program yang berhubungan dengan pengembangan skill akademik.',
      longDesc: 'Terlibat dalam kegiatan Himpunan Mahasiswa Informatika untuk mendukung program akademik, riset, serta kegiatan pengembangan kemampuan mahasiswa di bidang teknologi.',
      details: ['Membantu kegiatan IT Competition untuk kategori Web Design.', 'Mengikuti mentoring pemrograman dan diskusi akademik.', 'Mengembangkan teamwork, leadership, dan public speaking melalui kegiatan organisasi.'],
      tags: ['Organization', 'Teamwork', 'Leadership'],
      order: 2,
      images: [{ src: 'portfolio-collage.png', pos: '82% 82%', order: 0 }],
    },
    {
      title: 'Coding Camp Capstone Team',
      date: '2026 - Present',
      description: 'Berkolaborasi dalam pengembangan capstone project berbasis AI dari tahap ide, eksperimen model, hingga presentasi solusi.',
      longDesc: 'Berkolaborasi dalam tim capstone untuk membangun solusi berbasis kecerdasan buatan. Project ini membantu saya memahami alur riset, eksperimen model, dokumentasi, dan penyajian produk digital.',
      details: ['Mendokumentasikan dataset dan menyiapkan kebutuhan eksperimen model.', 'Membantu proses pengembangan backend service untuk integrasi model.', 'Menyusun presentasi solusi bersama tim.'],
      tags: ['AI', 'Capstone', 'Research'],
      order: 3,
      images: [{ src: 'portfolio-collage.png', pos: '67% 62%', order: 0 }, { src: 'foto3.JPG', pos: '50% 40%', order: 1 }],
    },
    {
      title: 'University Tech Volunteer',
      date: '2024',
      description: 'Membantu dokumentasi dan kebutuhan teknis dalam kegiatan kampus yang melibatkan media digital serta publikasi acara.',
      longDesc: 'Menjadi sukarelawan pada beberapa kegiatan kampus yang membutuhkan dukungan teknis dan dokumentasi digital, termasuk publikasi, arsip foto, serta kebutuhan media acara.',
      details: ['Membantu kebutuhan teknis acara kampus.', 'Mendukung dokumentasi foto dan publikasi media sosial.', 'Mengelola materi digital untuk kebutuhan arsip kegiatan.'],
      tags: ['Documentation', 'Campus', 'Media'],
      order: 4,
      images: [{ src: 'portfolio-collage.png', pos: '50% 18%', order: 0 }],
    },
  ];

  for (const act of activitiesData) {
    await prisma.activity.create({
      data: {
        title: act.title,
        date: act.date,
        description: act.description,
        longDesc: act.longDesc,
        details: act.details,
        tags: act.tags,
        order: act.order,
        images: { create: act.images },
      },
    });
  }
  console.log('✓ Activities seeded');

  // Projects
  await prisma.project.deleteMany();
  await prisma.project.createMany({
    data: [
      { title: 'FiScan', desc: 'Fish Classification Mobile App', longDesc: 'FiScan is a state-of-the-art mobile application designed to help fishermen and marine biologists classify fish species instantly using their smartphone camera.', features: ['Real-time camera classification', 'Offline prediction using TensorFlow Lite', 'Detailed species description and habitat info', 'History log of scanned fish'], tags: ['Flutter', 'TensorFlow'], cat: 'Mobile Development', pos: '16% 78%', github: 'https://github.com/rynlsc/fiscan', demo: 'https://fiscan.dev', featured: true, order: 0 },
      { title: 'Maritech Company', desc: 'Shipyard Inspection Management System', longDesc: 'A comprehensive, enterprise-grade inspection management web application tailored for maritime shipyards.', features: ['Interactive shipyard inspector dashboard', 'PDF inspection report generator', 'Real-time hazard notifications', 'Comprehensive historical maintenance log'], tags: ['React', 'Node.js'], cat: 'Web Development', pos: '66% 63%', github: 'https://github.com/rynlsc/maritech', demo: 'https://maritech.dev', featured: true, order: 1 },
      { title: 'Tuna Classification Research', desc: 'EfficientNetV2-S Multitask Learning', longDesc: 'A research-based project applying deep multitask neural networks to classify tuna species and simultaneously estimate weight based on camera imagery.', features: ['Multitask classification and regression head', 'Data augmentation pipeline for underwater imagery', 'Evaluation metrics graphs and confusion matrices', 'High accuracy on low-resolution image sets'], tags: ['Python', 'TensorFlow'], cat: 'Machine Learning', pos: '88% 81%', github: 'https://github.com/rynlsc/tuna-classification', demo: 'https://tuna-class.dev', featured: true, order: 2 },
      { title: 'TaskFlow', desc: 'Task Management Web Application', longDesc: 'A modern, collaborative task management app designed to boost productivity for software teams.', features: ['Drag-and-drop task boards', 'Collaborative updates with web sockets', 'Subtask tracking and progress bars', 'Flexible priority tags and filters'], tags: ['Next.js', 'Tailwind CSS'], cat: 'Web Development', pos: '18% 89%', github: 'https://github.com/rynlsc/taskflow', demo: 'https://taskflow.dev', order: 3 },
      { title: 'Personal Finance Tracker', desc: 'Track expenses and manage budgets', longDesc: 'A secure and lightweight personal finance management system.', features: ['Interactive category pie charts and monthly bar graphs', 'CSV export for financial logs', 'Custom budget warning alerts', 'Offline local storage backup'], tags: ['React', 'Chart.js'], cat: 'Web Development', pos: '83% 89%', github: 'https://github.com/rynlsc/finance-tracker', demo: 'https://finance-tracker.dev', order: 4 },
      { title: 'E-Learning Platform', desc: 'Web platform for online learning and courses', longDesc: 'An all-in-one e-learning portal hosting video lectures, interactive quizzes, and certificate generation.', features: ['HTML5 video lecture player with progress tracking', 'Automated quiz grading system', 'Dynamic PDF certificate generator', 'Student-instructor discussion forum'], tags: ['React', 'Node.js'], cat: 'Web Development', pos: '68% 78%', github: 'https://github.com/rynlsc/e-learning', demo: 'https://e-learning.dev', order: 5 },
      { title: 'Weather App', desc: 'Real-time weather forecast application', longDesc: 'A sleek, cross-platform mobile application delivering accurate local and global weather forecasts.', features: ['GPS-based local weather tracking', '7-day and hourly forecasting charts', 'Beautiful dynamic backgrounds matching current weather', 'Support for multiple saved cities'], tags: ['React Native', 'API'], cat: 'Mobile Development', pos: '20% 84%', github: 'https://github.com/rynlsc/weather-app', demo: 'https://weather-app.dev', order: 6 },
      { title: 'Portfolio Website', desc: 'Personal portfolio built with Next.js', longDesc: 'This very portfolio website designed with clean typography, dynamic layout grid, and subtle floral decors.', features: ['Fully responsive fluid design', 'Custom category project filter', 'Dynamic animations using react hooks', 'Direct contact form integration'], tags: ['Next.js', 'Tailwind CSS'], cat: 'Other', pos: '50% 20%', github: 'https://github.com/rynlsc/portfolio', demo: 'https://rynlsc.dev', order: 7 },
      { title: 'Fish Species Identification', desc: 'Image classification for fish species', longDesc: 'A Python-based desktop application utilizing traditional computer vision (OpenCV) and machine learning classifiers to identify fish species.', features: ['Canny edge detection and contour analysis', 'SIFT/SURF feature descriptor mapping', 'SVM classifier training pipeline', 'Real-time webcam feed identification'], tags: ['Python', 'OpenCV'], cat: 'Machine Learning', pos: '75% 18%', github: 'https://github.com/rynlsc/fish-species', demo: 'https://fish-species.dev', order: 8 },
      { title: 'Parking System', desc: 'Web-based parking management system', longDesc: 'A lightweight management software for commercial parking lots.', features: ['Automated tariff calculator', 'Real-time lot availability updates', 'Daily revenue reporting panel', 'Simple ticket printing support'], tags: ['PHP', 'MySQL'], cat: 'Web Development', pos: '87% 63%', github: 'https://github.com/rynlsc/parking-system', demo: 'https://parking-system.dev', order: 9 },
      { title: 'Inventory Management', desc: 'Manage inventory and stock tracking', longDesc: 'An inventory tracking solution tailored for retail and small businesses.', features: ['Barcode scanner integration support', 'Automatic low stock alert notifications', 'Supplier contact database management', 'Excel-compatible report export'], tags: ['Laravel', 'MySQL'], cat: 'Web Development', pos: '66% 89%', github: 'https://github.com/rynlsc/inventory-management', demo: 'https://inventory-management.dev', order: 10 },
      { title: 'Blog Platform', desc: 'Blogging platform with admin dashboard', longDesc: 'A full-featured blogging application with a rich-text post editor, category management, and user commenting.', features: ['WYSIWYG rich text editor', 'Markdown rendering support', 'Secure authentication and admin role verification', 'Nested comment sections with moderation tools'], tags: ['React', 'Node.js'], cat: 'Web Development', pos: '15% 70%', github: 'https://github.com/rynlsc/blog-platform', demo: 'https://blog-platform.dev', order: 11 },
    ],
  });
  console.log('✓ Projects seeded');

  console.log('\n✅ Database seeded successfully!');
  console.log('Admin credentials: admin / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
