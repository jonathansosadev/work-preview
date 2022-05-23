<template>
  <Card class="card-user-alerts">
    <div class="card-user-alerts__header">
      <div class="card-user-alerts__header-part">
        <Title icon="icon-gs-alertes">{{$t_locale('components/cockpit/admin/CardUserAlerts')("title")}}</Title>
      </div>
    </div>
    <div class="card-user-alerts__body">
      <!-- Tabs -->
      <div class="card-user-alerts__body__tabs">
        <div class="card-user-alerts__body__tabs__title card-user-alerts__body__tabs__title--frequencies card-user-alerts__body__tabs__title--selected">{{$t_locale('components/cockpit/admin/CardUserAlerts')('frequencies')}}</div>
        <div
          v-for="tab in tabs"
          :key="tab.label"
          class="card-user-alerts__body__tabs__title"
          :class="tabsClass(tab.label)"
          @mouseover="hover = tab.label"
          @mouseout="hover = ''"
          @click="selected = tab.label"
        >
          <span>{{ $t_locale('components/cockpit/admin/CardUserAlerts')(tab.label) }}</span>
        </div>
      </div>

      <div class="card-user-alerts__body__content">
        <!-- Frequencies -->
        <div class="card-user-alerts__body__content__column">
          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--frequencies" />

          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--frequencies">
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item card-user-alerts__item--inline">
                <i class="card-user-alerts__hide-mobile card-user-alerts__item-icon card-user-alerts__item-icon--inline icon-gs-alert-warning-circle" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("alerts") }}</label>
              </div>
            </div>
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item card-user-alerts__item--inline">
                <i class="card-user-alerts__hide-mobile card-user-alerts__item-icon card-user-alerts__item-icon--inline icon-gs-alert-warning-circle" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("escalation") }}</label>
              </div>
            </div>
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item card-user-alerts__item--inline">
                <i class="card-user-alerts__hide-mobile card-user-alerts__item-icon card-user-alerts__item-icon--inline icon-gs-file-text" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("daily") }}</label>
              </div>
            </div>
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item card-user-alerts__item--inline">
                <i class="card-user-alerts__hide-mobile card-user-alerts__item-icon card-user-alerts__item-icon--inline icon-gs-file-text" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("weekly") }}</label>
              </div>
            </div>
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item card-user-alerts__item--inline">
                <i class="card-user-alerts__hide-mobile card-user-alerts__item-icon card-user-alerts__item-icon--inline icon-gs-file-text" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("monthly") }}</label>
              </div>
            </div>
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item card-user-alerts__item--inline">
                <i class="card-user-alerts__hide-mobile card-user-alerts__item-icon card-user-alerts__item-icon--inline icon-gs-file-text" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("monthlySummary") }}</label>
              </div>
            </div>
          </div>
        </div>


        <!-- Unsatisfied -->
        <div class="card-user-alerts__body__content__column" :class="columnClass('unsatisfied')">
          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--unsatisfied">
            <div class="card-user-alerts__body__content__block__line">
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <i class="icon-gs-repair card-user-alerts__item-icon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("apv") }}</label>
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <i class="card-user-alerts__item-icon" :class="NewVehicleSaleIcon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("vn") }}</label>
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <i class="card-user-alerts__item-icon" :class="UsedVehicleSaleIcon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("vo") }}</label>
              </div>
              <div v-if="hasVehicleInspectionGarages" class="card-user-alerts__item">
                <i class="icon-gs-repair card-user-alerts__item-icon" />
                <label class="card-user-alerts__item-label">{{ hasDealershipGarages ? $t_locale('components/cockpit/admin/CardUserAlerts')("control") : $t_locale('components/cockpit/admin/CardUserAlerts')("vi")}}</label>
              </div>
            </div>
          </div>

          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--unsatisfied">
            <div class="card-user-alerts__body__content__block__line">
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.UnsatisfiedMaintenance" :disabled="!conditions.hasMaintenanceAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.UnsatisfiedVn" :disabled="!conditions.hasVnAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.UnsatisfiedVo" :disabled="!conditions.hasVoAtLeast" />
              </div>
              <div v-if="hasVehicleInspectionGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.UnsatisfiedVI" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.EscalationUnsatisfiedMaintenance" :disabled="!conditions.hasMaintenanceAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.EscalationUnsatisfiedVn" :disabled="!conditions.hasVnAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.EscalationUnsatisfiedVo" :disabled="!conditions.hasVoAtLeast" />
              </div>
              <div v-if="hasVehicleInspectionGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.EscalationUnsatisfiedVi" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.daily.unsatisfiedApv" :disabled="!conditions.hasMaintenanceAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.daily.unsatisfiedVn" :disabled="!conditions.hasVnAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.daily.unsatisfiedVo" :disabled="!conditions.hasVoAtLeast" />
              </div>
              <div v-if="hasVehicleInspectionGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.daily.UnsatisfiedVI" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.weekly.unsatisfiedApv" :disabled="!conditions.hasMaintenanceAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.weekly.unsatisfiedVn" :disabled="!conditions.hasVnAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.weekly.unsatisfiedVo" :disabled="!conditions.hasVoAtLeast" />
              </div>
              <div v-if="hasVehicleInspectionGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.weekly.UnsatisfiedVI" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthly.unsatisfiedApv" :disabled="!conditions.hasMaintenanceAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthly.unsatisfiedVn" :disabled="!conditions.hasVnAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthly.unsatisfiedVo" :disabled="!conditions.hasVoAtLeast" />
              </div>
              <div v-if="hasVehicleInspectionGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthly.UnsatisfiedVI" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.unsatisfiedApv" :disabled="!conditions.hasMaintenanceAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.unsatisfiedVn" :disabled="!conditions.hasVnAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.unsatisfiedVo" :disabled="!conditions.hasVoAtLeast" />
              </div>
              <div v-if="hasVehicleInspectionGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.unsatisfiedVI" />
              </div>
            </div>
          </div>
        </div>


        <!-- Leads -->
        <div class="card-user-alerts__body__content__column" :class="columnClass('leads')">

          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--leads">
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item">
                <i class="icon-gs-repair card-user-alerts__item-icon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("maintenance") }}</label>
              </div>
              <div class="card-user-alerts__item">
                <i class="card-user-alerts__item-icon" :class="NewVehicleSaleIcon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("vn") }}</label>
              </div>
              <div class="card-user-alerts__item">
                <i class="card-user-alerts__item-icon" :class="UsedVehicleSaleIcon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("used") }}</label>
              </div>
            </div>
          </div>

          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--leads">
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.LeadApv" :disabled="hasOnlyVIGarages || !hasAutomationAtLeast" />
              </div>
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.LeadVn" :disabled="!canToggleLeadSwitches" />
              </div>
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.LeadVo" :disabled="!canToggleLeadSwitches" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.EscalationLeadMaintenance" :disabled="hasOnlyVIGarages || !hasAutomationAtLeast || !hasEscalationGarages" />
              </div>
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.EscalationLeadVn" :disabled="!canToggleLeadSwitches || !hasEscalationGarages" />
              </div>
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.EscalationLeadVo" :disabled="!canToggleLeadSwitches || !hasEscalationGarages" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item" />
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.daily.leadVn" :disabled="!canToggleLeadSwitches" />
              </div>
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.daily.leadVo" :disabled="!canToggleLeadSwitches" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item" />
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.weekly.leadVn" :disabled="!canToggleLeadSwitches" />
              </div>
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.weekly.leadVo" :disabled="!canToggleLeadSwitches" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item" />
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.monthly.leadVn" :disabled="!canToggleLeadSwitches" />
              </div>
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.monthly.leadVo" :disabled="!canToggleLeadSwitches" />
              </div>
            </div>

            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item" />
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.leadVn" :disabled="!hasGsComponents" />
              </div>
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.leadVo" :disabled="!hasGsComponents" />
              </div>
            </div>
          </div>
        </div>


        <!-- Contacts -->
        <div class="card-user-alerts__body__content__column" :class="columnClass('contacts')">
          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--contacts">
            <div class="card-user-alerts__body__content__block__line">
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <i class="icon-gs-repair card-user-alerts__item-icon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("apv") }}</label>
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <i class="card-user-alerts__item-icon" :class="NewVehicleSaleIcon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("vn") }}</label>
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <i class="card-user-alerts__item-icon" :class="UsedVehicleSaleIcon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("vo") }}</label>
              </div>
              <div v-if="hasVehicleInspectionGarages" class="card-user-alerts__item">
                <i class="icon-gs-repair card-user-alerts__item-icon" />
                <label class="card-user-alerts__item-label">{{ hasDealershipGarages ? $t_locale('components/cockpit/admin/CardUserAlerts')("control") : $t_locale('components/cockpit/admin/CardUserAlerts')("vi")}}</label>
              </div>
            </div>
          </div>

          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--contacts">
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
            <div class="card-user-alerts__body__content__block__line">
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.contactsApv" :disabled="!conditions.hasMaintenanceAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.contactsVn" :disabled="!conditions.hasVnAtLeast" />
              </div>
              <div v-if="hasDealershipGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.contactsVo" :disabled="!conditions.hasVoAtLeast" />
              </div>
              <div v-if="hasVehicleInspectionGarages" class="card-user-alerts__item">
                <Toggle v-model="conf.monthlySummary.contactsVI" />
              </div>
            </div>
          </div>
        </div>


        <!-- E-Reputation -->
        <div class="card-user-alerts__body__content__column" :class="columnClass('ereputation')">
          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--ereputation">
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item">
                <i class="icon-gs-desktop-star card-user-alerts__item-icon" />
                <label class="card-user-alerts__item-label">{{ $t_locale('components/cockpit/admin/CardUserAlerts')("newReview") }}</label>
              </div>
            </div>
          </div>

          <div class="card-user-alerts__body__content__block card-user-alerts__body__content--ereputation">
            <div class="card-user-alerts__body__content__block__line">
              <div class="card-user-alerts__item">
                <Toggle v-model="conf.realTime.ExogenousNewReview" :disabled="!conditions.hasEReputationAtLeast" />
              </div>
            </div>
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
            <div class="card-user-alerts__body__content__block__line" /> <!-- Empty line -->
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>


<script>
export default {
  props: {
    user: Object,
    conditions: Object,
  },

  data() {
    return {
      selected: 'unsatisfied',
      hover: '',
      tabs: [
        {
          label: 'unsatisfied',
          icon: 'icon-gs-sad'
        },
        {
          label: 'leads',
          icon: 'icon-gs-car-repair'
        },
        {
          label: 'contacts',
          icon: 'icon-gs-database'
        },
        {
          label: 'ereputation',
          icon: 'icon-gs-desktop-star'
        }
      ],
      conf: {
        realTime: {
          UnsatisfiedVI: false,
          UnsatisfiedMaintenance: false,
          UnsatisfiedVn: false,
          UnsatisfiedVo: false,
          LeadApv: false,
          LeadVn: false,
          LeadVo: false,
          ExogenousNewReview: false,
          EscalationUnsatisfiedMaintenance: false,
          EscalationUnsatisfiedVn: false,
          EscalationUnsatisfiedVo: false,
          EscalationUnsatisfiedVi: false,
          EscalationLeadMaintenance: false,
          EscalationLeadVn: false,
          EscalationLeadVo: false,
        },
        daily: {
          UnsatisfiedVI: false,
          unsatisfiedApv: false,
          unsatisfiedVn: false,
          unsatisfiedVo: false,
          leadVn: false,
          leadVo: false
        },
        weekly: {
          UnsatisfiedVI: false,
          unsatisfiedApv: false,
          unsatisfiedVn: false,
          unsatisfiedVo: false,
          leadVn: false,
          leadVo: false
        },
        monthly: {
          UnsatisfiedVI: false,
          unsatisfiedApv: false,
          unsatisfiedVn: false,
          unsatisfiedVo: false,
          leadVn: false,
          leadVo: false
        },
        monthlySummary: {
          unsatisfiedApv: false,
          unsatisfiedVn: false,
          unsatisfiedVo: false,
          unsatisfiedVI: false,
          leadVn: false,
          leadVo: false,
          contactsApv: false,
          contactsVn: false,
          contactsVo: false,
          contactsVI: false
        },
      },
      loading: true
    };
  },
  computed: {
    hasOnlyVIGarages() {
      return !this.$store.getters["cockpit/allGaragesNotFiltered"].some(g => g.type !== "VehicleInspection");
    },
    canToggleLeadSwitches() {
      return !this.hasOnlyVIGarages && (this.conditions.hasLeadAtLeast || this.conditions.hasCrossLeadsAtLeast || this.conditions.hasAutomationAtLeast);
    },
    hasGsComponents() {
      return this.conditions.hasMaintenanceAtLeast || this.conditions.hasVnAtLeast || this.conditions.hasVoAtLeast || this.conditions.hasViAtLeast;
    },
    hasAutomationAtLeast() {
      return this.conditions.hasAutomationAtLeast;
    },
    NewVehicleSaleIcon() {
      return (this.$store.getters['profile/isMotorbikeOnly'] && 'icon-gs-moto') || 'icon-gs-car';
    },
    UsedVehicleSaleIcon() {
      return (this.$store.getters['profile/isMotorbikeOnly'] && 'icon-gs-moto-old') || 'icon-gs-car-old';
    },
    hasDealershipGarages() {
      return this.$store.getters['profile/hasDealershipGarages'];
    },
    hasVehicleInspectionGarages() {
      return this.$store.getters['profile/hasVehicleInspectionGarages'];
    },
    hasEscalationGarages() {
      return this.$store.getters['profile/hasEscalationGarages'];
    }
  },
  methods: {
    tabsClass(tabName) {
      return {
        [`card-user-alerts__body__tabs__title--${tabName}`]: true,
        'card-user-alerts__body__tabs__title--selected': this.selected === tabName || this.hover === tabName
      }
    },
    columnClass(tabName) {
      return {
        'card-user-alerts__body__content__column--hidden': tabName !== this.selected
      }
    }
  },
  mounted() {
    Object.keys(this.conf).forEach((config) => { // Setter traducing backend structure to frontend structure
      Object.keys(this.conf[config]).forEach((switcher) => {
        let value = false;
        if (config === 'realTime') value = (this.user.allGaragesAlerts && this.user.allGaragesAlerts[switcher]) || false;
        else value = (this.user.reportConfigs && this.user.reportConfigs[config] && this.user.reportConfigs[config][switcher]) || false;
        this.conf[config][switcher] = value;
      });
    });
    setTimeout(() => this.loading = false, 0);
  },
  watch: {
    'conf.realTime': {
      deep: true,
      handler(value, oldValue) {
        if (!this.loading) {
          this.$store.dispatch('cockpit/admin/profile/updateAlerts', {
            allGaragesAlerts: {
              UnsatisfiedVI: value.UnsatisfiedVI === true,
              UnsatisfiedVo: value.UnsatisfiedVo === true,
              UnsatisfiedVn: value.UnsatisfiedVn === true,
              UnsatisfiedMaintenance: value.UnsatisfiedMaintenance === true,
              LeadApv: value.LeadApv === true,
              LeadVn: value.LeadVn === true,
              LeadVo: value.LeadVo === true,
              ExogenousNewReview: value.ExogenousNewReview === true,
              EscalationUnsatisfiedMaintenance: value.EscalationUnsatisfiedMaintenance === true,
              EscalationUnsatisfiedVn: value.EscalationUnsatisfiedVn === true,
              EscalationUnsatisfiedVo: value.EscalationUnsatisfiedVo === true,
              EscalationUnsatisfiedVi: value.EscalationUnsatisfiedVi === true,
              EscalationLeadMaintenance: value.EscalationLeadMaintenance === true,
              EscalationLeadVn: value.EscalationLeadVn === true,
              EscalationLeadVo: value.EscalationLeadVo === true
            },
          });
        }
      }
    },

    'conf.daily': {
      deep: true,
      handler(value, oldValue) {
        if (!this.loading) {
          this.$store.dispatch('cockpit/admin/profile/updateAlerts', {
            reportConfigs: {
              daily: {
                UnsatisfiedVI: value.UnsatisfiedVI === true,
                unsatisfiedApv: value.unsatisfiedApv === true,
                unsatisfiedVn: value.unsatisfiedVn === true,
                unsatisfiedVo: value.unsatisfiedVo === true,
                leadVn: value.leadVn === true,
                leadVo: value.leadVo === true
              },
            },
          });
        }
      }
    },

    'conf.weekly': {
      deep: true,
      handler(value, oldValue) {
        if (!this.loading) {
          this.$store.dispatch('cockpit/admin/profile/updateAlerts', {
            reportConfigs: {
              weekly: {
                UnsatisfiedVI: value.UnsatisfiedVI === true,
                unsatisfiedApv: value.unsatisfiedApv === true,
                unsatisfiedVn: value.unsatisfiedVn === true,
                unsatisfiedVo: value.unsatisfiedVo === true,
                leadVn: value.leadVn === true,
                leadVo: value.leadVo === true
              },
            },
          });
        }
      }
    },

    'conf.monthly': {
      deep: true,
      handler(value, oldValue) {
        if (!this.loading) {
          this.$store.dispatch('cockpit/admin/profile/updateAlerts', {
            reportConfigs: {
              monthly: {
                UnsatisfiedVI: value.UnsatisfiedVI === true,
                unsatisfiedApv: value.unsatisfiedApv === true,
                unsatisfiedVn: value.unsatisfiedVn === true,
                unsatisfiedVo: value.unsatisfiedVo === true,
                leadVn: value.leadVn === true,
                leadVo: value.leadVo === true
              },
            },
          });
        }
      }
    },

    'conf.monthlySummary': {
      deep: true,
      handler(value, oldValue) {
        if (!this.loading) {
          this.$store.dispatch('cockpit/admin/profile/updateAlerts', {
            reportConfigs: {
              monthlySummary: {
                unsatisfiedApv: value.unsatisfiedApv === true,
                unsatisfiedVn: value.unsatisfiedVn === true,
                unsatisfiedVo: value.unsatisfiedVo === true,
                unsatisfiedVI: value.unsatisfiedVI === true,
                leadVn: value.leadVn === true,
                leadVo: value.leadVo === true,
                contactsApv: value.contactsApv === true,
                contactsVn: value.contactsVn === true,
                contactsVo: value.contactsVo === true,
                contactsVI: value.contactsVI === true
              },
            },
          });
        }
      }
    }

  }
}
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}

.card-user-alerts {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;

  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 0.7rem;
    padding-left: 1rem;
    border-bottom: 1px solid rgba($grey, .7);
    margin-bottom: 1rem;
  }

  &__hide-mobile {
    display: none;
  }

  &__item {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
    align-items: center;
    &--inline {
      flex-direction: row;
      justify-content: flex-start;
      text-align: left;
    }
  }

  &__item-icon {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
    &--inline {
      position: relative;
      top: 2px;
      margin-right: 4px;
    }
  }

  &__item-label {
    font-size: 1rem;
    text-align: left;
    font-weight: 700;
    &--thin {
      font-weight: 300;
    }
  }


  &__icon {
    margin-right: 0.25rem;
  }

  &__body {
    display: flex;
    flex-direction: column;
    width: 100%;
    &__tabs {
      width: 100%;
      display: flex;
      flex-direction: row;
      margin-bottom: 1rem;
      &__icon {
        position: relative;
        top: 1px;
      }
      &__title {
        color: $white;
        background-color: $grey!important;
        text-align: center;
        padding: 0.5rem 1rem;
        text-transform: uppercase;
        box-sizing: border-box;
        white-space:nowrap;
        cursor: pointer;
        -moz-transition: all ease-out 0.3s;
        -webkit-transition: all ease-out 0.3s;
        -ms-transition: all ease-out 0.3s;
        -o-transition: all ease-out 0.3s;
        transition: all ease-out 0.3s;
        flex-grow: 1;
        border-radius: 5px;

        &:not(:last-child) {
          margin-right: 1rem;
        }

        &:first-child {
          margin-right: 1rem;
          width: 20%;
          flex-shrink: 1;
          flex-grow: 0;
          cursor: default;
          border-radius: 5px;
        }
        &--selected {
          opacity: 1;
          flex-grow: 2;
          background-color: $blue!important;
        }
        &--frequencies { background-color: $custeedBrandColor!important; }
        &--unsatisfied { background-color: $blue; }
        &--contacts { background-color: $blue; }
        &--leads { background-color: $blue; }
        &--ereputation { background-color: $blue; }
      }
    }
    &__content {
      display:flex;
      flex-direction: row;
      &--frequencies { background-color: rgba($custeedBrandColor, .05); }
      &--unsatisfied { background-color: lighten($blue,  55%); }
      &--contacts { background-color: lighten($blue, 55%); }
      &--leads { background-color: lighten($blue,  55%); }
      &--ereputation { background-color: lighten($blue,  55%); }
      &__column {
        display: flex;
        align-items: center;
        flex-direction: column;
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
        flex-grow: 1000;
        flex-basis: 0;
        -moz-transition: all ease-out 0.3s;
        -webkit-transition: all ease-out 0.3s;
        -ms-transition: all ease-out 0.3s;
        -o-transition: all ease-out 0.3s;
        transition: all ease-out 0.3s;
        &--hidden {
          flex-grow: 0.001;
        }
        &:first-child {
          flex-basis: 20%;
          flex-grow: 0;
          flex-shrink: 1;
          margin-right: 1rem;
        }
      }
      &__block {
        padding: 1rem;
        min-height: 6rem;
        display:flex;
        align-items: flex-start;
        flex-direction: column;
        margin-bottom: 1rem;
        width: 100%;
        box-sizing: border-box;
        border-radius: 5px;

        &__line {
          padding: 0.5rem;
          height: 3rem;
          display:flex;
          align-items: center;
          flex-direction: row;
          width:100%;
          justify-content: flex-start;
        }
      }
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .card-user-alerts {
    &__hide-mobile {
      display: initial;
    }
    &__item-label {
      &--thin {
        margin-left: 1.5rem;
      }
    }
  }
}
@media (max-width: $breakpoint-min-md) {
  .card-user-alerts {
    &__header {
      padding-left: 0;
    }
  }
}
</style>
