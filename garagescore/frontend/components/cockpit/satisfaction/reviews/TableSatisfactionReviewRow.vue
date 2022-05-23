<template>
  <div>
    <TableRow>
      <TableRowCell class="table__first-cell" :display="['sm']">
        <Review
          v-bind="reviewProps"
          @customer-click="onCustomerClick"
          :customerActive="rowSubview === 'customer'"
        />
      </TableRowCell>
    </TableRow>
    <TableRow :border="false">
      <TableRowCell :style="{ flex: 2 }" :display="['md', 'lg']">
        <Review
          v-bind="reviewProps"
          @customer-click="onCustomerClick"
          :customerActive="rowSubview === 'customer'"
        />
      </TableRowCell>
      <TableRowCell center>
        <IconLabel :title="prestationData.label" v-if="prestationData">
          <template slot="icon">
            <i :class="prestationData.icon" />
          </template>
        </IconLabel>
      </TableRowCell>
      <TableRowCell center>
        <AppText
          tag="span"
          :type="colorSurveyScore"
          bold
        >
          {{ surveyScore }}
        </AppText>
      </TableRowCell>
      <TableRowCell center>
        <ButtonIconLabel
          :type="publicReviewStatusData.type"
          :title="publicReviewStatusData.label"
          v-if="publicReviewStatusData"
          @click="onClickPublicReview()"
          :active="rowSubview === 'publicReview'"
        >
          <template slot="icon">
            <i :class="publicReviewStatusData.icon" />
          </template>
        </ButtonIconLabel>
      </TableRowCell>
      <TableRowCell center>
        <ButtonIconLabel
          :type="publicReviewCommentStatusData.type"
          :title="publicReviewCommentStatusData.label"
          v-if="publicReviewCommentStatusData && reviewSurveyComment"
          @click="onClickPublicReviewComment"
          :active="rowSubview === 'publicReviewComment'"
        >
          <template slot="icon">
            <i :class="publicReviewCommentStatusData.icon" />
          </template>
        </ButtonIconLabel>
      </TableRowCell>
      <TableRowCell center>
        <ButtonIconLabel
          :title="followUpData.label"
          :type="followUpData.type"
          v-if="followUpData"
          @click="setRowSubview('followupUnsatisfied')"
          :active="rowSubview === 'followupUnsatisfied'"
        >
          <template slot="icon">
            <i :class="followUpData.icon" />
          </template>
        </ButtonIconLabel>
      </TableRowCell>
      <TableRowCell center>
        <ButtonIconLabel
          :title="leadData.label"
          :type="leadData.type"
          :class="{ 'c-icon-label--pointer': leadPotentialSale}"
          @click="onClickLead()"
          :active="rowSubview === 'lead'"
          v-if="leadPotentialSale && hasLeadRights"
        >
          <template slot="icon">
            <i :class="leadData.icon" />
          </template>
        </ButtonIconLabel>
      </TableRowCell>
    </TableRow>
  </div>
</template>

<script>
import ButtonIconLabel from '~/components/global/ButtonIconLabel';
import IconLabel from '~/components/global/IconLabel';
import Review from '~/components/global/Review';
import { scoreToColor } from '~/util/scoreToColor';
import { IconsTypes } from '~/utils/enumV2';
import GarageTypes from '~/utils/models/garage.type.js';
import { getDeepFieldValue as deep } from '~/utils/object';
import LeadFollowupStatus from '~/utils/models/data/type/lead-followup-status.js';
import UnsatisfiedFollowupStatus from '~/utils/models/data/type/unsatisfied-followup-status.js';

export default {
  components: { Review, IconLabel, ButtonIconLabel },

  created() {
    this.deepOnRow = (fieldName) => deep(this.row, fieldName);
  },

  props: {
    row: Object,
    cockpitType: String,
    fetchResponses: {
      type: Function,
      default: () => ({}),
    },
    changeRowSubview: { type: Function, required: true },
    getRowSubview: { type: Function, required: true },
    hasLeadRights: Boolean,
  },

  methods: {
    setRowSubview(view) {
      this.changeRowSubview({ id: this.row.id, view });
    },
    async onClickPublicReviewComment() {
      this.setRowSubview('publicReviewComment');
      await this.fetchResponses(
        this.deepOnRow('review.rating.value'),
        this.deepOnRow('garage.id'),
      );
    },
    onClickPublicReview() {
      this.setRowSubview('publicReview');
    },

    onClickLead() {
      if (this.deepOnRow('lead.potentialSale')) {
        this.setRowSubview('lead');
      }
    },

    onCustomerClick() {
      this.setRowSubview('customer');
    },
  },

  computed: {
    reviewSurveyComment() {
      return this.deepOnRow('review.surveyComment');
    },

    leadPotentialSale() {
      return this.deepOnRow('lead.potentialSale');
    },

    rowSubview() {
      return this.getRowSubview(this.row.id);
    },

    colorSurveyScore() {
      return scoreToColor(this.deepOnRow('review.rating.value'));
    },

    reviewProps() {
      return {
        comment: this.deepOnRow('review.surveyComment'),
        customerFullName: this.deepOnRow('customer.fullName.value'),
        customerCity: this.deepOnRow('customer.city.value'),
        vehicleBrand: this.deepOnRow('vehicle.make.value'),
        vehicleModel: this.deepOnRow('vehicle.model.value'),
        date: this.deepOnRow('review.createdAt'),
        garageId: this.deepOnRow('garage.id'),
        garagePublicDisplayName: this.deepOnRow('garage.publicDisplayName'),
        serviceFrontDeskUserName: this.deepOnRow('service.frontDeskUserName'),
        rating: this.deepOnRow('review.rating.value'),
        publicReviewFromCockpitContact: this.deepOnRow('review.fromCockpitContact'),
      };
    },
    //
    prestationData() {
      if (this.row.isApv) {
        return {
          icon: IconsTypes.MAINTENANCE,
          label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('maintenance'),
        };
      } else {
        if (this.row.isVn) {
          return {
            icon: IconsTypes.getPropertyOrValue(
              'NEWVEHICLESALE',
              this.cockpitType,
            ),
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('new'),
          };
        } else {
          if (this.row.isVo) {
            return {
              icon: IconsTypes.getPropertyOrValue(
                'USEDVEHICLESALE',
                this.cockpitType,
              ),
              label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('used'),
            };
          }
        }
      }
      return null;
    },

    followUpData() {
      if (!this.row.followupUnsatisfiedStatus) {
        return null;
      }
      switch (this.row.followupUnsatisfiedStatus) {
        case UnsatisfiedFollowupStatus.IN_PROGRESS:
          return {
            icon: 'icon-gs-time-hour-glass',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupUnsatisfiedStatus),
            type: 'warning',
          };
        case UnsatisfiedFollowupStatus.NOT_RESOLVED:
          return {
            icon: 'icon-gs-sad',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupUnsatisfiedStatus),
            type: 'danger',
          };
        case UnsatisfiedFollowupStatus.RESOLVED:
          return {
            icon: 'icon-gs-sad-checked',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupUnsatisfiedStatus),
            type: 'success',
          };
        case UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER:
          return {
            icon: 'icon-gs-sad',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupUnsatisfiedStatus),
            type: 'muted',
          };
        default:
          return {
            icon: 'icon-gs-sad',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(UnsatisfiedFollowupStatus.NEW_UNSATISFIED),
            type: 'muted',
          };
      }
    },

    publicReviewCommentStatusData() {
      switch (this.deepOnRow('review.reply.status')) {
        case 'Approved':
          return {
            icon: 'icon-gs-edit',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('published'),
            type: 'success',
          };
        case 'Pending':
          return {
            icon: 'icon-gs-alert-warning-circle',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('inspectionInProgress'),
            type: 'warning',
          };
        case 'Rejected':
          return {
            icon: 'icon-gs-alert-warning-circle',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('rejected'),
            type: 'danger',
          };
        default:
          return {
            icon: 'icon-gs-edit',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('noAnswer'),
            type: 'danger',
          };
      }
    },

    publicReviewStatusData() {
      switch (this.deepOnRow('review.comment.status')) {
        case 'Approved':
          return {
            icon: 'icon-gs-web-share-correct',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('published'),
            type: 'success',
          };
        case 'Pending':
          return {
            icon: 'icon-gs-web-share-correct',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('inspectionInProgress'),
            type: 'warning',
          };
        case 'Rejected':
          return {
            icon: 'icon-gs-web-share-block',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('rejected'),
            type: 'danger',
          };
        default:
          return {
            icon: 'icon-gs-web-share-lock',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('notPossible'),
            type: 'danger',
          };
      }
    },

    leadData() {
      if (!this.row.followupLeadStatus) {
        return {
          icon: 'icon-gs-car-repair',
          type: 'muted',
          label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')('NoLead'),
        };
      }
      switch (this.row.followupLeadStatus) {
        case LeadFollowupStatus.NEW_LEAD:
          return {
            icon: 'icon-gs-car-repair',
            type: 'muted',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus),
          };
        case LeadFollowupStatus.NOT_RECONTACTED:
          return {
            icon: 'icon-gs-help-customer-support',
            type: 'danger',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus),
          };
        case LeadFollowupStatus.YES_PLANNED:
          return {
            icon: 'icon-gs-calendar-check',
            type: 'success',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus),
          };
        case  LeadFollowupStatus.NOT_PROPOSED:
          return {
            icon: 'icon-gs-calendar-warning',
            type: 'danger',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus),
          };
        case LeadFollowupStatus.NOT_WANTED:
          return {
            icon: 'icon-gs-calendar-block',
            type: 'muted',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus),
          };
        case LeadFollowupStatus.YES_DONE:
          return {
            icon: 'icon-gs-calendar-check',
            type: 'success',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus),
          };
        case LeadFollowupStatus.LEAD_WITHOUT_ANSWER:
          return {
            icon: 'icon-gs-calendar-disable',
            type: 'muted',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus),
          };
        default:
          return {
            icon: this.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP ? 'icon-gs-moto-checked' : 'icon-gs-car-checked',
            type: 'success',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus),
          };
      }
    },

    surveyScore() {
      // [SGS] display surveyScore /5
      return this.deepOnRow('garage.type') === GarageTypes.VEHICLE_INSPECTION
      && this.deepOnRow('garage.ratingType') === 'stars'
        ? this.deepOnRow('review.rating.value') / 2
        : this.deepOnRow('review.rating.value');
    },
  },
};
</script>

<style lang="scss" scoped>
.c-icon-label {
  &--pointer {
    cursor: pointer;
    user-select: none;
  }
}
</style>
