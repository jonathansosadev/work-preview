<template>
  <div id="app">

    <!-- Sidebar Nav -->
    <Sidebar class="preview-sidebar">
      <div class="preview-sidebar__categorie">Campagnes Atelier</div>
      <div v-for="(item, index) in campagins" :key="index">
        <SidebarItem v-if="campaginsMaintenance(item)" :code="currentTargetName(item)" to="" :activeSidebarCode="activeCampaign" @click.native="currentTargetId(item)"/>
      </div>

      <div class="preview-sidebar__categorie">Campagnes Ventes</div>
      <div v-for="(item, index) in campagins" :key="index">
        <SidebarItem v-if="campaginsVehicle(item)" :code="currentTargetName(item)" to="" :activeSidebarCode="activeCampaign" @click.native="currentTargetId(item)"/>
      </div>
    </Sidebar>

    <!-- Container -->
    <div class="preview-container custom-scrollbar" :class="size">

      <!-- Desktop & Mobile BAR -->
      <div class="preview-container__header">
        <div class="preview-container__header__icons">
          <i
            class="preview-container__header__icons__icon icon-gs-computer"
            :class="[size === 'desktop' ? 'active' : '']"
            @click="changeSize('desktop')"
          />
          <i
            class="preview-container__header__icons__icon icon-gs-mobile"
            :class="[size === 'phone' ? 'active' : '']"
            @click="changeSize('phone')"
          />
        </div>
      </div>

       <!-- Body -->
      <div class="preview-container__body">
        <AutomationCampaignEmail
          :target="activeCampaign"
          themeColor="#F36233"
          :promotionalMessage="promotionalMessage"
          logoUrl="Logo-h60px-Renault.png"
          garageName="Garage Dupont"
          customerName="{customerName}"
          brandName="brandName"
        />
      </div>
    </div>
  </div>
</template>
<script>
import AutomationCampaignEmail from "~/components/emails/pages/automation/AutomationCampaignEmail.vue";
import { AutomationCampaignTargets } from '~/utils/enumV2';
const AutomationCampaigns = AutomationCampaignTargets.values();
// const AutomationCampaignDataType = AutomationCampaignTargets.getPropertyFromValue('dataTypeSource')

export default {
  name: "campaingPreview",
  layout: "greybo",
  components: { AutomationCampaignEmail },

  data(){
    return {
      size: 'desktop',
      activeCampaign: 'M_M',
    }
  },
  computed: {
    promotionalMessage() {
      return "<b style='color: #F36233;'>EN CE MOMENT -15% SUR VOTRE ENTRETIEN</b>" +
              "<br/>" +
              "<b>Profitez d'une remise exceptionnelle pour votre prochaine entretien valable jusqu'au xx/xx dans nos ateliers.</b>";
    },
    campagins() {
      return [
        ...AutomationCampaigns,
      ]
    },
  },
  methods: {
    changeSize(size) {
      switch (size) {
        case "phone":
          this.size = "phone";
          break;
        default:
          this.size = "desktop";
      }
    },
    currentTargetId(item) {
      this.activeCampaign = item;
    },
    currentTargetName(item) {
      const locale = this.$store.getters.locale;
      return this.$t_locale('pages/grey-bo/campaingPreview')(item);
    },
    campaginsMaintenance(item) {
      let leadDataType = AutomationCampaignTargets.getPropertyFromValue(item, 'leadDataType');
      if (leadDataType === "AUTOMATION_MAINTENANCE") {
        return true;
      }
    },
    campaginsVehicle(item) {
      let leadDataType = AutomationCampaignTargets.getPropertyFromValue(item, 'leadDataType');
      if (leadDataType === "AUTOMATION_VEHICLE_SALE") {
        return true;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
  display: flex;
}
.preview-sidebar {

  &__categorie {
    background: $automation-orange;
    padding: .5rem 1rem;
    color: $white;
    font-weight: 700;
  }
}
.preview-container {
  height: calc(100vh - 5.5rem);
  max-width: calc(600px + 2rem);
  padding: 1rem 0;
  background-color: $white;
  margin: 1rem auto;
  box-shadow: 0px 0px 3px 0px rgba($black, .15);
  overflow: auto;

  &__header {
    background-color: $white;
    border-bottom: 1px solid rgba($grey, .5);
    padding-bottom: .5rem;

    &__icons {
      width: 5rem;
      display: flex;
      justify-content: space-between;
      justify-content: center;
      align-items: center;
      margin: auto;

      &__icon {
        color: $dark-grey;
        margin: 0 .75rem;
      }
    }
  }
}

.active {
  color: $automation-orange!important;
  background: rgba($automation-orange, .15);
  padding: .4rem;
  border-radius: 3px;
}
.desktop {
  width: 600px;
}
.phone {
  width: 375px;
}

// TO EDIT //
::v-deep .sidebar {
  height: calc(100vh - 3.5rem)!important;
  width: 20rem!important;

  &__footer-sidebar-tiny {
    display: none!important;
  }
}
::v-deep .sidebar-item {

  &__item {
    padding-left: 1rem!important;
    height: 3rem!important;
    font-size: 0.92rem!important;
    text-align: left!important;

    &:focus {
      color: $automation-orange!important;
      border-left: 4px solid $automation-orange!important;
    }
    &:hover {
      color: $automation-orange!important;
    }
    &--active {
      color: $automation-orange!important;
    }
  }
  &__icon {
    width: 0!important;
  }
  &__label {
    margin-left: 0 !important;
  }
  &__label-value {
    text-transform: none!important;
  }
  &__separator {
    background-color: rgba($grey, .5)!important;
  }
}
</style>
