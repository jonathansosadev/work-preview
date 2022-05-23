export default {
  garageHistory() {
    return {
      countValidEmails: Number,
      countModifiedEmail: Number,
      countBlockedLastMonthEmail: Number,
      countBlockedByEmail: Number,
      countUnsubscribedByEmail: Number,
      countWrongEmails: Number,
      countNotPresentEmails: Number,

      countValidPhones: Number,
      countModifiedPhone: Number,
      countBlockedLastMonthPhone: Number,
      countBlockedByPhone: Number,
      countUnsubscribedByPhone: Number,
      countWrongPhones: Number,
      countNotPresentPhones: Number,

      countReceivedAndScheduledSurveys: Number,
      countReceivedSurveys: Number,
      countBlocked: Number,
      countNotContactable: Number,

      countContacts: Number,

      countSurveysResponded: Number,
      countSurveysRespondedPercent: Number,
      countNotContactablePercent: Number,
      garagePublicDisplayName: String,
      garageSlug: String,
      hideDirectoryPage: Boolean,
      frontDesk: String,

      countEmails: Number,
      totalShouldSurfaceInCampaignStats: Number,
    }
  },


  garageHistories() {
    return {
      garageId: String,
      externalId: String,
      frontDesk: String,
      garageSlug: String,
      garagePublicDisplayName: String,
      hideDirectoryPage: String,
      countValidEmails: Number,
      countValidPhones: Number,
      countNotContactable: Number,
      countNotContactablePercent: Number,
      countSurveysResponded: Number,
      countSurveysRespondedPercent: Number,
      countBlockedByEmail: Number,
      countWrongEmails: Number,
      countNotPresentEmails: Number,
      countBlockedByPhone: Number,
      countWrongPhones: Number,
      countNotPresentPhones: Number,
    }
  },

}
