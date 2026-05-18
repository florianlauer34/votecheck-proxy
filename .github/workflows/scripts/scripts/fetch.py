import urllib.request, json, os, datetime

CANDIDATES = [
    ('mlp', 'marine-le-pen'),
    ('ga',  'gabriel-attal'),
    ('ep',  'edouard-philippe'),
    ('jlm', 'jean-luc-melenchon'),
    ('ec',  'eric-ciotti'),
    ('sr',  'sandrine-rousseau'),
]

results = {}

for cid, slug in CANDIDATES:
    print('Fetching ' + slug + '...')
    try:
        req = urllib.request.Request(
            'https://www.nosdeputes.fr/' + slug + '/json',
            headers={'User-Agent': 'Mozilla/5.0 (compatible; VoteCheck/1.0)'}
        )
        with urllib.request.urlopen(req, timeout=12) as r:
            print('  HTTP ' + str(r.status))
            data = json.loads(r.read().decode('utf-8'))
            d = data.get('depute', {})
            t = d.get('top', {})
            results[cid] = {
                'profil': {
                    'semaines_presence':    t.get('semaines_presence'),
                    'interventions':        t.get('hemicycle_interventions'),
                    'amendements_proposes': t.get('amendements_proposes'),
                    'questions_ecrites':    t.get('questions_ecrites'),
                    'groupe':               d.get('groupe_sigle'),
                    'ancien':               bool(d.get('ancien_depute', False)),
                },
                'votes': [],
                'fetched_at': datetime.datetime.utcnow().isoformat()
            }
            print('  OK - ' + str(d.get('groupe_sigle')))
    except Exception as e:
        print('  ERREUR: ' + str(e))
        results[cid] = {'profil': None, 'votes': [], 'error': str(e)}

os.makedirs('data', exist_ok=True)
with open('data/stats.json', 'w') as f:
    json.dump({'last_sync': datetime.datetime.utcnow().isoformat(), 'candidates': results}, f, indent=2)

print('stats.json OK')
