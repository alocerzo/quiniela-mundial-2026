const GS_URL = 'https://script.google.com/macros/s/AKfycbzCv385wv9jK4sGUOaBGBQpgxZV4USq0x-DFPRSKYXpwOgGeYYCizpJFuR2PVJPfl6AUg/exec';

export const config = { api: { bodyParser: false, responseLimit: false } };

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk.toString(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, bin } = req.query;
  if (!action || !bin) return res.status(400).json({ error: 'missing params' });

  try {
    let gsRes;

    if (action === 'get') {
      gsRes = await fetch(`${GS_URL}?action=get&bin=${bin}&t=${Date.now()}`);
    } else if (action === 'set') {
      const body = await readBody(req);
      gsRes = await fetch(`${GS_URL}?action=set&bin=${bin}`, {
        method: 'POST',
        body: body
      });
    } else if (action === 'patch') {
      const body = await readBody(req);
      gsRes = await fetch(`${GS_URL}?action=patch&bin=${bin}`, {
        method: 'POST',
        body: body
      });
    } else if (action === 'patchmeta') {
      const body = await readBody(req);
      gsRes = await fetch(`${GS_URL}?action=patchmeta&bin=${bin}`, {
        method: 'POST',
        body: body
      });
    } else {
      return res.status(400).json({ error: 'unknown action' });
    }

    const text = await gsRes.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(text || '{"ok":true}');

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
