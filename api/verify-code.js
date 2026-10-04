// ==========================================================================
// Vercel Serverless Function: Confirm DM Verification Code (/api/verify-code)
// Confirms 6-digit code with Discord Bot and returns verified profile & auth token
// ==========================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { discordId, code } = req.body || {};
  if (!discordId || !code) {
    return res.status(400).json({ error: 'Discord ID and 6-digit verification code are required.' });
  }

  const rawForwarded = req.headers['x-forwarded-for'];
  const ip = (rawForwarded ? String(rawForwarded).split(',')[0].trim() : null) ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'Unknown IP';
  const cleanIp = String(ip).replace(/^::ffff:/, '').trim();

  const botApiUrl = process.env.RAILWAY_BOT_URL || 'https://strikerss-production.up.railway.app';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const botResp = await fetch(`${botApiUrl}/api/clan/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': cleanIp
      },
      body: JSON.stringify({ discordId, code }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await botResp.json();
    return res.status(botResp.status).json(data);
  } catch (err) {
    console.error('[VERIFY-CODE API ERROR]', err);
    return res.status(503).json({
      error: 'Backend authentication server is currently unreachable. Please try again in a few moments.'
    });
  }
}
