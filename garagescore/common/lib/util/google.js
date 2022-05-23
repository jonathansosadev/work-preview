const axios = require('axios');
const ModerationStatus = require('../../models/data/type/moderation-status');

if (
  !process.env.GOOGLE_OAUTH_CLIENT_ID ||
  !process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
  !process.env.GOOGLE_BACKEND_API_KEY
) {
  console.error('ENV: GOOGLE_OAUTH_CLIENT_ID and/or GOOGLE_OAUTH_CLIENT_SECRET missing.');
}
class Google {
  static tokenBaseUrl() {
    return `https://oauth2.googleapis.com`;
  }
  static apiBaseUrl() {
    return `https://mybusinessaccountmanagement.googleapis.com/v4`;
  }
  static get baseConfig() {
    return { client_id: process.env.GOOGLE_OAUTH_CLIENT_ID, client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET };
  }
  static get mapsApiKey() {
    return process.env.GOOGLE_BACKEND_API_KEY;
  }
  static async generateRefreshTokenFromCode(code) {
    let response = null;
    try {
      response = await axios.post(`${this.tokenBaseUrl()}/token`, {
        ...this.baseConfig,
        code,
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code',
      });
      return Promise.resolve(response.data.refresh_token);
    } catch (e) {
      console.error(
        `[GOOGLE] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return Promise.reject(
        e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)
      );
    }
  }
  static async generateAccessTokenFromRefreshToken(refreshToken) {
    let response = null;
    try {
      response = await axios.post(`${this.tokenBaseUrl()}/token`, {
        ...this.baseConfig,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      return Promise.resolve(response.data.access_token);
    } catch (e) {
      console.error(
        `[GOOGLE] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return Promise.reject(
        e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)
      );
    }
  }
  static async fetchLocations(refreshToken) {
    let accessToken = null;
    let accounts = [];
    let locations = [];
    let rawLocations = [];
    try {
      accessToken = await this.generateAccessTokenFromRefreshToken(refreshToken);
      accounts =
        (
          await axios.get(`${this.apiBaseUrl()}/accounts?pageSize=500`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        ).data.accounts || [];
      for (const account of accounts) {
        if (!account.accountName || !account.accountName.toLowerCase().includes('adwords')) {
          rawLocations =
            (
              await axios.get(`${this.apiBaseUrl()}/${account.name}/locations?pageSize=500`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              })
            ).data.locations || [];
          locations.push(
            ...rawLocations.filter(
              (l) =>
                l.locationKey &&
                l.locationKey.placeId &&
                !locations.find(
                  (e) => e.locationKey && e.locationKey.placeId && e.locationKey.placeId === l.locationKey.placeId
                )
            )
          );
        }
      }
      return Promise.resolve(locations);
    } catch (e) {
      console.error(
        `[GOOGLE] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return Promise.reject(
        e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)
      );
    }
  }
  static async fetchSingleLocation(refreshToken, locationId) {
    let accessToken = null;
    let location = null;
    try {
      accessToken = await this.generateAccessTokenFromRefreshToken(refreshToken);
      location =
        (
          await axios.get(`${this.apiBaseUrl()}/${locationId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        ).data || null;
      return Promise.resolve(location);
    } catch (e) {
      console.error(
        `[GOOGLE] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return Promise.reject(
        e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)
      );
    }
  }
  static async reply(refreshToken, reviewName, comment) {
    let accessToken = null;
    let response = null;
    try {
      accessToken = await this.generateAccessTokenFromRefreshToken(refreshToken);
      response = await axios.put(
        `${this.apiBaseUrl()}/${reviewName}/reply`,
        { comment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return Promise.resolve(response.data);
    } catch (e) {
      console.error(
        `[GOOGLE] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return Promise.reject(
        e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)
      );
    }
  }
  static async delete(refreshToken, reviewName) {
    let accessToken = null;
    let response = null;
    try {
      accessToken = await this.generateAccessTokenFromRefreshToken(refreshToken);
      response = await axios.delete(`${this.apiBaseUrl()}/${reviewName}/reply`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return Promise.resolve(response.data);
    } catch (e) {
      console.error(
        `[GOOGLE] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return Promise.reject(
        e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)
      );
    }
  }
  static async postOnGmb(refreshToken, locationId, post) {
    let accessToken = null;
    let response = null;
    try {
      accessToken = await this.generateAccessTokenFromRefreshToken(refreshToken);
      response = await axios.post(
        `${this.apiBaseUrl()}/${locationId}/localPosts`,
        { ...post },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return Promise.resolve(response.data);
    } catch (e) {
      console.error(
        `[GOOGLE] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return Promise.reject(
        e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)
      );
    }
  }
  static generateGmbPostFromText(text, url = null, imageUrl = null, lang = 'fr') {
    const post = {
      languageCode: `${lang.toLowerCase()}-${lang.toUpperCase()}`,
      summary: text.toString(),
    };
    if (url) {
      post.callToAction = { actionType: 'LEARN_MORE', url };
    }
    if (imageUrl) {
      post.media = [{ mediaFormat: 'PHOTO', sourceUrl: imageUrl }];
    }
    return post;
  }

  static getReplyToSave(replyText, authorId) {
    return {
      status: ModerationStatus.APPROVED,
      approvedAt: new Date(),
      rejectedReason: null,
      text: replyText,
      authorId: authorId,
      sharedWithPartnersAt: { $ifNull: ['$review.sharedWithPartnersAt', new Date()] },
    };
  }
}
module.exports = Google;
