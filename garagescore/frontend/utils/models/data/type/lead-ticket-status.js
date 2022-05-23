import Enum from '~/utils/enum.js'

export default new Enum({
  // DO NOT CHANGE ORDER, SOME CODE IS BASED ON Object.keys().indexOf()
  WAITING_FOR_CONTACT: 'WaitingForContact',
  CONTACT_PLANNED: 'ContactPlanned',

  WAITING_FOR_MEETING: 'WaitingForMeeting',
  MEETING_PLANNED: 'MeetingPlanned',

  WAITING_FOR_PROPOSITION: 'WaitingForProposition',
  PROPOSITION_PLANNED: 'PropositionPlanned',

  WAITING_FOR_CLOSING: 'WaitingForClosing',
  CLOSED_WITHOUT_SALE: 'ClosedWithoutSale',
  CLOSED_WITH_SALE: 'ClosedWithSale'
}, {
  displayName(value, language = 'fr') {
    if (language !== 'fr') {
      throw new Error(`Language ${language} is not supported`);
    }
    switch (value) {
      case this.WAITING_FOR_CONTACT : return 'Contact à prendre';
      case this.WAITING_FOR_MEETING : return 'Rendez-vous à réaliser';
      case this.WAITING_FOR_PROPOSITION : return 'Proposition à envoyer';
      case this.WAITING_FOR_CLOSING : return 'A clôturer';
      case this.CONTACT_PLANNED : return 'Contact planifié';
      case this.MEETING_PLANNED : return 'Rendez-vous planifié';
      case this.PROPOSITION_PLANNED : return 'Proposition planifiée';
      case this.CLOSED_WITHOUT_SALE : return 'Fermé, vente non réalisée';
      case this.CLOSED_WITH_SALE : return 'Fermé, vente réalisée';
      default: return value;
    }
  },
  isClosed(status) {
    return status === this.CLOSED_WITH_SALE || status === this.CLOSED_WITHOUT_SALE;
  },
  openStatus() {
    return [
      this.WAITING_FOR_CONTACT,
      this.CONTACT_PLANNED,
      this.WAITING_FOR_MEETING,
      this.MEETING_PLANNED,
      this.WAITING_FOR_PROPOSITION,
      this.PROPOSITION_PLANNED,
      this.WAITING_FOR_CLOSING
    ];
  }
});

