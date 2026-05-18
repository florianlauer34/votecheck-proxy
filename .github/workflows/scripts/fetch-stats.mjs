// scripts/fetch-stats.mjs
// Tourne dans GitHub Actions (IPs non bloquées par nosdeputes.fr)
// Récupère les stats d'activité de chaque candidat
// Sauvegarde dans data/stats.json → commité dans le repo → Vercel se redéploie

import fs from 'fs';

const CANDIDATES = [
  { id: 'mlp', nom: 'Marine Le Pen',       slug: 'marine-le-pen'      },
  { id: 'ga',  nom: 'Gabriel Attal',        slug: 'gabriel-attal'      },
  { id: 'ep',  nom: 'Édouard Philippe',     slug: 'edouard-philippe'   },
  { id: 'jlm', nom: 'Jean-Luc Mélenchon',  slug: 'jean-luc-melenchon' },
  { id: 'ec',  nom: 'Éric Ciotti',          slug: 'eric-ciotti'        },
  { id: 'sr',  nom: 'Sandrine Rousseau',    slug: 'sandrine-rousseau'  },
];

async function fetchProfil(slug) {
  const res = await fetch(`https://www.nosdeputes.fr/${slug}/json`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VoteCheck/1.0)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { depute: d } = await res.json();
  const t = d?.top || {};
  return {
    semaines_presence:    t.semaines_presence    ?? null,
    interventions:        t.hemicycle_interventions ?? null,
    amendements_proposes: t.amendements_proposes ?? null,
    amendements_adoptes:  t.amendements_adoptes  ?? null,
    questions_ecrites:    t.questions_ecrites    ?? null,
    groupe:               d?.groupe_sigle        ?? null,
    ancien:               !!d?.ancien_depute,
  };
}

async function fetchVotes(slug) {
  const res = await fetch(`https://www.nosdeputes.fr/${slug}/votes/json`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VoteCheck/1.0)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.votes || []).slice(0, 10).map(v => ({
    titre:    v.scrutin?.titre || v.titre || '—',
    date:     v.scrutin?.date  || v.date  || '',
    position: v.position || v.vote || 'absent',
  }));
}

const results = {};

for (const c of CANDIDATES) {
  console.log(`Fetching ${c.nom}…`);
  try {
    const [profil, votes] = await Promise.all([
      fetchProfil(c.slug).catch(() => null),
      fetchVotes(c.slug).catch(() => []),
    ]);
    results[c.id] = { profil, votes, fetched_at: new Date().toISOString() };
    console.log(`  ✅ profil=${!!profil} votes=${votes.length}`);
  } catch (e) {
    results[c.id] = { profil: null, votes: [], fetched_at: null, error: e.message };
    console.log(`  ❌ ${e.message}`);
  }
}

const output = { last_sync: new Date().toISOString(), candidates: results };
fs.writeFileSync('data/stats.json', JSON.stringify(output, null, 2));
console.log('\n✅ data/stats.json mis à jour');
