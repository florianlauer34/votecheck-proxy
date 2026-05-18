# VoteCheck — Architecture 100% gratuite

## Schéma de fonctionnement

```
GitHub Actions (cron 6h/jour — GRATUIT)
  → node scripts/fetch-stats.mjs
  → fetch nosdeputes.fr  ← IPs GitHub, non bloquées
  → commit data/stats.json dans le repo
         ↓
Vercel détecte le nouveau commit → redéploie auto
         ↓
api/stats.js sert le JSON au frontend
         ↓
VoteCheck affiche les vraies stats en temps réel
```

## Coût total : 0 €

| Service         | Usage                        | Prix    |
|-----------------|------------------------------|---------|
| GitHub          | Actions + repo               | Gratuit |
| Vercel          | Hosting + API                | Gratuit |
| NosDéputés.fr   | Données votes (open data)    | Gratuit |

## Setup (5 min)

1. **Copier ces fichiers** dans votre repo GitHub (à la racine)

2. **Aller dans GitHub → Actions → "Sync stats NosDéputés.fr" → Run workflow**
   - Vérifie que `data/stats.json` se remplit
   - Vercel redéploie automatiquement

3. **Tester** : `https://votre-site.vercel.app/api/stats`

C'est tout. Aucune variable d'environnement. Aucune clé API. Rien.

## Fréquence de mise à jour

- Stats automatiques : tous les jours à 6h UTC
- Analyse éditoriale : mise à jour manuelle via Claude.ai (gratuit)

## Ajouter un candidat

Ouvrir `scripts/fetch-stats.mjs` et ajouter une ligne dans `CANDIDATES`.
