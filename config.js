// STR Clan Configuration
(function() {
  // Verified Discord Webhook Endpoint
  const _EP = [
    "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTU1MzQyMjI2OTAxNDA4NTc0My9SdEh6MzQ1d1pWZFltVS1CaTFHblduTE04MjRHcUI1eEg0LXVVT0p1cFJlQTlXQmd5dHJvWm9sQTZXTWtYQW0xLUdEWg=="
  ];

  window.APP_CONFIG = {
    // Strikers Discord Bot Backend API Endpoint
    botApi: "http://localhost:3000",
    getEndpoint: function() {
      return atob(_EP[0]);
    },
    // Legitimacy & Account Age Requirement
    requiredAccountAgeDays: 90, // Minimum 3 months
    clanPrefix: "-͟͟͞ 𝐒𝐓𝐑 乂【",
    clanSuffix: "】",
    clanName: "STR Clan",
    embedColor: 0x1f1f1f
  };
})();
