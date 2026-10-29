// Contenus éditoriaux du site. Les éléments marqués « À COMPLÉTER » sont
// provisoires et doivent être remplacés par les informations réelles de l'église.

export const church = {
  name: "Église Baptiste Biblique Jésus Revient",
  shortName: "EBB Jésus Revient",
  city: "Tanmey",
  tagline: "Jésus revient — préparez-vous à Sa rencontre",
  address: "Tanmey — adresse exacte à compléter", // À COMPLÉTER
  phone: "01 97 60 97 49",
  assistancePhone: "01 53 73 62 65",
  whatsapp: "", // À COMPLÉTER : numéro au format international sans « + », ex. 22900000000
  email: "ebbtanmey@gmail.com",
  socials: {
    facebook: "", // À COMPLÉTER
    youtube: "https://www.youtube.com/@genietechw",
    whatsappChannel: "https://whatsapp.com/channel/0029VbC6GNE9WtCAv1X50M2l",
  },
  // Fuseau horaire de l'église (Bénin, UTC+1 sans heure d'été) — utilisé pour les dates et les rappels
  timeZone: "Africa/Porto-Novo",
  utcOffset: "+01:00",
  foundedYear: 2000,
  founder: "Pasteur CHABI BOUKO Youssouf",
  activeMembers: 100, // « une centaine de membres actifs »
  mapEmbedUrl: "", // À COMPLÉTER : lien « Intégrer une carte » de Google Maps
  pastor: {
    name: "Pasteur CHABI BOUKO Youssouf",
    title: "Pasteur principal et fondateur",
    welcome:
      "Bien-aimés, soyez les bienvenus. Notre désir est de vous accueillir comme le Seigneur nous a accueillis : avec amour, dans la vérité de Sa Parole. Que vous cherchiez Dieu pour la première fois ou que vous marchiez avec Lui depuis longtemps, il y a une place pour vous dans la famille de Dieu.",
  },
};

export const heroVerse = {
  text: "Ce Jésus, qui a été enlevé au ciel du milieu de vous, viendra de la même manière que vous l'avez vu allant au ciel.",
  ref: "Actes 1:11",
};

export const verses = [
  { text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.", ref: "Jean 3:16" },
  { text: "Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi.", ref: "Jean 14:6" },
  { text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.", ref: "Psaume 119:105" },
  { text: "Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu.", ref: "Éphésiens 2:8" },
  { text: "Voici, je viens bientôt, et ma rétribution est avec moi, pour rendre à chacun selon ce qu'est son œuvre.", ref: "Apocalypse 22:12" },
  { text: "L'Éternel est mon berger : je ne manquerai de rien.", ref: "Psaume 23:1" },
  { text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", ref: "Matthieu 11:28" },
];

export const lightVerse = "La lumière luit dans les ténèbres, et les ténèbres ne l'ont point reçue. Cette lumière était la véritable lumière, qui, en venant dans le monde, éclaire tout homme.";

export const gospelActs = [
  { key: "creation", title: "La Création", ref: "Genèse 1:1", text: "Au commencement, Dieu créa les cieux et la terre. Il nous a faits pour Le connaître et vivre en communion avec Lui." },
  { key: "croix", title: "La Croix", ref: "Romains 5:8", text: "Le péché nous a séparés de Dieu. Mais Christ est mort pour nous, alors que nous étions encore pécheurs." },
  { key: "resurrection", title: "La Résurrection", ref: "1 Corinthiens 15:4", text: "Il a été enseveli et Il est ressuscité le troisième jour. La mort est vaincue, le tombeau est vide." },
  { key: "retour", title: "Son Retour", ref: "1 Thessaloniciens 4:16", text: "Le Seigneur Lui-même descendra du ciel. Jésus revient : notre espérance est vivante." },
];

export const history = [
  {
    year: "2000",
    title: "La fondation",
    text: "Le Pasteur CHABI BOUKO Youssouf fonde l'Église Baptiste Biblique Jésus Revient à Tanmey, avec une conviction qui donne son nom à l'église : Jésus revient, et chaque âme doit s'y préparer.",
  },
  {
    year: "Les années de fidélité",
    title: "Une église enracinée dans la Parole",
    text: "Année après année, l'assemblée grandit autour de la prédication fidèle de la Bible, de la prière et de l'évangélisation à Tanmey et dans les environs.",
  },
  {
    year: "Aujourd'hui",
    title: "Une famille d'une centaine de membres",
    text: "Plus de vingt-cinq ans après sa fondation, l'église compte une centaine de membres actifs, engagés dans les ministères, et continue d'annoncer l'Évangile en attendant le retour du Seigneur.",
  },
];

export const vision = {
  vision: "Être une église biblique, fidèle et vivante, qui prépare chaque âme au retour de Jésus-Christ.",
  mission: [
    { title: "Annoncer", text: "Proclamer l'Évangile du salut par la grâce, au moyen de la foi en Jésus-Christ." },
    { title: "Enseigner", text: "Enraciner chaque croyant dans la Parole de Dieu, seule autorité en matière de foi et de vie." },
    { title: "Aimer", text: "Vivre en famille de Dieu : prier, servir et prendre soin les uns des autres." },
    { title: "Veiller", text: "Garder nos lampes allumées dans l'attente joyeuse du retour du Seigneur." },
  ],
};

// Points de doctrine baptistes bibliques habituels — À VALIDER par le pasteur.
export const confession = [
  { title: "Les Saintes Écritures", text: "La Bible, Ancien et Nouveau Testament, est la Parole de Dieu inspirée, infaillible, seule règle de foi et de conduite.", ref: "2 Timothée 3:16" },
  { title: "Dieu trinitaire", text: "Un seul Dieu, éternellement existant en trois personnes : le Père, le Fils et le Saint-Esprit.", ref: "Matthieu 28:19" },
  { title: "Jésus-Christ", text: "Vrai Dieu et vrai homme, né d'une vierge, mort pour nos péchés, ressuscité corporellement, monté au ciel.", ref: "Jean 1:1-14" },
  { title: "Le salut par grâce", text: "Le salut est un don gratuit de Dieu, reçu par la foi seule en Jésus-Christ, et non par les œuvres.", ref: "Éphésiens 2:8-9" },
  { title: "Le baptême et la Sainte Cène", text: "Le baptême par immersion du croyant et la Cène du Seigneur sont les deux ordonnances de l'Église.", ref: "Romains 6:3-4" },
  { title: "L'Église locale", text: "L'Église est une assemblée de croyants baptisés, autonome, unie pour le culte, la communion et la mission.", ref: "Actes 2:41-42" },
  { title: "Le retour de Christ", text: "Jésus-Christ reviendra personnellement et visiblement chercher les siens. Nous L'attendons chaque jour.", ref: "Jean 14:3" },
];

export const team: { name: string; role: string; photo?: string }[] = [
  { name: "CHABI BOUKO Youssouf", role: "Pasteur principal et fondateur", photo: "/brand/pasteur-chabi-bouko-youssouf.png" },
  { name: "Nom à compléter", role: "Pasteur adjoint / Ancien" },
  { name: "Nom à compléter", role: "Diacre" },
  { name: "Nom à compléter", role: "Responsable de la louange" },
];

export const firstVisitFaq = [
  { q: "Comment se déroule un culte ?", a: "Le culte commence par un temps de louange et de prière, suivi de la lecture de la Parole et de la prédication. Il se termine par la prière et les annonces." },
  { q: "Comment dois-je m'habiller ?", a: "Venez avec une tenue correcte et décente, dans laquelle vous êtes à l'aise. Ce qui compte pour Dieu, c'est votre cœur." },
  { q: "Y a-t-il quelque chose pour les enfants ?", a: "Oui, l'École du dimanche accueille les enfants pendant le culte, avec des moniteurs formés." },
  { q: "Dois-je donner une offrande ?", a: "Non, les visiteurs ne sont jamais obligés de donner. L'offrande est un acte d'adoration libre des membres." },
  { q: "Comment rencontrer le pasteur ?", a: "Après le culte, l'équipe d'accueil peut vous présenter au pasteur. Vous pouvez aussi nous écrire via la page Contact." },
];

export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/cultes", label: "Cultes" },
  { href: "/ministeres", label: "Ministères" },
  { href: "/evenements", label: "Événements" },
  { href: "/blog", label: "Blog" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
];

// Liens supplémentaires du pied de page
export const footerNav = [...nav.slice(0, 4), { href: "/annonces", label: "Annonces" }, ...nav.slice(4)];

export const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
