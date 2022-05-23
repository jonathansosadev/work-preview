<template>
  <div class="table-contacts">
    <div class="table-contacts__content">
      <Table
        :rows="rows"
        :loading="loading && !loadingMore"
        fixed
        :noResultGodMode="noResultGodMode"
      >
        <template slot="header">
          <TableContactsHeader
            :filtersDisabled="filtersDisabled"
            :hasOnlyContactWithoutCampaign="hasOnlyContactWithoutCampaign"
            :liveSearch="liveSearch"
            :fetchContactsListPage="fetchContactsListPage"
            :changeContactSearch="changeContactSearch"
            :changeContactFilters="changeContactFilters"
            :changeContactLiveSearch="changeContactLiveSearch"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
            :currentFilters="currentFilters"
          />
        </template>
        <template slot="header-fixed">
          <TableContactsHeader
            :filtersDisabled="filtersDisabled"
            :hasOnlyContactWithoutCampaign="hasOnlyContactWithoutCampaign"
            :liveSearch="liveSearch"
            :fetchContactsListPage="fetchContactsListPage"
            :changeContactSearch="changeContactSearch"
            :changeContactFilters="changeContactFilters"
            :changeContactLiveSearch="changeContactLiveSearch"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
            :currentFilters="currentFilters"
          />
        </template>
        <template slot="row" slot-scope="{ row }">
          <TableRowContacts
            :row="row"
            :data-id="row.id"
            :hasOnlyContactWithoutCampaign="hasOnlyContactWithoutCampaign"
            :getNotPossibleStatus="getNotPossibleStatus"
            :changeRowSubview="changeRowSubview"
            :getRowSubview="getRowSubview"
          />
          <TableRowContactsContacts
            v-if="getRowSubview(row.id) === 'contact'"
            v-bind="row.contactsProps"
          />
          <EditableTableRowContactsContacts
            v-if="getRowSubview(row.id) === 'contactTicket'"
            v-bind="row.contactsProps"
            :getNotPossibleStatus="getNotPossibleStatus"
            :updateContactsListData="updateContactsListData"
            :changeRowSubview="changeRowSubview"
            :updateData="updateData"
            :saveTicket="saveTicket"
          />
        </template>
        <template slot="row-loading">
          <TableRowCockpitSkeleton
            v-for="n in 10"
            :key="n"
            :columnCount="5"
          >
            <TableRowCellSkeleton :style="{ flex: 1.5 }" center>
              <SimpleNumberSkeleton />
            </TableRowCellSkeleton>
            <TableRowCellSkeleton :style="{ flex: 0.5 }" />
          </TableRowCockpitSkeleton>
        </template>
      </Table>
    </div>
    <div v-if="hasMore" class="table-contacts__footer">
      <Button
        type="orange-border"
        :disabled="loadingMore"
        fullSized
        @click="loadMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/contacts/reviews/TableContacts')("LoadMore") }}
        </template>
        <template v-else>
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/contacts/reviews/TableContacts')("LoadMore") }}...
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import EditableTableRowContactsContacts from "./EditableTableRowContactsContacts";

import TableContactsHeader from "~/components/cockpit/contacts/reviews/TableContactsHeader";
import TableRowContacts from "~/components/cockpit/contacts/reviews/TableRowContacts";
import TableRowContactsContacts from "~/components/cockpit/contacts/reviews/TableRowContactsContacts";
import SimpleNumberSkeleton from "~/components/global/skeleton/SimpleNumberSkeleton";
import TableRowCellSkeleton from "~/components/global/skeleton/TableRowCellSkeleton";
import TableRowCockpitSkeleton from "~/components/global/skeleton/TableRowCockpitSkeleton";


export default {
  components: {
    EditableTableRowContactsContacts,
    TableContactsHeader,
    TableRowContacts,
    TableRowContactsContacts,
    TableRowCockpitSkeleton,
    TableRowCellSkeleton,
    SimpleNumberSkeleton
  },

  props: {
    filtersDisabled: { type: Boolean, default: false },
    hasOnlyContactWithoutCampaign: { type: Boolean, default: false },
    contacts: { type: Array, default: () => [] },
    currentFilters: { type: Object, default: () => ({}) },
    hasMore: { type: Boolean, default: false },
    getRowSubview: { type: Function },
    loading: { type: Boolean, default: true },
    noResultGodMode: { type: Boolean, default: false },
    fetchNextPage: { type: Function },
    getNotPossibleStatus: { type: Function, required: true },
    updateContactsListData: { type: Function, required: true },
    changeRowSubview: { type: Function, required: true },
    updateData: { type: Function, required: true },
    fetchContactsListPage: { type: Function, required: true },
    changeContactSearch: { type: Function, required: true },
    changeContactFilters: { type: Function, required: true },
    changeContactLiveSearch: { type: Function, required: true },
    handleBack: { type: Function, required: true },
    saveTicket: { type: Function, required: true },
    hasBackArrow: { type: Boolean },
    liveSearch: { type: String },
  },

  data() {
    return {
      loadingMore: false
    };
  },

  computed: {
    rows() {
      return this.contacts.map(r => {
        return {
          ...r,
          contactsProps: {
            id: r.id,
            garageId: r.id, //@TODO remove useless one
            contactTicket: r.contactTicket,
            garageSubscriptions: r.garageSubscriptions,
            surveyRespondedAt: r.surveyRespondedAt,
            users: r.users,
            oldTitle: r.customerOldTitle,
            oldFullName: r.customerOldFullName,
            oldPhone: r.customerOldPhone,
            oldEmail: r.customerOldEmail,
            oldStreet: r.customerOldStreet,
            oldCity: r.customerOldCity,
            oldPostalCode: r.customerOldPostalCode,
            serviceFrontDeskUserName: r.serviceFrontDeskUserName,
            title: r.customerTitle,
            fullName: r.customerFullName,
            phone: r.customerPhone,
            email: r.customerEmail,
            emailIsNc: r.customerEmailIsNc,
            street: r.customerStreet,
            city: r.customerCity,
            postalCode: r.customerPostalCode,
            internalId: r.garageProvidedCustomerId,
            vehicleBrand: r.vehicleMake,
            vehicleModel: r.vehicleModel,
            vehicleImmat: r.vehicleRegistrationPlate,
            registrationDate: r.vehicleRegistrationFirstRegisteredAt,
            vin: r.vehicleVin,
            mileage: r.vehicleMileage,
            date: r.serviceProvidedAt,
            manager: r.garageProvidedFrontDeskUserName,
            garageName: r.garagePublicDisplayName,
            garageType: r.garageType,
            type: r.type,
            customerCampaignContactStatus: r.customerCampaignContactStatus,
            explainCampaignContactStatus: r.explainCampaignContactStatus,
            explainEmailStatus: r.explainEmailStatus,
            explainPhoneStatus: r.explainPhoneStatus,
            isCampaignContactedByEmail: r.isCampaignContactedByEmail,
            isCampaignContactedByPhone: r.isCampaignContactedByPhone,
			// campaignFirstSendAt correspond in DB to , either firstContactedAt, either firstContactByEmailDay, either firstContactByPhoneDay
			// based on the logic described in the function firstContactedAtOrfirstContactByEmailOrfirstContactByPhone in server/webservers-standalones/api/_common/data-resolve.js
            campaignFirstSendAt: r.campaignFirstSendAt,
            customerEmailStatus: r.customerEmailStatus,
            customerPhoneStatus: r.customerPhoneStatus,
            customerUnsubscribedByEmail: r.customerUnsubscribedByEmail,
            customerUnsubscribedByPhone: r.customerUnsubscribedByPhone
          }
        };
      });
    },
  },

  methods: {
    async loadMore() {
      this.loadingMore = true;
      await this.fetchNextPage();
      this.loadingMore = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.table-contacts {
  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
