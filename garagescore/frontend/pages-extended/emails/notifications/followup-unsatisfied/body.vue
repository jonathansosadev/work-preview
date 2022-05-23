<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="stateTitle" :subTitle="garageName" color="red" logo-url="/images/www/alert/warning-red.png"></BaseHeader>
    </tr>

    <tr>
      <td class="content">
        <p>{{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('greetings') }},</p><br/>
        <p>
          {{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('subject', { garageName: payload.garage.publicDisplayName, state }) }}
        </p>
      </td>
    </tr>
    <tr><CentralButton :text="$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('see')" :url="url"/></tr>
    <tr>
      <td>
        <ProTip class="pro-tip" v-bind="proTipProps"></ProTip>
      </td>
    </tr>
    <tr>
      <td class="content">
        <h1><b>{{ data.customer_getAbbreviatedTitle() }} {{ data.get('customer.fullName.value') }}</b></h1>
        <p class="left-margin">
          {{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('mobile') }} <span :class="getClass('customer.contact.mobilePhone.value')">{{ data.get('customer.contact.mobilePhone.value') || $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('email') }} <a v-if="data.get('customer.contact.email.value')" :href="'mailto:' + data.get('customer.contact.email.value')">{{ data.get('customer.contact.email.value') }}</a><span v-else>{{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('internalRef') }} <span :class="getClass('service.frontDeskCustomerId')">{{ data.get('service.frontDeskCustomerId') || $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('immat') }} <span :class="getClass('vehicle.plate.value')">{{ data.get('vehicle.plate.value') || $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('city') }} <span :class="getClass('customer.city.value')">{{ data.get('customer.city.value') || $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('postalCode') }} <span :class="getClass('customer.postalCode.value')">{{ data.get('customer.postalCode.value') || $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('undefined') }}</span><br>
          {{ $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('manager') }} <span :class="getClass('service.frontDeskUserName')">{{ data.get('service.frontDeskUserName') !== 'UNDEFINED' && data.get('service.frontDeskUserName') || $t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('undefined') }}</span>
        </p>
      </td>
    </tr>
    <br>
    <tr><CentralButton :text="$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('see')" :url="url"/></tr>
    <tr><BaseFooter legal="unsatisfied"></BaseFooter></tr>
  </table>
</template>


<script>
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
  import CentralButton from '../../../../components/emails/general/CentralButton.vue';
  import ModerationStatus from '~/utils/models/data/type/moderation-status.js';
  import DataTypes from '~/utils/models/data/type/data-types';
  import ProTip from '../../../../components/emails/notifications/ProTip.vue';


  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter, CentralButton, ProTip },
    methods: {
      displayName(value) {
        switch (value) {
          case DataTypes.MAINTENANCE: return this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('Maintenance');
          case DataTypes.NEW_VEHICLE_SALE: return this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('NewVehicleSale');
          case DataTypes.USED_VEHICLE_SALE: return this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('UsedVehicleSale');
          case DataTypes.VEHICLE_INSPECTION: return this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('VehicleInspection');
          default: return value;
        }
      },
      frenchDecimal(number) {
        return number || number === 0 ? number.toString().replace(/\./, ',') : '';
      },
      isReviewCommentRejected() {
        return this.data.get('review.comment.status') === ModerationStatus.REJECTED;
      },
      getClass(path) {
        if (path === 'service.frontDeskUserName' && this.data.get(path) === 'UNDEFINED') {
          return ""
        }
        return this.data.get(path) ? "black" : "";
      }
    },
    computed: {
      payload() { return this.$store.getters.payload; },
      color() {
        return this.payload.isSensitive ? 'yellow' : 'red';
      },
      date() {
        if (!this.data.get('service.providedAt')) return "";
        return " " + this.$dd(this.data.get('service.providedAt'), 'long');
      },
      bannerImage() {
        return this.payload.isSensitive ? '/images/www/alert/sensitive2.png' : '/images/www/alert/unsatisfied2.png';
      },
      data() {
        return this.payload.data;
      },
      url() {
        return encodeURI(this.payload.baseUrl + this.gsClient.url.getShortUrl('COCKPIT_UNSATISFIED_TICKET') + this.data.getId());
      },
      gsClient() {
        return this.payload.gsClient;
      },
      getAlertSensitiveThreshold() {
        return this.payload.garage.getSensitiveThreshold && this.payload.garage.getSensitiveThreshold(this.data.type);
      },
      displayType() {
        switch (this.payload.data.get('type')) {
          case DataTypes.MAINTENANCE: return this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('Maintenance');
          case DataTypes.NEW_VEHICLE_SALE: return this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('NewVehicleSale');
          case DataTypes.USED_VEHICLE_SALE: return this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('UsedVehicleSale');
          case DataTypes.VEHICLE_INSPECTION: return '';
          default: return this.payload.data.get('type');
        }
      },
      displayUnsatisfiedTitle() {
        const data = this.data;
        const garage = this.payload.garage;
        if (!data) { return ''; }
        const display1 = data.review_isSensitive(garage) ? this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('sensitiveShort') : this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('unsatisfiedShort');
        const type = data.get('type') === DataTypes.VEHICLE_INSPECTION ? '' : this.displayName(data.get('type'));
        const score = (typeof data.get('review.rating.value') === 'number') ? ` ${this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('at')} ${this.frenchDecimal(data.get('review.rating.value'))}/10` : '';
        return `${this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('client')} ${display1} ${type}${score}`; // eslint-disable-line max-len
      },
      images() {
        return {
          lead: this.gsClient.latestStaticUrl('/images/www/alert/star.png'),
          pencil: this.gsClient.latestStaticUrl('/images/www/alert/pencil-square.png'),
        }
      },
      state() {
        return (this.payload.data.get('unsatisfied.isRecontacted') === false) ? this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('notRecontacted') : this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('notResolved');
      },
      stateTitle() {
        return (this.payload.data.get('unsatisfied.isRecontacted') === false) ? this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('notRecontactedTitle', { type: this.displayType }) : this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('notResolvedTitle', { type: this.displayType });
      },
      garageName() {
        return this.payload.garage.publicDisplayName;
      },
      proTipProps() {
        return {
          title: this.$t_locale('pages-extended/emails/notifications/followup-unsatisfied/body')('protipTitle'),
          imgUrl: '/images/www/alert/zoomGuy.png',
          color: 'red',
          tipSet: 'unsatisfied'
        };
      }
    }
  }
</script>

<style lang="scss" scoped>
  p {
    color: #7f7f7f;
    font-size: 14px;
  }
  .lead {
    margin: auto!important;
    border: 1px solid #2199b5;
    padding: 10px;
    max-width: 500px;
  }
  .align-right {
    text-align: right;
  }

  .align-left {
    text-align: left;
  }

  .pro-tip {
    margin-bottom: 30px;
  }

  /** Logo and header disposition */


  .inline-img {
    vertical-align: middle;
  }

  .spacer-after-logos {
    Margin-bottom: 10px;
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
