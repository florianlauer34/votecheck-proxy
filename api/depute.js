// api/depute.js — Proxy gratuit vers NosDéputés.fr
// Déployez ce fichier sur Vercel (gratuit) pour contourner le CORS

export default async function handler(req, res) {
  // CORS headers — autoriser tous les origines (ou restreindre à votre domaine)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { slug, endpoint } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Paramètre "slug" requis. Ex: ?slug=marine-le-pen' });
  }

  // Endpoints supportés
  const ALLOWED_ENDPOINTS = ['json', 'votes/json', 'amendements/json'];
  const ep = endpoint || 'json';

  if (!ALLOWED_ENDPOINTS.includes(ep)) {
    return res.status(400).json({ error: `Endpoint non autorisé. Utilisez: ${ALLOWED_ENDPOINTS.join(', ')}` });
  }

  // Sécurité : slug ne doit contenir que des lettres, chiffres et tirets
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Slug invalide' });
  }

  const url = `https://www.nosdeputes.fr/${slug}/${ep}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'VoteCheck/1.0 (contact@votresite.fr)' }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `NosDéputés.fr a renvoyé ${response.status}` });
    }

    const data = await response.json();

    // Cache 1h côté CDN Vercel (les votes ne changent pas à la minute)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json(data);

  } catch (err) {
    console.error('[proxy error]', err.message);
    return res.status(500).json({ error: 'Erreur de connexion à NosDéputés.fr', detail: err.message });
  }
}