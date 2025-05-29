const { OAuth2Client } = require('google-auth-library');

// Initialize client with error checking
const initializeClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not set in environment variables');
  }
  return new OAuth2Client(clientId);
};

const client = initializeClient();

module.exports = async function verifyGoogleToken(token) {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    console.log('Verifying Google token...');
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    console.log('Google token verified successfully for user:', payload.email);

    return {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Google token verification failed:', error.message);
    throw new Error(`Google authentication failed: ${error.message}`);
  }
};
