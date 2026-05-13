# VoteCheck Proxy — Guide de déploiement gratuit

Ce proxy permet à l'application VoteCheck de récupérer les données réelles
de NosDéputés.fr sans problème de CORS.

---

## 🚀 Option A — Vercel (Node.js) — Recommandé, 3 minutes

### Prérequis
- Compte GitHub (gratuit) : https://github.com
- Compte Vercel (gratuit) : https://vercel.com

### Étapes

1. **Créez un repo GitHub** avec ce fichier :
   - `api/depute.js` ← le proxy
   - `package.json`

2. **Importez sur Vercel** :
   - Allez sur https://vercel.com/new
   - Cliquez "Import Git Repository"
   - Sélectionnez votre repo
   - Cliquez "Deploy" (aucune config nécessaire)

3. **Votre proxy est en ligne** à l'URL :
   ```
   https://votre-projet.vercel.app/api/depute?slug=marine-le-pen
   ```

4. **Testez** dans votre navigateur :
   ```
   https://votre-projet.vercel.app/api/depute?slug=gabriel-attal
   https://votre-projet.vercel.app/api/depute?slug=marine-le-pen&endpoint=votes/json
   ```

---

## 🐍 Option B — Python/FastAPI sur Render.com

### Prérequis
- Compte GitHub (gratuit)
- Compte Render (gratuit) : https://render.com

### Étapes

1. **Créez un repo GitHub** avec :
   - `python/main.py`
   - `requirements.txt` :
     ```
     fastapi>=0.110.0
     uvicorn>=0.27.0
     httpx>=0.26.0
     ```
   - `Procfile` :
     ```
     web: uvicorn python.main:app --host 0.0.0.0 --port $PORT
     ```

2. **Déployez sur Render** :
   - https://render.com/new → "Web Service"
   - Connectez votre repo GitHub
   - Runtime : Python 3
   - Build command : `pip install -r requirements.txt`
   - Start command : `uvicorn python.main:app --host 0.0.0.0 --port $PORT`
   - Cliquez "Deploy"

3. **Votre proxy est en ligne** à l'URL :
   ```
   https://votre-service.onrender.com/api/depute?slug=marine-le-pen
   ```

---

## 🔌 Intégration dans VoteCheck

Une fois votre proxy déployé, remplacez dans le code de l'application :

```javascript
// Avant (proxy public — instable)
const PROXY = 'https://corsproxy.io/?url=';

// Après (votre proxy — stable et gratuit)
const YOUR_PROXY = 'https://votre-projet.vercel.app/api/depute?slug=';

// Appel
const data = await fetch(YOUR_PROXY + 'marine-le-pen');
```

---

## 📊 Données disponibles via l'API

| Endpoint | Description |
|----------|-------------|
| `?slug={nom}` | Profil complet + stats d'activité |
| `?slug={nom}&endpoint=votes/json` | Historique des votes |
| `?slug={nom}&endpoint=amendements/json` | Amendements déposés |

### Slugs des candidats 2027
| Candidat | Slug |
|----------|------|
| Marine Le Pen | `marine-le-pen` |
| Gabriel Attal | `gabriel-attal` |
| Édouard Philippe | `edouard-philippe` |
| Jean-Luc Mélenchon | `jean-luc-melenchon` |
| Éric Ciotti | `eric-ciotti` |
| Sandrine Rousseau | `sandrine-rousseau` |

---

## ⚡ Limitations du plan gratuit

- **Vercel** : 100 Go/mois de bande passante, ~100 000 req/mois → largement suffisant
- **Render** : Le service s'endort après 15 min d'inactivité (plan gratuit) → peut causer un délai de 30s au premier appel. Solution : passer au plan Starter ($7/mois) ou utiliser un ping automatique.
- **Cache** : Le proxy met les réponses en cache 1h côté CDN Vercel — les votes ne changent pas à la minute, c'est suffisant.

---

## 🔒 Sécurité

- Les slugs sont validés (lettres, chiffres, tirets uniquement)
- Seuls les endpoints listés sont autorisés
- Aucune donnée personnelle n'est stockée
- Le proxy ne fait que transférer les données publiques de NosDéputés.fr