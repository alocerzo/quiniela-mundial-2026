const GS_URL = 'https://script.google.com/macros/s/AKfycbzCv385wv9jK4sGUOaBGBQpgxZV4USq0x-DFPRSKYXpwOgGeYYCizpJFuR2PVJPfl6AUg/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, bin } = req.query;
    let gsRes;

    if (action === 'get') {
      gsRes = await fetch(`${GS_URL}?action=get&bin=${bin}&t=${Date.now()}`);
    } else if (action === 'set') {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      gsRes = await fetch(`${GS_URL}?action=set&bin=${bin}`, {
        method: 'POST',
        body: body
      });
    } else if (action === 'patch') {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      gsRes = await fetch(`${GS_URL}?action=patch&bin=${bin}&data=${encodeURIComponent(body)}`);
    } else {
      return res.status(400).json({ error: 'unknown action' });
    }

    const text = await gsRes.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(text);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
