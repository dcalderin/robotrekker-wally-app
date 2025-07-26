// config/authConfig.js
export const msalConfig = {
  auth: {
    clientId: '04e2e4c0-153d-4d41-870e-41aab6af485b',
    // For External ID tenants, use the specific tenant subdomain
    authority: 'https://login.microsoftonline.com/robotrekerai.onmicrosoft.com',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    // Add these for External ID
    knownAuthorities: ['robotrekerai.onmicrosoft.com'],
    cloudDiscoveryMetadata: '',
    authorityMetadata: ''
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
  // Force account selection to ensure proper tenant
  prompt: 'select_account'
};