// ==========================================================================
// Clan Name Formatter & Discord Verification Script
// Matte Minimal Professional Identity Engine
// ==========================================================================

// Cryptographic SHA-256 Hashing Utility (Prevents Plain Text Exposure & Tampering)
async function hashSHA256(text) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(String(text || ''));
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {}
  // Deterministic fallback hash
  let hash = 5381;
  const str = String(text || '');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'sh_' + Math.abs(hash).toString(16);
}

// Client-Side Anti-Inspection & Dev Shortcuts Lock
(function initClientProtection() {
  // 1. Disable Right-Click (Context Menu)
  window.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, true);

  // 2. Disable DevTools Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
  window.addEventListener('keydown', function(e) {
    if (
      e.keyCode === 123 || e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 80 || e.key === 'u' || e.key === 's' || e.key === 'p')) ||
      (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.key === 'i' || e.key === 'j' || e.key === 'c')) ||
      (e.metaKey && (e.keyCode === 85 || e.keyCode === 83 || e.key === 'u' || e.key === 's'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 3. Clear Console and Protect Against Leaks
  try {
    if (typeof console !== 'undefined') {
      const origLog = console.log;
      console.log = function() {};
      console.info = function() {};
      console.debug = function() {};
      console.dir = function() {};
    }
  } catch (e) {}
})();

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
 * Converts text into Script Fancy typography:
 * e.g. "strikers" -> "𝓢 𝓽 𝓻 𝓲 𝓴 𝓮 𝓻 𝓼"
 */
function toScript(str) {
  if (!str) return '';
  return [...str].map(ch => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D4D0 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D4EA + (code - 97));
    return ch;
  }).join(' ');
}

/**
 * Converts text into Gothic / Blackletter typography:
 * e.g. "strikers" -> "𝔖 𝔱 𝔯 𝔦 𝔨 𝔢 𝔯 𝔰"
 */
function toGothic(str) {
  if (!str) return '';
  return [...str].map(ch => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D504 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D51E + (code - 97));
    return ch;
  }).join(' ');
}

/**
 * Constructs the formatted moniker with clan prefix and brackets:
 * e.g. "-͟͟͞ 𝐒𝐓𝐑 乂【sᴛʀɪᴋᴇʀs】"
 */
function formatClanMoniker(rawName, style = currentStyle) {
  const prefix = (window.APP_CONFIG && window.APP_CONFIG.clanPrefix) || "-͟͟͞ 𝐒𝐓𝐑 乂【";
  const suffix = (window.APP_CONFIG && window.APP_CONFIG.clanSuffix) || "】";
  const trimmed = (rawName || '').trim();
  let styled = toSmallCaps(trimmed);
  if (style === 'clean_bold') styled = toCleanBold(trimmed);
  else if (style === 'script') styled = toScript(trimmed);
  else if (style === 'gothic') styled = toGothic(trimmed);
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
  const botBase = (window.APP_CONFIG && window.APP_CONFIG.botApi) || 'https://strikerss-production.up.railway.app';

  // 1. Try Vercel Serverless Function first (/api/discord-lookup)
  try {
    const vResp = await fetch(`/api/discord-lookup?id=${encodeURIComponent(rawId)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (vResp.ok) {
      const data = await vResp.json();
      profileData = {
        id: data.id,
        username: data.username,
        globalName: data.globalName || data.global_name || data.username,
        pronouns: data.pronouns || null,
        avatarUrl: data.avatarUrl || data.avatar_url,
        bannerUrl: data.bannerUrl || data.banner_url,
        decorationUrl: data.decorationUrl || data.avatar_decoration_url,
        accentColor: data.accentColor || data.accent_color || '#1e1f22',
        badges: data.badges || [],
        createdAt: data.createdAt || data.created_at,
        createdAtFormatted: data.createdAtFormatted || (data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''),
        accountAgeDays: data.accountAgeDays !== undefined ? data.accountAgeDays : data.age_days,
        accountAgeMonths: data.accountAgeMonths !== undefined ? data.accountAgeMonths : data.age_months,
        isEligible: data.isEligible !== undefined ? data.isEligible : data.is_eligible,
        requiredDays: requiredDays
      };
    }
  } catch (vErr) {
    console.warn('Vercel serverless lookup not reachable, trying Bot API:', vErr);
  }

  // 2. Fallback to direct Bot API server if Vercel serverless wasn't reachable
  if (!profileData) {
    try {
      const bResp = await fetch(`${botBase}/api/discord/user/${encodeURIComponent(rawId)}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (bResp.ok) {
        const data = await bResp.json();
        profileData = {
          id: data.id,
          username: data.username,
          globalName: data.globalName || data.username,
          pronouns: null,
          avatarUrl: data.avatarUrl || data.avatar_url,
          bannerUrl: data.bannerUrl || data.banner_url,
          decorationUrl: data.decorationUrl || data.avatar_decoration_url,
          accentColor: data.accentColor || data.accent_color || '#1e1f22',
          badges: [],
          createdAt: data.createdAt,
          createdAtFormatted: data.createdAtFormatted,
          accountAgeDays: data.accountAgeDays,
          accountAgeMonths: data.accountAgeMonths,
          isEligible: data.isEligible,
          requiredDays: requiredDays
        };
      } else {
        const errData = await bResp.json().catch(() => ({}));
        showAlert(statusAlert, errData.error || 'Failed to find user. Please check the username or ID.', 'error');
        verifyDiscordBtn.disabled = false;
        if (btnText) btnText.textContent = 'Verify Account';
        if (btnLoader) btnLoader.classList.add('hidden');
        return;
      }
    } catch (bErr) {
      console.warn('Bot API lookup failed:', bErr);
    }
  }

  if (!profileData) {
    showAlert(statusAlert, 'Could not resolve Discord account. Please check username/ID or ensure you are in the clan server.', 'error');
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
  const botBase = (window.APP_CONFIG && window.APP_CONFIG.botApi) || 'https://strikerss-production.up.railway.app';
  let authUrl = null;
  const currentReturnUrl = window.location.origin + window.location.pathname;

  try {
    const res = await fetch(`${botBase}/api/clan/auth-url?return_url=${encodeURIComponent(currentReturnUrl)}`);
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
    const safeB64 = btoa(currentReturnUrl).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify&state=clan_portal_ret_${safeB64}`;
  }

  // Save current window URL so the callback can return if direct redirect
  localStorage.setItem('str_portal_return_url', currentReturnUrl);

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
// --------------------------------------------------------------------------
// Step 1: Form Validation & Discord Profile Confirmation Modal ("Is that you?")
// --------------------------------------------------------------------------
let pendingApplicationData = null;

// Modal Elements
const confirmProfileModal = document.getElementById('confirmProfileModal');
const confirmProfileYesBtn = document.getElementById('confirmProfileYesBtn');
const confirmProfileNoBtn = document.getElementById('confirmProfileNoBtn');
const confirmProfileCloseBtn = document.getElementById('confirmProfileCloseBtn');
const dpopDisplayName = document.getElementById('dpopDisplayName');
const dpopUsername = document.getElementById('dpopUsername');
const dpopTagline = document.getElementById('dpopTagline');
const dpopAvatar = document.getElementById('dpopAvatar');
const dpopCustomDecoration = document.getElementById('dpopCustomDecoration');
const dpopBanner = document.getElementById('dpopBanner');
const dpopStatusBubble = document.getElementById('dpopStatusBubble');
const dpopStatusText = document.getElementById('dpopStatusText');
const dpopBioText = document.getElementById('dpopBioText');
const dpopBioExpandBtn = document.getElementById('dpopBioExpandBtn');
const dpopFavGameName = document.getElementById('dpopFavGameName');
const dpopGameIcon = document.getElementById('dpopGameIcon');

function openProfileConfirmationModal(formData) {
  if (!confirmProfileModal || !verifiedDiscordAccount) return;
  pendingApplicationData = formData;

  // 1. Display Name & Username (Only authentic user profile data)
  if (dpopDisplayName) {
    dpopDisplayName.textContent = verifiedDiscordAccount.globalName || verifiedDiscordAccount.username;
  }
  if (dpopUsername) {
    dpopUsername.textContent = `@${verifiedDiscordAccount.username}`;
  }
  if (dpopTagline) {
    dpopTagline.textContent = '';
    dpopTagline.classList.add('hidden');
  }

  // 2. Avatar & Decoration (Only real Discord avatar decoration)
  if (dpopAvatar) {
    dpopAvatar.src = verifiedDiscordAccount.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png';
    dpopAvatar.onerror = function() {
      this.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
    };
  }

  if (dpopCustomDecoration) {
    if (verifiedDiscordAccount.decorationUrl) {
      dpopCustomDecoration.src = verifiedDiscordAccount.decorationUrl;
      dpopCustomDecoration.classList.remove('hidden');
    } else {
      dpopCustomDecoration.src = '';
      dpopCustomDecoration.classList.add('hidden');
    }
  }

  // 3. Banner
  if (dpopBanner) {
    if (verifiedDiscordAccount.bannerUrl) {
      dpopBanner.style.backgroundImage = `url('${verifiedDiscordAccount.bannerUrl}')`;
      dpopBanner.style.backgroundColor = 'transparent';
    } else {
      dpopBanner.style.backgroundImage = 'none';
      dpopBanner.style.backgroundColor = verifiedDiscordAccount.accentColor || '#1e1f22';
    }
  }

  // 4. Status Bubble (Only if user has an actual custom status)
  if (dpopStatusBubble) {
    if (verifiedDiscordAccount.customStatus && verifiedDiscordAccount.customStatus.trim()) {
      if (dpopStatusText) dpopStatusText.textContent = verifiedDiscordAccount.customStatus;
      dpopStatusBubble.classList.remove('hidden');
    } else {
      dpopStatusBubble.classList.add('hidden');
    }
  }

  // 5. Bio / About Me (Only if user has an actual bio)
  const dpopBioSection = document.getElementById('dpopBioSection') || document.querySelector('.dpop-bio-section');
  if (dpopBioSection) {
    if (verifiedDiscordAccount.bio && verifiedDiscordAccount.bio.trim()) {
      if (dpopBioText) dpopBioText.textContent = verifiedDiscordAccount.bio;
      dpopBioSection.classList.remove('hidden');
    } else {
      dpopBioSection.classList.add('hidden');
    }
  }

  // 6. Badges (Only real Discord badges)
  const dpopBadgesBar = document.getElementById('dpopBadgesBar');
  if (dpopBadgesBar) {
    dpopBadgesBar.innerHTML = '';
    if (verifiedDiscordAccount.badges && verifiedDiscordAccount.badges.length > 0) {
      verifiedDiscordAccount.badges.forEach(b => {
        const badgeElem = document.createElement('div');
        badgeElem.className = 'dpop-badge-pill';
        badgeElem.title = b.name;
        badgeElem.innerHTML = `<span class="badge-icon">${b.icon || '🛡️'}</span><span class="badge-label">${b.name}</span>`;
        dpopBadgesBar.appendChild(badgeElem);
      });
      dpopBadgesBar.classList.remove('hidden');
    } else {
      dpopBadgesBar.classList.add('hidden');
    }
  }

  // 7. Game Collection Favorite Game & Icon
  if (dpopFavGameName) {
    dpopFavGameName.textContent = formData.favouriteGame || 'Game';
  }
  if (dpopGameIcon) {
    const rawFav = (formData.favouriteGame || '').toLowerCase();
    let foundLogo = null;
    if (typeof POPULAR_GAMES !== 'undefined') {
      const match = POPULAR_GAMES.find(g => g.name.toLowerCase() === rawFav || g.id === rawFav);
      if (match && match.logo) foundLogo = match.logo;
    }
    if (foundLogo) {
      dpopGameIcon.src = foundLogo;
    } else if (rawFav.includes('mine') || rawFav.includes('craft')) {
      dpopGameIcon.src = 'icons/minecraft.png';
    } else if (rawFav.includes('rust')) {
      dpopGameIcon.src = 'icons/rust.png';
    } else {
      dpopGameIcon.src = 'icons/minecraft.png';
    }
  }

  // Open Modal
  confirmProfileModal.classList.remove('hidden');
}

function closeProfileConfirmationModal() {
  if (confirmProfileModal) {
    confirmProfileModal.classList.add('hidden');
  }
}

// Modal Listeners
if (confirmProfileYesBtn) {
  confirmProfileYesBtn.addEventListener('click', async () => {
    if (!pendingApplicationData) return;
    const btnLoader = confirmProfileYesBtn.querySelector('.btn-loader-modal');
    if (btnLoader) btnLoader.classList.remove('hidden');
    confirmProfileYesBtn.disabled = true;

    try {
      await performApplicationSubmission(pendingApplicationData);
    } finally {
      if (btnLoader) btnLoader.classList.add('hidden');
      confirmProfileYesBtn.disabled = false;
      closeProfileConfirmationModal();
    }
  });
}

if (confirmProfileNoBtn) {
  confirmProfileNoBtn.addEventListener('click', () => {
    closeProfileConfirmationModal();
    if (discordUserIdInput) {
      discordUserIdInput.readOnly = false;
      discordUserIdInput.focus();
      discordUserIdInput.select();
    }
  });
}

if (confirmProfileCloseBtn) {
  confirmProfileCloseBtn.addEventListener('click', closeProfileConfirmationModal);
}

if (confirmProfileModal) {
  confirmProfileModal.addEventListener('click', (e) => {
    if (e.target === confirmProfileModal) {
      closeProfileConfirmationModal();
    }
  });
}

if (dpopBioExpandBtn && dpopBioText) {
  dpopBioExpandBtn.addEventListener('click', () => {
    if (dpopBioText.style.maxHeight === 'none') {
      dpopBioText.style.maxHeight = '60px';
      dpopBioExpandBtn.textContent = 'View Full Bio';
    } else {
      dpopBioText.style.maxHeight = 'none';
      dpopBioExpandBtn.textContent = 'Collapse Bio';
    }
  });
}

// Intercept Form Submit: Validate first, then popup "Is that you?" modal
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

  // Inputs are valid: Pop up "Is that you?" Discord Profile Modal!
  openProfileConfirmationModal({
    rawId,
    rawUsername,
    ageNum,
    hasMic,
    favouriteGame,
    gamesPlayed
  });
});

// Final Application Submission (Executed when user clicks "Yes, that's me!" in modal)
async function performApplicationSubmission(formData) {
  const { rawId, rawUsername, ageNum, hasMic, favouriteGame, gamesPlayed } = formData;
  setSubmittingState(true);

  let submissionSuccess = false;
  let responseData = null;

  const botBase = (window.APP_CONFIG && window.APP_CONFIG.botApi) || 'https://strikerss-production.up.railway.app';
  const token = discordAuthToken || localStorage.getItem('str_discord_auth_token') || '';
  let lastErrorMessage = '';

  // 1. Submit directly to Railway Discord Bot Backend (/api/clan/apply)
  try {
    const botResp = await fetch(`${botBase}/api/clan/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId: verifiedDiscordAccount.id,
        username: rawUsername,
        age: ageNum,
        hasMic,
        favouriteGame,
        gamesPlayed,
        avatarUrl: verifiedDiscordAccount.avatarUrl,
        accountAgeDays: verifiedDiscordAccount.accountAgeDays,
        accountAgeMonths: verifiedDiscordAccount.accountAgeMonths,
        authToken: token
      })
    });

    if (botResp.ok) {
      responseData = await botResp.json();
      submissionSuccess = true;
    } else {
      const errJson = await botResp.json().catch(() => ({}));
      lastErrorMessage = errJson.error || `Server returned ${botResp.status}`;
      console.warn('Bot API /api/clan/apply status:', botResp.status, errJson);
    }
  } catch (apiErr) {
    console.warn('Direct Bot API unreachable, attempting serverless fallback:', apiErr);
    lastErrorMessage = apiErr.message;
  }

  // 2. Submit via Vercel Serverless Function Fallback
  if (!submissionSuccess) {
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
          accountAgeMonths: verifiedDiscordAccount.accountAgeMonths,
          authToken: token
        })
      });

      if (apiResp.ok) {
        responseData = await apiResp.json();
        submissionSuccess = true;
      } else {
        const errJson = await apiResp.json().catch(() => ({}));
        if (!lastErrorMessage) lastErrorMessage = errJson.error;
      }
    } catch (whErr) {
      console.warn('Serverless endpoint not reachable:', whErr);
    }
  }

  if (!submissionSuccess) {
    setSubmittingState(false);
    showAlert(statusAlert, `Submission Notice: ${lastErrorMessage || 'Service unavailable. Please verify the bot is online.'}`, 'error');
    return;
  }

  // Calculate cryptographic SHA-256 signature to protect sensitive applicant identity
  const applicantSig = await hashSHA256(
    (verifiedDiscordAccount.id || '') + ":" +
    rawUsername + ":" +
    (verifiedDiscordAccount.accountAgeDays || '0') + ":" +
    "STR_STRIKERS_SEC_SALT_2026"
  );

  // Save verified applicant data with signature into localStorage
  verifiedApplicant = {
    discordId: verifiedDiscordAccount.id,
    discordUsername: rawUsername,
    avatarUrl: verifiedDiscordAccount.avatarUrl,
    accountAgeDays: verifiedDiscordAccount.accountAgeDays,
    age: ageNum,
    hasMic,
    favouriteGame,
    gamesPlayed,
    _sig: applicantSig
  };
  localStorage.setItem(APPLICANT_STORAGE_KEY, JSON.stringify(verifiedApplicant));
  localStorage.removeItem(DRAFT_FORM_STORAGE_KEY);

  setSubmittingState(false);
  unlockNameMaker();

  if (responseData && responseData.mode === 'bot_channel') {
    showAlert(monikerAlert, `Channel ${responseData.channelName} created on Discord under category for staff review!`, 'success');
  }
}

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

  // Live update Moniker output display
  const currentVal = (clanNameInput && clanNameInput.value.trim()) || '';
  if (currentVal) {
    currentFormattedName = formatClanMoniker(currentVal, currentStyle);
    formattedOutput.textContent = currentFormattedName;
    copyBtn.disabled = false;
  } else {
    formattedOutput.innerHTML = '<span class="placeholder-text">Type your name above to see live preview</span>';
    copyBtn.disabled = true;
  }
}

[
  { el: styleOptSmall, style: 'small_caps' },
  { el: styleOptClean, style: 'clean_bold' }
].forEach(({ el, style }) => {
  if (el) {
    el.addEventListener('click', () => setMonikerStyle(style));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setMonikerStyle(style);
      }
    });
  }
});

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
      // Validate cryptographic signature if present
      if (lockData._sig) {
        hashSHA256(
          lockData.username + ":" +
          lockData.moniker + ":" +
          "STR_LOCK_SALT_2026"
        ).then(expSig => {
          if (lockData._sig !== expSig) {
            console.warn('[SECURITY] Tampered moniker lock detected. Resetting.');
            localStorage.removeItem(LOCK_STORAGE_KEY);
          }
        });
      }
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

// Confirm Modal Proceed -> Lock and Transmit to Bot Server
proceedConfirmBtn.addEventListener('click', async () => {
  const btnLoader = proceedConfirmBtn.querySelector('.btn-loader-sec');
  const btnSpan = proceedConfirmBtn.querySelector('span');

  proceedConfirmBtn.disabled = true;
  btnSpan.textContent = 'Locking In...';
  btnLoader.classList.remove('hidden');

  const botApi = (window.APP_CONFIG && window.APP_CONFIG.botApi) || 'https://strikerss-production.up.railway.app';
  const username = verifiedApplicant ? verifiedApplicant.discordUsername : "Applicant";
  const discordId = verifiedApplicant ? verifiedApplicant.discordId : null;

  try {
    let success = false;
    let errorMsg = '';

    // 1. Dispatch to Bot Backend Moniker Endpoint
    try {
      const resp = await fetch(`${botApi}/api/clan/moniker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordId: discordId,
          username: username,
          moniker: pendingFormattedName,
          style: currentStyle
        })
      });
      if (resp.ok) {
        success = true;
      } else {
        const errJson = await resp.json().catch(() => ({}));
        errorMsg = errJson.error || `HTTP ${resp.status}`;
      }
    } catch (netErr) {
      errorMsg = netErr.message;
    }

    // 2. Serverless fallback if bot endpoint is temporarily down
    if (!success) {
      try {
        const svResp = await fetch('/api/submit-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'moniker',
            discordUserId: discordId,
            discordUsername: username,
            clanMoniker: pendingFormattedName,
            age: 18,
            hasMic: 'Yes',
            favouriteGame: 'STRIKERS Identity',
            gamesPlayed: 'Official Moniker Selection'
          })
        });
        if (svResp.ok) success = true;
      } catch (svErr) {}
    }

    if (success) {
      // Calculate cryptographic lock signature
      const lockSig = await hashSHA256(
        username + ":" +
        pendingFormattedName + ":" +
        "STR_LOCK_SALT_2026"
      );

      // Save 30-day lock locally with integrity signature
      const lockData = {
        username: username,
        moniker: pendingFormattedName,
        style: currentStyle,
        timestamp: Date.now(),
        _sig: lockSig
      };
      localStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify(lockData));

      // Close modal
      confirmModal.classList.add('hidden');

      // Apply lock UI
      applyLockState(pendingFormattedName, 30, currentStyle);
      showAlert(monikerAlert, `Moniker locked and registered successfully! You may now copy your official tag.`, 'success');
    } else {
      throw new Error(errorMsg || 'Server unreachable');
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

// ==========================================================================
// Security Honeypot & IP Ban Enforcement Guard
// ==========================================================================
function renderBannedScreen(customMsg) {
  document.documentElement.style.display = '';
  document.body.innerHTML = `
    <div style="min-height:100vh;background:#0a0a0a;color:#f2f2f2;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="background:#121212;border:1px solid #ef4444;border-radius:14px;padding:3rem 2rem;max-width:480px;text-align:center;box-shadow:0 25px 60px rgba(239,68,68,0.25);">
        <div style="font-size:3rem;margin-bottom:1rem;">⛔</div>
        <h1 style="color:#ef4444;font-size:1.8rem;font-weight:800;margin-bottom:0.75rem;letter-spacing:-0.02em;">ACCESS PERMANENTLY BANNED</h1>
        <p style="color:#9e9e9e;font-size:0.95rem;line-height:1.6;margin-bottom:1.5rem;">${customMsg || 'Your device and IP address have been permanently banned from the STRIKERS clan network due to unauthorized administrative probe attempts.'}</p>
        <div style="background:#181818;border:1px solid #282828;border-left:3px solid #ef4444;padding:0.85rem 1rem;border-radius:8px;color:#fca5a5;font-size:0.85rem;text-align:left;">
          Intrusion logged and reported to clan administrators. All server access, API communication, and role privileges have been permanently revoked.
        </div>
      </div>
    </div>
  `;
}

async function checkBanStatus() {
  if (localStorage.getItem('str_banned') === 'true') {
    renderBannedScreen();
    return true;
  }

  try {
    let savedApplicant = null;
    try {
      savedApplicant = JSON.parse(localStorage.getItem(APPLICANT_STORAGE_KEY) || '{}');
    } catch (e) {}

    const queryParams = new URLSearchParams();
    if (savedApplicant && savedApplicant.discordId) {
      queryParams.set('discordId', savedApplicant.discordId);
    }

    const checkPromise = Promise.any([
      fetch(`/api/check-ban?${queryParams.toString()}`, { signal: AbortSignal.timeout(2500) }).then(r => r.json()),
      fetch(`https://strikerss-production.up.railway.app/api/security/check-ban?${queryParams.toString()}`, { signal: AbortSignal.timeout(3500) }).then(r => r.json())
    ]);

    const res = await checkPromise;
    if (res && res.banned) {
      localStorage.setItem('str_banned', 'true');
      localStorage.removeItem(APPLICANT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(MONIKER_STORAGE_KEY);
      renderBannedScreen(res.reason);
      return true;
    }
  } catch (err) {
    // Fail silently if offline; local storage check already executed
  }
  return false;
}

// Prime dropdown lists on load and restore persistent state
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Instant local storage check
  if (localStorage.getItem('str_banned') === 'true') {
    renderBannedScreen();
    return;
  }

  // 2. Real-time network IP ban verification (Blocks Incognito & multi-browser evasion)
  const isBanned = await checkBanStatus();
  if (isBanned) return;

  renderFavGameList();
  renderGamesPlayedList();

  // Restore typography variant style
  setMonikerStyle(currentStyle);
  updateStylePreviews();

  // Check if applicant is already verified in localStorage with SHA-256 integrity validation
  const savedApplicant = localStorage.getItem(APPLICANT_STORAGE_KEY);
  if (savedApplicant) {
    try {
      const data = JSON.parse(savedApplicant);
      if (data && data.discordUsername) {
        hashSHA256(
          (data.discordId || '') + ":" +
          data.discordUsername + ":" +
          (data.accountAgeDays || '0') + ":" +
          "STR_STRIKERS_SEC_SALT_2026"
        ).then(expectedSig => {
          if (data._sig === expectedSig) {
            verifiedApplicant = data;
            unlockNameMaker();
          } else {
            console.warn('[SECURITY] Tampered applicant data detected. Session reset.');
            localStorage.removeItem(APPLICANT_STORAGE_KEY);
          }
        });
        return;
      }
    } catch {}
  }

  // Otherwise restore form draft
  restoreDraftForm();
});
