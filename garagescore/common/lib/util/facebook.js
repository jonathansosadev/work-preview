const axios = require('axios');
const chalk = require('chalk');
const ModerationStatus = require('../../models/data/type/moderation-status');

if (!process.env.FACEBOOK_OAUTH_CLIENT_ID || !process.env.FACEBOOK_OAUTH_CLIENT_SECRET) {
  console.error(chalk.red('ENV: FACEBOOK_OAUTH_CLIENT_ID and/or FACEBOOK_OAUTH_CLIENT_SECRET missing.'));
}

const _noFacebookCommentWithoutResponse = (replies, authorizeNoResponseAtAll) => {
  if (!replies || !replies.length) {
    return authorizeNoResponseAtAll;
  }
  for (const reply of replies) {
    if (!_noFacebookCommentWithoutResponse(reply.replies, true)) {
      return false;
    }
  }
  return replies[replies.length - 1].isFromOwner;
};

class Facebook {
  static get baseUrl() {
    return process.env.FACEBOOK_API_URL;
  }
  static async generateLongTimeToken(token) {
    const path = '/oauth/access_token';
    const clientId = process.env.FACEBOOK_OAUTH_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_OAUTH_CLIENT_SECRET;
    const params = `?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${token}`;
    let longTimeToken = null;
    try {
      longTimeToken = (await axios.get(`${this.baseUrl}${path}${params}`)).data.access_token;
    } catch (e) {
      console.error(
        `[FACEBOOK] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
    }
    return longTimeToken;
  }
  static async fetchLocations(accessToken) {
    const accounts = [];
    let response = null;
    try {
      response = (
        await axios.get(
          `${this.baseUrl}/me/accounts?fields=name,location,locations{name_with_location_descriptor,name,location}&access_token=${accessToken}`
        )
      ).data; // eslint-disable-line
      for (const data of response.data) {
        if (!data.location && data.locations && data.locations.data.length) {
          accounts.push(
            ...data.locations.data.map((l) => ({
              name: l.name_with_location_descriptor,
              location: l.location,
              id: l.id,
            }))
          );
          accounts.push({ name: data.name, location: null, id: data.id });
        } else if (data.location) {
          accounts.push(data);
        }
      }
      while (response.paging && response.paging.next) {
        response = (await axios.get(response.paging.next)).data;
        for (const data of response.data) {
          if (!data.location && data.locations && data.locations.length) {
            accounts.push(
              ...data.locations.map((l) => ({ name: l.name_with_location_descriptor, location: l.location, id: l.id }))
            );
          } else if (data.location) {
            accounts.push(data);
          }
        }
      }
      return Promise.resolve(accounts);
    } catch (e) {
      console.error(
        `[FACEBOOK] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return Promise.reject(
        e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)
      );
    }
  }
  static async postComment(externalId, token, id, message) {
    let response = null;
    try {
      const account = (await axios.get(`${this.baseUrl}/${externalId}?fields=access_token&access_token=${token}`)).data;
      const accessToken = account.access_token;
      response = (
        await axios.post(
          `${this.baseUrl}/${id}/comments?access_token=${accessToken}&fields=from,created_time,message`,
          { message }
        )
      ).data; // eslint-disable-line
    } catch (e) {
      console.error(
        `[FACEBOOK] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return { error: e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message) };
    }
    return response;
  }
  static getReplyToSave({ review, commentId, replyId }, replyFromFB) {
    let thread = [];
    const { id, message, created_time, from } = replyFromFB;
    let relevantCommentIndex;
    if (review && review.reply && review.reply.thread) {
      thread = [...review.reply.thread];
    }
    const reply = {
      text: message || '',
      status: ModerationStatus.APPROVED,
      approvedAt: created_time || new Date(),
      rejectedReason: null,
      author: (from && from.name) || 'Owner',
      id: id || '',
      authorId: (from && from.id) || '',
      attachment: '',
      isFromOwner: true,
    };

    if (commentId) {
      relevantCommentIndex = thread.findIndex((comment) => comment.id === commentId);
    } else {
      reply.replies = [];
      thread.push(reply);
    }
    if (replyId && relevantCommentIndex > -1) {
      //create reply of a reply
      if (!thread[relevantCommentIndex].replies) {
        thread[relevantCommentIndex].replies = [reply];
      } else {
        const relevantReplyIndex = thread[relevantCommentIndex].replies.findIndex((comment) => comment.id === replyId);
        // update reply of a reply
        if (relevantReplyIndex >= 0) {
          thread[relevantCommentIndex].replies[relevantReplyIndex] = reply;
        } else {
          thread[relevantCommentIndex].replies.push(reply);
        }
      }
    } else if (relevantCommentIndex > -1 && !replyId) {
      if (thread[relevantCommentIndex].replies) {
        reply.replies = thread[relevantCommentIndex].replies;
      }
      thread[relevantCommentIndex] = reply;
    }
    const replyStatus = _noFacebookCommentWithoutResponse(thread, false) ? 'Approved' : 'NoResponse';
    return { replyStatus, thread };
  }

  static async deleteComment(externalId, token, id) {
    let response = null;
    try {
      const account = (await axios.get(`${this.baseUrl}/${externalId}?fields=access_token&access_token=${token}`)).data;
      const accessToken = account.access_token;
      response = (await axios.delete(`${this.baseUrl}/${id}?access_token=${accessToken}`)).data;
    } catch (e) {
      console.error(
        `[FACEBOOK] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return { error: e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message) };
    }
    return response;
  }
  static async updateComment(externalId, token, id, message) {
    let response = null;
    try {
      const account = (await axios.get(`${this.baseUrl}/${externalId}?fields=access_token&access_token=${token}`)).data;
      const accessToken = account.access_token;
      response = (
        await axios.post(`${this.baseUrl}/${id}?access_token=${accessToken}&fields=from,created_time,message`, {
          message,
        })
      ).data;
    } catch (e) {
      console.error(
        `[FACEBOOK] ${e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message)}`
      );
      return { error: e.response && e.response.data ? JSON.stringify(e.response.data) : JSON.stringify(e.message) };
    }
    return response;
  }

  static async getFieldsToRemoveFromReviewReply(commentId, replyId, thread) {
    let updatedThread = [...thread];
    if (!replyId) {
      updatedThread = updatedThread.filter((comment) => comment.id !== commentId);
    } else {
      updatedThread.forEach((comment) => {
        if (comment.replies && comment.replies.length) {
          comment.replies = comment.replies.filter((reply) => reply !== replyId);
        }
      });
    }

    const status = _noFacebookCommentWithoutResponse(thread, false) ? 'Approved' : 'NoResponse';

    return { status, updatedThread };
  }
}
module.exports = Facebook;
