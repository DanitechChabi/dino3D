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

## Phase 2 (livrée) : événements, programmes et rappels

- **Événements** (`/evenements`) : calendrier mensuel animé (cultes + événements), page de chaque événement avec
  compte à rebours, programme horaire, inscription en ligne (places limitées, accompagnants), ajout à l'agenda.
- **Rappels gratuits** :
  - **notifications** sur le téléphone ou l'ordinateur (bouton « Activer les rappels »), envoyées automatiquement la veille
    et 1 h avant chaque culte et événement ; chacun choisit : cultes, événements, annonces ;
  - **agenda synchronisé** : `/calendrier.ics` (abonnement iPhone, Android, Outlook) avec alarme intégrée.
- **Administration** : création des événements (programme, image, inscriptions), liste des inscrits et export Excel,
  envoi d'une notification à tous les abonnés, option « notifier » sur les annonces.

## Phase 3 (livrée) : dîmes, offrandes et quêtes

- **Faire un don** (`/donner`) : dîme, offrande, quête, action de grâce, construction, missions (types modifiables),
  montants rapides, Mobile Money ou carte, don anonyme possible, page de confirmation animée et **reçu imprimable/PDF**.
- **Paiement sécurisé** : un don n'est validé qu'après confirmation serveur du fournisseur (notification signée,
  idempotente) ; référence publique non devinable.
- **Espace membre** : « Mes dons » (total de l'année, historique, reçus).
- **Trésorier** (`/admin/finances`) : totaux du jour, du mois, de l'année, graphiques par mois et par type,
  saisie des quêtes et dîmes reçues en espèces, annulation tracée, liste filtrable, export Excel, journal complet.
- **Confidentialité** : l'identité des donateurs de dîmes n'est visible que du trésorier.

### Fournisseur de paiement

Le module est indépendant du fournisseur (`src/lib/payments/`). `PAYMENT_PROVIDER="simulation"` permet de tout
tester sans argent réel (refusé en production). L'intégration **SaaS Pay** se fait dans
`src/lib/payments/saaspay.ts` (3 fonctions à compléter avec la documentation de l'API), puis `PAYMENT_PROVIDER="saaspay"`.
URL de notification à déclarer chez le fournisseur : `https://<site>/api/paiements/notification/saaspay`.

## Phase 4 (livrée) : solidarité

- **Collectes** (`/solidarite`) : motif, objectif, date limite, anneau et barres de progression animés, nombre de
  donateurs, don en ligne direct à la collecte (reçu mentionnant la collecte).
- **Discrétion** : collecte publique, réservée aux membres connectés, ou bénéficiaire anonyme (nom jamais envoyé
  au navigateur des visiteurs).
- **Demande d'aide confidentielle** (`/solidarite/demande`, membres connectés) : pour soi ou pour un frère ;
  lue uniquement par le pasteur et le trésorier.
- **Validation obligatoire** (`/admin/solidarite`) : relecture du texte, objectif, date limite, discrétion,
  publication ou classement sans suite ; suivi des dons, **aides versées** (tracées au journal financier),
  clôture avec **message de remerciement** et notification.
- **Transparence** : historique public des aides apportées et des montants versés.

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

## Rappels : mise en service

1. Générer les clés : `npx web-push generate-vapid-keys`, puis renseigner dans `.env` :
   `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` et un `CRON_SECRET` aléatoire.
2. Programmer un appel **toutes les 15 minutes** (par ex. avec cron-job.org, gratuit) :
   `GET https://<site>/api/cron/rappels` avec l'en-tête `Authorization: Bearer <CRON_SECRET>`.
3. Sur iPhone, les notifications fonctionnent une fois le site ajouté à l'écran d'accueil (iOS 16.4+).

Les SMS et WhatsApp pourront être branchés dans `src/lib/notify.ts` une fois un fournisseur choisi.

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

- Branchement de l'API SaaS Pay (documentation attendue)
- Phase 5 — Lives : programmation, page en direct, archives
