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

  async getToken() {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
};