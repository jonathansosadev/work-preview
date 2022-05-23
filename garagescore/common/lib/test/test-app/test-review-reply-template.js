/*
 * Test-app: Review Reply Template
 */

class TestReviewReplyTemplate {
  constructor(testApp, payload) {
    this.app = testApp;
    this._id = payload.id;
    this.title = payload.title;
    this.content = payload.title;
    this.sources = payload.sources;
    this.ratingCategories = payload.ratingCategories;
    this.garageIds = payload.garageIds;
    this.automated = true;
  }

  async getInstance() {
    return this.app.models.ReviewReplyTemplate.findById(this._id);
  }
}
module.exports = TestReviewReplyTemplate;
