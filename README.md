# Église Baptiste Biblique Jésus Revient — Tanmey

Application web de l'église : site public en motion design, espace membre et administration.

## Phase 1 (livrée)

- **Site public** : accueil animé (croix de lumière, nuées qui s'écartent au défilement, Évangile en 4 actes,
  colombe, lampes à huile, compte à rebours avant le prochain culte), À propos (histoire, vision, confession de foi,
  équipe), Cultes & première visite, Ministères, Annonces, Blog (récits d'activités), Galerie (albums,
  visionneuse plein écran), Contact & demande de prière.
- **Écran d'ouverture** : une colombe traverse la nuit puis le logo EBB‑JR se dévoile (une fois par visite, cliquable pour passer).
- **Comptes membres** : inscription / connexion par numéro de téléphone + mot de passe, profil, ministères, mot de passe.
- **Rôles** : Membre, Responsable de ministère, Trésorier, Pasteur / Administrateur.
- **Administration** : tableau de bord, membres et rôles, cultes & horaires, annonces, messages et prières
  (les demandes de prière ne sont visibles que par le pasteur).
- Les animations respectent le réglage « réduire les animations » du téléphone ou de l'ordinateur.

## Démarrage

Prérequis : Node.js 20.9+ et PostgreSQL.

```bash
cp .env.example .env        # puis renseigner DATABASE_URL, AUTH_SECRET, compte admin
npm install
npx prisma migrate deploy   # crée les tables
npm run db:seed             # ministères, horaires provisoires, compte administrateur
npm run dev                 # http://localhost:3000
```

Connexion administrateur : le numéro `SEED_ADMIN_PHONE` et le mot de passe `SEED_ADMIN_PASSWORD` du fichier `.env`.
**Changez ce mot de passe dès la première connexion** (Espace membre → Sécurité).

## Où modifier les contenus

| Contenu | Où |
|---|---|
| Nom, adresse, téléphone, WhatsApp, e-mail, carte, mot du pasteur | `src/content/site.ts` (`church`) |
| Histoire, vision, confession de foi, équipe, FAQ, versets | `src/content/site.ts` |
| Activités (articles du blog + albums photo) | photos dans `public/galerie/<activité>/`, texte et légendes dans `src/content/activities.ts` |
| Logo | `public/brand/` |
| Horaires des cultes, annonces, rôles des membres | depuis l'administration (`/admin`) |

Les textes marqués **« À COMPLÉTER »** sont provisoires.

## Technique

Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4, Motion, Prisma 6 + PostgreSQL,
sessions signées (JWT HS256 dans un cookie httpOnly), mots de passe hachés avec bcrypt.

## Prochaines phases

2. Événements, calendrier, programmes, rappels (push, SMS, WhatsApp)
3. Paiements SaaS Pay : dîmes, offrandes, quêtes, reçus
4. Collectes de solidarité, tableau de bord trésorier
5. Lives : programmation, page en direct, archives
