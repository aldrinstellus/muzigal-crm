/**
 * config.gs — Configuration management with CacheService
 *
 * Reads key-value pairs from the Config tab.
 * Caches values for 10 minutes to reduce sheet reads.
 */

var CONFIG_CACHE_PREFIX_ = 'cfg_';
var CONFIG_CACHE_TTL_ = 600; // 10 minutes in seconds

/**
 * Reads a config value by key. Uses CacheService for performance.
 * @param {string} key - The config key to look up.
 * @return {string|null} The config value, or null if not found.
 */
function getConfig(key) {
  var cache = CacheService.getScriptCache();
  var cacheKey = CONFIG_CACHE_PREFIX_ + key;
  var cached = cache.get(cacheKey);

  if (cached !== null) {
    return cached;
  }

  var value = readConfigFromSheet_(key);
  if (value !== null) {
    cache.put(cacheKey, value, CONFIG_CACHE_TTL_);
  }
  return value;
}

/**
 * Reads a config value directly from the Config sheet (bypasses cache).
 * @param {string} key
 * @return {string|null}
 */
function readConfigFromSheet_(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Config');
  if (!sheet) return null;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) { // skip header
    if (data[i][0] === key) {
      return String(data[i][1]);
    }
  }
  return null;
}

/**
 * Clears all cached config values.
 */
function clearConfigCache() {
  var cache = CacheService.getScriptCache();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Config');
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var keys = [];
  for (var i = 1; i < data.length; i++) {
    keys.push(CONFIG_CACHE_PREFIX_ + data[i][0]);
  }

  if (keys.length > 0) {
    cache.removeAll(keys);
  }
  Logger.log('Config cache cleared for ' + keys.length + ' key(s).');
}

/**
 * Validates all required config keys are present and not placeholder values.
 * @return {string[]} Array of missing or invalid config key names.
 */
function validateConfig() {
  var requiredKeys = [
    'WHATSAPP_TOKEN',
    'PHONE_NUMBER_ID',
    'TEMPLATE_NAME',
    'CLAUDE_API_KEY',
    'USE_CLAUDE',
    'DAILY_SEND_HOUR',
    'DAILY_SEND_MINUTE',
    'TIMEZONE',
    'SCHOOL_NAME',
    'WEBHOOK_SECRET'
  ];

  var invalid = [];

  requiredKeys.forEach(function(key) {
    var value = readConfigFromSheet_(key);
    if (!value || value === '(placeholder)' || value.trim() === '') {
      invalid.push(key);
    }
  });

  return invalid;
}
