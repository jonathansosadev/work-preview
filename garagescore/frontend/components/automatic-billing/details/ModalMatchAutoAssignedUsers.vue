<template>
  <ModalBase class="modal-match-auto-assigned-users">
    <template slot="header-icon">
      <img src="/e-reputation/Garagescore.svg" alt="Logo GarageScore" />
    </template>

    <template slot="header-title">
      <AppText tag="div" size="md" bold>Choix des utilisateurs automatiquement assignés</AppText>
    </template>

    <template slot="header-subtitle">
      <AppText tag="div" type="primary"
        >Lors de la création d'un dossier, l'utilisateur désigné sera automatiquement assigné</AppText
      >
    </template>

    <template slot="body" v-if="!loading && users.length">
      <AppText tag="div" type="muted"
        >Veuillez sélectionner, pour chaque catégorie de dossier, l'utilisateur qui y sera affecté par défaut.</AppText
      >
      <div class="users-header">
        <div class="users-header-logo">
          <i class="icon-gs-folder"></i>
          <AppText tag="span" type="muted">Dossiers</AppText>
        </div>
        <div class="users-header-logo">
          <i class="icon-gs-group"></i>
          <AppText tag="span" type="muted">Utilisateurs</AppText>
        </div>
      </div>
      <div class="users-to-match">
        <div class="ticket" v-for="ticket in filteredTickets" :key="ticket.id">
          <div class="ticket-name">
            <AppText tag="div" bold>{{ ticket.name }}</AppText>
          </div>
          <!--<select v-model="ticket.userId" @click="setAssignedUser(ticket.userId, ticket.id)">-->
          <select v-model="ticket.userId">
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ formatUserName(user) }}
            </option>
          </select>
        </div>
      </div>
    </template>

    <template slot="body" v-else-if="!loading && users.length <= 0">
      <AppText tag="div" type="danger">Aucun utilisateur n'est configuré pour cet établissement !</AppText>
      <AppText tag="div" type="danger">Veuillez configurer les utilisateurs avant toute chose !</AppText>
    </template>

    <template slot="body" v-else>
      <AppText tag="div" type="muted" italic>Chargement de la liste des collaborateurs, veuillez patienter...</AppText>
    </template>

    <template slot="footer">
      <div class="message--and--buttons">
        <div class="message">
          <AppText v-if="ticketsToMatchCount" tag="span" type="danger"
            >Il reste {{ ticketsToMatchCount }} catégorie{{ ticketsToMatchCount > 1 ? 's' : '' }} de dossier à
            associer</AppText
          >
          <AppText v-else-if="noChangeDetected" tag="span" type="warning">Aucun changement à sauvegarder</AppText>
          <AppText v-else tag="span" type="success">Toutes les catégories de dossier ont été associées !</AppText>
        </div>
        <div class="buttons">
          <Button
            :type="buttonType"
            border="square"
            @click="save()"
            :disabled="!!(loading || ticketsToMatchCount || noChangeDetected)"
            >Valider</Button
          >
        </div>
      </div>
    </template>
  </ModalBase>
</template>

<script>
import GarageStatus from '~/utils/models/garage.status.js';

export default {
  props: {
    garage: Object,
    assignedUser: Function,
    action_updateGarageStatus: {
      type: Function,
      required: false,
    },
    users: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      regularTickets: [
        { name: 'Mécontent APV', id: 'Unsatisfied_Maintenance', userId: '' },
        { name: 'Mécontent VN', id: 'Unsatisfied_NewVehicleSale', userId: '' },
        { name: 'Mécontent VO', id: 'Unsatisfied_UsedVehicleSale', userId: '' },
        { name: 'Lead APV', id: 'Lead_Maintenance', userId: '' },
        { name: 'Lead VN', id: 'Lead_NewVehicleSale', userId: '' },
        { name: 'Lead VO', id: 'Lead_UsedVehicleSale', userId: '' },
      ],
      vhTickets: [{ name: 'Mécontent CT', id: 'VehicleInspection', userId: '' }],
      loading: true,
    };
  },
  async mounted() {
    this.loadExistingConfiguration();
    this.loading = false;
  },
  computed: {
    garageIsVehicleInspection() {
      return this.garage.type === 'VehicleInspection';
    },
    ticketsConfiguration() {
      if (!this.garage.ticketsConfiguration) return null;
      const ticketsConfigurationCopy = { ...this.garage.ticketsConfiguration };
      this.ticketsToMatchKeys.forEach((key) => {
        if (!(key in ticketsConfigurationCopy)) ticketsConfigurationCopy[key] = null;
      });
      return ticketsConfigurationCopy;
    },
    filteredTickets() {
      return this.garageIsVehicleInspection ? this.vhTickets : this.regularTickets;
    },
    ticketsToMatchCount() {
      return this.filteredTickets.filter((t) => !t.userId).length;
    },
    ticketsToMatchKeys() {
      return this.filteredTickets.map((t) => t.id);
    },
    buttonType() {
      return this.ticketsToMatchCount ? 'danger' : 'success';
    },
    noChangeDetected() {
      return (
        !this.action_updateGarageStatus &&
        this.ticketsConfiguration &&
        !Object.keys(this.ticketsConfiguration).some(
          (key) =>
            this.filteredTickets.find((t) => t.id === key) &&
            this.filteredTickets.find((t) => t.id === key).userId !== this.ticketsConfiguration[key]
        )
      );
    },
  },

  methods: {
    formatUserName(user) {
      if (user.firstName || user.lastName) {
        return `${user.firstName ? `${user.firstName[0]}. ` : ''} ${user.lastName}, ${user.job}`;
      } else {
        return `${user.email}, ${user.job}`;
      }
    },
    loadExistingConfiguration() {
      if (this.ticketsConfiguration) {
        for (const key of Object.keys(this.ticketsConfiguration)) {
          const ticket = this.filteredTickets.find((t) => t.id === key);
          const user = this.users.find((u) => u.id === this.ticketsConfiguration[key]);

          if (ticket && user) {
            ticket.userId = this.ticketsConfiguration[key];
          }
        }
      }
    },
    async setAssignedUser(oldUserId, alertType) {
      const findUser = this.filteredTickets.find((t) => t.id === alertType);
      await this.assignedUser(this.garage.id, findUser.userId, oldUserId, alertType);
    },
    async save() {
      if (!this.loading && !this.ticketsToMatchCount) {
        this.loading = true;
        if (this.action_updateGarageStatus) {
          await this.action_updateGarageStatus(this.garage.id, GarageStatus.RUNNING_AUTO, this.filteredTickets);
          this.$snotify.success(`Le garage a été lancé en automatique !`);
        } else {
          for (const ticket of this.filteredTickets) {
            await this.setAssignedUser(ticket.userId, ticket.id);
          }
          this.loadExistingConfiguration();
          this.$snotify.success(`Les managers par défaut ont été sauvegardés.`);
        }
        await this.$store.dispatch('closeModal');
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-match-auto-assigned-users {
  max-height: 80vh;
  overflow-y: auto;

  .header-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: left;

    .header-logo {
      img {
        width: 40px;
      }
    }

    .header-info {
      flex: 1;
      height: 40px;
      display: flex;
      flex-flow: column;
      align-items: flex-start;
      justify-content: space-between;
      padding-left: 15px;
    }
  }

  .users-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 30px 0 15px 0;
    .users-header-logo {
      display: flex;
      align-items: center;
      i {
        margin-right: 5px;
      }
    }
  }

  .users-to-match {
    display: flex;
    flex-flow: column;
    .ticket {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #dddddd;
      padding: 12px 0;
      .ticket-name {
        flex: 1;
      }
      select {
        width: 350px;
        margin-left: 20px;
      }
    }
  }

  .message--and--buttons {
    display: flex;
    align-items: center;
  }

  .buttons {
    display: flex;
    flex: 1;
    align-items: stretch;
    justify-content: flex-end;

    button {
      margin-left: 10px;
    }
  }
}
</style>
