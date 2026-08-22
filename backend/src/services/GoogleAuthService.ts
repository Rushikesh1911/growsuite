import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

export class GoogleAuthService {
  /**
   * Verifies a Google access_token and returns the user payload.
   * Throws an error if the token is invalid or verification fails.
   */
  static async verifyIdToken(accessToken: string) {
    try {
      // Use the access token to fetch user info directly from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const payload = await response.json();
      
      if (!payload || !payload.email) {
        throw new Error("Invalid token payload");
      }

      return {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || null,
        googleId: payload.sub
      };
    } catch (error) {
      console.error("Google verifyIdToken error:", error);
      throw new Error("Failed to verify Google token");
    }
  }
}
