import Enum from '~/utils/enum.js'

export default new Enum({
  AUTHOR_IS_NOT_INDIVIDUAL: 'inhumanAuthor',
  CONTENT_INCLUDES_PERSONAL_DATA: 'includesPersonalData',
  CONTENT_IS_ABUSIVE: 'abusive',
  CONTENT_IS_MEANINGLESS: 'meaningless',
  CONTENT_IS_TOO_SHORT: 'tooShort',
  CONTENT_IS_UNINTELLIGIBLE: 'unintelligible',
  CONTENT_IS_UNRELATED_TO_REVIEWED_ITEM: 'unrelated',
  INCOHERENT_RATING: 'incoherentRating',
  REJECTED_BY_CUSTOMER_REQUEST: 'rejectedByCustomerRequest',
  REJECTED_BY_EXOGENOUS_SERVICE: 'rejectedByExogenousService'
}, {
});

