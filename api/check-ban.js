// ==========================================================================
// Vercel Serverless Function: Ban Enforcement Checker (/api/check-ban)
// Checks if caller's IP address or Discord ID is blacklisted on STRIKERS network
// ==========================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawForwarded = req.headers['x-forwarded-for'];
  const ip = (rawForwarded ? String(rawForwarded).split(',')[0].trim() : null) ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'Unknown IP';

  const cleanIp = String(ip).replace(/^::ffff:/, '').trim();
  const discordId = req.query.discordId ? String(req.query.discordId).trim() : '';

  const botCheckUrl = `https://strikerss-production.up.railway.app/api/security/check-ban?ip=${encodeURIComponent(cleanIp)}&discordId=${encodeURIComponent(discordId)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const botRes = await fetch(botCheckUrl, {
      signal: controller.signal,
      headers: {
        'x-forwarded-for': cleanIp
      }
    });
    clearTimeout(timeoutId);

    if (botRes.ok) {
      const data = await botRes.json();
      return res.status(200).json({
        banned: Boolean(data.banned),
        ip: cleanIp,
        reason: data.reason || 'Access denied by STRIKERS security protocol.'
      });
    }
  } catch (err) {
    // Railway bot timeout or error
  }

  return res.status(200).json({
    banned: false,
    ip: cleanIp
  });
}
