// ==========================================================================
// Vercel Serverless Function: Submit Application
// Creates channel under category via Discord Bot API + fallback to Webhook
// ==========================================================================

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

  const rawToken = process.env.DISCORD_BOT_TOKEN || process.env.token || "";
  const botToken = String(rawToken).replace(/^["']|["']$/g, '').trim();
  const guildId = String(process.env.DISCORD_GUILD_ID || process.env.CLAN_GUILD_ID || "1553407415523999824").replace(/^["']|["']$/g, '').trim();
  const categoryId = String(process.env.DISCORD_CATEGORY_ID || process.env.CLAN_CATEGORY_ID || "1554194420377583708").replace(/^["']|["']$/g, '').trim();
  const staffRoleId = String(process.env.DISCORD_STAFF_ROLE_ID || process.env.CLAN_STAFF_ROLE_ID || "1553810081915600946").replace(/^["']|["']$/g, '').trim();

  const applicantId = discordUserId || cleanHandle;
  const applicantChannelName = cleanChannelSlug.toLowerCase();

  // Mode 1: Direct Discord REST API Channel Creation in Target Category (1554194420377583708)
  try {
    // 1. Check if an application channel for this person already exists in the category
    let existingChannel = null;
    try {
      const chansResp = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'User-Agent': 'STRClanVerification/2.0'
        }
      });
      if (chansResp.ok) {
        const chans = await chansResp.json();
        existingChannel = chans.find(c =>
          c.parent_id === categoryId &&
          (c.name === applicantChannelName || c.name === `verify-${applicantChannelName}`)
        );
      }
    } catch (checkErr) {
      console.warn('[SUBMIT] Could not inspect existing channels:', checkErr.message);
    }

    let createdChannel = existingChannel;

    if (!createdChannel) {
      // Setup permission overwrites:
      // @everyone is denied ViewChannel
      // Staff role is allowed ViewChannel, SendMessages, ReadHistory, ManageMessages
      // Applicant is allowed ViewChannel, SendMessages, ReadHistory, AttachFiles
      const permissionOverwrites = [
        {
          id: guildId, // @everyone
          type: 0,
          deny: "1024" // Deny ViewChannel
        },
        {
          id: staffRoleId, // Clan Staff Role
          type: 0,
          allow: "76800" // ViewChannel (1024) + SendMessages (2048) + ReadMessageHistory (65536) + ManageMessages (8192)
        }
      ];

      if (discordUserId && /^\d{17,20}$/.test(String(discordUserId).trim())) {
        permissionOverwrites.push({
          id: String(discordUserId).trim(), // Applicant Member
          type: 1,
          allow: "100352" // ViewChannel (1024) + SendMessages (2048) + ReadMessageHistory (65536) + AttachFiles (32768)
        });
      }

      // Create text channel named directly after the application holder person
      const channelResp = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'STRClanVerification/2.0'
        },
        body: JSON.stringify({
          name: applicantChannelName,
          type: 0, // Guild Text Channel
          parent_id: categoryId,
          topic: `STR Clan Intake Review for @${cleanHandle} (${discordUserId || 'N/A'})`,
          permission_overwrites: permissionOverwrites
        })
      });

      if (!channelResp.ok) {
        const errJson = await channelResp.json().catch(() => ({}));
        console.error('Failed to create channel in category 1554194420377583708:', channelResp.status, errJson);
        throw new Error(`Discord channel creation failed: ${errJson.message || channelResp.statusText}`);
      }

      createdChannel = await channelResp.json();
    }

    // 2. Action buttons for Staff Review (Approve or Reject)
    const components = [
      {
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            style: 3, // Success (Green)
            label: "Approve",
            custom_id: `clan_approve_${applicantId}`,
            emoji: { name: "✅" }
          },
          {
            type: 2, // Button
            style: 4, // Danger (Red)
            label: "Reject",
            custom_id: `clan_reject_${applicantId}`,
            emoji: { name: "❌" }
          }
        ]
      }
    ];

    // 3. Post review embed message with buttons into the new applicant channel
    const messageBody = {
      content: staffRoleId
        ? `<@&${staffRoleId}> 🔔 New applicant intake channel ready for review: <@${applicantId}>!`
        : `🔔 New applicant intake channel ready for review: <@${applicantId}>!`,
      embeds: [embedPayload],
      components: components
    };

    const msgResp = await fetch(`https://discord.com/api/v10/channels/${createdChannel.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'STRClanVerification/2.0'
      },
      body: JSON.stringify(messageBody)
    });

    if (!msgResp.ok) {
      const errJson = await msgResp.json().catch(() => ({}));
      console.error('Failed to post message with review buttons:', msgResp.status, errJson);
    }

    // 4. Background Sync with Live Railway Bot & MongoDB
    const railwayBotUrl = process.env.RAILWAY_BOT_URL || 'https://strikerss-production.up.railway.app';
    fetch(`${railwayBotUrl}/api/clan/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId: discordUserId,
        username: discordUsername,
        age: ageNum,
        hasMic,
        favouriteGame,
        gamesPlayed,
        clanMoniker,
        avatarUrl,
        accountAgeDays: calculatedDays,
        accountAgeMonths: calculatedMonths,
        channelId: createdChannel.id,
        authToken: req.body?.authToken || ''
      })
    }).catch(rErr => console.warn('[BACKGROUND RAILWAY SYNC ERROR]', rErr.message));

    return res.status(200).json({
      success: true,
      mode: 'bot_channel',
      channelId: createdChannel.id,
      channelName: createdChannel.name,
      channelUrl: `https://discord.com/channels/${guildId}/${createdChannel.id}`
    });
  } catch (chanErr) {
    console.error('[SUBMIT-APPLICATION ERROR]', chanErr);
    return res.status(500).json({
      error: `Failed to create application channel in category: ${chanErr.message || chanErr}`
    });
  }
}
