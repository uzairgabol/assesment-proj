import { Amplify } from 'aws-amplify';
import { AUTH_CONFIG } from './constants';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: AUTH_CONFIG.USER_POOL_ID,
      userPoolClientId: AUTH_CONFIG.APP_CLIENT_ID,
      region: AUTH_CONFIG.REGION,
    },
  },
});