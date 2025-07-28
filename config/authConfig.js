// config/authConfig.js - CIAM External ID Configuration
export const msalConfig = {
  auth: {
    clientId: '04e2e4c0-153d-4d41-870e-41aab6af485b',
    authority: 'https://robotrekerai.ciamlogin.com/47ad30b9-4668-4bb3-a485-0a1c23a66679/v2.0',
    // FIXED: Use exact registered redirect URI (no dynamic window.location.origin)
    redirectUri: 'https://agreeable-water-0cc1ed70f.1.azurestaticapps.net',
    knownAuthorities: ['robotrekerai.ciamlogin.com'],
    validateAuthority: false,
    // FIXED: Static postLogoutRedirectUri
    postLogoutRedirectUri: 'https://agreeable-water-0cc1ed70f.1.azurestaticapps.net',
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(`MSAL ${level}: ${message}`);
      },
      logLevel: 'Info'
    }
  }
};

// Enhanced login request for external users
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
  prompt: 'select_account', // Critical for external users
  extraQueryParameters: {
    // User flow for external user authentication
    p: 'sisuwally'
  }
};

// Specific request for external user scenarios
export const externalUserLoginRequest = {
  scopes: ['openid', 'profile', 'email'],
  prompt: 'login', // Force fresh login
  extraQueryParameters: {
    login_hint: '', // Don't pre-fill any account
    domain_hint: '', // Allow any domain
    p: 'sisuwally' // ADDED: User flow for external users
  }
};