<template>
  <Sidebar :class="classBinding" class="cockpit-sidebar">
    <template #header>
      <div class="cockpit-sidebar__header">
        <UserProfileContent
          :currentUser="currentUser"
          class="cockpit-sidebar__header-user-profile"
        />
        <div class="cockpit-sidebar__header-logo">
          <nuxt-link
            :to="{ name: 'cockpit' }"
            class="cockpit-sidebar__header-logo-link"
          >
            <img
              v-if="!sidebarTiny"
              alt="Custeed logo - long version"
              src="/logo/logo-custeed-long.svg"
              class="cockpit-sidebar__logo"
            />
            <img
              v-else
              alt="Custeed logo - picto version"
              src="/logo/logo-custeed-picto.svg"
              class="cockpit-sidebar__logo"
            />
          </nuxt-link>
        </div>
      </div>
    </template>
    <SidebarItem
      v-for="(item, index) in menu"
      :key="index"
      v-bind="item"
      v-tooltip="tooltipContent(item)"
      :activeSidebarCode="activeSidebarCode"
      :hasSidebarSubmenu="hasSidebarSubmenu"
      :setFromRowClick="setFromRowClick"
      :sidebarTiny="sidebarTiny"
      :toggleSidebar="toggleSidebar"
      @click.native="onSidebarItemClick(item)"
    />
    <template #footer>
      <div class="cockpit-sidebar__footer-actions">
        <Button
          v-if="canCreateUser"
          @click="openModalAddUser"
          type="contained-orange"
        >
          <i v-if="sidebarTiny" class="icon-gs-add-user" />
          <template v-else #left>
            <i class="icon-gs-add-user" />
          </template>
          <AppText
            v-if="!sidebarTiny"
            bold
            tag="span"
          >
            {{ $t_locale('components/cockpit/CockpitSidebar')("AddUser")  }}
          </AppText>
        </Button>
        <ButtonExport
          :availableAutomationCampaigns="availableAutomationCampaigns"
          :availableFrontDeskUsers="availableFrontDeskUsers"
          :availableGarages="availableGarages"

          :currentUser="currentUser"

          :closeModalFunction="closeModalFunction"
          :openModalFunction="openModalFunction"

          :customExports="customExports"
          :deleteCustomExportFunction="deleteCustomExportFunction"
          :exportGetAvailableFrontDeskUsers="exportGetAvailableFrontDeskUsers"
          :exportType="null"
          :fetchCustomExports="fetchCustomExports"
          :openCustomExportModalFunction="openCustomExportModalFunction"
          :saveCustomExportFunction="saveCustomExportFunction"
          :startExportFunction="startExportFunction"
          :updateCustomExportFunction="updateCustomExportFunction"
          :garageIds="garageIds"
          :selectedTags="selectedTags"
          :optionSelected="optionSelected"
          class="cockpit-sidebar__footer-actions--exports-button"
        />
      </div>
      <SidebarItem
        v-for="(item, index) in footerMenu"
        :key="index"
        v-bind="item"
        :activeSidebarCode="activeSidebarCode"
        :hasSidebarSubmenu="hasSidebarSubmenu"
        :setFromRowClick="setFromRowClick"
        :sidebarTiny="sidebarTiny"
        :toggleSidebar="toggleSidebar"
        @click.native="onSidebarItemClick(item)"
      />
    </template>
  </Sidebar>
</template>


<script>
import ButtonExport from '~/components/global/exports/ButtonExport';
import UserProfileContent from "~/components/global/UserProfileContent";
import { UserRoles, MenuCodes } from '~/utils/enumV2';
import { getDeepFieldValue as deep } from "~/utils/object";
import { garagesValidator } from '~/utils/components/validators';

export default {
  components: { ButtonExport, UserProfileContent },
  props: {
    accessRules: Object,
    authorizations: Object,
    automationCampaignType: String,
    availableFrontDeskUsers: {
     type: Array,
      default: () => [],
    },
    availableGarages: {
      type: Array,
      default: () => [],
    },
    availablePeriods: {
      type: Array,
      default: () => [],
    },
    canAccessToAutomation: Array,
    canSubscribeToCrossLeads: Array,
    closeModalFunction: {
      type: Function,
      default: () => console.error('CockpitSidebar.vue ::closeModalFunction not set')
    },
    cockpitType: String,
    currentUser: {
      type: Object,
      default: () => ({}),
    },
    currentUserIsGarageScoreUser: Boolean,
    customExports: {
      type: Array,
      default: () => [],
    },
    availableAutomationCampaigns: {
      type: Array,
      default: () => [],
    },
    dataTypeId: String,
    deleteCustomExportFunction: {
      type: Function,
      default: () => console.error('CockpitSidebar.vue :: updateCustomExportFunction not set')
    },
    exportGetAvailableFrontDeskUsers: {
      type: Function,
      default: () => console.error('ModalExports.vue :: exportGetAvailableFrontDeskUsers not set')
    },
    fetchCustomExports: {
      type: Function,
      default: () => {}
    },
    garageIds: {
      required: true,
      validator: garagesValidator
    },
    hasSidebarSubmenu: {
      type: Function,
      default() {
        return () => {};
      },
    },
    jobsByCockpitType: Array,
    locale: String,
    openCustomExportModalFunction: {
      type: Function,
      default:() => console.error('CockpitSidebar:vue :: openCustomExportModalFunction not set')
    },
    openModalFunction: {
      type: Function,
      default: () => console.error('CockpitSidebar.vue :: openModalFunction not set')
    },
    periodId: String,
    route: Object,
    saveCustomExportFunction: {
      type: Function,
      default: () => console.error('CockpitSidebar.vue :: saveCustomExportFunction not set')
    },
    selectedGarage: {
      type:Array,
      default: () => []
    },
    setFromRowClick: {
      type: Function,
      default() {
        return () => {};
      },
    },
    sidebarTiny: Boolean,
    startExportFunction: {
      type: Function,
      default: () => console.error('CockpitSidebar.vue :: startExportFunction not set')
    },
    toggleSidebar: {
      type: Function,
      default() {
        return () => {};
      },
    },
    updateCustomExportFunction: {
      type: Function,
      default: () => console.error('CockpitSidebar.vue :: updateCustomExportFunction not set')
    },
    optionSelected: {
      type: String,
      default: 'garages'
    },
    selectedTags:{
      type: Array,
      default: () => []
    },
  },
  data() {
    let activeSidebarCode = '';
    const routeNameIncludes = (str) => this.route.name.includes(str);
    switch(true) {
      case routeNameIncludes("cockpit-welcome"): activeSidebarCode = MenuCodes.WELCOME; break;
      case routeNameIncludes("cockpit-satisfaction"): activeSidebarCode = MenuCodes.SATISFACTION; break;
      case routeNameIncludes("cockpit-unsatisfied"): activeSidebarCode = MenuCodes.UNSATISFIED; break;
      case routeNameIncludes("cockpit-leads"): activeSidebarCode = MenuCodes.LEADS; break;
      case routeNameIncludes("cockpit-automation"): activeSidebarCode = MenuCodes.AUTOMATION; break;
      case routeNameIncludes("cockpit-contacts"): activeSidebarCode = MenuCodes.CONTACTS; break;
      case routeNameIncludes("cockpit-e-reputation"): activeSidebarCode = MenuCodes.EREP; break;
      case routeNameIncludes("cockpit-cross-leads"): activeSidebarCode = MenuCodes.XLEADS; break;
      case routeNameIncludes("cockpit-admin"): activeSidebarCode = MenuCodes.ADMIN; break;
    }
    return {
      activeSidebarCode,
      deep: (fieldName) => deep(this, fieldName),
    };
  },

  computed: {
    access() {
      return this.accessRules;
    },
    canCreateUser() {
      return UserRoles.getPropertyFromValue(
        this.deep('currentUser.role'),
        'canCreateUser'
      );
    },
    classBinding() {
      return {
        "cockpit-sidebar--tiny": this.sidebarTiny
      };
    },
    footerMenu() {
      return [
        {
          code: MenuCodes.ADMIN,
          icon: "icon-gs-cog",
          to: { },
          exact: false,
          submenu: [
            { to: `/cockpit/admin/profile`, code: "submenu_admin_profile" },
            ...(this.canCreateUser
              ? [
                  {
                    to: `/cockpit/admin/users`,
                    code: "submenu_admin_users",
                    alias: "/cockpit/admin/users"
                  }
                ]
              : []),
            ...(this.hasAccessToAdminSourcesSubMenu
              ? [
                {
                  to: `/cockpit/admin/sources`,
                  code: "submenu_admin_sources",
                  alias: "/cockpit/admin/sources",
                  isNew: true
                }
              ]
              : []),
            ...(this.access.surveys
              ? [
                  {
                    to: `/cockpit/admin/surveys`,
                    code: "submenu_admin_surveys",
                    alias: "/cockpit/admin/surveys"
                  }
                ]
              : []),
              /*{ to: `/cockpit/admin/responses`, code: "submenu_admin_responses" },*/
            ...((this.access.eReputationOnly) ?
                [
                  {
                    to: `/cockpit/admin/pageCustomResponses`,
                    code: "submenu_admin_responses",
                    alias: "/cockpit/admin/pageCustomResponses"
                  }
                ]:
                []
              ),
            ...(this.access.widgetManagement && this.locale === "fr"
              ? [{ to: `/cockpit/admin/widget`, code: "submenu_admin_widgets" }]
              : [])
          ],
          onClick: () => {},
          showSubmenu: this.activeSidebarCode.includes('menu_admin')
        }
      ];
    },
    hasAccessToGarageSubMenu() {
      return this.access.establishment;
    },
    hasAccessToTeamSubMenu() {
      return this.access.team;
    },
    hasAccessToAdminSourcesSubMenu() {
      return this.access.xleads;
    },
    isAvailableGaragesShareAllTickets() {
      return this.availableGarages.every(
        g => g.isAgentSharingAllTickets === true
      );
    },
    isAvailableGaragesSharingTickets() {
      return this.availableGarages.some(g => g.isAAgentSharingHisLeads === true);
    },
    menu() {
      const haveAnAgentInMyGarages = this.availableGarages.find(
        e => e.type === "Agent"
      );

      const menu = [
        {
          code: MenuCodes.WELCOME,
          icon: "icon-gs-gauge-dashboard",
          to: { path: "/cockpit/welcome", query: this.query },
          exact: false,
          disabled: !this.access.welcome,
          onClick: () => {
            if (!this.access.welcome) {
              this.openModalFunction({
                component: "ModalMessage",
                props: {
                  message: "You do not have access to this page",
                  type: "danger",
                },
              });
            }
          }
        },
        {
          code: MenuCodes.SATISFACTION,
          icon: "icon-gs-chat-bubble",
          to: { },
          exact: false,
          disabled: !this.access.satisfaction,
          submenu: !this.access.satisfaction
            ? []
            : [
              ...(this.hasAccessToGarageSubMenu
                ? [
                      {
                        to: { path: `/cockpit/satisfaction/garages`, query: this.query },
                        code: "submenu_satisfaction_garages",
                        alias: "/cockpit/satisfaction/garages",
                      }
                    ]
                : []
              ),
              ...(this.hasAccessToTeamSubMenu
                ? [
                    {
                      to: { path: `/cockpit/satisfaction/team`, query: this.query },
                      code: "submenu_satisfaction_team",
                      alias: "/cockpit/satisfaction/team",
                    }
                  ]
                : []
              ),
              {
                to: { path: `/cockpit/satisfaction/reviews`, query: this.query },
                code: "submenu_satisfaction_reviews",
                alias: "/cockpit/satisfaction/reviews",
              }
            ],
          onClick: () => {
            if (!this.access.satisfaction) {
              this.openModalFunction({
                component: "ModalSubscriptionSatisfaction",
              });
            }
          },
          showSubmenu: this.activeSidebarCode.includes('menu_satisfaction'),
        },

        {
          code: MenuCodes.UNSATISFIED,
          icon: "icon-gs-sad",
          to: { },
          exact: false,
          disabled: !this.access.unsatisfied,
          submenu: !this.access.unsatisfied
            ? []
            : [
              ...(this.hasAccessToGarageSubMenu
                ? [
                    {
                      to: { path: `/cockpit/unsatisfied/garages`, query: this.query },
                      code: "submenu_unsatisfied_garages",
                      alias: "/cockpit/unsatisfied/garages"
                    }
                  ]
                : []
              ),
              ...(this.hasAccessToTeamSubMenu
                ? [
                    {
                      to: { path: `/cockpit/unsatisfied/team`, query: this.query },
                      code: "submenu_unsatisfied_team",
                      alias: "/cockpit/unsatisfied/team"
                    }
                  ]
                : []
              ),
              {
                to: { path: `/cockpit/unsatisfied/reviews`, query: this.query },
                code: "submenu_unsatisfied_reviews",
                alias: "/cockpit/unsatisfied"
              }
            ],
          onClick: () => {
            if (!this.access.unsatisfied) {
              this.openModalFunction({
                component: "ModalSubscriptionUnsatisfied",
              });
            }
          },
          showSubmenu: this.activeSidebarCode.includes('menu_unsatisfied')
        },

        {
          code: MenuCodes.LEADS,
          icon: "icon-gs-car-repair",
          to: { },
          disabled: !this.access.leads,
          exact: false,
          submenu: !this.access.leads
            ? []
            : [
              ...(
                (
                  this.hasAccessToGarageSubMenu
                  && !this.isAvailableGaragesShareAllTickets
                )
                  ? [
                      {
                        to: { path: `/cockpit/leads/garages`, query: this.query },
                        code: "submenu_leads_garages",
                        alias: "/cockpit/leads/garages"
                      }
                    ]
                  : []
              ),
              ...(this.hasAccessToTeamSubMenu && !this.isAvailableGaragesShareAllTickets
                ? [
                    {
                      to: { path: `/cockpit/leads/team`, query: this.query },
                      code: "submenu_leads_team",
                      alias: "/cockpit/leads/team"
                    }
                  ]
                : []
              ),
              {
                to: { path: `/cockpit/leads/sources`, query: this.query },
                code: "submenu_leads_sources",
                alias: "/cockpit/leads/sources",
                isNew: true
              },
              ...(!this.isAvailableGaragesShareAllTickets
                ? [
                    {
                      to: { path: `/cockpit/leads/reviews`, query: this.query },
                      code: "submenu_leads_reviews",
                      alias: "/cockpit/leads"
                    }
                  ]
                : []
              ),
              ...(haveAnAgentInMyGarages && this.isAvailableGaragesSharingTickets
                ? [
                    {
                      to: { path: `/cockpit/leads/followed`, query: this.query },
                      code: "submenu_leads_followed",
                      alias: "/cockpit/leads"
                    }
                  ]
                : []
              )
          ],
          onClick: () => {
            if (!this.access.leads) {
              this.openModalFunction({
                component: "ModalSubscriptionLeads",
              });
            }
          },
          showSubmenu: this.activeSidebarCode.includes('menu_leads')
        },
        ...(this.canAccessToAutomation.length
          ? [{
            code: MenuCodes.AUTOMATION,
            ...(
              this.authorizations.hasAutomationAtLeast
                ? { icon: 'icon-gs-send' }
                : { iconSvg: '/logo/logo-custeed-automation-picto.svg' }
            ),
            to: (
              this.authorizations.hasAutomationAtLeast
                ? { }
                : { path : "/cockpit/automation", query: this.query }
            ),
            disabled: !this.access.automation,
            exact: false,
            submenu: !this.access.automation ? [] : [
              ...(this.hasAccessToGarageSubMenu
                ? [
                    {
                      to: { path: '/cockpit/automation/garages', query: this.query },
                      code: 'submenu_automation_garages',
                      alias: '/cockpit/automation/garages'
                    }
                  ]
                : []),
                {
                  to: { path: '/cockpit/automation/campaigns', query: this.query },
                  code: 'submenu_automation_campaigns',
                  alias: '/cockpit/automation'
                }
            ],
            onClick: () => {
              const hasSuscripcionAutomation = this.selectedGarage.some(g=>g.subscriptions?.Automation === true);

              const garageHasAccess = hasSuscripcionAutomation || this.authorizations.hasAutomationAtLeast;

              if (garageHasAccess && !this.access.automation) {
                this.openModalFunction({
                  component: 'ModalSubscriptionAutomation'
                });
              } else {
                this.$router.push({ name: 'cockpit-automation', query: this.query });
              }
            },
            showSubmenu: (
              this.access.automation
              && this.activeSidebarCode.includes('menu_automation')
            )
          }]
          : []
        ),

        {
          code: MenuCodes.CONTACTS,
          icon: "icon-gs-database",
          to: { },
          disabled: !this.access.contacts,
          exact: false,
          submenu: !this.access.contacts ? [] : [
            ...(this.hasAccessToGarageSubMenu
              ? [
                  {
                    to: { path: `/cockpit/contacts/garages`, query: this.query },
                    code: "submenu_contacts_garages",
                    alias: "/cockpit/contacts/garages"
                  }
                ]
              : []),
            ...(this.hasAccessToTeamSubMenu
              ? [
                  {
                    to: { path: `/cockpit/contacts/team`, query: this.query },
                    code: "submenu_contacts_team",
                    alias: "/cockpit/contacts/team"
                  }
                ]
              : []),
              {
                to: { path: `/cockpit/contacts/reviews`, query: this.query },
                code: "submenu_contacts_reviews",
                alias: "/cockpit/contacts"
              }
          ],
          onClick: () => {
            if (!this.access.contacts) {
              this.openModalFunction({
                component: "ModalSubscriptionContacts",
              });
            }
          },
          showSubmenu: this.activeSidebarCode.includes('menu_contacts')
        },
        {
          code: MenuCodes.EREP,
            ...(this.authorizations.hasEReputationAtLeast
              ? { icon: 'icon-gs-desktop-star' }
              : { iconSvg: '/logo/logo-custeed-e-reputation-picto.svg' }
            ),
          to: (
            this.authorizations.hasEReputationAtLeast
              ? { }
              : { path : "/cockpit/e-reputation/garages", query: this.query }
          ),
          exact: false,
          disabled: !this.access.eReputation,
          isNew: false,
          submenu: !this.access.eReputation ? [] : [
            ...(this.hasAccessToGarageSubMenu
              ? [
                  {
                    to: { path: `/cockpit/e-reputation/garages`, query: this.query },
                    code: "submenu_erep_garages",
                    alias: "/cockpit/e-reputation/garages"
                  }
                ]
              : []),
              {
                to: { path: `/cockpit/e-reputation/reviews`, query: this.query },
                code: "submenu_erep_reviews",
                alias: "/cockpit/e-reputation"
              }
          ],
          onClick: () => {
            if (!this.access.eReputation) {
              this.$router.push("/cockpit/e-reputation/demonstration");
            }
          },
          showSubmenu: (
            this.access.eReputation
            && this.activeSidebarCode.includes('menu_erep')
          )
        },
      ];

      if (this.canSubscribeToCrossLeads.length) {
        menu.push({
          code: MenuCodes.XLEADS,
          iconSvg: "/logo/logo-custeed-xlead-picto.svg",
          to: { path: "/cockpit/cross-leads", query: this.query },
          exact: false,
          disabled: !this.access.xleads,
          isNew: true,
          submenu: [],
          onClick: () => {
            this.$router.push("/cockpit/cross-leads");
          },
          showSubmenu: false
        });
      }

      const disabledItems = [];
      menu.forEach(item => {
        if (item.disabled) {
          disabledItems.push(item);
        }
      });
      const result = menu.filter(item => !item.disabled && !item.invisible);
      Array.prototype.push.apply(result, disabledItems);
      return result;
    },
    query() {
      return {
        automationCampaignType: this.automationCampaignType || undefined,
        cockpitType: this.cockpitType || undefined,
        dataTypeId: this.dataTypeId || undefined,
        garageIds: this.garageIds || undefined,
        periodId: this.periodId || undefined,
        startDate: undefined,
      };
    },
  },
  methods: {
    onSidebarItemClick(item) {
      this.setActiveSidebarCode(item.code);
      item?.onClick?.();
      // By default, if there is only one sub menu, we redirect to it
      if (item.submenu?.length === 1) {
        this.$router.push(item.submenu[0].to);
      }
    },
    openModalAddUser() {
      this.openModalFunction({
        component: "ModalAddUser",
        props: {
          userRole: this.currentUser?.role,
          onUserAdded: this.userAdd,
          currentUserIsGarageScoreUser: this.currentUserIsGarageScoreUser,
          jobsByCockpitType: this.jobsByCockpitType,
          garages: this.availableGarages,
        },
      });
    },
    setActiveSidebarCode(code) {
      this.activeSidebarCode = code;
    },
    shouldDisplayOptionalTooltip(item) {
      const partialMenuCodes = [
        MenuCodes.AUTOMATION,
        MenuCodes.EREP,
        MenuCodes.XLEADS,
      ];
      return (item.disabled && partialMenuCodes.includes(item.code));
    },
    tooltipContent(item) {
      return {
        content: this.shouldDisplayOptionalTooltip(item)
          ? this.$t_locale('components/cockpit/CockpitSidebar')('optional')
          : ''
      }
    },
    userAdd(data) {
      this.closeModalFunction();
      this.$router.push({
        name: "cockpit-admin-user-id",
        params: { id: data.user.id }
      });
    },
  },
};
</script>


<style lang="scss" scoped>
.cockpit-sidebar {
  &__footer-actions {
    display: none;
    align-items: center;
    justify-content: center;
    flex-flow: column;
    border-bottom: 1px solid rgba($grey, .5);
    padding-bottom: 1rem;
    margin-top: 1rem;
  }

  &__header-logo {
    background-color: $custeedBrandColor;
    height: 3.5rem;
    display: none;
  }

  &__header-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__logo {
    width: 100%;
    box-sizing: border-box;
    height: 100%;
    padding: .4rem;
  }

  &__header-user-profile {
    display: block;
  }
}

@media (min-width: $breakpoint-min-md) {
  .cockpit-sidebar {
    &__header-user-profile {
      display: none;
    }

    &__header-logo {
      display: block;
    }

    &__footer-actions {
      display: flex;

      &--exports-button {
        margin-top: 1rem;
      }
    }
  }
}
</style>
