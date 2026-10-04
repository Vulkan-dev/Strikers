// ==========================================================================
// Vercel Serverless Function: Confirm DM Verification Code (/api/verify-code)
// Confirms 6-digit code with Discord Bot or direct HMAC validation
// ==========================================================================

import crypto from 'crypto';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.token || "";
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || "1553407415523999824";
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID || "1554580539082809490";
const AUTH_SECRET = process.env.AUTH_SECRET || "STR_CLAN_PORTAL_AUTH_SECRET_2026";
const DISCORD_EPOCH = 1420070400000n;

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

  const { discordId, code, challengeToken, mode } = req.body || {};
  if (!discordId || !code) {
    return res.status(400).json({ error: 'Discord ID and 6-digit verification code are required.' });
  }

  const rawForwarded = req.headers['x-forwarded-for'];
  const ip = (rawForwarded ? String(rawForwarded).split(',')[0].trim() : null) ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'Unknown IP';
  const cleanIp = String(ip).replace(/^::ffff:/, '').trim();
  const cleanUserId = String(discordId).replace(/^[@#]/, '').trim();
  const cleanCode = String(code).trim();

  // 1. Attempt Live Railway Bot Server (/api/clan/verify-code)
  const botApiUrl = process.env.RAILWAY_BOT_URL || 'https://strikerss-production.up.railway.app';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const botResp = await fetch(`${botApiUrl}/api/clan/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': cleanIp
      },
      body: JSON.stringify({ discordId: cleanUserId, code: cleanCode, mode }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = botResp.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await botResp.json();
      return res.status(botResp.status).json(data);
    }
  } catch (railwayErr) {
    console.warn('[VERIFY-CODE] Railway bot unavailable or timed out, executing direct validation fallback:', railwayErr.message);
  }

  // 2. Direct HMAC Challenge Token Validation Fallback
  try {
    if (!challengeToken) {
      return res.status(400).json({
        error: 'Verification session missing or expired. Please click "Change ID / Resend Code" to request a new code.'
      });
    }

    const parts = String(challengeToken).split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Malformed verification challenge token. Please request a new code.' });
    }

    const [tokenUserId, expStr, expectedHash] = parts;
    if (tokenUserId !== cleanUserId) {
      return res.status(400).json({ error: 'Verification token does not match the entered Discord ID.' });
    }

    const expiresAt = Number(expStr);
    if (Date.now() > expiresAt) {
      return res.status(400).json({ error: 'Verification code has expired (1 minute limit). Please request a new code.' });
    }

    const computedHash = crypto.createHmac('sha256', AUTH_SECRET)
      .update(`${cleanUserId}:${cleanCode}:${expStr}`)
      .digest('hex');

    if (computedHash !== expectedHash) {
      return res.status(400).json({ error: 'Incorrect 6-digit verification code. Please check your Discord Direct Messages.' });
    }

    // Code is Valid! Fetch Member Profile from Discord REST API
    let member = null;
    let user = null;

    const memResp = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${cleanUserId}`, {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'User-Agent': 'STRClanVerification/2.0'
      }
    });

    if (memResp.ok) {
      member = await memResp.json();
      user = member.user;
    } else {
      const userResp = await fetch(`https://discord.com/api/v10/users/${cleanUserId}`, {
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'User-Agent': 'STRClanVerification/2.0'
        }
      });
      if (userResp.ok) {
        user = await userResp.json();
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'Unable to retrieve Discord user profile.' });
    }

    // Calculate account age from snowflake
    const snowflake = BigInt(cleanUserId);
    const createdAtTimestamp = Number((snowflake >> 22n) + DISCORD_EPOCH);
    const createdAt = new Date(createdAtTimestamp);
    const diffTime = Math.max(0, Date.now() - createdAtTimestamp);
    const accountAgeDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const accountAgeMonths = parseFloat((accountAgeDays / 30.4375).toFixed(1));
    const isEligible = accountAgeDays >= 90;

    const memberRoles = Array.isArray(member?.roles) ? member.roles : [];
    const hasVerifiedRole = memberRoles.includes(VERIFIED_ROLE_ID);

    // Generate signed authToken
    const now = Date.now();
    const sigPayload = `${cleanUserId}:${user.username}:${now}`;
    const sig = crypto.createHmac('sha256', AUTH_SECRET).update(sigPayload).digest('hex');
    const authToken = Buffer.from(JSON.stringify({
      userId: cleanUserId,
      username: user.username,
      timestamp: now,
      sig
    })).toString('base64');

    // Build Avatar and Asset URLs
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${cleanUserId}/${user.avatar}.png?size=512`
      : `https://cdn.discordapp.com/embed/avatars/${Number((snowflake >> 22n) % 6n)}.png`;
    const bannerUrl = user.banner
      ? `https://cdn.discordapp.com/banners/${cleanUserId}/${user.banner}.png?size=1024`
      : null;
    const accentColor = user.accent_color
      ? `#${user.accent_color.toString(16).padStart(6, '0')}`
      : '#121212';

    return res.status(200).json({
      success: true,
      authToken,
      userProfile: {
        id: cleanUserId,
        discordId: cleanUserId,
        username: user.username,
        globalName: user.global_name || user.username,
        avatarUrl,
        bannerUrl,
        accentColor,
        createdAt: createdAt.toISOString(),
        accountAgeDays,
        accountAgeMonths,
        isEligible,
        inServer: true,
        hasVerifiedRole
      }
    });
  } catch (err) {
    console.error('[VERIFY-CODE FALLBACK ERROR]', err);
    return res.status(500).json({
      error: `Verification failed: ${err.message || 'Unknown error'}`
    });
  }
}

