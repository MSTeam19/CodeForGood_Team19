const axios = require('axios');
require('dotenv').config();

async function getLongLivedToken() {
  try {
    const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_PAGE_ACCESS_TOKEN } = process.env;
    
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !FACEBOOK_PAGE_ACCESS_TOKEN) {
      throw new Error('Missing Facebook credentials in .env file');
    }

    // Step 1: Exchange short-lived user token for long-lived user token
    const userTokenResponse = await axios.get('https://graph.facebook.com/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: FACEBOOK_PAGE_ACCESS_TOKEN
      }
    });

    const longLivedUserToken = userTokenResponse.data.access_token;
    console.log('Long-lived user token:', longLivedUserToken);

    // Step 2: Get page access token (this will be long-lived if user token is long-lived)
    const pageTokenResponse = await axios.get('https://graph.facebook.com/me/accounts', {
      params: {
        access_token: longLivedUserToken
      }
    });

    const pages = pageTokenResponse.data.data;
    console.log('Available pages:');
    pages.forEach(page => {
      console.log(`- ${page.name} (ID: ${page.id})`);
      console.log(`  Access Token: ${page.access_token}`);
      console.log(`  Permissions: ${page.perms.join(', ')}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error getting long-lived token:', error.response?.data || error.message);
  }
}

// Run the function
getLongLivedToken();
