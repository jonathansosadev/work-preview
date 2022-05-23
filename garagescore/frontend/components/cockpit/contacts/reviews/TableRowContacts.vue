<template>
  <div>
    <TableRow>
      <TableRowCell :display="['sm']">
        <Review
          v-bind="contactProps"
          @customer-click="onCustomerClick"
          :customerActive="rowSubview === 'contact'"
        />
      </TableRowCell>
    </TableRow>
    <TableRow border>
      <TableRowCell :style="{ flex: 2 }" :display="['lg', 'md']">
        <Review
          v-bind="contactProps"
          @customer-click="onCustomerClick"
          :customerActive="rowSubview === 'contact'"
        />
      </TableRowCell>
      <TableRowCell center>
        <IconLabel v-if="prestationData" :title="prestationData.label">
          <template slot="icon">
            <i :class="prestationData.icon" />
          </template>
        </IconLabel>
      </TableRowCell>
      <TableRowCell center>
        <IconLabel
          v-if="emailData"
          :type="emailData ? emailData.type : ''"
          :title="emailData.label"
        >
          <template slot="icon">
            <i :class="emailData.icon" />
          </template>
        </IconLabel>
      </TableRowCell>
      <TableRowCell center>
        <IconLabel
          v-if="mobileData"
          :type="mobileData ? mobileData.type : ''"
          :title="mobileData.label"
        >
          <template slot="icon">
            <i :class="mobileData.icon" />
          </template>
        </IconLabel>
      </TableRowCell>
      <TableRowCell center>
        <IconLabel
          v-if="campaignData"
          :type="campaignData ? campaignData.type : ''"
          :title="campaignData.label"
        >
          <template slot="icon">
            <i :class="campaignData.icon" />
          </template>
        </IconLabel>
      </TableRowCell>
      <TableRowCell center>
        <IconLabel
          v-if="contactData"
          :type="contactData ? contactData.type : ''"
          :title="contactData.label"
        >
          <template slot="icon">
            <i :class="contactData.icon" />
          </template>
        </IconLabel>
      </TableRowCell>
      <TableRowCell
        center
        flow="column"
        :background="$mq==='sm'?undefined:'grey'"
        :class="openClass"
        :style="{ flex: 1.5 }"
      >
        <ButtonStatus
          role="button"
          :type="ticketStatusData.type"
          :messageType="subMessage.type"
          @click="onCustomerTicketClick"
        >
          <template slot="icon" v-if="ticketStatusData.icon">
            <i :class="ticketStatusData.icon" />
          </template>
          <template>{{ ticketStatusData.label }}</template>
          <template slot="message">
            {{ subMessage.text }}
          </template>
        </ButtonStatus>
      </TableRowCell>
    </TableRow>
  </div>
</template>

<script>
import CampaignStatus from '../../../../utils/models/data/type/campaign-status';

import ButtonStatus from '~/components/global/ButtonStatus';
import IconLabel from '~/components/global/IconLabel';
import Review from '~/components/global/Review';
import campaignStatus from '~/utils/models/data/type/campaign-contact-status.js';
import ContactTicketStatus from '~/utils/models/data/type/contact-ticket-status.js';
import emailStatus from '~/utils/models/data/type/email-status.js';
import phoneStatus from '~/utils/models/data/type/phone-status.js';

export default {
  components: { Review, IconLabel, ButtonStatus },

  props: {
    row: Object,
    hasOnlyContactWithoutCampaign: { type: Boolean, default: false },
    getNotPossibleStatus: { type: Function, required: true },
    changeRowSubview: { type: Function, required: true },
    getRowSubview: { type: Function, required: true },
  },

  methods: {
    setRowSubview(view) {
      this.changeRowSubview({ id: this.row.id, view });
    },

    onCustomerClick() {
      this.setRowSubview('contact');
    },

    onCustomerTicketClick() {
      this.setRowSubview('contactTicket');
    },

    isOpen(id) {
      return this.getRowSubview(id) === 'contactTicket';
    },

    isToday(date) {
      const momentDate = this.$moment(date);
      return this.$moment().isSame(momentDate, 'day');
    },
  },

  computed: {
    rowSubview() {
      return this.getRowSubview(this.row.id);
    },

    isCampaignContactedByEmail() {
      return this.row.isCampaignContactedByEmail;
    },

    oldEmail() {
      return this.row.customerOldEmail;
    },

    isCampaignContactedByPhone() {
      return this.row.isCampaignContactedByPhone;
    },

    openClass() {
      return this.isOpen(this.row.id) ? 'contact-table__selected-cell' : '';
    },

    subMessage() {
      if (this.row.campaignStatus === CampaignStatus.WITHOUTCAMPAIGN) {
        return {
          text: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('WithoutCampaign'),
          type: 'warning',
        };
      }
      if (this.buttonStatus === ContactTicketStatus.TO_RECONTACT) {
        return {
          text: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('NotResponding'),
          type: 'danger',
        };
      }
      if (!this.notPossibleStatus) {
        return {};
      }
      if (this.notPossibleStatus.value === 'Answered') {
        let via = '';

        if (this.isCampaignContactedByEmail && this.oldEmail) {
          via += this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('email');
        }
        if (
          this.isCampaignContactedByPhone &&
          this.isCampaignContactedByEmail &&
          this.oldEmail
        ) {
          via += ' + ';
        }
        if (this.isCampaignContactedByPhone) {
          via += this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('sms');
        }
        return {
          text: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('Answered', { via }),
          type: 'success',
        };
      }

      let date = '';
      if (this.notPossibleStatus.value === 'Planned') {
        date = this.$dd(this.row.campaignFirstSendAt || new Date(), 'short');

        return {
          text: this.isToday(this.$dd(this.row.campaignFirstSendAt || new Date()))
            ? this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('PlannedToday')
            : this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')(this.notPossibleStatus.value, { date }),
          type: this.notPossibleStatus.type,
        };
      }

      return {
        text: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')(this.notPossibleStatus.value, { date }),
        type: this.notPossibleStatus.type,
      };
    },

    notPossibleStatus() {
      return this.getNotPossibleStatus({
        surveyRespondedAt: this.row?.surveyRespondedAt,
        contactTicketStatus: this.row?.contactTicket?.status,
        customerCampaignContactStatus: this.row?.customerCampaignContactStatus,
        customerPhoneStatus: this.row?.customerPhoneStatus,
        campaignFirstSendAt: this.row?.campaignFirstSendAt,
      });
    },

    buttonStatus() {
      let status = (this.row.contactTicket?.status)
        || ContactTicketStatus.TO_RECONTACT;
      if (this.row.campaignStatus === CampaignStatus.WITHOUTCAMPAIGN
        && (this.row.contactTicket && !this.row.contactTicket.status)
      ) {
        status = ContactTicketStatus.TO_RECONTACT;
        if (this.hasOnlyContactWithoutCampaign) {
          status = ContactTicketStatus.TO_RECONTACT_WITHOUT_CAMPAIGN;
        }
      }
      if (this.notPossibleStatus) {
        status = ContactTicketStatus.NOT_POSSIBLE;
      }
      return this.isOpen(this.row.id) ? 'Cancel' : status;
    },

    ticketStatusData() {
      switch (this.buttonStatus) {
        case 'Cancel':
          return {
            icon: 'icon-gs-up',
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('Cancel'),
            type: '', // muted disable the button !
          };
        case ContactTicketStatus.TO_RECONTACT:
          return {
            icon: "icon-gs-help-customer-support",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')(ContactTicketStatus.TO_RECONTACT),
            type: 'danger',
          };
        case ContactTicketStatus.TO_RECONTACT_WITHOUT_CAMPAIGN:
          return {
            icon: "icon-gs-help-customer-support",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')(ContactTicketStatus.TO_RECONTACT_WITHOUT_CAMPAIGN),
            type: 'danger',
          };
        case ContactTicketStatus.ONGOING:
          return {
            icon: "icon-gs-time-hour-glass",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')(ContactTicketStatus.ONGOING),
            type: 'warning',
          };
        case ContactTicketStatus.NOT_POSSIBLE:
          return {
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')(ContactTicketStatus.NOT_POSSIBLE),
            type: "muted"
          }; // icon: 'icon-gs-edit',
        case ContactTicketStatus.TERMINATED:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')(ContactTicketStatus.TERMINATED),
            type: 'success',
          };
        case ContactTicketStatus.CLOSED_WITHOUT_TREATMENT:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("ClosedWithoutTreatment"),
            type: "success"
          };
        default:
          return { icon: '', label: '' };
      }
    },

    contactProps() {
      return {
        comment: null,
        customerFullName: this.row.customerFullName,
        vehicleBrand: this.row.vehicleMake,
        vehicleModel: this.row.vehicleModel,
        date: this.row.serviceProvidedAt,
        garagePublicDisplayName: this.row.garagePublicDisplayName,
        garageId: this.row.garageId,
        customerCity: this.row.customerCity,
        serviceFrontDeskUserName: this.row.serviceFrontDeskUserName,
        showNoComment: false,
      };
    },

    prestationData() {
      if (this.row.isApv) {
        return {
          icon: this.$store.getters['cockpit/MaintenanceIcon'],
          label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('Maintenance'),
        };
      } else if (this.row.isVn) {
        return {
          icon: this.$store.getters['cockpit/NewVehicleSaleIcon'],
          label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('New'),
        };
      } else if (this.row.isVo) {
        return {
          icon: this.$store.getters['cockpit/UsedVehicleSaleIcon'],
          label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')('Used'),
        };
      }

      return null;
    },

    emailData() {
      switch (this.row.customerEmailStatus) {
        case emailStatus.VALID:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("email_valid"),
            type: "success"
          };
        case emailStatus.EMPTY:
          return {
            icon: "icon-gs-help-question-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("email_empty"),
            type: "muted"
          };
        case emailStatus.WRONG:
          return {
            icon: "icon-gs-alert-warning-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("email_wrong"),
            type: "danger"
          };
        case emailStatus.RECENTLY_CONTACTED:
          return {
            icon: "icon-gs-lock",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("email_contacted"),
            type: "warning"
          };
        case emailStatus.UNSUBSCRIBED:
          return {
            icon: "icon-gs-web-mail-block",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("email_unsubscribed"),
            type: "danger"
          };
        case emailStatus.DROPPED:
          return {
            icon: "icon-gs-alert-warning-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("email_dropped"),
            type: "danger"
          };
      }
      return {};
    },

    mobileData() {
      switch (this.row.customerPhoneStatus) {
        case phoneStatus.VALID:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("phone_valid"),
            type: "success"
          };
        case phoneStatus.EMPTY:
          return {
            icon: "icon-gs-help-question-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("phone_empty"),
            type: "muted"
          };
        case phoneStatus.WRONG:
          return {
            icon: "icon-gs-alert-warning-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("phone_wrong"),
            type: "danger"
          };
        case phoneStatus.RECENTLY_CONTACTED:
          return {
            icon: "icon-gs-lock",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("phone_contacted"),
            type: "warning"
          };
        case phoneStatus.UNSUBSCRIBED:
          return {
            icon: "icon-gs-phone-block",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("phone_unsubscribed"),
            type: "danger"
          };
      }
      return {};
    },

    campaignData() {
      switch (this.row.customerCampaignContactStatus) {
        case campaignStatus.IMPOSSIBLE:
          return {
            icon: "icon-gs-calendar-disable",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("campaign_impossible"),
            type: "muted"
          };
        case campaignStatus.BLOCKED:
          return {
            icon: "icon-gs-calendar-block",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("campaign_blocked"),
            type: "warning"
          };
        case campaignStatus.NO_CAMPAIGN:
          return {
            icon: "icon-gs-calendar-block",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("campaign_blocked"),
            type: "warning"
          };
        case campaignStatus.RECEIVED:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("campaign_received"),
            type: "success"
          };
        case campaignStatus.SCHEDULED:
          return {
            icon: "icon-gs-calendar-check",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("campaign_scheduled"),
            type: "success"
          };
        case campaignStatus.NOT_RECEIVED:
          return {
            icon: "icon-gs-alert-warning-circle",
            label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("campaign_noreceived"),
            type: "danger"
          };
      }
      return {};
    },

    contactData() {
      if (this.row.customerIsRevised) {
        return {
          icon: "icon-gs-validation-check-circle",
          label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("data_modified"),
          type: "success"
        };
      } else if (this.row.customerIsValidated) {
        return {
          icon: "icon-gs-validation-check-circle",
          label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("data_success"),
          type: "success"
        };
      }
      return {
        icon: "icon-gs-help-question-circle",
        label: this.$t_locale('components/cockpit/contacts/reviews/TableRowContacts')("data_muted"),
        type: "muted"
      };
    },
  },
};
</script>
