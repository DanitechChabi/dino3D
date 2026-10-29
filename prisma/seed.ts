import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const ministries = [
  { slug: "enfants", name: "Enfants", icon: "baby", summary: "L'École du dimanche, pour grandir dans la foi dès le plus jeune âge.", description: "Chaque dimanche, nos moniteurs enseignent aux enfants les histoires de la Bible, des versets à mémoriser et des chants, pour qu'ils connaissent Jésus dès leur jeunesse (Proverbes 22:6)." },
  { slug: "jeunesse", name: "Jeunesse", icon: "flame", summary: "Une génération enflammée pour Christ.", description: "Études bibliques, rencontres, évangélisation et activités : la jeunesse se forme à vivre pour Dieu dans un monde qui a besoin de Lui (1 Timothée 4:12)." },
  { slug: "femmes", name: "Femmes", icon: "flower", summary: "Des femmes vertueuses, enracinées dans la Parole.", description: "Prière, enseignement et entraide : les femmes de l'église s'encouragent à servir Dieu dans leur foyer, leur travail et l'église (Proverbes 31)." },
  { slug: "hommes", name: "Hommes", icon: "shield", summary: "Des hommes fidèles, piliers de leur foyer et de l'église.", description: "Les hommes se réunissent pour prier, étudier la Parole et apprendre à conduire leur famille selon le cœur de Dieu (Josué 24:15)." },
  { slug: "louange", name: "Chorale & Louange", icon: "music", summary: "Chanter la gloire de Dieu avec excellence.", description: "La chorale et l'équipe de louange conduisent l'assemblée dans l'adoration, avec des cantiques et des chants qui exaltent le Seigneur (Psaume 150)." },
  { slug: "evangelisation", name: "Évangélisation & Missions", icon: "globe", summary: "Allez, faites de toutes les nations des disciples.", description: "Sorties d'évangélisation, distribution de traités, visites et soutien aux missions : nous portons l'Évangile à Tanmey et au-delà (Matthieu 28:19-20)." },
];

// Programme réel de l'église (modifiable ensuite depuis l'administration).
// weeks : semaines du mois concernées ; vide = chaque semaine.
const services = [
  { name: "École du dimanche", dayOfWeek: 0, weeks: [], startTime: "09:00", endTime: "09:30", description: "Étude biblique pour tous les âges.", order: 0 },
  { name: "Culte du dimanche", dayOfWeek: 0, weeks: [], startTime: "09:30", endTime: "11:30", description: "Louange, prière et prédication de la Parole.", order: 1 },
  { name: "Réunion des couples", dayOfWeek: 0, weeks: [1], startTime: "13:00", endTime: null, description: "Enseignement et partage pour les couples.", order: 2 },
  { name: "Jeunesse", dayOfWeek: 0, weeks: [1, 3], startTime: "17:00", endTime: "18:30", description: "Rencontre de la jeunesse, à la place de l'étude biblique.", order: 3 },
  { name: "Étude biblique", dayOfWeek: 0, weeks: [2, 4, 5], startTime: "17:00", endTime: "18:30", description: "Étude approfondie de la Parole de Dieu.", order: 4 },
  { name: "Réunion de prière", dayOfWeek: 3, weeks: [], startTime: "18:00", endTime: "19:00", description: "Intercession pour l'église, les familles et la nation.", order: 5 },
  { name: "Réunion de prière", dayOfWeek: 5, weeks: [2, 3, 4, 5], startTime: "19:00", endTime: "20:00", description: "Prière et intercession.", order: 6 },
  { name: "Veillée de prière", dayOfWeek: 5, weeks: [1], startTime: "19:00", endTime: "22:00", description: "Une soirée de prière le premier vendredi du mois.", order: 7 },
];

async function main() {
  const phone = process.env.SEED_ADMIN_PHONE ?? "+22900000000";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangezMoi!2026";

  await db.user.upsert({
    where: { phone },
    update: {},
    create: {
      firstName: "Administrateur",
      lastName: "EBB",
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });

  for (const [order, m] of ministries.entries()) {
    await db.ministry.upsert({ where: { slug: m.slug }, update: {}, create: { ...m, order } });
  }

  if ((await db.service.count()) === 0) {
    await db.service.createMany({ data: services });
  }

  if ((await db.announcement.count()) === 0) {
    await db.announcement.create({
      data: {
        title: "Bienvenue sur notre nouveau site !",
        body: "Notre église dispose désormais de son application web. Créez votre compte membre pour recevoir les annonces et, bientôt, les rappels des cultes.",
        pinned: true,
      },
    });
  }

  // Événement réel passé, relié à son récit sur le blog
  await db.event.upsert({
    where: { slug: "conference-couple-2026" },
    update: {},
    create: {
      slug: "conference-couple-2026",
      title: "Conférence sur le couple : bâtir son union sur l'amour de Christ",
      category: "Conférence",
      summary: "Une journée pour apprendre à vivre le mariage selon la volonté de Dieu, avec des participants de l'EBB-JR et d'Églises-sœurs.",
      description: "Apprendre et vivre dans la volonté de Dieu, l'instigateur même de l'union sacrée du mariage, préserve les couples de bien des maux qui les minent.",
      location: "EBB-JR de Tanmey",
      startAt: new Date("2026-09-05T09:00:00+01:00"),
      endAt: new Date("2026-09-05T19:00:00+01:00"),
      coverUrl: "/galerie/conference-couple-2026/conference-02.jpg",
      articleSlug: "conference-couple-2026",
    },
  });

  console.log(`Seed terminé. Administrateur : ${phone}`);
}

main().finally(() => db.$disconnect());
