/**
 * config.gs — Configuration management with CacheService
 *
 * Reads key-value pairs from the Config tab.
 * Caches values for 10 minutes to reduce sheet reads.
 *
 * WhatsApp Token Types:
 *   - "temporary" (default): 24-hour token from Meta Developer dashboard.
 *     Must be refreshed daily. The system warns when API calls fail due to expiry.
 *   - "system_user": Permanent token from a Meta System User. Does not expire.
 *     Created in Meta Business Manager > Business Settings > System Users.
 *     Recommended for production deployments.
 *
 * The token value itself is always stored in the WHATSAPP_TOKEN config key.
 * Set WHATSAPP_TOKEN_TYPE to "system_user" or "temporary" to control behavior.
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
    'WHATSAPP_TOKEN_TYPE',
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

  // Validate WHATSAPP_TOKEN_TYPE has a recognized value
  var tokenType = readConfigFromSheet_('WHATSAPP_TOKEN_TYPE');
  if (tokenType && tokenType !== '(placeholder)' && tokenType !== 'temporary' && tokenType !== 'system_user') {
    invalid.push('WHATSAPP_TOKEN_TYPE (invalid value: "' + tokenType + '", expected "temporary" or "system_user")');
  }

  return invalid;
}

/**
 * Returns the configured WhatsApp token type.
 * @return {string} "temporary" or "system_user" (defaults to "temporary")
 */
function getWhatsAppTokenType() {
  var tokenType = getConfig('WHATSAPP_TOKEN_TYPE');
  if (tokenType === 'system_user') {
    return 'system_user';
  }
  return 'temporary';
}

/**
 * Returns whether the WhatsApp token is a permanent System User token.
 * @return {boolean}
 */
function isSystemUserToken() {
  return getWhatsAppTokenType() === 'system_user';
}

/**
 * Validates the WhatsApp token by making a lightweight API call to Meta.
 * Calls the GET /PHONE_NUMBER_ID endpoint which returns phone number info
 * without sending any messages.
 *
 * @return {Object} { valid: boolean, tokenType: string, error: string, details: string }
 */
function validateWhatsAppToken() {
  var token = getConfig('WHATSAPP_TOKEN');
  var phoneNumberId = getConfig('PHONE_NUMBER_ID');
  var tokenType = getWhatsAppTokenType();

  if (!token || token === '(placeholder)') {
    return {
      valid: false,
      tokenType: tokenType,
      error: 'WHATSAPP_TOKEN is not configured. Add your token in the Config tab.',
      details: ''
    };
  }

  if (!phoneNumberId || phoneNumberId === '(placeholder)') {
    return {
      valid: false,
      tokenType: tokenType,
      error: 'PHONE_NUMBER_ID is not configured. Add your Phone Number ID in the Config tab.',
      details: ''
    };
  }

  // Make a lightweight GET request to verify the token works.
  // This endpoint returns the phone number details without sending a message.
  var url = 'https://graph.facebook.com/v19.0/' + phoneNumberId;

  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: { 'Authorization': 'Bearer ' + token },
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    var body = JSON.parse(response.getContentText());

    if (code === 200) {
      var details = 'Phone: ' + (body.display_phone_number || 'N/A') +
                    ', Name: ' + (body.verified_name || 'N/A') +
                    ', Quality: ' + (body.quality_rating || 'N/A');
      Logger.log('WhatsApp token valid (' + tokenType + '). ' + details);
      return {
        valid: true,
        tokenType: tokenType,
        error: '',
        details: details
      };
    }

    // Handle specific error codes with actionable messages
    var errorMsg = '';
    var metaError = body.error || {};
    var metaCode = metaError.code || 0;
    var metaSubcode = metaError.error_subcode || 0;

    if (code === 401 || metaCode === 190) {
      // OAuth exception — token expired or invalid
      if (metaSubcode === 463 || metaSubcode === 467) {
        // 463 = expired, 467 = invalid/logged out
        if (tokenType === 'temporary') {
          errorMsg = 'WhatsApp token has EXPIRED. Temporary tokens last only 24 hours. ' +
                     'Go to developers.facebook.com > Your App > WhatsApp > API Setup > ' +
                     'generate a new temporary token, then update WHATSAPP_TOKEN in the Config tab. ' +
                     'TIP: Switch to a System User token for a permanent solution (set WHATSAPP_TOKEN_TYPE to "system_user").';
        } else {
          errorMsg = 'WhatsApp System User token is INVALID. This should not expire. ' +
                     'Check that: (1) the System User still exists in Meta Business Manager, ' +
                     '(2) it has whatsapp_business_messaging permission, ' +
                     '(3) the token was generated for the correct app. ' +
                     'Regenerate at: Business Manager > Business Settings > System Users > Generate New Token.';
        }
      } else {
        errorMsg = 'WhatsApp token is invalid (Meta error code ' + metaCode + '). ';
        if (tokenType === 'temporary') {
          errorMsg += 'The 24-hour temporary token may have expired. Generate a new one at developers.facebook.com.';
        } else {
          errorMsg += 'Verify the System User token in Meta Business Manager > System Users.';
        }
      }
    } else {
      errorMsg = 'WhatsApp API returned HTTP ' + code + ': ' + (metaError.message || JSON.stringify(body));
    }

    Logger.log('WhatsApp token validation failed (' + tokenType + '): ' + errorMsg);
    return {
      valid: false,
      tokenType: tokenType,
      error: errorMsg,
      details: ''
    };

  } catch (e) {
    Logger.log('WhatsApp token validation error: ' + e.message);
    return {
      valid: false,
      tokenType: tokenType,
      error: 'Could not reach WhatsApp API: ' + e.message,
      details: ''
    };
  }
}
