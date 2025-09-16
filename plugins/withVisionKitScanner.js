const { withInfoPlist } = require('@expo/config-plugins');

module.exports = function withVisionKitScanner(config) {
  return withInfoPlist(config, (config) => {
    // Add camera usage description for OCR
    config.modResults.NSCameraUsageDescription = 
      config.modResults.NSCameraUsageDescription || 
      'This app needs camera access to scan documents and text';
    
    return config;
  });
};
