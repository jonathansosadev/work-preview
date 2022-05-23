<template>
  <div class="custeedbook">
    <!-- ASIDE -->
    <div v-if="fullScreen" class="custeedbook__aside">
      <div class="custeedbook__aside__header">
        <img
          class="custeedbook__aside__header__logo"
          src="/logo/logo-custeed-long.svg"
          alt="Custted"
        />
      </div>
      <div class="custeedbook__aside__components custom-scrollbar">
        <tree :node="sectionsTree" :setActiveComponent="setActiveComponent"></tree>
      </div>
    </div>

    <!-- MAIN -->
    <div id="main" class="custeedbook__main">

      <!-- HEADER -->
      <div v-if="fullScreen" class="custeedbook__main__header">
        {{ activeComponent && activeComponent.split('____')[0] }}
        <div class="custeedbook__main__header__language-switcher" id="LanguageSwitcher">
          <LanguageSwitcher/>
        </div>
      </div>

      <!-- PROPS -->
      <div v-if="fullScreen">
        <div class="custeedbook__main__props custom-scrollbar" v-if="activeComponent">
          <div
            class="custeedbook__main__props__prop"
            v-for="(componentInput, index) in activeComponentsInputs"
            :key="index"
          >
            <div>
              {{ componentInput.isSlot ? 'SLOT : ' : '' }}
              <div class="custeedbook__main__props__prop__label">
                {{ componentInput.label }}
              </div>
            </div>

            <template v-if="componentInput.inputType === 'select' && componentInput.inputValues ">
              <select v-model="componentInput.value">
                <option
                  v-for="(option , i) in componentInput.inputOptions"
                  :value="componentInput.inputValues[i]"
                  :key="`${componentInput.label}${i}`"
                >
                  {{ option }}
                </option>
              </select>
              <selectMaterial
                v-model="newUnsatisfied.unsatisfiedCriterias"
                :options="optionsUnsatisfactionCriterias"
              >
              </selectMaterial>
            </template>

            <template v-else-if="componentInput.inputType === 'select'">
              <select v-model="componentInput.value">
                <option v-for="(option , i) in componentInput.inputOptions"
                        :value="option"
                        :key="`${componentInput.label}${i}`"
                >
                  {{ option }}
                </option>
              </select>
            </template>

            <template v-else-if="componentInput.inputType === 'json'">
              <textarea
                class="custeedbook__main__props__prop__textarea"
                v-model="componentInput.textValue"
                v-on:change="jsonifyValue(componentInput)"
                @input="resize($event)"
              />
              <AppText
                tag="h1"
                type="muted"
                size="xs"
                bold
              >
                (Appuyez sur entrée pour actualiser, utilisez cet input aussi pour les tableaux)
              </AppText>
            </template>

            <template v-else-if="componentInput.inputType === 'longtext'">
              <textarea
                class="custeedbook__main__props__prop__textarea"
                v-model="componentInput.value"
                @input="resize($event)"
              />
              {{ componentInput.comment }}
            </template>

            <template v-else-if=" componentInput.inputType === 'Function'">
                Function
            </template>

            <template v-else-if="componentInput.inputType === 'checkbox'">
              <input
                v-model="componentInput.value"
                type="checkbox"
              />
                {{ componentInput.comment }}
            </template>

            <template v-else>
              <InputMaterial
                v-model="componentInput.value"
                :type="componentInput.inputType"
                fixedWidth="100%"
              >
              </InputMaterial>
                {{ componentInput.comment }}
            </template>
          </div>
        </div>
      </div>

      <!-- COMPONENT -->
      <div id="component" class="custeedbook__main__component custom-scrollbar" :class="size" v-if="activeComponent">
        <div id="main-component-header" class="custeedbook__main__component__header">
          <div class="custeedbook__main__component__header__left-part">
            <!-- LEFT PART HERE -->
          </div>
          <div class="custeedbook__main__component__header__right-part">
            <div class="custeedbook__main__component__header__right-part__icons">
              <i
                class="custeedbook__main__component__header__right-part__icon icon-gs-computer"
                :class="[size == 'desktop' ? 'active' : '']"
                @click="changeSize('desktop')"
              />
              <i
                class="custeedbook__main__component__header__right-part__icon icon-gs-tablet"
                :class="[size == 'tablet' ? 'active' : '']"
                @click="changeSize('tablet')"
              />
              <i
                class="custeedbook__main__component__header__right-part__icon icon-gs-mobile"
                :class="[size == 'phone' ? 'active' : '']"
                @click="changeSize('phone')"
              />
              <i
                v-if="fullScreen"
                class="custeedbook__main__component__header__right-part__icon icon-gs-full-screen"
                @click="fullScreenToggle()"
              />
              <i
                v-if="!fullScreen"
                class="custeedbook__main__component__header__right-part__icon icon-gs-windowed"
                @click="fullScreenToggle()"
              />
            </div>
          </div>
        </div>
        <component class="custeedbook__main__component__content" :is="activeComponent" v-bind="activeComponentsProps" v-on="listeners">
          <!-- SLOTS GO HERE -->
          <template v-if="activeComponent === 'CusteedbookSample'" v-slot:default ><p class="red">Hello there</p><i class="icon-gs-add" aria-hidden="true"></i></template>
          <template v-if="activeComponent === 'CusteedbookSample'" v-slot:named ><p>General Kenobi</p></template>
          <template v-if="activeComponent === 'Button'" v-slot:left >Button</template>
          <template v-if="activeComponent === 'KPI'" v-slot:label >Title</template>
          <template v-if="activeComponent === 'KPI'" v-slot:subtitle >Subtitle</template>
          <template v-if="activeComponent === 'AppFilters'" v-slot:true >Chargement</template>
          <template v-if="activeComponent === 'AppFilters'" v-slot:false >Filtres d'en-tête </template>
          <template v-if="activeComponent.split('____')[0] === 'ButtonGroup'" v-slot:stats ><i class="icon-gs-setting-slider"></i></template>
          <template v-if="activeComponent.split('____')[0] === 'ButtonGroup'" v-slot:evol ><i class="icon-gs-graph-bar"></i></template>
        </component>
      </div>
    </div>
  </div>
</template>

<script>
import * as Utils from "./utils/index"
import Tree from "./Tree";
import LanguageSwitcher from "~/components/i18n/LanguageSwitcher";
import ComponentsAMigrer from "./scenarios/ComponentsAMigrer"
import PropsAMigrer from "./scenarios/PropsAMigrer"
import IdeaboxIdea from "./scenarios/ideabox/Idea";
import IdeaboxAddIdea from "./scenarios/ideabox/AddIdea";
import IdeaboxIdeaBox from "./scenarios/ideabox/IdeaBox";


import AddFields from "./scenarios/cockpit/global/AddFields";


import Chart from './scenarios/cockpit/global/Chart';

import WidgetIframe from './scenarios/cockpit/admin/widget/WidgetIframe';
import WidgetIframePreview from "./scenarios/cockpit/admin/widget/WidgetIframePreview";

import ChartSkeleton from './scenarios/cockpit/global/ChartSkeleton';
import CampaignSms from "./scenarios/cockpit/automation/sms/CampaignSms";
import CampaignGdprSms from "./scenarios/cockpit/automation/sms/CampaignGdprSms";

import AutomationCampaignEditor from "./scenarios/cockpit/automation/AutomationCampaignEditor";
import AutomationDemonstration from "./scenarios/cockpit/automation/AutomationDemonstration";
import AutomationCampaignManagementTable from "./scenarios/cockpit/automation/AutomationCampaignManagementTable";
import AutomationCentralButton from "./scenarios/automation/AutomationCentralButton";
import AutomationFooter from "./scenarios/automation/AutomationFooter";
import AutomationHeader from "./scenarios/automation/AutomationHeader";
import AutomationInnerHTML from "./scenarios/automation/AutomationInnerHTML";
import AutomationSetupCustomContent from "./scenarios/cockpit/automation/AutomationSetupCustomContent";
import AutomationThankYou from "./scenarios/automation/AutomationThankYou";
import AutomationTitle from "./scenarios/automation/AutomationTitle";

import OptionsLeadSaleTypes from "./scenarios/cockpit/global/OptionsLeadSaleTypes";
import OptionsDataTypes from "./scenarios/cockpit/global/OptionsDataTypes";
import OptionsAutomationCampaignTypes from "./scenarios/cockpit/global/OptionsAutomationCampaignTypes";
import GlobalUserProfileContent from "./scenarios/cockpit/global/UserProfileContent";
import ModalAddUser from "./scenarios/cockpit/satisfaction/ModalAddUser";
import UserRole from "./scenarios/cockpit/global/UserRole";
import CardUserRole from "./scenarios/cockpit/admin/CardUserRole";
import CustomExportsList from "./scenarios/cockpit/global/exports/CustomExportsList";
import ModalSplashScreen from "./scenarios/cockpit/global/exports/ModalSplashScreen";
import ModalConfirmName from './scenarios/cockpit/global/exports/ModalConfirmName';
import ModalConfirmDelete from './scenarios/cockpit/global/exports/ModalConfirmDelete';
import TagSelector from './scenarios/cockpit/global/TagSelector';
import ModalDeleteTag from './scenarios/cockpit/global/ModalDeleteTag.js';
import ModalAdminTag from './scenarios/cockpit/global/ModalAdminTag.js';
import DropdownGarageFilter from './scenarios/cockpit/global/DropdownGarageFilter'
import DropdownUser from './scenarios/cockpit/global/DropdownUser.js'
import DropdownContentGarageFilter from './scenarios/cockpit/global/DropdownContentGarageFilter.js'
import DropdownDMS from './scenarios/cockpit/global/DropdownDMS.js'

import CheckBox from "./scenarios/UI/CheckBox";
import ButtonGroup from './scenarios/UI/ButtonGroup';
import MultiSelectMaterial from "./scenarios/UI/MultiSelectMaterial";
import Tag from './scenarios/UI/Tag';
import Button from "./scenarios/UI/Button";
import DropdownGarage from  "./scenarios/cockpit/global/DropdownGarage.js"
import Toast from './scenarios/UI/Toast';
import Icon from './scenarios/UI/Icon';

//Exports
import ButtonExport from './scenarios/cockpit/global/exports/ButtonExport';
import ModalExports from "./scenarios/cockpit/global/exports/ModalExports";
import SetupExportsDatatypesGaragesFrontDeskUsers from './scenarios/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers.js';
import SetupExportsPeriod from './scenarios/cockpit/analytics/SetupExportsPeriod';
import ExportEmailBody from "./scenarios/emails/export/EmailBody";
import ExportEmailSubject from "./scenarios/emails/export/EmailSubject";
import SetupExportsAutomationCampaigns from "./scenarios/cockpit/global/exports/SetupExportsAutomationCampaigns";

import Profile from './scenarios/cockpit/user/Profile.js';
import TableAdminUsersUsers from './scenarios/cockpit/user/TableAdminUsersUsers.js';
import TableAdminUsersGarages from './scenarios/cockpit/user/TableAdminUsersGarages.js';


// XLeads components
import CrossLeadsDemonstration from './scenarios/cockpit/x-leads/CrossLeadsDemonstration';

// E-reputation components
import EReputationPresentationTitleSkeleton from './scenarios/global/skeleton/EReputationPresentationTitleSkeleton';
import TileEreputationSkeleton from './scenarios/global/skeleton/TileEreputationSkeleton';
import EReputationStatsSkeleton from './scenarios/global/skeleton/EReputationStatsSkeleton';

import EReputationCustomResponse from './scenarios/cockpit/admin/EReputationCustomResponse'
import EReputationModalConfigTime from './scenarios/cockpit/admin/EReputationModalConfigTimeAnswer'
import EReputationModalAccessDenied from './scenarios/cockpit/admin/EReputationModalAccessDenied'
import EReputationModalConfigModelResponse from './scenarios/cockpit/admin/EReputationModalConfigModelResponse'
import EreputationDemonstration from './scenarios/global/skeleton/EreputationDemonstration';
import EReputationModalDeleteModelResponse from './scenarios/cockpit/admin/EReputationModalDeleteModelResponse'
import TextAreaHighlight from './scenarios/global/TextAreaHighlight'

// Grey-Bo components
import campaingPreview from './scenarios/grey-bo/campaingPreview';
import testSurveyForm  from './scenarios/grey-bo/testSurveyForm';
import RgpdForm from './scenarios/grey-bo/RgpdForm';
import monthlySummary from './scenarios/grey-bo/monthlySummary';

// Global components
import ProductDemonstrationBase from './scenarios/cockpit/global/ProductDemonstrationBase';
import AppFilters from "./scenarios/cockpit/global/AppFilters";
import DropdownPeriod from "./scenarios/cockpit/global/DropdownPeriod.js"
import DropdownCockpitTypes from "./scenarios/cockpit/global/DropdownCockpitTypes.js"
import SearchInput from './scenarios/cockpit/global/SearchInput.js'

import SelectableListOfValues from './scenarios/cockpit/global/SelectableListOfValues.js'
import ButtonToggle from './scenarios/cockpit/global/ButtonToggle';
// Emails components
import WelcomeEmail from './scenarios/emails/notifications/WelcomeEmail';

import ModalMakeSurveys from './scenarios/cockpit/admin/surveys/ModalMakeSurveys';
import ModalMakeSurveysPrevisualisation from './scenarios/cockpit/admin/surveys/ModalMakeSurveysPrevisualisation';

import AutomationCampaignEmailSubject from "./scenarios/emails/automation/AutomationCampaignEmailSubject";
import AutomationCampaignEmail from "./scenarios/emails/automation/AutomationCampaignEmail";

// import CustomerExperienceSimpleSurvey from "./scenarios/emails/customer-experience/CustomerExperienceSimpleSurvey";
// use(CustomerExperienceSimpleSurvey, ["Emails", "CustomerExperience"]);
// remove comment to get Props of a component
// console.log(Utils.getProps(HistoryTicketItem));
let components = ComponentsAMigrer;
let props = PropsAMigrer;
function use(scenario, section = "default") {
  scenario.component.securedName = `${scenario.component.name}____${Math.round(10000*Math.random())}`;
  if (scenario.name) {
    scenario.component.customName = scenario.name;
    scenario.component.securedName = `${scenario.name}____${Math.round(10000*Math.random())}`;
  }
  const c = scenario.component;
  c.custeedbookSection = section;
  components = {...components, [`${scenario.component.securedName}`]: c};
  props = {...props, [`${scenario.component.securedName}Props`]: scenario.props};
}

//UI Components
use(CheckBox, ["UI", 'Components']);
use(ButtonGroup, ["UI", 'Components']);
use(MultiSelectMaterial, ["UI", 'Components']);
use(Tag, ['UI', 'Components']);
use(Button, ["UI", 'Components']);
use(Toast, ["UI", "Components"]);
use(Icon, ["UI", "Components"]);

// COCKPIT/Global/components
use(ProductDemonstrationBase, ["Cockpit", "Global", "Components"]);
use(AppFilters, ["Cockpit", "Global", "Components"]);
use(OptionsLeadSaleTypes, ["Cockpit", "Global", "Components"]);
use(OptionsDataTypes, ["Cockpit", "Global", "Components"]);
use(OptionsAutomationCampaignTypes, ["Cockpit", "Global", "Components"]);
use(Chart, ["Cockpit", "Global", "Components"]);
use(ChartSkeleton, ["Cockpit", "Global", "Components"]);
use(AddFields, ["Cockpit", "Global", "Components"]);
use(TagSelector, ["Cockpit", "Global", "Components"]);
use(GlobalUserProfileContent, ["Cockpit", "Global", "Components"]);
use(UserRole, ["Cockpit", "Global", "Components"]);
use(ModalAdminTag, ["Cockpit", "Global", "Components"]);
use(DropdownGarage, ["Cockpit", "Global", "Components"]);
use(DropdownPeriod, ["Cockpit", "Global", "Components"])
use(DropdownCockpitTypes, ["Cockpit", "Global", "Components"])
use(SearchInput, ["Cockpit", "Global", "Components"]);
use(DropdownGarageFilter, ["Cockpit", "Global", "Components"]);
use(SelectableListOfValues, ["Cockpit", "Global", "Components"]);
use(DropdownContentGarageFilter, ["Cockpit", "Global", "Components"]);
use(DropdownDMS, ["Cockpit", "Global", "Components"]);

use(ButtonToggle, ["Cockpit", "Global", "Components"]);
use(ModalDeleteTag, ["Cockpit", "Global", "Components"]);
use(DropdownUser, ["Cockpit", "Global", "Components"])
use(CardUserRole, ["Cockpit", "Global", "Components"]);
use(CheckBox, ["Cockpit", "Global", "Components"]);
use(TextAreaHighlight, ["Cockpit", "Global", "Components"]);
// Exports


//COCKPIT/Global/exports
use(ModalExports, ["Cockpit", "Global", "Exports"]);
use(CustomExportsList, ["Cockpit", "Global", "Exports"]);
use(ModalSplashScreen, ["Cockpit", "Global", "Exports"]);
use(ModalConfirmName, ['Cockpit', 'Global', 'Exports']);
use(ModalConfirmDelete, ['Cockpit', 'Global','Exports']);
use(ButtonExport, ["Cockpit", "Global", "Exports"]);

//COCKPIT/AUTOMATION
use(AutomationCampaignEditor, ["Cockpit", "Automation"]);
use(AutomationDemonstration, ["Cockpit", "Automation"]);
use(AutomationSetupCustomContent, ["Cockpit", "Automation"]);

//COCKPIT/USER
use(Profile, ["Cockpit", "User"]);
use(TableAdminUsersUsers, ["Cockpit", "User"]);
use(TableAdminUsersGarages, ["Cockpit", "User"]);

//COCKPIT/SATISFACTION
use(ModalAddUser, ["Cockpit", "Satisfaction"]);
//COCKPIT/ADMIN
use(CardUserRole, ["Cockpit", "Admin", "Components"]);
use(WidgetIframePreview, ["Cockpit", "Admin", "Widget"]);
use(WidgetIframe, ["Cockpit", "Admin", "Widget"]);
use(ModalMakeSurveys, ["Cockpit", "Admin","Survey"]);
use(ModalMakeSurveysPrevisualisation, ["Cockpit", "Admin","Survey"]);
use(EReputationCustomResponse, ["Cockpit", "Admin", "Pages"]);
use(EReputationModalConfigTime, ["Cockpit", "Admin", "Components"]);
use(EReputationModalAccessDenied, ["Cockpit", "Admin", "Components"]);
use(EReputationModalConfigModelResponse, ["Cockpit", "Admin", "Components"]);
use(EReputationModalDeleteModelResponse, ["Cockpit", "Admin", "Components"]);

//COCKPIT/Analytics
use(SetupExportsDatatypesGaragesFrontDeskUsers, ['Cockpit', 'Analytics', 'Components']);
use(SetupExportsPeriod, ['Cockpit', 'Analytics', 'Components']);
// XLeads components
use(SetupExportsAutomationCampaigns, ['Cockpit', 'Analytics', 'Components']);

//COCKPIT/xleads
use(CrossLeadsDemonstration, ["Cockpit", "XLeads", "Pages"]);

// E-reputation components

use(EreputationDemonstration, ["Cockpit", "e-reputation", "Pages"]);


//SMS/Automation
use(CampaignSms, ["Sms", "Automation"]);
use(CampaignGdprSms, ["Sms", "Automation"]);

//utilise des slots => cassé use(AutomationFooter, ["Emails", "Automation", "Components"]);
//utilise des slots => cassé use(AutomationThankYou, ["Emails", "Automation", "Components"]);

//Automation/Components
use(AutomationHeader, ["Automation", "Components"]);
use(AutomationFooter, ["Automation", "Components"]);
use(AutomationThankYou, ["Automation", "Components"]);
use(AutomationInnerHTML, ["Automation", "Components"]);
use(AutomationTitle, ["Automation", "Components"]);
use(AutomationCentralButton, ["Automation", "Components"]);

//Global
use(EReputationPresentationTitleSkeleton, ["Global", "Skeleton"]);
use(TileEreputationSkeleton, ["Global", "Skeleton"]);
use(EReputationStatsSkeleton, ["Global", "Skeleton"]);
use(EreputationDemonstration, ["Global", "Skeleton"]);


//IDeaBox
use(IdeaboxIdeaBox, ["IdeaBox", "Components"]);
use(IdeaboxIdea, ["IdeaBox", "Components"]);
use(IdeaboxAddIdea, ["IdeaBox", "Components"]);

// Grey-Bo components
use(campaingPreview, ["Greybo", "Components"]);
use(testSurveyForm, ["Greybo", "Components"]);
use(RgpdForm, ["Greybo", "Components"]);
use(monthlySummary, ["Greybo", "Components"]);

// Emails components
use(WelcomeEmail, ["Emails", "Notifications"]);
use(AutomationCampaignEmailSubject, ["Emails", "Automation"]);
use(AutomationCampaignEmail, ["Emails", "Automation"]);

use(ExportEmailBody, ["Emails", "Analytics"]);
use(ExportEmailSubject, ["Emails", "Analytics"]);

export default {
  name: 'CusteedBook',
  components: {...components, Tree, LanguageSwitcher},
  data() {
    let activeComponent = null;
    const sectionsTree = {};
    Object.values(this.$options.components).forEach(component => {
      const sections = component.custeedbookSection || ["default"];
      let root = sectionsTree;
      sections.forEach(section => {
        if(!root[section]) root[section] = {};
        root = root[section];
      });


      if (component.customName) {
        root[component.customName] = { leaf: true, component };
      } else {
        /*
        * if the scenario includes directly the component (ex: frontend/components/global/TagSelector.vue), the name can be found in component.name
        * if the scenario create a dynamic component with Vue.component (ex: frontend/pages-extended/custeedbook/scenarios/cockpit/global/SearchInput.js), the name can be found in component.extendOptions.name
        */
        const name = (component.extendOptions && component.extendOptions.name) || component.name
        root[name] = { leaf: true, component };
      }
    });
    return {
      activeComponent,
      activeProps: null,
      sectionsTree,
      componentsList: {},
      ...props,
      fullScreen: true,
      size: 'desktop',
    }
  },
  methods: {
    setActiveComponent(component) {
      this.activeComponent = component.securedName || component.name;
      this.$router.push(`/custeedbook#${component.custeedbookSection},${ component.customName || component.name || 'YouShouldNameYourComponentForThisToWork'} `);
    },
    jsonifyValue(componentInput) {
      console.log('Label du composant jsonified', componentInput.label);
      componentInput.value = JSON.parse(componentInput.textValue);
    },
    setTextValue(component) {
      return {
        ...component,
        ...component.inputType === 'json' && { textValue: JSON.stringify(component.value, null, 2) }
      };
    },
    fullScreenToggle() {
      this.fullScreen = !this.fullScreen;
      document.getElementById('main').style.width = '100%';
      document.getElementById('main').style.height = '100vh';
      document.getElementById('component').style.height = '100vh'
    },
    resize (e) {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + "px";
    },
    changeSize(size) {
      switch (size) {
        case "phone":
          this.size = "phone";
          break;
        case "tablet":
          this.size = "tablet";
          break;
        case "desktop":
          this.size = "desktop";
          break;
        default:
          this.size = "desktop";
      }
    },
  },
  computed: {
    activeComponentsInputs() {
      if (!this.activeComponent) {
        return[];
      }
      this[`${this.activeComponent}Props`] = this[`${this.activeComponent}Props`] && this[`${this.activeComponent}Props`].map(this.setTextValue);
      return this[`${this.activeComponent}Props`];
    },
    activeComponentsProps() {
      if (!this.activeComponent) {
        return {};
      }
      // Getting default props
      let props = {};
      if(this[`${this.activeComponent}Props`]) {
        for (const prop of this[`${this.activeComponent}Props`]) {
          props[prop.label] = prop.value;
        }
      }
      return props;
    },
    listeners() {
      return {
        input: (event) => alert(`emitName: input, event: ${JSON.stringify(event)}`),
        validate: (event) => alert(`emitName: validate, event: ${JSON.stringify(event)}`),
        close: () => alert('emitName: close'),
        change: (event) => alert(`emitName: change, event: ${JSON.stringify(event)}`),
        keyup: (event) => alert(`emitName: keyup, event: ${JSON.stringify(event)}`),
        submit: (event) => alert(`emitName: submit, event: ${JSON.stringify(event)}`),
        onAccordionItemClick: (event) => alert(`emitName: onAccordionItemClick, event: ${JSON.stringify(event)}`),
        filtersChange: (event) => alert(`emitName: filtersChange, event: ${JSON.stringify(event)}`),
        searchClick: (event) => alert(`emitName: searchClick, event: ${JSON.stringify(event)}`),
      };
    }
  }
}
</script>

<style scoped lang="scss">
#LanguageSwitcher {
  font-size: 16px;
}
.active {
  color: $blue!important;
  background: rgba($blue, .15);
  padding: .4rem;
  border-radius: 3px;
}
.desktop {
  width: calc(100% - 5rem);
}
.tablet {
  width: 768px;
}
.phone {
  width: 375px;
}
.custeedbook {
  display: flex;
  flex-direction: row;
  background-color: $bg-grey;
  &__aside {
    text-align: left;
    background-color: $very-light-grey;
    width: 20rem;
    min-height: 100vh;
    font-size: 1.5rem;
    display:flex;
    flex-direction: column;
    &__header {
      color: $white;
      background-color: $custeedBrandColor;
      flex-grow: 0;
      flex-shrink: 0;
      height: 4rem;
      box-sizing: border-box;
      padding: .25rem 1rem;
      &__logo {
        height: 100%;
        box-sizing: border-box;
        padding: 0.25rem;
      }
    }
    &__components {
      background-color: $white;
      height: calc(100vh - 4rem);
      flex-grow: 1;
      overflow: auto;
      box-shadow: 20px -15px 10px -20px rgba($black, .3);
      border-right: 1px solid rgba($grey, .5);
    }
    &__component-button {
      font-size: 1rem;
      cursor: pointer;
      padding: 1rem 0 1rem 1.5rem;
      width: calc(100% - 2rem);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: $dark-grey;
      box-sizing: border-box
    }
  }
  &__main {
    width: calc(100% - 20rem);
    height: calc(100vh - 4rem);
    background-color: $very-light-grey;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    &__header {
      padding: 1.15rem;
      text-align: center;
      color: $white;
      background-color: $custeedBrandColor;
      font-size: 1.5rem;
      height: 4rem;
      box-sizing: border-box;
      &__language-switcher {
        position: absolute;
        top: 1rem;
        left: 20.6rem;
      }
    }
    &__props {
      display:flex;
      flex-direction: column;
      height: 30vh;
      background-color: $white;
      padding: 1.5rem;
      margin: 1rem 1rem 0;
      color: $black;
      font-weight: 700;
      border-radius: .5rem;
      box-shadow: 0px 0px 3px 0px rgba($black, 0.15);
      overflow: auto;
      &__prop {
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        background: $very-light-grey;
        padding: .7rem 1rem;
        border-radius: .2rem;
        &__textarea {
          padding: 0.5rem;
          box-sizing: border-box;
          border-radius: 5px;
          border: 1px solid $grey;
          color: $greyish-brown;
          width: 100%;
          background-color: $white;
          resize: vertical;
          line-height: 1.5;
          outline: none;
          display: block;
          &:focus {
            box-shadow: inset 0 0 2px $blue;
            border: 1px solid $blue;
          }
          &::placeholder {
            color: $grey;
          }
          &::-webkit-scrollbar {
            width: 8px;
          }
          &::-webkit-scrollbar-track {
            background-color: $grey;
            border-radius: 10px;
            box-shadow: 0 0 6px rgba($black, .2);
          }
          &::-webkit-scrollbar-thumb {
            background: rgba($white, .5);
            border-radius: 10px;
          }
        }
        &__label {
          margin: 0 1rem .5rem 0;
        }
      }
    }
    &__component {
      background: $white;
      margin: 1rem auto;
      padding: 1.5rem;
      border-radius: .5rem;
      box-shadow: 0px 0px 3px 0px rgba($black, 0.15);
      overflow: auto;
      position: relative;
      &__content {
        margin-top: 3rem !important;
      }
      &__header {
        background-color: $white;
        border-bottom: 1px solid rgba($grey, .5);
        display: flex;
        flex-direction: row;
        padding: 1rem 0;
        &__left-part {
          width: 100px;
          display: flex;
          padding-left: .5rem;
        }
        &__right-part {
          width: 120px;
          margin-left: auto;
          display: flex;
          padding-right: .5rem;
          &__icons {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          &__icon {
            font-size: 1.2rem;
            color: $dark-grey;
          }
        }
      }
    }
  }
}
</style>
