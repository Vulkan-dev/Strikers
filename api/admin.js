// ==========================================================================
// Vercel Serverless Function: Honeypot Ban Route (/api/admin)
// Captures unauthorized probes, reports to Discord Webhook, and triggers Bot Ban
// ==========================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawForwarded = req.headers['x-forwarded-for'];
  const ip = (rawForwarded ? String(rawForwarded).split(',')[0].trim() : null) ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'Unknown IP';

  const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';
  const { discordId, username, incidentId } = req.body || {};
  const incId = incidentId || ('SEC-' + Math.random().toString(36).substring(2, 9).toUpperCase());

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL ||
    'https://discord.com/api/webhooks/1556030068856328192/s_DOqvcXHmRnjSQcR-VHBYbvbN4vg-l7SPMIezwGnyXVYy2WDLGNMqS7rlsM-52k1hyd';

  const botApiUrl = 'https://strikerss-production.up.railway.app/api/security/honeypot-ban';

  // 1. Forward Ban Request to Railway Bot API
  try {
    await fetch(botApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId,
        username,
        ip,
        userAgent,
        path: '/admin',
        incidentId: incId
      }),
      signal: AbortSignal.timeout(4000)
    }).catch(err => console.error('[BOT HONEYPOT FORWARD ERROR]', err));
  } catch (e) {}

  // 2. Send Direct Discord Webhook Notification
  try {
    const embed = {
      title: "🚨 HONEYPOT TRIGGERED: Unauthorized Admin Probe",
      color: 0xef4444,
      description: "**Intrusion detected on `/admin` endpoint!**\nImmediate ban sequence executed.",
      fields: [
        {
          name: "👤 Discord User",
          value: discordId ? `<@${discordId}> (\`${username || 'Unknown'}\` / \`${discordId}\`)` : "*Anonymous Intruder (No session stored)*",
          inline: false
        },
        {
          name: "🌐 IP Address",
          value: `\`${ip}\``,
          inline: true
        },
        {
          name: "📍 Target Route",
          value: "`https://strikers-cyan.vercel.app/admin`",
          inline: true
        },
        {
          name: "🆔 Incident ID",
          value: `\`${incId}\``,
          inline: true
        },
        {
          name: "🛡️ Action Taken",
          value: "⛔ **BANNED & BLACKLISTED**",
          inline: false
        },
        {
          name: "🖥️ User Agent",
          value: `\`${userAgent.slice(0, 160)}\``,
          inline: false
        }
      ],
      footer: {
        text: "STRIKERS Sentry Engine"
      },
      timestamp: new Date().toISOString()
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "⚠️ **HONEYPOT ALERT**: Unauthorized access attempt on `/admin` detected!",
        embeds: [embed]
      }),
      signal: AbortSignal.timeout(4000)
    }).catch(err => console.error('[HONEYPOT WEBHOOK ERROR]', err));
  } catch (e) {}

  return res.status(403).json({
    error: "403 Forbidden - Honeypot Triggered",
    incidentId: incId,
    ip: ip,
    status: "PERMANENTLY_BANNED"
  });
}
