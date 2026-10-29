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

// Horaires provisoires — À COMPLÉTER / modifier depuis l'administration.
const services = [
  { name: "Culte du dimanche", dayOfWeek: 0, startTime: "09:00", endTime: "12:00", description: "Louange, prière et prédication de la Parole.", order: 1 },
  { name: "École du dimanche", dayOfWeek: 0, startTime: "08:00", endTime: "09:00", description: "Étude biblique pour tous les âges.", order: 0 },
  { name: "Réunion de prière", dayOfWeek: 3, startTime: "18:00", endTime: "19:30", description: "Intercession pour l'église, les familles et la nation.", order: 2 },
  { name: "Étude biblique", dayOfWeek: 5, startTime: "18:00", endTime: "19:30", description: "Étude approfondie d'un livre de la Bible.", order: 3 },
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

  console.log(`Seed terminé. Administrateur : ${phone}`);
}

main().finally(() => db.$disconnect());
