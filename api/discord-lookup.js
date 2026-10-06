// ==========================================================================
// Vercel Serverless Function: Discord User Profile & Legitimacy Resolver
// Snowflake epoch calculation & Discord REST API v10 Integration
// ==========================================================================

const DISCORD_EPOCH = 1420070400000n;

const BADGE_FLAGS = [
  { flag: 1 << 0, name: 'Discord Staff', icon: 'staff' },
  { flag: 1 << 1, name: 'Partnered Server Owner', icon: 'partner' },
  { flag: 1 << 2, name: 'HypeSquad Events', icon: 'hypesquad' },
  { flag: 1 << 3, name: 'Bug Hunter Level 1', icon: 'bughunter_1' },
  { flag: 1 << 6, name: 'HypeSquad Bravery', icon: 'bravery' },
  { flag: 1 << 7, name: 'HypeSquad Brilliance', icon: 'brilliance' },
  { flag: 1 << 8, name: 'HypeSquad Balance', icon: 'balance' },
  { flag: 1 << 9, name: 'Early Supporter', icon: 'early_supporter' },
  { flag: 1 << 14, name: 'Bug Hunter Level 2', icon: 'bughunter_2' },
  { flag: 1 << 17, name: 'Early Verified Bot Developer', icon: 'bot_dev' },
  { flag: 1 << 18, name: 'Discord Certified Moderator', icon: 'mod' },
  { flag: 1 << 22, name: 'Active Developer', icon: 'active_dev' }
];

function parseBadges(flags) {
  const badges = [];
  for (const b of BADGE_FLAGS) {
    if ((flags & b.flag) === b.flag) {
      badges.push({ name: b.name, icon: b.icon });
    }
  }
  return badges;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  let targetId = (id || '').trim();

  if (!targetId) {
    return res.status(400).json({ error: 'Please enter a Discord User ID or Username.' });
  }

  const rawToken = process.env.DISCORD_BOT_TOKEN || process.env.token || "";
  const botToken = String(rawToken).replace(/^["']|["']$/g, '').trim();
  const guildId = String(process.env.DISCORD_GUILD_ID || "1553407415523999824").replace(/^["']|["']$/g, '').trim();

  // Resolve Username to ID if not numeric
  if (!/^\d{17,20}$/.test(targetId)) {
    if (botToken && guildId) {
      try {
        const searchRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/search?query=${encodeURIComponent(targetId)}&limit=1`, {
          headers: {
            Authorization: `Bot ${botToken}`,
            'User-Agent': 'STRClanVerification/2.0'
          }
        });

        if (searchRes.ok) {
          const members = await searchRes.json();
          if (members && members.length > 0 && members[0].user) {
            targetId = members[0].user.id;
          }
        }
      } catch (err) {
        console.warn('Member search failed:', err);
      }
    }

    if (!/^\d{17,20}$/.test(targetId)) {
      return res.status(404).json({ error: 'User not found in the server by that username. Please enter your 17-20 digit Discord ID or ensure you have joined the server.' });
    }
  }

  try {
    const snowflakeBigInt = BigInt(targetId);
    const createdAtMs = Number((snowflakeBigInt >> 22n) + DISCORD_EPOCH);
    const createdAtDate = new Date(createdAtMs);
    const now = new Date();

    const ageMs = Math.max(0, now.getTime() - createdAtMs);
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    const ageMonths = Math.floor(ageDays / 30.4375);
    const isEligible = ageDays >= 90; // Minimum 3 months (90 days) rule

    // Default profile fallback
    const defaultAvatarIndex = Number((snowflakeBigInt >> 22n) % 6n);
    let profile = {
      id: targetId,
      username: `user_${targetId.slice(-4)}`,
      global_name: null,
      pronouns: null,
      avatar_url: `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`,
      avatar_decoration_url: null,
      banner_url: null,
      accent_color: '#1a1a1a',
      banner_color: '#121212',
      badges: [],
      created_at: createdAtDate.toISOString(),
      age_days: ageDays,
      age_months: ageMonths,
      is_eligible: isEligible,
      source: 'snowflake'
    };

    // If DISCORD_BOT_TOKEN is set, fetch full Discord user object via REST API v10
    if (botToken) {
      try {
        const discordRes = await fetch(`https://discord.com/api/v10/users/${targetId}`, {
          headers: {
            Authorization: `Bot ${botToken}`,
            'User-Agent': 'STRClanVerification/2.0'
          }
        });

        if (discordRes.ok) {
          const user = await discordRes.json();
          profile.username = user.username;
          profile.global_name = user.global_name || user.username;
          profile.discriminator = user.discriminator;

          if (user.avatar) {
            const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
            profile.avatar_url = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=512`;
          }

          if (user.avatar_decoration_data && user.avatar_decoration_data.asset) {
            profile.avatar_decoration_url = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png`;
          }

          if (user.banner) {
            const ext = user.banner.startsWith('a_') ? 'gif' : 'png';
            profile.banner_url = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${ext}?size=1024`;
          }

          if (user.accent_color) {
            profile.accent_color = '#' + user.accent_color.toString(16).padStart(6, '0');
          }
          if (user.banner_color) {
            profile.banner_color = user.banner_color;
          }

          profile.badges = parseBadges(user.public_flags || 0);
          profile.source = 'discord_api';
        }
      } catch (apiErr) {
        console.warn('Bot API lookup failed, using snowflake metadata:', apiErr.message);
      }
    }

    // Attach camelCase aliases for complete frontend compatibility
    profile.avatarUrl = profile.avatar_url;
    profile.bannerUrl = profile.banner_url;
    profile.decorationUrl = profile.avatar_decoration_url;
    profile.globalName = profile.global_name;
    profile.accountAgeDays = profile.age_days;
    profile.accountAgeMonths = profile.age_months;
    profile.isEligible = profile.is_eligible;

    return res.status(200).json(profile);
  } catch (err) {
    console.error('Error processing Discord lookup:', err);
    return res.status(500).json({ error: 'Failed to process Discord ID lookup.' });
  }
}
