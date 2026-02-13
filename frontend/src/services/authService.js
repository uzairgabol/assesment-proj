import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignIn,
} from 'aws-amplify/auth';

export const authService = {
  async login(username, password) {
    try {
      const response = await signIn({ username, password });
      return {
        success: true,
        nextStep: response.nextStep,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async completeNewPassword(newPassword) {
    try {
      const response = await confirmSignIn({
        challengeResponse: newPassword,
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async logout() {
    try {
      await signOut();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getToken(forceRefresh = false) {
    try {
      const session = await fetchAuthSession({ forceRefresh });
      
      // Use idToken for API authorization (matching Postman configuration)
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        console.error('No ID token found in session');
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
};