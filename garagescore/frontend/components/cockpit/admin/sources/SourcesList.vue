<template>
  <div>
    <OpenableListItem
      v-for="(crossLead, index) in crossLeads"
      :key="crossLead.type"
      :firstItem="index === 0"
      :open="activeItem === index"
      @click="open(index)"
    >
      <template slot="header">
        <div class="item-icon">
          <img :src="`/cross-leads/${crossLead.type}.svg`"/>
        </div>
        <div class="item-1">{{ $t_locale('components/cockpit/admin/sources/SourcesList')(crossLead.type) }}</div>
        <div class="item-2">
          <i class="icon-gs-add-outline-circle"></i>
          {{ `${crossLead.sources.length}/${availableGarages.length} ${$t_locale('components/cockpit/admin/sources/SourcesList')("addedEstablishments")}` }} {{ canSubscribeToCrossLeads ? ` (${canSubscribeToCrossLeads} ${$t_locale('components/cockpit/admin/sources/SourcesList')("notSubscribedYet")})` : '' }}
        </div>
      </template>
      <template>
        <SourceEstablishmentHeader />
        <SourceEstablishmentRow
          v-for="source in crossLead.sources"
          :key="source.garageId"
          :source="source"
          :openModalDeleteSource="openModalDeleteSource"
          @onClickEdit="handleClickEdit(source)"
        />
      </template>
      <template slot="footer">
        <AddSourceButton @click="openModalAddSource(crossLead.type)" />
      </template>
    </OpenableListItem>
  </div>
</template>

<script>
import OpenableListItem from "~/components/ui/OpenableListItem";
import AddSourceButton from "~/components/cockpit/admin/sources/AddSourceButton";
import SourceEstablishmentHeader from "~/components/cockpit/admin/sources/SourceEstablishmentHeader";
import SourceEstablishmentRow from "~/components/cockpit/admin/sources/SourceEstablishmentRow";

export default {
  components: {
    OpenableListItem,
    AddSourceButton,
    SourceEstablishmentHeader,
    SourceEstablishmentRow
  },

  data() {
    return {
      activeItem: null
    };
  },

  mounted() {
    this.$store.dispatch("cockpit/admin/crossLeads/fetchSources");
  },

  methods: {
    handleClickEdit(source) {
      this.$store.dispatch("openModal", {
        component: "ModalEditSource",
        props: { source },
      });
    },

    openModalAddSource(sourceType) {
      this.$store.dispatch("openModal", {
        component: "ModalAddSource",
        props: { sourceType },
      });
    },

    async handleDeleteSource(garageId , email, phone, type) {
      await this.$store.dispatch("cockpit/admin/crossLeads/deleteSource", { garageId , email, phone, type });
      this.closeModal();
    },

    openModalDeleteSource(source) {
      this.$store.dispatch("openModal", {
        component: "ModalDeleteSource",
        props: { source, handleDeleteSource: this.handleDeleteSource, closeModal: this.closeModal },
      });
    },

    closeModal() {
      this.$store.dispatch('closeModal');
    },

    open(index) {
      this.activeItem = index === this.activeItem ? null : index;
    }
  },
  computed: {
    crossLeads() {
      return this.$store.getters["cockpit/admin/crossLeads/crossLeads"];
    },
    availableGarages() {
      return this.$store.getters["cockpit/availableCrossLeadsGarages"];
    },
    canSubscribeToCrossLeads() {
      return (this.$store.getters["cockpit/canSubscribeToCrossLeads"] || []).length;
    }
  }
};
</script>

<style lang="scss" scoped>
.item-icon {
  width: 21px;
  height: 21px;
  background-color: $very-light-grey;
  margin-right: 7px;

  img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
}

.item-1 {
  flex: 1;
  font-weight: bold;
}
.item-2 {
  flex: 2;
  display: flex;
  align-items: center;
}

.icon-gs-add-outline-circle {
  font-size: 1.2rem;
  color: $dark-grey;
  margin-right: .5rem;
}
</style>
