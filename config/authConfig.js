// config/authConfig.js
export const msalConfig = {
  auth: {
    clientId: '04e2e4c0-153d-4d41-870e-41aab6af485b',
    authority: 'https://robotrekerai.ciamlogin.com/47ad30b9-4668-4bb3-a485-0a1c23a66679/v2.0?p=susi_wally',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000/authentication/login-callback',
    knownAuthorities: ['robotrekerai.ciamlogin.com']
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};