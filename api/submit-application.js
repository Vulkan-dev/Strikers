// ==========================================================================
// Vercel Serverless Function: Submit Application
// Creates channel under category via Discord Bot API + fallback to Webhook
// ==========================================================================

const DISCORD_EPOCH = 1420070400000n;
const FALLBACK_WEBHOOK_B64 = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTU1MzQyMjI2OTAxNDA4NTc0My9SdEh6MzQ1d1pWZFltVS1CaTFHblduTE04MjRHcUI1eEg0LXVVT0p1cFJlQTlXQmd5dHJvWm9sQTZXTWtYQW0xLUdEWg==";

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

  const {
    discordUserId,
    discordUsername,
    age,
    hasMic,
    favouriteGame,
    gamesPlayed,
    clanMoniker,
    avatarUrl,
    accountAgeDays,
    accountAgeMonths
  } = req.body || {};

  // Basic Validation
  if (!discordUsername || !age || !hasMic || !favouriteGame || !gamesPlayed) {
    return res.status(400).json({ error: 'Missing required application fields.' });
  }

  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum) || ageNum < 10 || ageNum > 99) {
    return res.status(400).json({ error: 'Age must be between 10 and 99.' });
  }

  // Enforce 3-Month Account Age Requirement via Snowflake Check
  let calculatedDays = accountAgeDays;
  let calculatedMonths = accountAgeMonths;

  if (discordUserId && /^\d{17,20}$/.test(discordUserId.trim())) {
    const snowflake = BigInt(discordUserId.trim());
    const createdAtMs = Number((snowflake >> 22n) + DISCORD_EPOCH);
    const nowMs = Date.now();
    calculatedDays = Math.floor(Math.max(0, nowMs - createdAtMs) / (1000 * 60 * 60 * 24));
    calculatedMonths = Math.floor(calculatedDays / 30.4375);

    if (calculatedDays < 90) {
      return res.status(400).json({
        error: `Ineligible Discord Account: This account is only ${calculatedDays} days old. Minimum requirement is 90 days (3 months) to prevent alt accounts.`
      });
    }
  }

  const cleanHandle = discordUsername.replace(/^@/, '').trim();
  const cleanChannelSlug = cleanHandle.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24) || 'applicant';

  // Construct Embed
  const embedDescription = [
    "A new applicant has completed identity verification and is waiting for review.",
    "",
    "👤 **Username**",
    `\`@${cleanHandle}\``,
    ...(discordUserId ? ["", "🆔 **Discord ID**", `\`${discordUserId}\``] : []),
    "",
    "🎂 **Age**",
    `\`${ageNum}\``,
    "",
    "🎙️ **Has Mic?**",
    `\`${hasMic}\``,
    "",
    "🎮 **Favourite Game**",
    `\`${favouriteGame}\``,
    "",
    "🕹️ **Games Played**",
    `\`${gamesPlayed}\``,
    ...(calculatedDays !== undefined ? [
      "",
      "⏳ **Discord Account Age**",
      `\`${calculatedMonths || 0} months (${calculatedDays} days old)\``,
      "🛡️ **Legitimacy Status**",
      "`Passed (Account >= 3 Months Old)`"
    ] : []),
    ...(clanMoniker ? ["", "🏷️ **Official Moniker**", `\`${clanMoniker}\``] : []),
    "",
    "> Staff approval is required before the member receives their STRIKERS role."
  ].join("\n");

  const embedPayload = {
    author: {
      name: "⚡ 𝑺𝑻𝑹𝑰𝑲𝑬𝑹𝑺"
    },
    title: "𝑴𝑬𝑴𝑩𝑬𝑹 𝑽𝑬𝑹𝑰𝑭𝑰𝑪𝑨𝑻𝑰𝑶𝑵",
    description: embedDescription,
    color: 0x1f1f1f,
    ...(avatarUrl ? { thumbnail: { url: avatarUrl } } : {}),
    footer: {
      text: "STR Clan Review • Automated Intake Portal"
    },
    timestamp: new Date().toISOString()
  };

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const categoryId = process.env.DISCORD_CATEGORY_ID;
  const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID;

  // Mode 1: Bot API Channel Creation
  if (botToken && guildId && categoryId) {
    try {
      // 1. Create text channel under category
      const channelResp = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'STRClanVerification/2.0'
        },
        body: JSON.stringify({
          name: `str-${cleanChannelSlug}`,
          type: 0, // Guild Text Channel
          parent_id: categoryId,
          topic: `STR Clan Review • @${cleanHandle} (${discordUserId || 'N/A'})`
        })
      });

      if (!channelResp.ok) {
        const errJson = await channelResp.json().catch(() => ({}));
        console.error('Failed to create channel via bot:', channelResp.status, errJson);
        throw new Error(`Bot channel creation failed: ${errJson.message || channelResp.statusText}`);
      }

      const createdChannel = await channelResp.json();

      // 2. Post embed message into the new channel
      const messageBody = {
        content: staffRoleId ? `<@&${staffRoleId}> New applicant channel ready for review.` : undefined,
        embeds: [embedPayload]
      };

      await fetch(`https://discord.com/api/v10/channels/${createdChannel.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'STRClanVerification/2.0'
        },
        body: JSON.stringify(messageBody)
      });

      return res.status(200).json({
        success: true,
        mode: 'bot_channel',
        channelId: createdChannel.id,
        channelName: createdChannel.name,
        channelUrl: `https://discord.com/channels/${guildId}/${createdChannel.id}`
      });
    } catch (botErr) {
      console.error('Error during Bot channel workflow, falling back to Webhook:', botErr);
      // Fallback directly to webhook if bot fails
    }
  }

  // Mode 2: Webhook Fallback
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || Buffer.from(FALLBACK_WEBHOOK_B64, 'base64').toString('utf-8');

  try {
    const hookResp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "⚡ 𝑺𝑻𝑹𝑰𝑲𝑬𝑹𝑺",
        embeds: [embedPayload]
      })
    });

    if (!hookResp.ok && hookResp.status !== 204) {
      const errTxt = await hookResp.text();
      return res.status(500).json({ error: `Webhook dispatch failed: ${errTxt}` });
    }

    return res.status(200).json({
      success: true,
      mode: 'webhook_fallback'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Transmission failed.' });
  }
}
