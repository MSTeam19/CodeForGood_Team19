const axios = require('axios');

const FB_API_VERSION = "v23.0";

class FacebookService {
  constructor() {
    this.pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    this.pageId = process.env.FACEBOOK_PAGE_ID;
    this.baseUrl = `https://graph.facebook.com/${FB_API_VERSION}`;
  }

  async postToFacebook(message, imageUrl = null) {
    try {
      // Check if credentials are available
      if (!this.pageAccessToken || !this.pageId) {
        console.warn('Facebook credentials not configured. Skipping Facebook post.');
        return { success: false, error: 'Facebook credentials not configured' };
      }

      const url = `${this.baseUrl}/${this.pageId}/feed`;
      
      const postData = {
        message: message,
        access_token: this.pageAccessToken
      };

      // If there's an image, add it
      if (imageUrl) {
        postData.link = imageUrl;
      }

      const response = await axios.post(url, postData);
      
      return {
        success: true,
        facebookPostId: response.data.id
      };
    } catch (error) {
      console.error('Facebook posting error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async postPhotoToFacebook(message, photoUrl) {
    try {
      // Check if credentials are available
      if (!this.pageAccessToken || !this.pageId) {
        console.warn('Facebook credentials not configured. Skipping Facebook post.');
        return { success: false, error: 'Facebook credentials not configured' };
      }

      const url = `${this.baseUrl}/${this.pageId}/photos`;
      
      const postData = {
        caption: message,
        url: photoUrl,
        access_token: this.pageAccessToken
      };

      const response = await axios.post(url, postData);
      
      return {
        success: true,
        facebookPostId: response.data.id
      };
    } catch (error) {
      console.error('Facebook photo posting error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

module.exports = new FacebookService();