// api/stats.js
// Sert data/stats.json au frontend — aucune dépendance externe, 100% gratuit
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900'); // cache 15 min CDN Vercel
  try {
    const raw = readFileSync(join(__dirname, '../data/stats.json'), 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(raw);
  } catch {
    res.status(503).json({ error: 'Données pas encore synchronisées. Lancez le workflow GitHub Actions.' });
  }
}
