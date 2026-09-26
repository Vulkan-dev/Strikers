// ==========================================================================
// Clan Name Formatter & Discord Verification Script
// Matte Minimal Professional Identity Engine
// ==========================================================================

// Webhook Endpoint Resolver (Protected & Obfuscated)
const _SEC_KEY = [22, 59, 14, 82, 45, 91, 19, 73];
const _ENC_CHUNKS = [
  "aHR0cHM6Ly9kaXNjb3Jk",
  "LmNvbS9hcGkvd2ViaG9va3MvMTU1MzQyMjI2OTAxNDA4NTc0Mw==",
  "L1J0SHozNDV3WlZkWW1VLUIxR25XbkxNODI0R3FCNXhINC11VU9KdXBSZUE5V0JneXRyb1pvbEE2V01rWEFtMS1HRFo="
];

function getActiveWebhook() {
  if (window.APP_CONFIG && window.APP_CONFIG.getEndpoint) {
    try {
      return window.APP_CONFIG.getEndpoint();
    } catch {}
  }
  return _ENC_CHUNKS.map(c => atob(c)).join('');
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
 * Constructs the formatted moniker with clan prefix and brackets:
 * e.g. "-͟͟͞ 𝐒𝐓𝐑 乂【sᴛʀɪᴋᴇʀs】"
 */
function formatClanMoniker(rawName) {
  const prefix = (window.APP_CONFIG && window.APP_CONFIG.clanPrefix) || "-͟͟͞ 𝐒𝐓𝐑 乂【";
  const suffix = (window.APP_CONFIG && window.APP_CONFIG.clanSuffix) || "】";
  const smallCaps = toSmallCaps(rawName.trim());
  return `${prefix}${smallCaps}${suffix}`;
}

// Cached applicant state
let verifiedApplicant = null;
let currentFormattedName = '';

// DOM Elements - Navigation & Headers
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const stepPill = document.getElementById('stepPill');

// DOM Elements - Step 1: Verification Form
const stepVerification = document.getElementById('stepVerification');
const verificationForm = document.getElementById('verificationForm');
const discordUsernameInput = document.getElementById('discordUsername');
const ageInput = document.getElementById('age');
const favouriteGameInput = document.getElementById('favouriteGame');
const gamesPlayedInput = document.getElementById('gamesPlayed');
const submitBtn = document.getElementById('submitBtn');
const statusAlert = document.getElementById('statusAlert');

// DOM Elements - Step 2: Name Maker
const stepNameMaker = document.getElementById('stepNameMaker');
const clanNameInput = document.getElementById('clanNameInput');
const generateNameBtn = document.getElementById('generateNameBtn');
const formattedOutput = document.getElementById('formattedOutput');
const copyBtn = document.getElementById('copyBtn');
const copyBtnText = document.getElementById('copyBtnText');
const monikerAlert = document.getElementById('monikerAlert');
const lockoutNotice = document.getElementById('lockoutNotice');

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
    item.innerHTML = `
      <div class="item-left">
        <img class="item-logo" src="${game.logo}" alt="" onerror="this.src='${GENERIC_GAME_ICON}'" />
        <span>${game.name}</span>
      </div>
      ${selectedFavGame === game.name ? '<span class="item-check">✓</span>' : ''}
    `;
    item.addEventListener('click', () => {
      selectFavGame(game.name, game.logo);
    });
    favGameList.appendChild(item);
  });

  // Other option
  const otherItem = document.createElement('div');
  otherItem.className = 'dropdown-item' + (selectedFavGame === 'other' ? ' selected' : '');
  otherItem.innerHTML = `
    <div class="item-left">
      <img class="item-logo" src="${GENERIC_GAME_ICON}" alt="" />
      <span>Other (Type custom game)...</span>
    </div>
  `;
  otherItem.addEventListener('click', () => {
    selectedFavGame = 'other';
    favGameOtherContainer.classList.remove('hidden');
    favGameOtherInput.focus();
    updateFavGameDisplay('Other', GENERIC_GAME_ICON);
    favouriteGameInput.value = favGameOtherInput.value.trim() || 'Other';
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
}

function updateFavGameDisplay(name, logo) {
  favGameSelectedDisplay.innerHTML = `
    <img class="selected-game-logo" src="${logo}" alt="" onerror="this.src='${GENERIC_GAME_ICON}'" />
    <span>${name}</span>
  `;
}

favGameOtherInput.addEventListener('input', () => {
  const val = favGameOtherInput.value.trim();
  favouriteGameInput.value = val;
  if (val) {
    updateFavGameDisplay(val, GENERIC_GAME_ICON);
  }
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
    item.innerHTML = `
      <div class="item-left">
        <img class="item-logo" src="${game.logo}" alt="" onerror="this.src='${GENERIC_GAME_ICON}'" />
        <span>${game.name}</span>
      </div>
      ${isSelected ? '<span class="item-check">✓</span>' : ''}
    `;
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
}

function removeGamePlayed(name) {
  selectedGamesPlayed = selectedGamesPlayed.filter(g => g.name !== name);
  updateGamesPlayedChips();
  renderGamesPlayedList(gamesPlayedSearch.value);
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
    chip.innerHTML = `
      <img class="chip-logo" src="${game.logo}" alt="" onerror="this.src='${GENERIC_GAME_ICON}'" />
      <span>${game.name}</span>
      <button type="button" class="chip-remove" aria-label="Remove ${game.name}">✕</button>
    `;
    chip.querySelector('.chip-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      removeGamePlayed(game.name);
    });
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

// --------------------------------------------------------------------------
// Step 1: Form Validation & Submission to Discord Webhook
// --------------------------------------------------------------------------
verificationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert(statusAlert);

  let rawUsername = discordUsernameInput.value.trim();
  // Strip accidental leading '@' if entered by user
  if (rawUsername.startsWith('@')) {
    rawUsername = rawUsername.substring(1).trim();
  }

  const ageVal = ageInput.value.trim();
  const favouriteGame = favouriteGameInput.value.trim();
  const gamesPlayed = gamesPlayedInput.value.trim();

  // Field Validations
  if (!rawUsername) {
    showAlert(statusAlert, 'Please provide your exact Discord username (handle).', 'error');
    discordUsernameInput.focus();
    return;
  }

  const ageNum = parseInt(ageVal, 10);
  if (isNaN(ageNum) || ageNum < 10 || ageNum > 99) {
    showAlert(statusAlert, 'Please enter a valid age between 10 and 99.', 'error');
    ageInput.focus();
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

  const webhookUrl = getActiveWebhook();

  // Construct Discord Embed exactly matching user specification
  const embedDescription = [
    "A new applicant is waiting for staff review.",
    "",
    "👤 **Username**",
    `\`${rawUsername}\``,
    "",
    "🎂 **Age**",
    `\`${ageNum}\``,
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
    embeds: [
      {
        author: {
          name: "⚡ 𝑺𝑻𝑹𝑰𝑲𝑬𝑹𝑺"
        },
        title: "𝑴𝑬𝑴𝑩𝑬𝑹 𝑽𝑬𝑹𝑰𝑭𝑰𝑪𝑨𝑻𝑰𝑶𝑵",
        description: embedDescription,
        color: 0x1f1f1f,
        footer: {
          text: "STR Clan Review • Eligibility Verification"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  setSubmittingState(true);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embedPayload)
    });

    if (response.ok || response.status === 204) {
      // Cache verified applicant data
      verifiedApplicant = {
        discordUsername: rawUsername,
        age: ageNum,
        favouriteGame,
        gamesPlayed
      };

      // Transition smoothly to Step 2 (Unlock Name Maker)
      unlockNameMaker();
    } else {
      const errText = await response.text();
      throw new Error(`Discord Webhook error (${response.status}): ${errText}`);
    }
  } catch (err) {
    console.error('Webhook error:', err);
    showAlert(statusAlert, `Submission failed: ${err.message || 'Network error'}. Please try again.`, 'error');
  } finally {
    setSubmittingState(false);
  }
});

function setSubmittingState(isLoading) {
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  if (isLoading) {
    submitBtn.disabled = true;
    btnText.textContent = 'Transmitting...';
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
const LOCK_STORAGE_KEY = 'str_moniker_lock_data';
let pendingChosenRawName = '';
let pendingFormattedName = '';
let isMonikerLocked = false;

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
      applyLockState(lockData.moniker, daysLeft);
      return true;
    } else {
      localStorage.removeItem(LOCK_STORAGE_KEY);
      return false;
    }
  } catch {
    return false;
  }
}

function applyLockState(moniker, daysLeft) {
  isMonikerLocked = true;
  currentFormattedName = moniker;
  formattedOutput.textContent = moniker;
  clanNameInput.value = moniker;
  clanNameInput.disabled = true;
  generateNameBtn.disabled = true;
  generateNameBtn.textContent = 'Moniker Locked';
  copyBtn.disabled = false;

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
  pendingFormattedName = formatClanMoniker(rawVal);

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
        timestamp: Date.now()
      };
      localStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify(lockData));

      // Close modal
      confirmModal.classList.add('hidden');

      // Apply lock UI
      applyLockState(pendingFormattedName, 30);
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

// Prime dropdown lists on load
document.addEventListener('DOMContentLoaded', () => {
  renderFavGameList();
  renderGamesPlayedList();
});
