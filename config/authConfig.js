export const msalConfig = {
  auth: {
    clientId: '04e2e4c0-153d-4d41-870e-41aab6af485b', // Your app client ID
    authority: 'https://login.microsoftonline.com/47ad30b9-4668-4bb3-a485-0a1c23a66679', // Your tenant ID
    redirectUri: 'http://localhost:3000'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'User.Read'],
};
