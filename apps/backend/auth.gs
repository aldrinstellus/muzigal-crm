/**
 * auth.gs — JWT-based authentication for ZOO CRM
 *
 * Provides Google OAuth token verification, JWT creation/verification,
 * role-based access control, and login handling.
 */

/**
 * Verifies a Google OAuth ID token by calling Google's tokeninfo endpoint.
 * @param {string} idToken - The Google OAuth ID token from the frontend
 * @return {Object|null} User info {email, name, picture} or null if invalid
 */
function verifyGoogleToken(idToken) {
  if (!idToken) {
    Logger.log('verifyGoogleToken: No ID token provided');
    return null;
  }

  try {
    var url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = response.getResponseCode();

    if (code !== 200) {
      Logger.log('verifyGoogleToken: Google returned status ' + code);
      return null;
    }

    var payload = JSON.parse(response.getContentText());

    if (!payload.email) {
      Logger.log('verifyGoogleToken: No email in token payload');
      return null;
    }

    return {
      email: payload.email,
      name: payload.name || '',
      picture: payload.picture || ''
    };
  } catch (err) {
    Logger.log('verifyGoogleToken error: ' + err.message);
    return null;
  }
}

/**
 * Creates a JWT token signed with HMAC-SHA256.
 * @param {Object} payload - Token payload (email, name, role)
 * @return {string} The signed JWT string
 */
function createJWT(payload) {
  var secret = getConfig('JWT_SECRET');
  if (!secret || secret === '(placeholder)') {
    throw new Error('JWT_SECRET not configured in Config tab');
  }

  var header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  var now = Math.floor(Date.now() / 1000);
  var tokenPayload = {
    email: payload.email || '',
    name: payload.name || '',
    role: payload.role || 'student',
    iat: now,
    exp: now + (24 * 60 * 60) // 24 hours
  };

  var headerEncoded = base64UrlEncode_(JSON.stringify(header));
  var payloadEncoded = base64UrlEncode_(JSON.stringify(tokenPayload));
  var signingInput = headerEncoded + '.' + payloadEncoded;

  var signatureBytes = Utilities.computeHmacSha256Signature(signingInput, secret);
  var signatureEncoded = base64UrlEncodeBytes_(signatureBytes);

  return signingInput + '.' + signatureEncoded;
}

/**
 * Verifies a JWT token's signature and expiry.
 * @param {string} token - The JWT string to verify
 * @return {Object|null} Decoded payload or null if invalid/expired
 */
function verifyJWT(token) {
  if (!token) {
    Logger.log('verifyJWT: No token provided');
    return null;
  }

  try {
    var parts = token.split('.');
    if (parts.length !== 3) {
      Logger.log('verifyJWT: Invalid token format (expected 3 parts)');
      return null;
    }

    var secret = getConfig('JWT_SECRET');
    if (!secret || secret === '(placeholder)') {
      Logger.log('verifyJWT: JWT_SECRET not configured');
      return null;
    }

    // Verify signature
    var signingInput = parts[0] + '.' + parts[1];
    var signatureBytes = Utilities.computeHmacSha256Signature(signingInput, secret);
    var expectedSignature = base64UrlEncodeBytes_(signatureBytes);

    if (expectedSignature !== parts[2]) {
      Logger.log('verifyJWT: Signature mismatch');
      return null;
    }

    // Decode payload
    var payload = JSON.parse(base64UrlDecode_(parts[1]));

    // Check expiry
    var now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      Logger.log('verifyJWT: Token expired for ' + payload.email);
      return null;
    }

    return payload;
  } catch (err) {
    Logger.log('verifyJWT error: ' + err.message);
    return null;
  }
}

/**
 * Determines user role based on email. Checks against ADMIN_EMAILS config.
 * @param {string} email - The user's email address
 * @return {string} 'admin' if email is in ADMIN_EMAILS, 'student' otherwise
 */
function getRole(email) {
  if (!email) return 'student';

  var adminEmailsRaw = getConfig('ADMIN_EMAILS');
  if (!adminEmailsRaw || adminEmailsRaw === '(placeholder)') {
    Logger.log('getRole: ADMIN_EMAILS not configured, defaulting to student');
    return 'student';
  }

  var adminEmails = adminEmailsRaw.split(',').map(function(e) {
    return e.trim().toLowerCase();
  });

  return adminEmails.indexOf(email.toLowerCase()) !== -1 ? 'admin' : 'student';
}

/**
 * Authentication middleware. Extracts and verifies JWT from the request.
 * Checks Authorization header (Bearer token) or `token` query parameter.
 * @param {Object} e - Apps Script web app event object
 * @param {string} [requiredRole] - Optional role requirement ('admin')
 * @return {Object} {authenticated: true, user: {email, name, role}} or {authenticated: false, error: string}
 */
function requireAuth(e, requiredRole) {
  var token = null;

  // Try Authorization header (Bearer token)
  if (e && e.parameter && e.parameter.Authorization) {
    var authHeader = e.parameter.Authorization;
    if (authHeader.indexOf('Bearer ') === 0) {
      token = authHeader.substring(7);
    }
  }

  // Try token query parameter as fallback
  if (!token && e && e.parameter && e.parameter.token) {
    token = e.parameter.token;
  }

  // Try POST body token field
  if (!token && e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      if (body.token) {
        token = body.token;
      }
    } catch (parseErr) {
      // Ignore parse errors — body may not be JSON
    }
  }

  if (!token) {
    return { authenticated: false, error: 'No authentication token provided' };
  }

  var payload = verifyJWT(token);
  if (!payload) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }

  // Check role if required
  if (requiredRole && payload.role !== requiredRole) {
    return { authenticated: false, error: 'Insufficient permissions. Required role: ' + requiredRole };
  }

  return {
    authenticated: true,
    user: {
      email: payload.email,
      name: payload.name,
      role: payload.role
    }
  };
}

/**
 * Handles user login. Supports email:password OR Google OAuth token.
 * @param {string} credentials - Either "email:password" or a Google OAuth ID token
 * @return {Object} {success, token, user} or {success: false, error}
 */
function handleLogin(credentials) {
  try {
    var email, name, role;

    // Check if credentials contain ":" (email:password format)
    if (credentials && credentials.indexOf(':') !== -1 && credentials.indexOf('.') < credentials.indexOf(':')) {
      // Email:password login
      var parts = credentials.split(':');
      var inputEmail = parts[0];
      var inputPassword = parts.slice(1).join(':'); // password may contain colons

      // Look up user in Users sheet
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var usersSheet = ss.getSheetByName('Users');
      if (!usersSheet || usersSheet.getLastRow() <= 1) {
        // Fall back to ADMIN_EMAILS check with default password
        var adminEmails = (getConfig('ADMIN_EMAILS') || '').split(',').map(function(e) { return e.trim().toLowerCase(); });
        var defaultPassword = getConfig('DEFAULT_PASSWORD') || 'admin123';
        if (adminEmails.indexOf(inputEmail.toLowerCase()) !== -1 && inputPassword === defaultPassword) {
          email = inputEmail;
          name = inputEmail.split('@')[0];
          role = 'admin';
        } else {
          return { success: false, error: 'Invalid email or password' };
        }
      } else {
        // Check Users sheet for credentials
        var userData = usersSheet.getDataRange().getValues();
        var found = false;
        for (var i = 1; i < userData.length; i++) {
          if (String(userData[i][0]).toLowerCase() === inputEmail.toLowerCase()) {
            // Column 0=Email, 1=Password (hashed or plain for now), 2=Name, 3=Role, 4=Active
            if (String(userData[i][1]) === inputPassword && String(userData[i][4]).toUpperCase() === 'TRUE') {
              email = String(userData[i][0]);
              name = String(userData[i][2]) || email.split('@')[0];
              role = String(userData[i][3]) || 'student';
              found = true;
            }
            break;
          }
        }
        if (!found) {
          return { success: false, error: 'Invalid email or password' };
        }
      }
    } else {
      // Google OAuth token login (original flow)
      var googleUser = verifyGoogleToken(credentials);
      if (!googleUser) {
        return { success: false, error: 'Invalid credentials' };
      }
      email = googleUser.email;
      name = googleUser.name;
      role = getRole(googleUser.email);
    }

    var jwt = createJWT({
      email: email,
      name: name,
      role: role
    });

    Logger.log('Login successful: ' + email + ' (role: ' + role + ')');

    return {
      success: true,
      token: jwt,
      user: {
        email: googleUser.email,
        name: googleUser.name,
        role: role
      }
    };
  } catch (err) {
    Logger.log('handleLogin error: ' + err.message);
    return { success: false, error: 'Login failed: ' + err.message };
  }
}

// ---------------------------------------------------------------------------
// Helper functions (private)
// ---------------------------------------------------------------------------

/**
 * Base64url-encodes a string.
 * @private
 * @param {string} str - The string to encode
 * @return {string} Base64url-encoded string
 */
function base64UrlEncode_(str) {
  var encoded = Utilities.base64Encode(str, Utilities.Charset.UTF_8);
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64url-encodes a byte array.
 * @private
 * @param {number[]} bytes - The byte array to encode
 * @return {string} Base64url-encoded string
 */
function base64UrlEncodeBytes_(bytes) {
  var encoded = Utilities.base64Encode(bytes);
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64url-decodes a string.
 * @private
 * @param {string} str - The base64url-encoded string to decode
 * @return {string} Decoded string
 */
function base64UrlDecode_(str) {
  // Restore standard base64 characters
  var base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  var padding = base64.length % 4;
  if (padding === 2) {
    base64 += '==';
  } else if (padding === 3) {
    base64 += '=';
  }

  var decoded = Utilities.base64Decode(base64, Utilities.Charset.UTF_8);
  return Utilities.newBlob(decoded).getDataAsString();
}
