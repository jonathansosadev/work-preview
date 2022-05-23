 <template>
    <table class="email-new-lead" cellspacing="0" cellpadding="0">

      <!-- BASE HEADER -->
      <tr>
        <td>
          <BaseHeader :title="title" :subTitle="subTitle" :color="color" :logoUrl="logoUrl" :bannerPrefix="bannerPrefix"></BaseHeader>
        </td>
      </tr>

      <!-- GREETINGS MESSAGE -->
      <tr>
        <td>
          {{ $t_locale('pages-extended/emails/notifications/lead/body')('greetings') }}
        </td>
      </tr>

      <!-- EXPLANATION MESSAGE -->
      <tr>
        <td>
          {{ $t_locale('pages-extended/emails/notifications/lead/body')('explanation', { date: $dd(providedAt, 'DD MMMM YYYY') }) }}
        </td>
      </tr>

      <tr v-if="manager">
        <td>
          {{ $t_locale('pages-extended/emails/notifications/lead/body')('assignedTo') }}
          <span style="font-weight: bold;">{{ managerName }}, <JobHandler :job="managerJob"/>.</span>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <CentralButton :text="$t_locale('pages-extended/emails/notifications/lead/body')('cta')" :url="url"/>
      </tr>

      <tr>
        <td>
          <ProTip class="pro-tip" v-bind="proTipProps"></ProTip>
        </td>
      </tr>

      <!-- FINAL USER INFORMATION -->
      <tr>
        <td>
          <div class="customer-name">{{ $t_locale('pages-extended/emails/notifications/lead/body')(`civility${customerCivility}`) }} {{ customerFullName }}</div>
          <div class="customer-info">
            {{ $t_locale('pages-extended/emails/notifications/lead/body')('mobile') }}
            <span :class="{blue: hasPhone}"> {{ hasPhone ? phone : $t_locale('pages-extended/emails/notifications/lead/body')('undefined') }}</span><br>
            {{ $t_locale('pages-extended/emails/notifications/lead/body')('email') }}
            <span :class="{blue: hasEmail}">
              <a v-if="hasEmail" :href="`mailto:${email}`">{{ email }}</a>
              <span v-else>{{ $t_locale('pages-extended/emails/notifications/lead/body')('undefined') }}</span>
            </span><br>
            {{ $t_locale('pages-extended/emails/notifications/lead/body')('city') }}
            <span :class="{blue: hasCity}"> {{ hasCity ? city : $t_locale('pages-extended/emails/notifications/lead/body')('undefined') }}</span>
            <br>
            {{ $t_locale('pages-extended/emails/notifications/lead/body')('postalCode') }}
            <span :class="{blue: hasPostalCode}"> {{ hasPostalCode ? postalCode : $t_locale('pages-extended/emails/notifications/lead/body')('undefined') }}</span>
          </div>
        </td>
      </tr>



    <!-- FINAL USER REVIEW -->
     <tr>
       <td>
         <div class="subtitle">{{ $t_locale('pages-extended/emails/notifications/lead/body')('clientReview') }}</div>
         <div>
           <div v-if="review">
             <div class="review"><span v-if="typeof reviewRating === 'number'">{{ reviewRating }}/10 - </span>{{ reviewText }}</div>
             <div class="rejected" v-if="reviewRejected">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('rejectedReview') }} {{ $t_locale('pages-extended/emails/notifications/lead/body')(`rejectedReason_${rejectedReason}`) }}
             </div>
           </div>
           <div v-else>
             {{ $t_locale('pages-extended/emails/notifications/lead/body')('unspecified') }}
           </div>
         </div>
       </td>
     </tr>

    <!-- LEAD DETAILS -->
     <tr>
       <td>
         <div class="subtitle" v-if="leadAlreadyPlanned || (lead && (leadTiming || leadSaleType || leadKnowVehicle))">{{ $t_locale('pages-extended/emails/notifications/lead/body')('answerDetails') }}</div>
         <div class="details">
           <div v-if="leadAlreadyPlanned">
             {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadAlreadyPlanned') }} 
             <span class="blue">{{ $t_locale('pages-extended/emails/notifications/lead/body')(`leadType_${leadType}`) }}</span>
           </div>
           <div class="lead" v-if="lead">
             <div v-if="leadTiming">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadTiming', { vehicleType: $t_locale('pages-extended/emails/notifications/lead/body')(garageType === 'MotorbikeDealership' ? 'motorbike' : 'vehicle') }) }}
               <span class="blue">{{ $t_locale('pages-extended/emails/notifications/lead/body')(`leadTiming_${leadTiming}`) }}</span>
             </div>
             <div v-if="leadSaleType">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadSaleType', { vehicleType: $t_locale('pages-extended/emails/notifications/lead/body')(garageType === 'MotorbikeDealership' ? 'motorbike' : 'vehicle') }) }}
               <span class="blue">{{ $t_locale('pages-extended/emails/notifications/lead/body')(`leadSaleType_${leadSaleType}`) }}</span>
             </div>
             <div v-if="leadKnowVehicle">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadKnowVehicle') }}
               <span class="blue"> {{ $t_locale('pages-extended/emails/notifications/lead/body')('yes') }}</span>
               <div v-if="leadVehicle" class="lead-subdetail">
                 <span class="left-margin2">{{ $t_locale('pages-extended/emails/notifications/lead/body')('leadVehicle') }}</span>
                 <span class="blue"> {{ leadVehicle }}</span><br>
               </div>
             </div>
             <div v-if="leadBrands">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadBrands') }}
               <span class="blue">{{ Array.isArray(leadBrands) ? formatBrandModel(leadBrands) : $t_locale('pages-extended/emails/notifications/lead/body')('unspecified') }}</span>
             </div>
             <div v-if="leadBodyType">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadBodyType', { vehicleType: $t_locale('pages-extended/emails/notifications/lead/body')(garageType === 'MotorbikeDealership' ? 'motorbike' : 'vehicle') }) }}
               <span class="blue">{{ displayBodyTypes(leadBodyType) }}</span>
             </div>
             <div v-if="leadEnergyType">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadEnergyType') }}
               <span class="blue">{{ displayEnergyTypes(leadEnergyType) }}</span>
             </div>
             <div v-if="leadCylinder">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadCylinder') }}
               <span class="blue">{{ displayCylinders(leadCylinder) }}</span>
             </div>
             <div v-if="leadTradeIn">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadTradeIn', { vehicleType: $t_locale('pages-extended/emails/notifications/lead/body')(garageType === 'MotorbikeDealership' ? 'motorbike' : 'vehicle') }) }}
               <span class="blue">{{ $t_locale('pages-extended/emails/notifications/lead/body')(`leadTradeIn_${leadTradeIn}`) }}</span>
             </div>
             <div v-if="leadFinancing">
               {{ $t_locale('pages-extended/emails/notifications/lead/body')('leadFinancing') }}
               <span class="blue">{{ $t_locale('pages-extended/emails/notifications/lead/body')(`leadFinancing_${leadFinancing}`) }}</span>
             </div>
           </div>
           <div v-else>
             {{ $t_locale('pages-extended/emails/notifications/lead/body')('unspecified') }}
           </div>
         </div>
       </td>
     </tr>

      <!-- CTA -->
      <tr>
        <CentralButton :text="$t_locale('pages-extended/emails/notifications/lead/body')('cta')" :url="url"/>
      </tr>

      <tr>
        <BulletList v-if="!isVehicleInspection" class="bullet-list" :title="$t_locale('pages-extended/emails/notifications/lead/body')('bullet-list-title')" :list="bulletListItems"></BulletList>
      </tr>

      <!-- GOOD BYE MESSAGE -->
      <tr>
        <td class="no-padding">
          <BaseFooter></BaseFooter>
        </td>
      </tr>

      <!-- COPYRIGHT -->
      <tr>
        <td class="copyright">
          {{ $t_locale('pages-extended/emails/notifications/lead/body')('copyright1') }}
          {{ $t_locale('pages-extended/emails/notifications/lead/body')('copyright2') }}
          {{ $t_locale('pages-extended/emails/notifications/lead/body')('copyright3', { fullYearNumber }) }}
        </td>
      </tr>
    </table>
</template>

<script>
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import CentralButton from '../../../../components/emails/general/CentralButton';
  import ProTip from '../../../../components/emails/notifications/ProTip';
  import BulletList from '../../../../components/emails/notifications/BulletList';
  import JobHandler from '../../../../components/emails/notifications/JobHandler';
  import GarageTypes from '~/utils/models/garage.type.js';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter, CentralButton, ProTip, BulletList, JobHandler },
    methods: {
      displayBodyTypes(bodyTypes) {
        if (!Array.isArray(bodyTypes)) {
          return this.$t_locale('pages-extended/emails/notifications/lead/body')('unspecified');
        }
        return bodyTypes.map(item => this.$t_locale('pages-extended/emails/notifications/lead/body')(`leadBodyType_${item}`)).join(', ');
      },
      displayCylinders(cylinders) {
        if (!Array.isArray(cylinders)) {
          return this.$t_locale('pages-extended/emails/notifications/lead/body')('unspecified');
        }
        return cylinders.map(item => this.$t_locale('pages-extended/emails/notifications/lead/body')(`leadCylinder_${item}`)).join(', ');
      },
      displayEnergyTypes(energyTypes) {
        if (!Array.isArray(energyTypes)) {
          return this.$t_locale('pages-extended/emails/notifications/lead/body')('unspecified');
        }
        return energyTypes.map(item => this.$t_locale('pages-extended/emails/notifications/lead/body')(`leadEnergyType_${item}`)).join(', ');
      },
      formatBrandModel: (brands) => 
        brands
          .map((brand) => {
            let str = brand.brand;
            if (brand.model) str += `: ${brand.model}`;
            return str;
          })
          .join(', '),
    },
    computed: {
      bulletListItems() {
        const hasFollowup = !isNaN(this.followupDays);
        if (!hasFollowup) return [{ label: this.$t_locale('pages-extended/emails/notifications/lead/body')(`bullet-list-label-1`), item: this.$t_locale('pages-extended/emails/notifications/lead/body')(`bullet-list-item-1`) }];
        return [
          { label: this.$t_locale('pages-extended/emails/notifications/lead/body')(`bullet-list-label-1`), item: this.$t_locale('pages-extended/emails/notifications/lead/body')(`bullet-list-item-1`) },
          { label: this.$t_locale('pages-extended/emails/notifications/lead/body')(`bullet-list-label-2`, { days: this.followupDays }), item: this.$t_locale('pages-extended/emails/notifications/lead/body')(`bullet-list-item-2`) }
        ];
      },
      followupDays() {
        return this.data.get('leadTicket.followUpDelayDays');
      },
      payload() { return this.$store.getters.payload; },
      garageType() {
        return this.data.garageType;
      },
      bannerPrefix() {
        return this.$t_locale('pages-extended/emails/notifications/lead/body')('bannerPrefix')
      },
      title() {
        const isEmpty = this.data.get('lead.saleType') === 'Unknown' || !this.data.get('lead.saleType');
        if(isEmpty){
          return this.$t_locale('pages-extended/emails/notifications/lead/body')('defaultTitle');  
        }
        const type = this.$t_locale('pages-extended/emails/notifications/lead/body')(this.data.get('lead.saleType'), {}, this.data.get('lead.saleType'));
        return this.$t_locale('pages-extended/emails/notifications/lead/body')('title', {type});
      },
      subTitle() {
        return this.garage.publicDisplayName;
      },
      color() {
        return 'gold';
      },
      logoUrl() {
        return '/images/www/alert/ticket/lead-gold.png';
      },
      garage() {
        return this.payload.garage;
      },
      providedAt() {
        return (this.data.service && this.data.service.providedAt) || (this.data.leadTicket && this.data.leadTicket.createdAt);
      },
      dataId() {
        return this.data.id.toString();
      },
      data() {
        return this.payload.data;
      },
      url() {
        return encodeURI(this.payload.baseUrl + this.gsClient.url.getShortUrl('COCKPIT_LEAD_TICKET') + this.dataId);
      },
      fullYearNumber() {
        return this.payload.fullYearNumber;
      },
      customerCivility() {
        return this.data.customer.title.value || 'Monsieur';
      },
      customerFullName() {
        return this.data.customer.fullName.value;
      },
      gsClient() {
        return this.payload.gsClient;
      },
      config() {
        return this.payload.config;
      },
      hasPhone() {
        return !!this.data.customer.contact.mobilePhone.value;
      },
      hasEmail() {
        return !!this.data.customer.contact.email.value;
      },
      hasCity() {
        return !!this.data.customer.city.value;
      },
      hasPostalCode() {
        return !!this.data.customer.postalCode.value;
      },
      phone() {
        return this.data.customer.contact.mobilePhone.value;
      },
      email() {
        return this.data.customer.contact.email.value;
      },
      city() {
        return this.data.customer.city.value;
      },
      postalCode() {
        return this.data.customer.postalCode.value;
      },
      review() {
        return this.data.review && this.data.review.comment;
      },
      reviewText() {
        return this.review && this.review.text;
      },
      reviewRating() {
        return this.review && this.data.review.rating && this.data.review.rating.value;
      },
      reviewRejected() {
        return this.review.status === 'Rejected';
      },
      rejectedReason() {
        return this.review && this.review.rejectedReason;
      },
      leadAlreadyPlanned() {
        return ['AlreadyPlanned', 'AlreadyPlannedOtherBusiness', 'InContactWithVendor'].includes(this.leadType);
      },
      leadType() {
        return this.lead.type;
      },
      lead() {
        return this.data.lead;
      },
      leadTiming() {
        return this.lead.timing;
      },
      leadSaleType() {
        return this.payload.data.get('leadTicket.saleType');
      },
      leadKnowVehicle() {
        return this.lead.knowVehicle;
      },
      leadVehicle() {
        return this.lead.vehicle;
      },
      leadBrands() {
        return this.lead.brands;
      },
      leadBodyType() {
        return this.lead.bodyType;
      },
      leadEnergyType() {
        return this.lead.energyType;
      },
      leadCylinder() {
        return this.lead.cylinder;
      },
      leadTradeIn() {
        return this.lead.tradeIn;
      },
      leadFinancing() {
        return this.lead.financing;
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
      proTipProps() {
        return {
          title: this.$t_locale('pages-extended/emails/notifications/lead/body')('protipTitle'),
          imgUrl: "/images/www/alert/zoomGuy.png",
          color: 'gold',
          tipSet: 'lead'
        };
      },
      isVehicleInspection() {
        return this.data.garageType === GarageTypes.VEHICLE_INSPECTION;
      },
    },
  }
</script>


<style lang="scss" scoped>
  .email-new-lead {
    width: 100%;
    color: #7f7f7f;
    font-size: 14px;
    font-family: "Trebuchet MS", sans-serif;

    td {
      padding: 10px 5px;
    }

    .bullet-list {
      margin-top: 40px;
    }

    .no-padding {
      padding: 0;
    }

    .pro-tip {
      padding-bottom: 30px;
    }

    .customer-name {
      color: #000000;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .customer-info {
      line-height: 1.5;
    }

    .blue {
      color: #219AB5;
      a {
        text-decoration: underline;
      }
    }

    .subtitle {
      font-weight: 700;
      margin: 10px 0;
    }

    .review {
      font-size: 16px;
      font-weight: 700;
      font-style: italic;
      color: #219AB5;
      padding: 10px 15px;
    }

    .rejected {
      color: #d14836;
      padding-left: 15px;
    }

    .details {
      padding-left: 15px;
      .lead > div {
        padding: 5px 0;
      }
      .lead-subdetail {
        padding: 10px 15px 5px 15px;
      }
    }

    .cta-wrapper {
      padding: 25px 0;
      text-align: center;
    }

    .cta {
      padding-bottom: 12px;
      text-decoration: none;
      padding-left: 39px;
      padding-right: 39px;
      padding-top: 12px;
      display: inline-block;
      background-color: #ed5600;
      color: #FFFFFF;
      border-radius: 3px;
      font-size: 16px;
      font-weight: bold;
    }

    .copyright {
      font-size: 12px;
      font-style: italic;
      color: #999
    }
  }
</style>
