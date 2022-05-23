import Enum from '~/utils/enum.js'

export default new Enum({
  TO_RECONTACT: 'ToRecontact',
  TO_RECONTACT_WITHOUT_CAMPAIGN: 'ToRecontactWithoutCampaign',
  ONGOING: 'Ongoing',
  NOT_POSSIBLE: 'NotPossible',
  TERMINATED: 'Terminated',
  CLOSED_WITHOUT_TREATMENT: 'ClosedWithoutTreatment'
})
