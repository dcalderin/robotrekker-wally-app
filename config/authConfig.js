// config/authConfig.js - FIXED for External ID with User Flow
export const msalConfig = {
  auth: {
    clientId: '04e2e4c0-153d-4d41-870e-41aab6af485b',
    // CORRECTED: Remove v2.0 when using user flows in External ID
    authority: 'https://robotrekerai.ciamlogin.com/47ad30b9-4668-4bb3-a485-0a1c23a66679?p=susi_wally',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    knownAuthorities: ['robotrekerai.ciamlogin.com'],
    // EXTERNAL ID SPECIFIC: Ensure proper authority validation
    validateAuthority: false
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  // EXTERNAL ID OPTIMIZATION: Better error handling
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 'Error'
    }
  }
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
  // EXTERNAL ID: Ensure proper scope handling
  extraScopesToConsent: []
};