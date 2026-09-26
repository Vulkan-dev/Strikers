// STR Clan Configuration
(function() {
  const _EP = [
    "aHR0cHM6Ly9kaXNjb3Jk",
    "LmNvbS9hcGkvd2ViaG9va3MvMTU1MzQyMjI2OTAxNDA4NTc0Mw==",
    "L1J0SHozNDV3WlZkWW1VLUIxR25XbkxNODI0R3FCNXhINC11VU9KdXBSZUE5V0JneXRyb1pvbEE2V01rWEFtMS1HRFo="
  ];

  window.APP_CONFIG = {
    getEndpoint: function() {
      return _EP.map(function(s) { return atob(s); }).join('');
    },
    clanPrefix: "-͟͟͞ 𝐒𝐓𝐑 乂【",
    clanSuffix: "】",
    clanName: "STR Clan",
    embedColor: 0x1f1f1f
  };
})();
