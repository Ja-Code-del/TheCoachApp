# MonWidget

Compte à rebours personnel avec citations IA et images inspirantes. Crée des widgets pour tes événements importants, partage-les en image et retrouve-les à chaque visite.

---

## Aperçu

- Compte à rebours vers n'importe quelle date cible
- Citation générée par **OpenAI GPT-4o-mini** adaptée au thème et à l'urgence
- Image de fond tirée d'**Unsplash** selon le thème
- Gestion de plusieurs événements avec navigation par swipe
- Écran spécial **Jour J** avec confettis animés
- Export en image partageable via l'API Web Share ou téléchargement
- 5 polices personnalisables
- Persistance locale (localStorage)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| UI | React 19 + Vite 7 |
| Style | Tailwind CSS v4 |
| Icônes | Font Awesome |
| Capture | html2canvas |
| Backend | Vercel Serverless Functions |
| IA | OpenAI GPT-4o-mini |
| Images | Unsplash API |
| Analytics | Vercel Analytics + Speed Insights |

---

## Structure du projet

```
mon-app/
├── api/                        # Vercel serverless functions
│   ├── quote.js                # OpenAI → génération de citation
│   └── image.js                # Unsplash → image par thème
├── src/
│   ├── App.jsx                 # Orchestrateur principal
│   ├── components/
│   │   ├── WelcomeScreen.jsx   # Onboarding premier lancement
│   │   ├── JourJScreen.jsx     # Écran Jour J (countdown = 0)
│   │   ├── ShareCard.jsx       # Carte hors-écran pour capture
│   │   ├── ConfettiAnimation.jsx
│   │   ├── Spinner.jsx
│   │   └── widget/
│   │       ├── WidgetDisplay.jsx   # Affichage principal
│   │       └── WidgetSettings.jsx  # Panneau de réglages
│   ├── hooks/
│   │   ├── useEvents.js        # State + persistence des événements
│   │   ├── useCarousel.js      # Navigation swipe + fade
│   │   ├── useMediaGeneration.js # Appels API quote + image
│   │   └── useShare.js         # Capture html2canvas + partage
│   ├── lib/
│   │   ├── api.js              # Client HTTP (fetch quote / image)
│   │   └── utils.js            # calcDaysLeft, DEFAULT_EVENT, generateId
│   └── constants/
│       └── fonts.js            # 5 presets de polices
```

---

## Installation locale

### Prérequis

- Node.js 18+
- Compte [OpenAI](https://platform.openai.com/) (clé API GPT-4o-mini)
- Compte [Unsplash Developers](https://unsplash.com/developers) (Access Key)

### 1. Cloner et installer

```bash
git clone https://github.com/<ton-compte>/MonWidget.git
cd MonWidget/mon-app
npm install
```

### 2. Variables d'environnement

Crée un fichier `.env.local` à la racine de `mon-app/` :

```env
OPENAI_API_KEY=sk-...
UNSPLASH_ACCESS_KEY=...
VITE_API_BASE_URL=http://localhost:3000
```

> `.env.local` est ignoré par git — ne commite jamais tes clés.

### 3. Lancer en développement

```bash
npm run dev
```

Les routes `/api/*` nécessitent [Vercel CLI](https://vercel.com/docs/cli) pour être émulées localement :

```bash
npm install -g vercel
vercel dev
```

---

## Scripts

```bash
npm run dev      # Serveur de développement (Vite)
npm run build    # Build de production
npm run preview  # Prévisualiser le build
npm run lint     # ESLint
```

---

## API serverless

### `GET /api/image?theme=<theme>`

Retourne une image Unsplash au format portrait correspondant au thème.

**Réponse :**
```json
{
  "url": "https://images.unsplash.com/...",
  "photographer": "Prénom Nom",
  "photographerUrl": "https://unsplash.com/@..."
}
```

---

### `POST /api/quote`

Génère une citation inspirante via GPT-4o-mini, adaptée au nombre de jours restants.

**Corps de la requête :**
```json
{
  "theme": "marathon sportif",
  "daysLeft": 12
}
```

**Réponse :**
```json
{
  "text": "La douleur est temporaire, la fierté est éternelle.",
  "author": "Lance Armstrong"
}
```

**Tonalité automatique selon l'urgence :**
- `≤ 7 jours` → urgente et intense
- `≤ 30 jours` → motivante et proche
- `> 30 jours` → patiente et inspirante

---

## Déploiement (Vercel)

1. Importer le repo sur [vercel.com](https://vercel.com)
2. Définir le **Root Directory** sur `mon-app/`
3. Ajouter les variables d'environnement dans les Settings Vercel :
   - `OPENAI_API_KEY`
   - `UNSPLASH_ACCESS_KEY`
4. Déployer — les fonctions `api/` sont détectées automatiquement

---

## Flux applicatif

```
Premier lancement
  └─ WelcomeScreen → WidgetSettings (créer un événement)

Usage courant
  └─ WidgetDisplay (compte à rebours + citation)
       ├─ Swipe gauche/droite → changer d'événement
       ├─ Bouton image → nouvelle image Unsplash
       ├─ Bouton citation → nouvelle citation IA
       └─ Bouton partager → capture + Web Share API

Jour J (daysLeft === 0)
  └─ JourJScreen (confettis + partage du moment)
```

---

## Structure d'un événement

```js
{
  id: 'evt_1234567890_abc',
  eventName: 'Mon marathon',       // Nom affiché
  theme: 'marathon sportif',       // Utilisé par l'IA
  targetDate: '2026-10-15',        // Format ISO YYYY-MM-DD
  fontId: 'inter',                 // inter | bebas | playfair | lora | space
  quote: { text: '...', author: '...' },
  bgImage: 'https://...',          // URL Unsplash
  photographer: {
    name: 'Prénom Nom',
    url: 'https://unsplash.com/@...'
  }
}
```

---

## Roadmap

- [ ] Portage Expo (iOS / Android)
- [ ] Notifications push J-7, J-1
- [ ] Thèmes de couleur personnalisés
- [ ] Synchronisation cloud (compte utilisateur)

---

## Licence

MIT
