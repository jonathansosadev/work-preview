export default {
  reviewsList() {
    return {
      id: String,
      garageId: String,
      garagePublicDisplayName: String,
      source: String,
      surveyComment: String,
      surveyRespondedAt: String,
      surveyScore: Number,
      recommend: Boolean,
      surveyOriginalScore: Number,
      surveyOriginalScale: Number,
      customerFullName: String,
      publicReviewComment: String,
      publicReviewCommentStatus: String,
      publicReviewCommentRejectionReason: String,
      publicReviewCommentApprovedAt: String,
      thread: {
        text: String,
        status: String,
        approvedAt: String,
        rejectedReason: String,
        author: String,
        id: String,
        authorId: String,
        attachment: String,
        isFromOwner: Boolean,
        replies: {
          text: String,
          status: String,
          approvedAt: String,
          rejectedReason: String,
          author: String,
          id: String,
          authorId: String,
          attachment: String,
          isFromOwner: Boolean,
        }
      }
    }
  },
}
