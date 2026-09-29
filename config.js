// STR Clan Configuration
(function() {
  window.APP_CONFIG = {
    // Strikers Discord Bot Backend API Endpoint (Railway Public URL or Localhost)
    botApi: window.RAILWAY_URL || localStorage.getItem('str_railway_api') || "http://localhost:3000",
    // Legitimacy & Account Age Requirement
    requiredAccountAgeDays: 90, // Minimum 3 months
    clanPrefix: "-͟͟͞ 𝐒𝐓𝐑 乂【",
    clanSuffix: "】",
    clanName: "STR Clan",
    embedColor: 0x1f1f1f
  };
})();
