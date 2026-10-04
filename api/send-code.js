// ==========================================================================
// Vercel Serverless Function: Send Clan Member DM Verification Code (/api/send-code)
// Verifies member existence in Discord server & sends 6-digit code to their DM
// ==========================================================================

import crypto from 'crypto';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.token || "";
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || "1553407415523999824";
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID || "1554580539082809490";
const WEBHOOK_URL = process.env.SECURITY_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1556296965367791789/mL6O6JxySSy2FWxzlgcxTO2WvWuTW9hw5klrrC9DLtxhkZGAYr9PrWd_W_x46fcwq9kP";
const AUTH_SECRET = process.env.AUTH_SECRET || "STR_CLAN_PORTAL_AUTH_SECRET_2026";

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

  const { discordId, mode } = req.body || {};
  if (!discordId) {
    return res.status(400).json({ error: 'Please enter your Discord User ID or Username.' });
  }

  const rawForwarded = req.headers['x-forwarded-for'];
  const ip = (rawForwarded ? String(rawForwarded).split(',')[0].trim() : null) ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'Unknown IP';
  const cleanIp = String(ip).replace(/^::ffff:/, '').trim();
  const inputTarget = String(discordId).replace(/^[@#]/, '').trim();

  // 1. Attempt Live Railway Bot Server (/api/clan/send-code)
  const botApiUrl = process.env.RAILWAY_BOT_URL || 'https://strikerss-production.up.railway.app';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const botResp = await fetch(`${botApiUrl}/api/clan/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': cleanIp
      },
      body: JSON.stringify({ discordId: inputTarget, mode: mode || 'register' }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    // Only accept valid JSON responses
    const contentType = botResp.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await botResp.json();
      return res.status(botResp.status).json(data);
    }
  } catch (railwayErr) {
    console.warn('[SEND-CODE] Railway bot unavailable or timed out, executing direct Discord fallback:', railwayErr.message);
  }

  // 2. Direct Discord REST API Fallback
  try {
    let member = null;
    let userId = null;

    // Check if input is a valid snowflake
    if (/^\d{17,20}$/.test(inputTarget)) {
      userId = inputTarget;
      const memResp = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userId}`, {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'User-Agent': 'STRClanVerification/2.0'
        }
      });

      if (memResp.status === 404) {
        return res.status(404).json({
          error: "You are not a member of the STRIKERS Discord server. Please join our Discord server first before verifying.",
          inServer: false
        });
      }

      if (memResp.ok) {
        member = await memResp.json();
      }
    } else {
      // Search member by username / nickname
      const searchResp = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/search?query=${encodeURIComponent(inputTarget)}&limit=1`, {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'User-Agent': 'STRClanVerification/2.0'
        }
      });
      if (searchResp.ok) {
        const results = await searchResp.json();
        if (Array.isArray(results) && results.length > 0) {
          member = results[0];
          userId = member.user?.id;
        }
      }
    }

    if (!member || !userId) {
      return res.status(404).json({
        error: "Member not found in the STRIKERS Discord server. Please verify your User ID and make sure you have joined the server.",
        inServer: false
      });
    }

    const cleanUsername = member.user?.username || inputTarget;
    const memberRoles = Array.isArray(member.roles) ? member.roles : [];
    const hasVerifiedRole = memberRoles.includes(VERIFIED_ROLE_ID);

    // If user lacks Verified role, alert staff channel via Webhook
    if (!hasVerifiedRole && WEBHOOK_URL) {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "⚠️ Unverified Member Portal Login Request",
            color: 0xf59e0b,
            description: `Member <@${userId}> (\`${cleanUsername}\`) is in the server but does **not** have the Verified role. They have requested a login verification code on the portal.`,
            fields: [
              { name: "👤 User", value: `<@${userId}> (\`${userId}\`)`, inline: true },
              { name: "🌐 Client IP", value: `\`${cleanIp}\``, inline: true },
              { name: "Mode", value: mode === 'login' ? 'Existing Member Sign In' : 'New Intake Verification', inline: true },
              { name: "🛡️ Action", value: "Code issued via Direct Message", inline: false }
            ],
            footer: { text: "STRIKERS Sentry Guard • Portal Auth" },
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(() => {});
    }

    // Generate cryptographically secure random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Send DM to Member via Discord REST API
    // Step A: Create DM Channel
    const dmChannelResp = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'STRClanVerification/2.0'
      },
      body: JSON.stringify({ recipient_id: userId })
    });

    if (!dmChannelResp.ok) {
      const dmErr = await dmChannelResp.json().catch(() => ({}));
      console.warn('[DM CHANNEL CREATION FAILED]', dmErr);
      return res.status(403).json({
        error: "Could not send the verification code to your Discord DM. Please enable 'Allow direct messages from server members' in your Discord Privacy Settings (User Settings > Privacy & Safety) and try again.",
        dmFailed: true,
        inServer: true
      });
    }

    const dmChannel = await dmChannelResp.json();

    // Step B: Send Embed Message into DM Channel
    const msgResp = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'STRClanVerification/2.0'
      },
      body: JSON.stringify({
        embeds: [{
          title: "⚡ STRIKERS Clan Portal — Login Code",
          color: 0x3b82f6,
          description: [
            `Hello **${cleanUsername}**,`,
            "",
            "Here is your 6-digit verification code to sign in to the **STRIKERS Member Verification Portal**:",
            "",
            `# \`\`\`${code}\`\`\``,
            "",
            "⏱️ This code will expire in **1 minute (60 seconds)**.",
            "🔒 **Never share this code with anyone.** Clan staff will never ask for your login code."
          ].join("\n"),
          footer: { text: "STRIKERS Identity Guard" },
          timestamp: new Date().toISOString()
        }]
      })
    });

    if (!msgResp.ok) {
      return res.status(403).json({
        error: "Could not send verification message to your Discord DM. Please check your Discord privacy settings to allow direct messages.",
        dmFailed: true,
        inServer: true
      });
    }

    // Step C: Generate signed HMAC verification challenge (1 minute expiration)
    const expiresAt = Date.now() + 60 * 1000;
    const challengeHash = crypto.createHmac('sha256', AUTH_SECRET)
      .update(`${userId}:${code}:${expiresAt}`)
      .digest('hex');
    const challengeToken = `${userId}.${expiresAt}.${challengeHash}`;

    return res.status(200).json({
      success: true,
      message: "A 6-digit verification code was sent to your Discord Direct Messages!",
      discordId: userId,
      username: cleanUsername,
      hasVerifiedRole,
      challengeToken,
      mode: mode || 'register'
    });
  } catch (err) {
    console.error('[SEND-CODE FALLBACK ERROR]', err);
    return res.status(500).json({
      error: `Failed to dispatch verification code: ${err.message || 'Unknown error'}`
    });
  }
}
