<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :sub-title="payload.garage.publicDisplayName" :bannerPrefix="$t_locale('pages-extended/emails/notifications/unsatisfied/body')('bannerPrefix')" :title="displayUnsatisfiedTitle" :color="color" :logo-url="bannerImage"></BaseHeader>
    </tr>
    <tr>
      <td class="content">
        <p>{{$t_locale('pages-extended/emails/notifications/unsatisfied/body')('dearPartner')}},</p>
        <p v-if="isSensitive">
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('youAsk', getAlertSensitiveThreshold) }}.<br>
        </p>
        <p>
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('content', { date, end: (isSensitive ? $t_locale('pages-extended/emails/notifications/unsatisfied/body')('sensitive'): $t_locale('pages-extended/emails/notifications/unsatisfied/body')('unsatisfied')) }) }}
        </p>
        <p v-if="manager">
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('assignedTo') }}
          <span style="font-weight: bold;"> {{ managerName }}, <JobHandler :job="managerJob"/>.</span>
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <ProTip v-if="hasLead" class="lead-pro-tip" v-bind="tradeProTipProps">
          <a slot="link" :href="tradeProTipProps.link">{{ tradeProTipProps.linkLabel }}</a>
        </ProTip>
      </td>
    </tr>
    <tr>
      <CentralButton v-if="!isVehicleInspection" :text="$t_locale('pages-extended/emails/notifications/unsatisfied/body')('handle')" :url="url"/>
      <td v-else>
        <br/><br/>
      </td>
    </tr>
    <tr>
      <td>
        <ProTip class="pro-tip" v-bind="unsatisfiedProTipProps"></ProTip>
      </td>
    </tr>
    <tr>
      <td class="content">
        <h1><b>{{ data.customer_getAbbreviatedTitle() }} {{ data.get('customer.fullName.value') }}</b></h1>
        <p class="left-margin" style="margin-bottom: 0;">
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('mobile') }} <span :class="getClass('customer.contact.mobilePhone.value')">{{ data.get('customer.contact.mobilePhone.value') || $t_locale('pages-extended/emails/notifications/unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('email') }} <a v-if="data.get('customer.contact.email.value')" :href="'mailto:' + data.get('customer.contact.email.value')">{{ data.get('customer.contact.email.value') }}</a><span v-else>{{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('internalRef') }} <span :class="getClass('service.frontDeskCustomerId')">{{ data.get('service.frontDeskCustomerId') || $t_locale('pages-extended/emails/notifications/unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('immat') }} <span :class="getClass('vehicle.plate.value')">{{ data.get('vehicle.plate.value') || $t_locale('pages-extended/emails/notifications/unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('city') }} <span :class="getClass('customer.city.value')">{{ data.get('customer.city.value') || $t_locale('pages-extended/emails/notifications/unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('postalCode') }} <span :class="getClass('customer.postalCode.value')">{{ data.get('customer.postalCode.value') || $t_locale('pages-extended/emails/notifications/unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('manager') }} <span :class="getClass('service.frontDeskUserName')">{{ data.get('service.frontDeskUserName') !== 'UNDEFINED' && data.get('service.frontDeskUserName') || $t_locale('pages-extended/emails/notifications/unsatisfied/body')('undefined') }}</span>
        </p>
        <br>
        <p>
          <span><b>{{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('clientComment') }}</b></span>
        </p>
        <p class="comment-body">
          <span v-if="data.get('review.comment')">{{ data.get('review.comment.text') }}</span>
          <span v-else class="grey-gs" style="font-weight: normal; font-size: 14px;">{{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('undefined') }}</span>
        </p>
        <p style="color: #d14836;padding: 5px 20px;" v-if="isReviewCommentRejected()">
          {{$t_locale('pages-extended/emails/notifications/unsatisfied/body')('notPublished')}} {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')(data.get('review.comment.rejectedReason')) }}
        </p>
        <br>
        <table width="100%" class="bordred-table" v-if="Array.isArray(data.get('unsatisfied.criteria')) && data.get('unsatisfied.criteria').length">
          <tr>
            <td class="one-column">
              <table width="100%">
                <tr>
                  <td class="inner" align="left">
                    <p>
                      <span><b>{{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('motif') }}</b></span>
                    </p>
                    <p class="left-margin2" v-if="data.get('unsatisfied.criteria')" v-for="item in data.get('unsatisfied.criteria')" v-bind:key="item.values">
                      <span>{{ displayReviewDetailedCriteria(item.label) }}</span>&nbsp;
                      <span class="blue-gs">{{ displayReviewDetailedSubCriteria(item.values) }} </span>
                      <br>
                    </p>
                    <p v-else> {{ $t_locale('pages-extended/emails/notifications/unsatisfied/body')('undefined') }}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <CentralButton v-if="!isVehicleInspection" :text="$t_locale('pages-extended/emails/notifications/unsatisfied/body')('handle')" :url="url"/>
      <td v-else>
        <br/><br/>
      </td>
    </tr>
    <tr>
      <BulletList v-if="!isVehicleInspection" class="bullet-list" :title="$t_locale('pages-extended/emails/notifications/unsatisfied/body')('bullet-list-title')" :list="bulletListItems"></BulletList>
      <div class="margin"></div>
    </tr>
    <tr>
      <BaseFooter class="base-footer" legal="unsatisfied"></BaseFooter>
    </tr>
  </table>
</template>

<script>
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
  import ModerationStatus from '~/utils/models/data/type/moderation-status.js';
  import DataTypes from '~/utils/models/data/type/data-types.js';
  import AlertTypes from '~/utils/models/alert.types.js';
  import GarageTypes from '~/utils/models/garage.type.js';
  import CentralButton from '../../../../components/emails/general/CentralButton.vue';
  import ProTip from '../../../../components/emails/notifications/ProTip.vue';
  import BulletList from '../../../../components/emails/notifications/BulletList.vue';
  import JobHandler from '../../../../components/emails/notifications/JobHandler';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter, CentralButton, ProTip, BulletList, JobHandler },
    methods: {
      displayName(value) {
        switch (value) {
          case DataTypes.MAINTENANCE: return this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('Maintenance');
          case DataTypes.NEW_VEHICLE_SALE: return this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('NewVehicleSale');
          case DataTypes.USED_VEHICLE_SALE: return this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('UsedVehicleSale');
          case DataTypes.VEHICLE_INSPECTION: return this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('VehicleInspection');
          default: return value;
        }
      },
      frenchDecimal(number) {
        return (number || number === 0) ? number.toString().replace(/\./, ',') : '';
      },
      isReviewCommentRejected() {
        return this.data.get('review.comment.status') === ModerationStatus.REJECTED;
      },
      displayReviewDetailedSubCriteria(criteria) {
        return criteria.map((c) => this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('_' + c)).join(' / ');
      },
      displayReviewDetailedCriteria(criteria) {
        return this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')(criteria);
      },
      getClass(path) {
        if (path === 'service.frontDeskUserName' && this.data.get(path) === 'UNDEFINED') {
          return "";
        }
        return this.data.get(path) ? "black" : "";
      }
    },
    computed: {
      bulletListItems() {
        return [
          { label: this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')(`bullet-list-label-1`), item: this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')(`bullet-list-item-1`) },
          { label: this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')(`bullet-list-label-2`, { days: this.followupDays }), item: this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')(`bullet-list-item-2`) }
        ];
      },
      followupDays() {
        return this.data.get('unsatisfiedTicket.followUpDelayDays') || 5;
      },
      payload() { return this.$store.getters.payload; },
      isSensitive() {
        return [AlertTypes.SENSITIVE_MAINTENANCE_WITH_LEAD,
          AlertTypes.SENSITIVE_VI, AlertTypes.SENSITIVE_VO,
          AlertTypes.SENSITIVE_VN, AlertTypes.SENSITIVE_MAINTENANCE].includes(this.payload.contact.payload.alertType);
      },
      hasLead() {
        return [AlertTypes.UNSATISFIED_MAINTENANCE_WITH_LEAD,
          AlertTypes.SENSITIVE_MAINTENANCE_WITH_LEAD].includes(this.payload.contact.payload.alertType);
      },
      color() {
        return this.isSensitive ? 'yellow' : 'red';
      },
      date() {
        if (!this.data.get('service.providedAt')) return "";
        return " " + this.$dd(this.data.get('service.providedAt'), 'long');
      },
      bannerImage() {
        return this.isSensitive ? '/images/www/alert/sensitive2.png' : '/images/www/alert/unsatisfied2.png';
      },
      data() {
        return this.payload.data;
      },
      url() {
        return encodeURI(this.payload.baseUrl + this.gsClient.url.getShortUrl('COCKPIT_UNSATISFIED_TICKET') + this.data.getId());
      },
      leadUrl() {
        return encodeURI(this.payload.baseUrl + this.gsClient.url.getShortUrl('COCKPIT_LEAD_TICKET') + this.data.getId());
      },
      gsClient() {
        return this.payload.gsClient;
      },
      getAlertSensitiveThreshold() {
        const threshold = this.payload.garage.getSensitiveThreshold && this.payload.garage.getSensitiveThreshold(this.data.type);
        const base = 6;
        // [SGS] : display rating /5
        const divider = this.shouldUseRatingOver5 ? 2 : 1;
        return {
          threshold: threshold / divider,
          base : base / divider
        };
      },
      displayUnsatisfiedTitle() {
        const data = this.data;
        const garage = this.payload.garage;
        if (!data) { return ''; }
        const display1 = data.review_isSensitive(garage) ? this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('sensitiveShort') : this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('unsatisfiedShort');
        const rating = data.get('review.rating.value');
        // [VI] : display rating /5
        let type = "";
        let score = "";
        // VI && ratingType is "stars"
        if(this.shouldUseRatingOver5) {
          if(typeof rating === 'number') {
            score = ` ${this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('at')} ${this.frenchDecimal(rating / 2)}/5`;
          }
        }
        // Others
        else {
          type = this.displayName(data.get('type'));
          if((typeof rating === 'number')) {
            score = ` ${this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('at')} ${this.frenchDecimal(rating)}/10`;
          }
        }
        return `${this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('client')} ${display1} ${type}${score}`; // eslint-disable-line max-len
      },
      images() {
        return {
          lead: '/images/www/alert/unsatisfied-star.png',
          pencil: this.gsClient.latestStaticUrl('/images/www/alert/pencil-square.png'),
        }
      },
      manager() {
        return this.payload.manager;
      },
      managerName() {
        if (this.manager) {
          if (this.manager.firstName && this.manager.lastName) {
            return `${this.manager.firstName} ${this.manager.lastName}`;
          }
          return this.manager.email;
        }
      },
      managerJob() {
        return this.manager ? this.manager.job : '';
      },
      tradeProTipProps() {
        return {
          title: this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('tradeTitle'),
          imgUrl: this.images.lead,
          color: 'gold',
          text: this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('trade'),
          linkLabel: this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('see'),
          link: this.leadUrl
        }
      },
      unsatisfiedProTipProps() {
        return {
          title: this.$t_locale('pages-extended/emails/notifications/unsatisfied/body')('protipTitle'),
          imgUrl: "/images/www/alert/zoomGuy.png",
          color: 'red',
          tipSet: 'unsatisfied'
        };
      },
      isVehicleInspection() {
        return this.payload && this.payload.garage && this.payload.garage.type === GarageTypes.VEHICLE_INSPECTION;
      },
      shouldUseRatingOver5() {
        return this.isVehicleInspection && this.payload.garage.ratingType === 'stars';
      }
    }
  }
</script>


<style lang="scss" scoped>
  p {
    color: #7f7f7f;
    font-size: 14px;
  }

  .margin {
    height: 20px;
  }

  .lead {
    margin: auto!important;
    border: 1px solid #2199b5;
    padding: 15px;
    max-width: 560px;
    padding-left: 0;
  }
  .align-right {
    text-align: right;
  }

  .align-left {
    text-align: left;
  }

  /** Logo and header disposition */


  .inline-img {
    vertical-align: middle;
  }

  .spacer-after-logos {
    Margin-bottom: 10px;
  }

  .pro-tip {
    padding-bottom: 40px;
  }

  .lead-pro-tip {
    padding-top: 30px;
  }

  /** fcopyright disposition **/
  p.footer-element {
    font-style: italic;
    font-size: 12px;
    color: #999;
  }

  h1 {
    font-size: 20px;
    margin: 5px;
  }

  h2 {
    font-size: 20px;
    color: black;
    margin: 5px;
  }

  p, .grey-gs {
    color: #7f7f7f;
  }

  .black {
    color: black;
  }

  .blue-gs {
    color: #219AB5;
  }

  .green-gs {
    color: #00cc33;
  }

  .red-gs {
    color: #ff0000;
  }

  .left-margin {
    margin: 20px 0;
    margin-left: 30px;
  }

  .left-margin2 {
    margin-top: 10px;
    margin-left: 20px;
  }

  .one-column .comment-body {
    margin-left: 20px;
    font-size: 16px;
    color: #219AB5;
    font-style: italic;
    font-weight: bold;
  }

  .bordred-table {
    border: 1px solid #f7f7f7;
    border-radius: 3px;
  }

  .right-column .score-container {
    margin-right: 0;
  }

  .middle-column .score-container {
    width: 70px;
  }

  .left-column-2 .score-containe,
  .right-column-2 .score-container {
    width: 83px;
    padding: 10px 3px;
    margin-right: 0;
  }
  .middle-column-2 .score-container {
    width: 80px;
  }

  .left-column-2.sp-column,
  .left-column.sp-column {
    padding-right: 15px;
  }

  .score-container {
    background-color: #219AB5;
    padding: 10px 6px;
    text-align: center;
    width: 75px;
    margin-right: 4px;
  }

  .score-container p {
    font-size: 12px;
    color: white;
  }

  .sp-column .score-container {
    background-color: #c9984f;
    width: 75px;
    margin-right: 0;
  }

  .inner.no-right-pad {
    padding-right: 0;
  }

  .inner.no-left-pad {
    padding-left: 0;
  }

  .score-container .score-number {
    font-size: 20px;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 5px;
  }

  /** click to comment */

  .inline-img-pencil {
    vertical-align: middle;
    width: 30px;
  }
  .clic-comment a,
  .clic-comment a:hover {
    color: black;
    font-size: 14px;
    font-weight: bold;
    text-decoration: none;
  }
  .bordred-table-black {
    border: 1px solid #000000;
    background-color: #e5e5e5;
    border-radius: 3px;
  }
  .gs-name{
    font-family: Arial;
  }
  .gs-light-blue{
    color: #37b0c8;
  }

  .customer-name-lead {
    color: #37b0c8;
  }

  .btn-action{
    display: inline-block;
    padding-left: 39px;
    padding-right: 39px;
    padding-top: 12px;
    padding-bottom: 12px;;
    background-color: #ed5600;
    color: #FFFFFF;
    border-radius: 3px;
    font-size: 16px;
    font-weight:bold;
    text-decoration: none;
  }

</style>
