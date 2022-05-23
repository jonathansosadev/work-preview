export default {
  getUserMonthlySummaries() {
    return {
      results: {
        id: String,
        createdAt: String,
        sendDate: String
      },
      error: String,
      userId: String
    };
  }
}