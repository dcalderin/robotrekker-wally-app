// config/authConfig.js
export const msalConfig = {
  auth: {
    clientId: '04e2e4c0-153d-4d41-870e-41aab6af485b',
    // Use the External ID tenant where your app is registered
    authority: 'https://login.microsoftonline.com/47ad30b9-4668-4bb3-a485-0a1c23a66679',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};
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