// ==========================================================================
// Popular Games Directory with Vector / CDN Logos
// ==========================================================================

const POPULAR_GAMES = [
  {
    id: "valorant",
    name: "Valorant",
    logo: "https://cdn.simpleicons.org/valorant/ff4655"
  },
  {
    id: "cs2",
    name: "Counter-Strike 2 (CS2)",
    logo: "https://cdn.simpleicons.org/counterstrike/f5a623"
  },
  {
    id: "fortnite",
    name: "Fortnite",
    logo: "https://cdn.simpleicons.org/fortnite/ffffff"
  },
  {
    id: "minecraft",
    name: "Minecraft",
    logo: "https://cdn.simpleicons.org/minecraft/529b38"
  },
  {
    id: "apex-legends",
    name: "Apex Legends",
    logo: "https://cdn.simpleicons.org/ea/da292a"
  },
  {
    id: "call-of-duty",
    name: "Call of Duty: Warzone",
    logo: "https://cdn.simpleicons.org/activision/ffffff"
  },
  {
    id: "rainbow-six",
    name: "Tom Clancy's Rainbow Six Siege",
    logo: "https://cdn.simpleicons.org/ubisoft/0066ff"
  },
  {
    id: "rust",
    name: "Rust",
    logo: "https://cdn.simpleicons.org/rust/ce422b"
  },
  {
    id: "gta-v",
    name: "Grand Theft Auto V / RP",
    logo: "https://cdn.simpleicons.org/rockstargames/f99f1b"
  },
  {
    id: "league-of-legends",
    name: "League of Legends",
    logo: "https://cdn.simpleicons.org/leagueoflegends/c8aa6e"
  },
  {
    id: "roblox",
    name: "Roblox",
    logo: "https://cdn.simpleicons.org/roblox/ffffff"
  },
  {
    id: "overwatch",
    name: "Overwatch 2",
    logo: "https://cdn.simpleicons.org/overwatch/f99e1a"
  },
  {
    id: "rocket-league",
    name: "Rocket League",
    logo: "https://cdn.simpleicons.org/rocketleague/0074e4"
  },
  {
    id: "pubg",
    name: "PUBG: Battlegrounds",
    logo: "https://cdn.simpleicons.org/pubg/f39c12"
  },
  {
    id: "dota-2",
    name: "Dota 2",
    logo: "https://cdn.simpleicons.org/dota2/e74c3c"
  },
  {
    id: "tarkov",
    name: "Escape from Tarkov",
    logo: "https://cdn.simpleicons.org/battlenet/00aeff"
  },
  {
    id: "dead-by-daylight",
    name: "Dead by Daylight",
    logo: "https://cdn.simpleicons.org/steam/ffffff"
  },
  {
    id: "brawlhalla",
    name: "Brawlhalla",
    logo: "https://cdn.simpleicons.org/ubisoft/0066ff"
  },
  {
    id: "free-fire",
    name: "Garena Free Fire",
    logo: "https://cdn.simpleicons.org/epicgames/ffffff"
  }
];

// Fallback generic game controller SVG icon (safely encoded)
const GENERIC_GAME_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5ZTllOWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48bGluZSB4MT0iNiIgeTE9IjEyIiB4Mj0iMTAiIHkyPSIxMiI+PC9saW5lPjxsaW5lIHgxPSI4IiB5MT0iMTAiIHgyPSI4IiB5Mj0iMTQiPjwvbGluZT48bGluZSB4MT0iMTUiIHkxPSIxMyIgeDI9IjE1LjAxIiB5Mj0iMTMiPjwvbGluZT48bGluZSB4MT0iMTgiIHkxPSIxMSIgeDI9IjE4LjAxIiB5Mj0iMTEiPjwvbGluZT48cmVjdCB4PSIyIiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMTIiIHJ4PSI2Ij48L3JlY3Q+PC9zdmc+";
