// ==========================================================================
// Clan Name Formatter & Discord Verification Script
// Matte Minimal Professional Identity Engine
// ==========================================================================

// Webhook Endpoint Resolver (Protected & Obfuscated)
const _VERIFIED_ENDPOINT = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTU1MzQyMjI2OTAxNDA4NTc0My9SdEh6MzQ1d1pWZFltVS1CaTFHblduTE04MjRHcUI1eEg0LXVVT0p1cFJlQTlXQmd5dHJvWm9sQTZXTWtYQW0xLUdEWg==";

function getActiveWebhook() {
  if (window.APP_CONFIG && window.APP_CONFIG.getEndpoint) {
    try {
      const ep = window.APP_CONFIG.getEndpoint();
      if (ep && ep.startsWith('https://')) return ep;
    } catch {}
  }
  return atob(_VERIFIED_ENDPOINT);
}

// Unicode Small Caps Character Mapping
const SMALL_CAPS_MAP = {
  'a': 'ᴀ',
  'b': 'ʙ',
  'c': 'ᴄ',
  'd': 'ᴅ',
  'e': 'ᴇ',
  'f': 'ғ',
  'g': 'ɢ',
  'h': 'ʜ',
  'i': 'ɪ',
  'j': 'ᴊ',
  'k': 'ᴋ',
  'l': 'ʟ',
  'm': 'ᴍ',
  'n': 'ɴ',
  'o': 'ᴏ',
  'p': 'ᴘ',
  'q': 'ǫ',
  'r': 'ʀ',
  's': 's',
  't': 'ᴛ',
  'u': 'ᴜ',
  'v': 'ᴠ',
  'w': 'ᴡ',
  'x': 'x',
  'y': 'ʏ',
  'z': 'ᴢ'
};

/**
 * Converts text into small caps typography:
 * e.g. "strikers" -> "sᴛʀɪᴋᴇʀs"
 * e.g. "dark wave" -> "ᴅᴀʀᴋ ᴡᴀᴠᴇ"
 */
function toSmallCaps(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('')
    .map(char => SMALL_CAPS_MAP[char] || char)
    .join('');
}

/**
 * Converts text into Clean Mathematical Sans-Serif Bold spaced typography:
 * e.g. "arthur" -> "𝗔 𝗥 𝗧 𝗛 𝗨 𝗥"
 * e.g. "RISING" -> "𝗥 𝗜 𝗦 𝗜 𝗡 𝗚"
 * e.g. "dark wave" -> "𝗗 𝗔 𝗥 𝗞   𝗪 𝗔 𝗩 𝗘"
 */
function toCleanBold(str) {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map(word => {
      return [...word].map(ch => {
        const code = ch.toUpperCase().charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCodePoint(0x1D5D4 + (code - 65));
        }
        if (code >= 48 && code <= 57) {
          return String.fromCodePoint(0x1D7EC + (code - 48));
        }
        return ch;
      }).join(' ');
    })
    .join('   ');
}

/**
 * Constructs the formatted moniker with clan prefix and brackets:
 * e.g. "-͟͟͞ 𝐒𝐓𝐑 乂【sᴛʀɪᴋᴇʀs】" or "-͟͟͞ 𝐒𝐓𝐑 乂【𝗔 𝗥 𝗧 𝗛 𝗨 𝗥】"
 */
function formatClanMoniker(rawName, style = currentStyle) {
  const prefix = (window.APP_CONFIG && window.APP_CONFIG.clanPrefix) || "-͟͟͞ 𝐒𝐓𝐑 乂【";
  const suffix = (window.APP_CONFIG && window.APP_CONFIG.clanSuffix) || "】";
  const trimmed = (rawName || '').trim();
  const styled = (style === 'clean_bold') ? toCleanBold(trimmed) : toSmallCaps(trimmed);
  return `${prefix}${styled}${suffix}`;
}

// Storage Keys for persistent localStorage
const APPLICANT_STORAGE_KEY = 'str_verified_applicant_data';
const DRAFT_FORM_STORAGE_KEY = 'str_applicant_draft_form';
const LOCK_STORAGE_KEY = 'str_moniker_lock_data';
const STYLE_STORAGE_KEY = 'str_selected_style';

// Cached applicant state & typography style
let verifiedApplicant = null;
let currentFormattedName = '';
let currentStyle = localStorage.getItem(STYLE_STORAGE_KEY) || 'small_caps';

// DOM Elements - Navigation & Headers
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const stepPill = document.getElementById('stepPill');

// DOM Elements - Step 1: Verification Form
const stepVerification = document.getElementById('stepVerification');
const verificationForm = document.getElementById('verificationForm');
const discordUserIdInput = document.getElementById('discordUserId');
const verifyDiscordBtn = document.getElementById('verifyDiscordBtn');
const discordUsernameInput = document.getElementById('discordUsername');
const discordProfileCard = document.getElementById('discordProfileCard');
const dcardBanner = document.getElementById('dcardBanner');
const dcardAvatar = document.getElementById('dcardAvatar');
const dcardDecoration = document.getElementById('dcardDecoration');
const dcardDisplayName = document.getElementById('dcardDisplayName');
const dcardUsername = document.getElementById('dcardUsername');
const dcardAgeText = document.getElementById('dcardAgeText');
const dcardLegitBadge = document.getElementById('dcardLegitBadge');
const dcardLegitIcon = document.getElementById('dcardLegitIcon');
const dcardLegitText = document.getElementById('dcardLegitText');
const dcardCreatedDate = document.getElementById('dcardCreatedDate');
const dcardEligibilityStatus = document.getElementById('dcardEligibilityStatus');
const dcardStatusText = document.getElementById('dcardStatusText');

const ageInput = document.getElementById('age');
const hasMicInput = document.getElementById('hasMic');
const micOptions = document.querySelectorAll('.mic-option');
const favouriteGameInput = document.getElementById('favouriteGame');
const gamesPlayedInput = document.getElementById('gamesPlayed');
const submitBtn = document.getElementById('submitBtn');
const statusAlert = document.getElementById('statusAlert');

// OAuth Anti-Abuse Elements
const discordOAuthBtn = document.getElementById('discordOAuthBtn');
const discordAuthTokenInput = document.getElementById('discordAuthToken');
let discordAuthToken = localStorage.getItem('str_discord_auth_token') || null;

// Verified Discord Account State
let verifiedDiscordAccount = null;

// DOM Elements - Step 2: Name Maker
const stepNameMaker = document.getElementById('stepNameMaker');
const clanNameInput = document.getElementById('clanNameInput');
const generateNameBtn = document.getElementById('generateNameBtn');
const formattedOutput = document.getElementById('formattedOutput');
const copyBtn = document.getElementById('copyBtn');
const copyBtnText = document.getElementById('copyBtnText');
const monikerAlert = document.getElementById('monikerAlert');
const lockoutNotice = document.getElementById('lockoutNotice');

// Typography Style Picker Elements
const styleOptSmall = document.getElementById('styleOptSmall');
const styleOptClean = document.getElementById('styleOptClean');
const previewSmallCaps = document.getElementById('previewSmallCaps');
const previewCleanBold = document.getElementById('previewCleanBold');

// Modal Elements
const confirmModal = document.getElementById('confirmModal');
const modalConfirmUsername = document.getElementById('modalConfirmUsername');
const modalConfirmMoniker = document.getElementById('modalConfirmMoniker');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const proceedConfirmBtn = document.getElementById('proceedConfirmBtn');

// DOM Elements - Dropdowns
const favGameWrapper = document.getElementById('favGameWrapper');
const favGameTrigger = document.getElementById('favGameTrigger');
const favGameSelectedDisplay = document.getElementById('favGameSelectedDisplay');
const favGameDropdown = document.getElementById('favGameDropdown');
const favGameList = document.getElementById('favGameList');
const favGameSearch = document.getElementById('favGameSearch');
const favGameOtherContainer = document.getElementById('favGameOtherContainer');
const favGameOtherInput = document.getElementById('favGameOtherInput');

const gamesPlayedWrapper = document.getElementById('gamesPlayedWrapper');
const gamesPlayedTrigger = document.getElementById('gamesPlayedTrigger');
const gamesPlayedChips = document.getElementById('gamesPlayedChips');
const gamesPlayedPlaceholder = document.getElementById('gamesPlayedPlaceholder');
const gamesPlayedDropdown = document.getElementById('gamesPlayedDropdown');
const gamesPlayedList = document.getElementById('gamesPlayedList');
const gamesPlayedSearch = document.getElementById('gamesPlayedSearch');
const gamesPlayedOtherInput = document.getElementById('gamesPlayedOtherInput');
const addCustomGameBtn = document.getElementById('addCustomGameBtn');

// Helper: Show and Clear Alert Notices
function showAlert(element, message, type = 'error') {
  element.textContent = message;
  element.className = `status-alert ${type}`;
  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert(element) {
  element.textContent = '';
  element.className = 'status-alert hidden';
}

// Helper to safely create image element with fallback
function makeGameImg(src, className) {
  const img = document.createElement('img');
  img.className = className;
  img.src = src;
  img.alt = '';
  img.onerror = function() {
    this.onerror = null;
    this.src = GENERIC_GAME_ICON;
  };
  return img;
}

// --------------------------------------------------------------------------
// Microphone Availability Option Handler
// --------------------------------------------------------------------------
function selectMicOption(val) {
  if (hasMicInput) hasMicInput.value = val;
  micOptions.forEach(opt => {
    if (opt.getAttribute('data-value') === val) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
  saveDraftForm();
}

micOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const val = opt.getAttribute('data-value');
    selectMicOption(val);
  });
});

// --------------------------------------------------------------------------
// Favourite Game (Single-Select Dropdown)
// --------------------------------------------------------------------------
let selectedFavGame = null;

function renderFavGameList(filter = '') {
  favGameList.innerHTML = '';
  const query = filter.toLowerCase().trim();
  const games = (typeof POPULAR_GAMES !== 'undefined') ? POPULAR_GAMES : [];

  const filtered = games.filter(g => g.name.toLowerCase().includes(query));

  filtered.forEach(game => {
    const item = document.createElement('div');
    item.className = 'dropdown-item' + (selectedFavGame === game.name ? ' selected' : '');
    
    const left = document.createElement('div');
    left.className = 'item-left';
    left.appendChild(makeGameImg(game.logo, 'item-logo'));
    const span = document.createElement('span');
    span.textContent = game.name;
    left.appendChild(span);
    item.appendChild(left);

    if (selectedFavGame === game.name) {
      const check = document.createElement('span');
      check.className = 'item-check';
      check.textContent = '✓';
      item.appendChild(check);
    }

    item.addEventListener('click', () => {
      selectFavGame(game.name, game.logo);
    });
    favGameList.appendChild(item);
  });

  // Other option
  const otherItem = document.createElement('div');
  otherItem.className = 'dropdown-item' + (selectedFavGame === 'other' ? ' selected' : '');
  const otherLeft = document.createElement('div');
  otherLeft.className = 'item-left';
  otherLeft.appendChild(makeGameImg(GENERIC_GAME_ICON, 'item-logo'));
  const otherSpan = document.createElement('span');
  otherSpan.textContent = 'Other (Type custom game)...';
  otherLeft.appendChild(otherSpan);
  otherItem.appendChild(otherLeft);

  otherItem.addEventListener('click', () => {
    selectedFavGame = 'other';
    favGameOtherContainer.classList.remove('hidden');
    favGameOtherInput.focus();
    updateFavGameDisplay('Other', GENERIC_GAME_ICON);
    favouriteGameInput.value = favGameOtherInput.value.trim() || 'Other';
    saveDraftForm();
  });
  favGameList.appendChild(otherItem);
}

function selectFavGame(name, logo) {
  selectedFavGame = name;
  favouriteGameInput.value = name;
  updateFavGameDisplay(name, logo);
  favGameOtherContainer.classList.add('hidden');
  favGameDropdown.classList.add('hidden');
  favGameTrigger.classList.remove('active');
  saveDraftForm();
}

function updateFavGameDisplay(name, logo) {
  favGameSelectedDisplay.innerHTML = '';
  favGameSelectedDisplay.appendChild(makeGameImg(logo, 'selected-game-logo'));
  const span = document.createElement('span');
  span.textContent = name;
  favGameSelectedDisplay.appendChild(span);
}

favGameOtherInput.addEventListener('input', () => {
  const val = favGameOtherInput.value.trim();
  favouriteGameInput.value = val;
  if (val) {
    updateFavGameDisplay(val, GENERIC_GAME_ICON);
  }
  saveDraftForm();
});

favGameTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = favGameDropdown.classList.contains('hidden');
  closeAllDropdowns();
  if (isHidden) {
    favGameDropdown.classList.remove('hidden');
    favGameTrigger.classList.add('active');
    renderFavGameList();
    favGameSearch.value = '';
    favGameSearch.focus();
  }
});

favGameSearch.addEventListener('input', () => {
  renderFavGameList(favGameSearch.value);
});

// --------------------------------------------------------------------------
// Games You Play (Multi-Select Dropdown with Chips)
// --------------------------------------------------------------------------
let selectedGamesPlayed = []; // array of { name, logo }

function renderGamesPlayedList(filter = '') {
  gamesPlayedList.innerHTML = '';
  const query = filter.toLowerCase().trim();
  const games = (typeof POPULAR_GAMES !== 'undefined') ? POPULAR_GAMES : [];

  const filtered = games.filter(g => g.name.toLowerCase().includes(query));

  filtered.forEach(game => {
    const isSelected = selectedGamesPlayed.some(g => g.name === game.name);
    const item = document.createElement('div');
    item.className = 'dropdown-item' + (isSelected ? ' selected' : '');
    
    const left = document.createElement('div');
    left.className = 'item-left';
    left.appendChild(makeGameImg(game.logo, 'item-logo'));
    const span = document.createElement('span');
    span.textContent = game.name;
    left.appendChild(span);
    item.appendChild(left);

    if (isSelected) {
      const check = document.createElement('span');
      check.className = 'item-check';
      check.textContent = '✓';
      item.appendChild(check);
    }

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleGamePlayed(game.name, game.logo);
      renderGamesPlayedList(gamesPlayedSearch.value);
    });
    gamesPlayedList.appendChild(item);
  });
}

function toggleGamePlayed(name, logo) {
  const idx = selectedGamesPlayed.findIndex(g => g.name === name);
  if (idx > -1) {
    selectedGamesPlayed.splice(idx, 1);
  } else {
    selectedGamesPlayed.push({ name, logo });
  }
  updateGamesPlayedChips();
  saveDraftForm();
}

function removeGamePlayed(name) {
  selectedGamesPlayed = selectedGamesPlayed.filter(g => g.name !== name);
  updateGamesPlayedChips();
  renderGamesPlayedList(gamesPlayedSearch.value);
  saveDraftForm();
}

function updateGamesPlayedChips() {
  // Clear chips except placeholder
  gamesPlayedChips.innerHTML = '';
  
  if (selectedGamesPlayed.length === 0) {
    gamesPlayedChips.appendChild(gamesPlayedPlaceholder);
    gamesPlayedPlaceholder.classList.remove('hidden');
    gamesPlayedInput.value = '';
    return;
  }

  selectedGamesPlayed.forEach(game => {
    const chip = document.createElement('span');
    chip.className = 'game-chip';
    chip.appendChild(makeGameImg(game.logo, 'chip-logo'));

    const span = document.createElement('span');
    span.textContent = game.name;
    chip.appendChild(span);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip-remove';
    btn.setAttribute('aria-label', `Remove ${game.name}`);
    btn.textContent = '✕';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeGamePlayed(game.name);
    });
    chip.appendChild(btn);

    gamesPlayedChips.appendChild(chip);
  });

  gamesPlayedInput.value = selectedGamesPlayed.map(g => g.name).join(', ');
}

// Add Custom Game handler
function addCustomGame() {
  const val = gamesPlayedOtherInput.value.trim();
  if (!val) return;
  if (!selectedGamesPlayed.some(g => g.name.toLowerCase() === val.toLowerCase())) {
    selectedGamesPlayed.push({ name: val, logo: GENERIC_GAME_ICON });
    updateGamesPlayedChips();
    saveDraftForm();
  }
  gamesPlayedOtherInput.value = '';
}

addCustomGameBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  addCustomGame();
});

gamesPlayedOtherInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    addCustomGame();
  }
});

gamesPlayedTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = gamesPlayedDropdown.classList.contains('hidden');
  closeAllDropdowns();
  if (isHidden) {
    gamesPlayedDropdown.classList.remove('hidden');
    gamesPlayedTrigger.classList.add('active');
    renderGamesPlayedList();
    gamesPlayedSearch.value = '';
    gamesPlayedSearch.focus();
  }
});

gamesPlayedSearch.addEventListener('input', () => {
  renderGamesPlayedList(gamesPlayedSearch.value);
});

// Close dropdowns on outside click
function closeAllDropdowns() {
  favGameDropdown.classList.add('hidden');
  favGameTrigger.classList.remove('active');
  gamesPlayedDropdown.classList.add('hidden');
  gamesPlayedTrigger.classList.remove('active');
}

document.addEventListener('click', (e) => {
  if (!favGameWrapper.contains(e.target)) {
    favGameDropdown.classList.add('hidden');
    favGameTrigger.classList.remove('active');
  }
  if (!gamesPlayedWrapper.contains(e.target)) {
    gamesPlayedDropdown.classList.add('hidden');
    gamesPlayedTrigger.classList.remove('active');
  }
});

// Stop clicks inside dropdowns from bubbling up
favGameDropdown.addEventListener('click', (e) => e.stopPropagation());
gamesPlayedDropdown.addEventListener('click', (e) => e.stopPropagation());

// Real-time draft persistence
discordUsernameInput.addEventListener('input', saveDraftForm);
ageInput.addEventListener('input', saveDraftForm);

// --------------------------------------------------------------------------
// Advanced Discord Identity Verification & Profile Card Resolver
// --------------------------------------------------------------------------

// Discord Snowflake Timestamp Calculator: (snowflake >> 22) + 1420070400000
function getSnowflakeDate(snowflakeId) {
  try {
    const epoch = 1420070400000n;
    const timestamp = Number((BigInt(snowflakeId) >> 22n) + epoch);
    return new Date(timestamp);
  } catch (e) {
    return null;
  }
}

async function verifyDiscordIdentity() {
  clearAlert(statusAlert);
  const rawId = (discordUserIdInput.value || '').trim();

  if (!rawId) {
    showAlert(statusAlert, 'Please enter your Discord User ID or Username.', 'error');
    discordUserIdInput.focus();
    return;
  }

  const requiredDays = (window.APP_CONFIG && window.APP_CONFIG.requiredAccountAgeDays) || 90;

  // Toggle button loader
  const btnText = verifyDiscordBtn.querySelector('.btn-text');
  const btnLoader = verifyDiscordBtn.querySelector('.btn-loader');
  verifyDiscordBtn.disabled = true;
  if (btnText) btnText.textContent = 'Verifying...';
  if (btnLoader) btnLoader.classList.remove('hidden');

  let profileData = null;
  const botBase = (window.APP_CONFIG && window.APP_CONFIG.botApi) || 'http://localhost:3000';

  try {
    const resp = await fetch(`${botBase}/api/discord/user/${encodeURIComponent(rawId)}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (resp.ok) {
      const data = await resp.json();
      profileData = {
        id: data.id,
        username: data.username,
        globalName: data.globalName || data.username,
        pronouns: null, // Bot API doesn't provide pronouns
        avatarUrl: data.avatarUrl,
        bannerUrl: data.bannerUrl,
        decorationUrl: data.decorationUrl,
        accentColor: data.accentColor,
        badges: [], // Bot API doesn't provide badges
        createdAt: data.createdAt,
        createdAtFormatted: data.createdAtFormatted,
        accountAgeDays: data.accountAgeDays,
        accountAgeMonths: data.accountAgeMonths,
        isEligible: data.isEligible,
        requiredDays: requiredDays
      };
    } else {
        const errData = await resp.json().catch(() => ({}));
        showAlert(statusAlert, errData.error || 'Failed to find user. Please check the username or ID.', 'error');
        verifyDiscordBtn.disabled = false;
        if (btnText) btnText.textContent = 'Verify Account';
        if (btnLoader) btnLoader.classList.add('hidden');
        return;
    }
  } catch (err) {
    console.warn('[SERVERLESS LOOKUP ERROR] Fetch failed:', err);
    showAlert(statusAlert, 'Could not connect to the Strikers authentication server.', 'error');
    verifyDiscordBtn.disabled = false;
    if (btnText) btnText.textContent = 'Verify Account';
    if (btnLoader) btnLoader.classList.add('hidden');
    return;
  }

  // Update verifiedDiscordAccount state
  verifiedDiscordAccount = profileData;
  discordUsernameInput.value = profileData.username;

  // Render Discord Profile Card UI
  renderDiscordProfileCard(profileData);

  verifyDiscordBtn.disabled = false;
  if (btnText) btnText.textContent = 'Verified ✓';
  if (btnLoader) btnLoader.classList.add('hidden');

  // Enforce 3-Month (90 Days) Age Gate
  if (!profileData.isEligible) {
    const daysRemaining = requiredDays - profileData.accountAgeDays;
    showAlert(
      statusAlert,
      `🚫 Application Ineligible: Your Discord account is only ${profileData.accountAgeDays} days old (~${profileData.accountAgeMonths} months). Accounts must be at least 3 months old (90 days) to prevent alt accounts. (Requires ${daysRemaining} more days).`,
      'error'
    );
    submitBtn.disabled = true;
  } else {
    clearAlert(statusAlert);
    submitBtn.disabled = false;
  }
}

function renderDiscordProfileCard(profile) {
  discordProfileCard.classList.remove('hidden');

  // Banner
  if (profile.bannerUrl) {
    dcardBanner.style.backgroundImage = `url('${profile.bannerUrl}')`;
    dcardBanner.style.backgroundColor = 'transparent';
  } else {
    dcardBanner.style.backgroundImage = 'none';
    dcardBanner.style.backgroundColor = profile.accentColor || '#1e1f22';
  }

  // Avatar
  dcardAvatar.src = profile.avatarUrl;
  dcardAvatar.onerror = function() {
    this.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
  };

  // Avatar Decoration
  if (profile.decorationUrl) {
    dcardDecoration.src = profile.decorationUrl;
    dcardDecoration.onerror = function() {
      if (!this.dataset.fallbackTried && profile.id) {
        this.dataset.fallbackTried = 'true';
        const assetMatch = profile.decorationUrl.match(/\/([^/]+)\.png/);
        if (assetMatch) {
          this.src = `https://cdn.discordapp.com/avatar-decorations/${profile.id}/${assetMatch[1]}.png`;
          return;
        }
      }
      this.classList.add('hidden');
    };
    dcardDecoration.classList.remove('hidden');
  } else {
    dcardDecoration.classList.add('hidden');
  }

  // Names & Pronouns
  dcardDisplayName.textContent = profile.globalName || profile.username;
  dcardUsername.textContent = `@${profile.username}`;

  const dcardPronouns = document.getElementById('dcardPronouns');
  if (dcardPronouns) {
    if (profile.pronouns) {
      dcardPronouns.textContent = profile.pronouns;
      dcardPronouns.classList.remove('hidden');
    } else {
      dcardPronouns.classList.add('hidden');
    }
  }

  // Badges
  const dcardPublicBadges = document.getElementById('dcardPublicBadges');
  if (dcardPublicBadges) {
    dcardPublicBadges.innerHTML = '';
    if (profile.badges && profile.badges.length > 0) {
      profile.badges.forEach(b => {
        const badgeSpan = document.createElement('span');
        badgeSpan.className = 'dcard-public-badge';
        badgeSpan.textContent = b.name;
        dcardPublicBadges.appendChild(badgeSpan);
      });
      dcardPublicBadges.classList.remove('hidden');
    } else {
      dcardPublicBadges.classList.add('hidden');
    }
  }

  // Age & Badge
  dcardAgeText.textContent = `${profile.accountAgeDays} Days (${profile.accountAgeMonths} mo)`;
  dcardCreatedDate.textContent = profile.createdAtFormatted;

  if (profile.isEligible) {
    discordProfileCard.classList.remove('ineligible');
    discordProfileCard.classList.add('eligible');

    dcardLegitBadge.className = 'dcard-badge legit-badge eligible';
    dcardLegitIcon.textContent = '🛡️';
    dcardLegitText.textContent = '3+ Months Verified';

    dcardEligibilityStatus.className = 'dcard-eligibility eligible';
    dcardStatusText.textContent = 'Account Confirmed • Eligible';
    clearAlert(statusAlert);
    submitBtn.disabled = false;
  } else {
    discordProfileCard.classList.remove('eligible');
    discordProfileCard.classList.add('ineligible');

    dcardLegitBadge.className = 'dcard-badge legit-badge ineligible';
    dcardLegitIcon.textContent = '⚠️';
    dcardLegitText.textContent = 'Under 3 Months';

    dcardEligibilityStatus.className = 'dcard-eligibility ineligible';
    dcardStatusText.textContent = 'Ineligible (Account Too New)';
    submitBtn.disabled = true;
  }
}

// Event Listeners for Discord Verification
verifyDiscordBtn.addEventListener('click', verifyDiscordIdentity);

// --------------------------------------------------------------------------
// Discord OAuth2 Authorization Flow (Anti-Abuse)
// --------------------------------------------------------------------------
async function initiateDiscordOAuth() {
  const botBase = (window.APP_CONFIG && window.APP_CONFIG.botApi) || 'http://localhost:3000';
  let authUrl = null;

  try {
    const res = await fetch(`${botBase}/api/clan/auth-url`);
    if (res.ok) {
      const data = await res.json();
      authUrl = data.authUrl;
    }
  } catch (e) {
    console.warn('Failed to fetch auth-url dynamically, fallback to default:', e);
  }

  if (!authUrl) {
    const clientId = '1553647181326581770';
    const redirectUri = `${botBase}/api/auth/callback`;
    authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify&state=clan_portal`;
  }

  // Save current window URL so the callback can return if direct redirect
  localStorage.setItem('str_portal_return_url', window.location.href.split('?')[0]);

  // Open OAuth popup window
  const width = 500, height = 750;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(authUrl, 'discord_oauth', `width=${width},height=${height},left=${left},top=${top}`);

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    // Popup blocked, fallback to normal navigation
    window.location.href = authUrl;
  }
}

if (discordOAuthBtn) {
  discordOAuthBtn.addEventListener('click', initiateDiscordOAuth);
}

// Listen for OAuth message from authorization popup window
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'STR_DISCORD_AUTH_SUCCESS') {
    handleOAuthSuccess(event.data.data);
  }
});

function handleOAuthSuccess(authData) {
  if (!authData || !authData.userId) return;
  discordAuthToken = authData.token;
  localStorage.setItem('str_discord_auth_token', authData.token);
  if (discordAuthTokenInput) discordAuthTokenInput.value = authData.token;

  // Auto-fill and lock Discord User ID input
  discordUserIdInput.value = authData.userId;
  discordUserIdInput.readOnly = true;

  if (discordOAuthBtn) {
    discordOAuthBtn.classList.add('authorized');
    discordOAuthBtn.innerHTML = `<span>✓ Authorized (@${authData.username})</span>`;
    discordOAuthBtn.disabled = true;
  }

  // Automatically trigger Discord identity verification and profile card render
  verifyDiscordIdentity();
}

// Check URL params for direct OAuth redirect fallback (?auth_token=...&user_id=...)
(function checkUrlOAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('auth_token');
  const userId = urlParams.get('user_id');
  if (token && userId) {
    handleOAuthSuccess({ token, userId, username: 'Verified User' });
    // Clean URL query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  }
})();

discordUserIdInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    verifyDiscordIdentity();
  }
});

// Auto-trigger verification on pasting valid 17-20 digit snowflake
discordUserIdInput.addEventListener('input', () => {
  const val = discordUserIdInput.value.trim();
  if (/^\d{17,20}$/.test(val)) {
    verifyDiscordIdentity();
  }
});

// --------------------------------------------------------------------------
// Step 1: Form Validation & Submission to Bot & Category Channel Creation
// --------------------------------------------------------------------------
verificationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert(statusAlert);

  const rawId = (discordUserIdInput.value || '').trim();

  // Ensure Discord verification was conducted
  if (!verifiedDiscordAccount || verifiedDiscordAccount.id !== rawId) {
    showAlert(statusAlert, 'Please click "Verify Identity" to verify your Discord Account first.', 'error');
    discordUserIdInput.focus();
    return;
  }

  // Enforce 3-Month Account Age Rule
  if (!verifiedDiscordAccount.isEligible) {
    showAlert(
      statusAlert,
      `Submission Blocked: Your Discord account is only ${verifiedDiscordAccount.accountAgeDays} days old. Accounts must be at least 3 months old (90 days).`,
      'error'
    );
    return;
  }

  const rawUsername = verifiedDiscordAccount.username;
  const ageVal = ageInput.value.trim();
  const hasMic = (hasMicInput ? hasMicInput.value : '').trim();
  const favouriteGame = favouriteGameInput.value.trim();
  const gamesPlayed = gamesPlayedInput.value.trim();

  // Field Validations
  const ageNum = parseInt(ageVal, 10);
  if (isNaN(ageNum) || ageNum < 10 || ageNum > 99) {
    showAlert(statusAlert, 'Please enter a valid age between 10 and 99.', 'error');
    ageInput.focus();
    return;
  }

  if (!hasMic) {
    showAlert(statusAlert, 'Please answer whether you have a mic (Yes / NO / Sometimes).', 'error');
    const micWrapper = document.getElementById('micWrapper');
    if (micWrapper) micWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (!favouriteGame) {
    showAlert(statusAlert, 'Please enter your favourite game.', 'error');
    favouriteGameInput.focus();
    return;
  }

  if (!gamesPlayed) {
    showAlert(statusAlert, 'Please list the games you currently play.', 'error');
    gamesPlayedInput.focus();
    return;
  }

  setSubmittingState(true);

  let submissionSuccess = false;
  let responseData = null;

  // 1. Submit via Vercel Serverless Function (Creates category channel via Bot API or dispatches embed)
  try {
    const apiResp = await fetch('/api/submit-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordUserId: verifiedDiscordAccount.id,
        discordUsername: rawUsername,
        age: ageNum,
        hasMic,
        favouriteGame,
        gamesPlayed,
        avatarUrl: verifiedDiscordAccount.avatarUrl,
        accountAgeDays: verifiedDiscordAccount.accountAgeDays,
        accountAgeMonths: verifiedDiscordAccount.accountAgeMonths
      })
    });

    if (apiResp.ok) {
      responseData = await apiResp.json();
      submissionSuccess = true;
    } else {
      const errJson = await apiResp.json().catch(() => ({}));
      console.warn('Serverless submit-application returned status:', apiResp.status, errJson);
    }
  } catch (apiErr) {
    console.warn('Serverless endpoint not reachable, falling back to direct webhook:', apiErr);
  }

  // 2. Direct Webhook Fallback if serverless API wasn't reached (e.g. static local file preview)
  if (!submissionSuccess) {
    try {
      const webhookUrl = getActiveWebhook();
      const embedDescription = [
        "A new applicant is waiting for staff review.",
        "",
        "👤 **Applicant**",
        `<@${verifiedDiscordAccount.id}> (\`@${rawUsername}\` / \`${verifiedDiscordAccount.id}\`)`,
        "",
        "🛡️ **Legitimacy Check**",
        `✅ Verified Discord Account (${verifiedDiscordAccount.accountAgeDays} days / ~${verifiedDiscordAccount.accountAgeMonths} mo)`,
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
        "",
        "> Staff approval is required before the member receives their STRIKERS role."
      ].join("\n");

      const embedPayload = {
        username: "⚡ 𝑺𝑻𝑹𝑰𝑲𝑬𝑹𝑺",
        avatar_url: verifiedDiscordAccount.avatarUrl,
        embeds: [
          {
            author: {
              name: `⚡ 𝑺𝑻𝑹𝑰𝑲𝑬𝑹𝑺 • ${verifiedDiscordAccount.globalName || rawUsername}`,
              icon_url: verifiedDiscordAccount.avatarUrl
            },
            title: "𝑴𝑬𝑴𝑩𝑬𝑹 𝑽𝑬𝑹𝑰𝑭𝑰𝑪𝑨𝑻𝑰𝑶𝑵",
            description: embedDescription,
            color: 0x1f1f1f,
            thumbnail: { url: verifiedDiscordAccount.avatarUrl },
            footer: {
              text: `STR Clan Review • Discord ID: ${verifiedDiscordAccount.id}`
            },
            timestamp: new Date().toISOString()
          }
        ]
      };

      const whResp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embedPayload)
      });

      if (whResp.ok || whResp.status === 204) {
        submissionSuccess = true;
      } else {
        throw new Error('Both Bot channel creation and fallback webhook were unreachable.');
      }
    } catch (whErr) {
      setSubmittingState(false);
      showAlert(statusAlert, `Submission failed: ${whErr.message}. Please check your connection or contact staff.`, 'error');
      return;
    }
  }

  // Save verified applicant data into localStorage
  verifiedApplicant = {
    discordId: verifiedDiscordAccount.id,
    discordUsername: rawUsername,
    avatarUrl: verifiedDiscordAccount.avatarUrl,
    accountAgeDays: verifiedDiscordAccount.accountAgeDays,
    age: ageNum,
    hasMic,
    favouriteGame,
    gamesPlayed
  };
  localStorage.setItem(APPLICANT_STORAGE_KEY, JSON.stringify(verifiedApplicant));
  localStorage.removeItem(DRAFT_FORM_STORAGE_KEY);

  setSubmittingState(false);
  unlockNameMaker();

  if (responseData && responseData.mode === 'bot_channel') {
    showAlert(monikerAlert, `Channel ${responseData.channelName} created on Discord under category for staff review!`, 'success');
  }
});

function setSubmittingState(isLoading) {
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  if (isLoading) {
    submitBtn.disabled = true;
    btnText.textContent = 'Transmitting to Discord...';
    btnLoader.classList.remove('hidden');
  } else {
    submitBtn.disabled = false;
    btnText.textContent = 'Submit & Unlock Name Maker';
    btnLoader.classList.add('hidden');
  }
}

// --------------------------------------------------------------------------
// Step 2: Moniker Generator with 30-Day Anti-Abuse Lock
// --------------------------------------------------------------------------
let pendingChosenRawName = '';
let pendingFormattedName = '';
let isMonikerLocked = false;

function saveDraftForm() {
  if (verifiedApplicant) return;
  try {
    const draft = {
      discordUsername: discordUsernameInput ? discordUsernameInput.value : '',
      age: ageInput ? ageInput.value : '',
      hasMic: hasMicInput ? hasMicInput.value : '',
      favouriteGame: favouriteGameInput ? favouriteGameInput.value : '',
      favGameName: selectedFavGame,
      favGameOther: favGameOtherInput ? favGameOtherInput.value : '',
      gamesPlayed: selectedGamesPlayed
    };
    localStorage.setItem(DRAFT_FORM_STORAGE_KEY, JSON.stringify(draft));
  } catch {}
}

function restoreDraftForm() {
  try {
    const raw = localStorage.getItem(DRAFT_FORM_STORAGE_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (draft.discordUsername && discordUsernameInput) {
      discordUsernameInput.value = draft.discordUsername;
    }
    if (draft.age && ageInput) {
      ageInput.value = draft.age;
    }
    if (draft.hasMic) {
      selectMicOption(draft.hasMic);
    }
    if (draft.favGameName) {
      if (draft.favGameName === 'other') {
        selectedFavGame = 'other';
        favGameOtherContainer.classList.remove('hidden');
        favGameOtherInput.value = draft.favGameOther || '';
        updateFavGameDisplay(draft.favGameOther || 'Other', GENERIC_GAME_ICON);
        favouriteGameInput.value = draft.favGameOther || 'Other';
      } else {
        const g = (typeof POPULAR_GAMES !== 'undefined') ? POPULAR_GAMES.find(x => x.name === draft.favGameName) : null;
        if (g) {
          selectFavGame(g.name, g.logo);
        }
      }
    }
    if (draft.gamesPlayed && Array.isArray(draft.gamesPlayed) && draft.gamesPlayed.length > 0) {
      selectedGamesPlayed = draft.gamesPlayed;
      updateGamesPlayedChips();
    }
  } catch {}
}

function setMonikerStyle(style) {
  if (isMonikerLocked) return;
  currentStyle = style;
  localStorage.setItem(STYLE_STORAGE_KEY, style);

  if (style === 'clean_bold') {
    if (styleOptClean) styleOptClean.classList.add('active');
    if (styleOptSmall) styleOptSmall.classList.remove('active');
  } else {
    if (styleOptSmall) styleOptSmall.classList.add('active');
    if (styleOptClean) styleOptClean.classList.remove('active');
  }
  updateStylePreviews();
}

function updateStylePreviews() {
  const raw = (clanNameInput && clanNameInput.value.trim()) || 'strikers';
  if (previewSmallCaps) previewSmallCaps.textContent = formatClanMoniker(raw, 'small_caps');
  if (previewCleanBold) previewCleanBold.textContent = formatClanMoniker(raw, 'clean_bold');
}

if (styleOptSmall) {
  styleOptSmall.addEventListener('click', () => setMonikerStyle('small_caps'));
  styleOptSmall.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMonikerStyle('small_caps');
    }
  });
}

if (styleOptClean) {
  styleOptClean.addEventListener('click', () => setMonikerStyle('clean_bold'));
  styleOptClean.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMonikerStyle('clean_bold');
    }
  });
}

if (clanNameInput) {
  clanNameInput.addEventListener('input', () => {
    updateStylePreviews();
  });
}

function checkExistingLock() {
  const rawLock = localStorage.getItem(LOCK_STORAGE_KEY);
  if (!rawLock) return false;

  try {
    const lockData = JSON.parse(rawLock);
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    if (now - lockData.timestamp < thirtyDaysMs) {
      // Still locked
      const daysLeft = Math.ceil((thirtyDaysMs - (now - lockData.timestamp)) / (24 * 60 * 60 * 1000));
      applyLockState(lockData.moniker, daysLeft, lockData.style);
      return true;
    } else {
      localStorage.removeItem(LOCK_STORAGE_KEY);
      return false;
    }
  } catch {
    return false;
  }
}

function applyLockState(moniker, daysLeft, style) {
  isMonikerLocked = true;
  currentFormattedName = moniker;
  formattedOutput.textContent = moniker;
  clanNameInput.value = moniker;
  clanNameInput.disabled = true;
  generateNameBtn.disabled = true;
  generateNameBtn.textContent = 'Moniker Locked';
  copyBtn.disabled = false;

  if (style) {
    currentStyle = style;
  }
  if (styleOptSmall) styleOptSmall.classList.add('disabled');
  if (styleOptClean) styleOptClean.classList.add('disabled');
  if (currentStyle === 'clean_bold') {
    if (styleOptClean) styleOptClean.classList.add('active');
    if (styleOptSmall) styleOptSmall.classList.remove('active');
  } else {
    if (styleOptSmall) styleOptSmall.classList.add('active');
    if (styleOptClean) styleOptClean.classList.remove('active');
  }

  lockoutNotice.classList.remove('hidden');
  const lockP = lockoutNotice.querySelector('p');
  if (lockP) {
    lockP.textContent = `Your official moniker "${moniker}" has been logged and permanently locked with clan leadership. You can change it again in ${daysLeft} days.`;
  }
}

function unlockNameMaker() {
  stepVerification.classList.add('hidden');
  stepNameMaker.classList.remove('hidden');

  pageTitle.textContent = 'Official Moniker Generator';
  pageSubtitle.textContent = `Welcome, @${verifiedApplicant.discordUsername}. Choose your moniker carefully. Once confirmed, it is locked to your identity for 30 days.`;
  stepPill.textContent = 'Step 2 of 2 (Unlocked)';
  stepPill.classList.add('active');

  setMonikerStyle(currentStyle);
  updateStylePreviews();

  if (!checkExistingLock()) {
    clanNameInput.focus();
  }
}

// When clicking "Confirm & Generate Moniker"
generateNameBtn.addEventListener('click', () => {
  if (isMonikerLocked) return;

  const rawVal = clanNameInput.value.trim();
  if (!rawVal) {
    showAlert(monikerAlert, 'Please enter your desired clan name before generating.', 'error');
    clanNameInput.focus();
    return;
  }

  if (rawVal.length < 2) {
    showAlert(monikerAlert, 'Clan moniker must be at least 2 characters.', 'error');
    clanNameInput.focus();
    return;
  }

  pendingChosenRawName = rawVal;
  pendingFormattedName = formatClanMoniker(rawVal, currentStyle);

  const username = verifiedApplicant ? verifiedApplicant.discordUsername : "Member";
  modalConfirmUsername.textContent = `@${username}`;
  modalConfirmMoniker.textContent = pendingFormattedName;

  confirmModal.classList.remove('hidden');
});

cancelConfirmBtn.addEventListener('click', () => {
  confirmModal.classList.add('hidden');
});

// Confirm Modal Proceed -> Lock and Transmit to Discord
proceedConfirmBtn.addEventListener('click', async () => {
  const btnLoader = proceedConfirmBtn.querySelector('.btn-loader-sec');
  const btnSpan = proceedConfirmBtn.querySelector('span');

  proceedConfirmBtn.disabled = true;
  btnSpan.textContent = 'Locking In...';
  btnLoader.classList.remove('hidden');

  const webhookUrl = getActiveWebhook();
  const username = verifiedApplicant ? verifiedApplicant.discordUsername : "Applicant";

  const monikerDescription = [
    "Applicant has finalized and locked their official clan moniker.",
    "",
    "👤 **Username**",
    `\`${username}\``,
    "",
    "🏷️ **Official Moniker**",
    `\`${pendingFormattedName}\``,
    "",
    "🔒 **Status**",
    "Locked for 30 days. Ready for manual STRIKERS role assignment."
  ].join("\n");

  const payload = {
    username: "⚡ 𝑺𝑻𝑹𝑰𝑲𝑬𝑹𝑺",
    embeds: [
      {
        author: {
          name: "⚡ 𝑺𝑻𝑹𝑰𝑲𝑬𝑹𝑺"
        },
        title: "𝑶𝑭𝑭𝑰𝑪𝑰𝑨𝑳 𝑴𝑶𝑵𝑰𝑲𝑬𝑹 𝑳𝑶𝑮𝑮𝑬𝑫",
        description: monikerDescription,
        color: 0x1f1f1f,
        footer: {
          text: "STR Clan Review • Moniker Selection"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok || response.status === 204) {
      // Save 30-day lock locally
      const lockData = {
        username: username,
        moniker: pendingFormattedName,
        style: currentStyle,
        timestamp: Date.now()
      };
      localStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify(lockData));

      // Close modal
      confirmModal.classList.add('hidden');

      // Apply lock UI
      applyLockState(pendingFormattedName, 30, currentStyle);
      showAlert(monikerAlert, `Moniker locked and registered successfully! You may now copy your official tag.`, 'success');
    } else {
      throw new Error(`Discord returned HTTP ${response.status}`);
    }
  } catch (err) {
    showAlert(monikerAlert, `Could not register moniker: ${err.message}. Please try again.`, 'error');
  } finally {
    proceedConfirmBtn.disabled = false;
    btnSpan.textContent = 'Confirm & Lock In';
    btnLoader.classList.add('hidden');
  }
});

// Copy to Clipboard (Only allowed once generated/locked)
copyBtn.addEventListener('click', async () => {
  if (!currentFormattedName) {
    showAlert(monikerAlert, 'Please confirm your moniker first before copying.', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(currentFormattedName);
    showCopySuccess();
  } catch {
    const tempInput = document.createElement('input');
    tempInput.value = currentFormattedName;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showCopySuccess();
  }
});

function showCopySuccess() {
  copyBtn.classList.add('copied');
  copyBtnText.textContent = 'Copied';
  setTimeout(() => {
    copyBtn.classList.remove('copied');
    copyBtnText.textContent = 'Copy';
  }, 2000);
}

// Prime dropdown lists on load and restore persistent state
document.addEventListener('DOMContentLoaded', () => {
  renderFavGameList();
  renderGamesPlayedList();

  // Restore typography variant style
  setMonikerStyle(currentStyle);
  updateStylePreviews();

  // Check if applicant is already verified in localStorage
  const savedApplicant = localStorage.getItem(APPLICANT_STORAGE_KEY);
  if (savedApplicant) {
    try {
      const data = JSON.parse(savedApplicant);
      if (data && data.discordUsername) {
        verifiedApplicant = data;
        unlockNameMaker();
        return;
      }
    } catch {}
  }

  // Otherwise restore form draft
  restoreDraftForm();
});
