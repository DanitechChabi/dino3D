// Activités de l'église : chaque activité est à la fois un article du blog et un album de la galerie.
// Pour en ajouter une : déposer les photos dans /public/galerie/<slug>/ puis ajouter une entrée ci-dessous.

export type Photo = { src: string; caption: string; width: number; height: number };

export type Activity = {
  slug: string;
  title: string;
  category: string;
  ministry?: string; // slug du ministère concerné (l'activité s'affiche sur sa page)
  date?: string; // AAAA-MM-JJ
  time?: string; // ex. « 9h – 19h »
  place?: string;
  excerpt: string;
  body: string[];
  verse?: { text: string; ref: string };
  cover: number; // index de la photo de couverture
  wall?: number[]; // photos affichées sur la « table de souvenirs » (Polaroid)
  photos: Photo[];
};

const photo = (dir: string, prefix: string, w: number, h: number) => (n: number, caption: string): Photo => ({
  src: `/galerie/${dir}/${prefix}-${String(n).padStart(2, "0")}.jpg`,
  caption,
  width: w,
  height: h,
});

const conf = photo("conference-couple-2026", "conference", 1275, 956);
const wassa = photo("formation-wassa-wassa", "wassa", 1215, 1620);
const souvenir = photo("souvenirs", "souvenir", 1600, 900);
const souvenirPortrait = photo("souvenirs", "souvenir", 900, 1600);

export const activities: Activity[] = [
  {
    slug: "souvenirs",
    title: "Nos souvenirs : le chemin parcouru",
    category: "Souvenirs",
    excerpt: "Des images d'hier : nos cultes, notre chorale, nos enfants et nos repas fraternels. Un regard reconnaissant sur le chemin parcouru depuis 2000.",
    body: [
      "Depuis sa fondation en 2000 par le Pasteur CHABI BOUKO Youssouf, l'Église Baptiste Biblique Jésus Revient a vécu bien des saisons. Ces photos d'archives en gardent la trace : les cultes sur les bancs de bois, la chorale en uniforme, les enfants rassemblés sous l'abri en bambou, les repas partagés entre frères et sœurs.",
      "Elles nous rappellent la fidélité de Dieu, qui a conduit son Église pas à pas, et tous ceux qui ont servi avec amour au fil des années. Regarder en arrière, c'est rendre grâce ; regarder en avant, c'est attendre avec foi le retour du Seigneur.",
    ],
    verse: { text: "Mon âme, bénis l'Éternel, et n'oublie aucun de ses bienfaits !", ref: "Psaume 103:2" },
    cover: 10,
    wall: [10, 6, 2, 19, 15, 9, 0, 21, 12],
    photos: [
      souvenir(1, "Un repas partagé entre sœurs dans la salle"),
      souvenir(2, "Moment de communion autour du repas"),
      souvenir(3, "L'assemblée réunie dans la salle aux bancs de bois"),
      souvenir(4, "Les fidèles prennent place sur les bancs"),
      souvenir(5, "Avec les tout‑petits, à l'entrée de l'église"),
      souvenir(6, "Attentives à la Parole"),
      souvenir(7, "Les enfants réunis sous l'abri en bambou"),
      souvenir(8, "La louange accompagnée à la guitare"),
      souvenir(9, "Au pupitre, devant l'assemblée"),
      souvenir(10, "Les enfants chantent et frappent des mains"),
      souvenir(11, "La chorale en uniforme bleu, en pleine louange"),
      souvenir(12, "La chorale prête à chanter"),
      souvenir(13, "Un jeune frère et un tout‑petit"),
      souvenir(14, "Échanges fraternels dans la salle"),
      souvenir(15, "La salle parée de tentures pour le culte"),
      souvenir(16, "Deux frères au pupitre"),
      souvenir(17, "Les enfants à l'écoute sous l'abri en bambou"),
      souvenirPortrait(18, "Un frère savoure le repas fraternel"),
      souvenir(19, "Présentation devant l'assemblée"),
      souvenir(20, "Un petit garçon dans la cour de l'église"),
      souvenir(21, "L'assemblée attentive pendant le culte"),
      souvenir(22, "Recueillement de la chorale"),
      souvenir(23, "Vue de la salle pendant le culte"),
      souvenir(24, "Temps de prière"),
      souvenir(25, "Un frère immortalise le moment"),
    ],
  },
  {
    slug: "conference-couple-2026",
    title: "Conférence sur le couple : bâtir son union sur l'amour de Christ",
    category: "Conférence",
    date: "2026-09-05",
    time: "9h – 19h",
    place: "EBB‑JR de Tanmey",
    excerpt:
      "Une journée entière pour apprendre à vivre le mariage selon la volonté de Dieu, avec des participants de l'EBB‑JR et d'Églises‑sœurs.",
    body: [
      "Beaucoup de couples ont volé en éclats dans le monde, faute du vrai amour fondé sur Jésus‑Christ, qui nous a aimés jusqu'à se sacrifier pour l'Église, son épouse.",
      "Apprendre et vivre dans la volonté de Dieu, l'instigateur même de cette union sacrée, préserve les couples de bien des maux qui les minent. C'était là l'objectif de cette conférence, qui a eu lieu le samedi 5 septembre 2026 à l'EBB‑JR de Tanmey et qui a réuni des participants d'ici et d'autres Églises‑sœurs.",
      "De nombreuses questions et réponses ont étoffé cette rencontre, démarrée à 9 heures et achevée aux environs de 19 heures, dans une ambiance bon enfant.",
    ],
    verse: {
      text: "Maris, aimez vos femmes, comme Christ a aimé l'Église, et s'est livré lui‑même pour elle.",
      ref: "Éphésiens 5:25",
    },
    cover: 1,
    photos: [
      conf(1, "L'orateur partage l'enseignement sur le couple chrétien"),
      conf(2, "Une assemblée nombreuse, venue de l'EBB‑JR et d'Églises‑sœurs"),
      conf(3, "Bible ouverte, les participants suivent l'enseignement"),
      conf(4, "Prise de notes pendant la conférence"),
    ],
  },
  {
    slug: "formation-wassa-wassa",
    title: "Formation de la jeunesse : préparation du wassa‑wassa",
    category: "Jeunesse",
    ministry: "jeunesse",
    excerpt: "Une journée de formation pratique où la jeunesse a appris à préparer le wassa‑wassa, dans la joie et la fraternité.",
    body: [
      "La jeunesse de l'Église Baptiste Biblique Jésus Revient s'est réunie pour une formation pratique consacrée à la préparation du wassa‑wassa, plat traditionnel à base de farine d'igname, servi ici avec du poisson.",
      "Au‑delà de la recette, cette journée a été un temps de partage et de communion fraternelle : jeunes, parents et enfants se sont retrouvés autour d'un même savoir‑faire, transmis avec patience et bonne humeur.",
      "Former nos jeunes, c'est les préparer à servir Dieu et leur prochain dans tous les domaines de la vie, y compris par le travail de leurs mains.",
    ],
    verse: {
      text: "Tout ce que vous faites, faites‑le de bon cœur, comme pour le Seigneur et non pour des hommes.",
      ref: "Colossiens 3:23",
    },
    cover: 3,
    photos: [
      wassa(1, "Sourires à l'arrivée des participants"),
      wassa(2, "Échanges fraternels avant le début de la formation"),
      wassa(3, "Un jeune de l'église, prêt pour la journée"),
      wassa(4, "Les jeunes immortalisent ce moment de partage"),
      wassa(5, "Bonne humeur entre deux ateliers"),
      wassa(6, "Les enfants aussi étaient de la partie"),
      wassa(7, "Petits et grands réunis pour l'occasion"),
      wassa(8, "Bébé au dos, on ne manque pas la formation"),
      wassa(9, "Les tout‑petits accompagnent la famille de l'église"),
      wassa(10, "Belle tenue pour une belle journée"),
      wassa(11, "Un moment de complicité"),
      wassa(12, "Les femmes de l'église présentes et attentives"),
      wassa(13, "À l'écoute pendant la formation"),
      wassa(14, "À l'entrée de la salle"),
      wassa(15, "La joie d'être ensemble"),
      wassa(16, "Tendresse et communion fraternelle"),
      wassa(17, "Une participante à la formation"),
      wassa(18, "Les participants s'installent dans la salle"),
      wassa(19, "Dans la salle, en attendant l'atelier"),
      wassa(20, "Le poisson préparé pour accompagner le wassa‑wassa"),
    ],
  },
];

export function wallPhotos(a: Activity) {
  return (a.wall ?? []).map((i) => a.photos[i]).filter(Boolean);
}

export function getActivity(slug: string) {
  return activities.find((a) => a.slug === slug);
}

export function formatActivityDate(date?: string) {
  if (!date) return undefined;
  const text = new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return text.charAt(0).toUpperCase() + text.slice(1); // « Samedi 5 septembre 2026 »
}
