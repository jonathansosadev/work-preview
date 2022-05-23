<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="subject" color="blue" logo-url="/images/www/alert/notepad.png"></BaseHeader>
    </tr>
    <tr>
      <td class="content">
        Cher collègue,<br/><br/>
        <div v-if="payload.type === 'SUPERVISOR_X_LEADS_STATS_REPORT'">
          <h3>Stats des sources:</h3>
          <table cellspacing="10" cellpadding="0" width="90%" style="border-spacing: 10px;border-collapse: separate; width:90%">
            <thead>
            <tr>
              <td>Nom</td>
              <td>Erreurs email - phone j-7</td>
              <td>Parsés j-7 / Transferés j-7 / Total (all history)</td>
            </tr>
            </thead>
            <tbody>
            <tr class="active" v-for="stat in logs">
              <td>{{ stat.publicDisplayName }}</td>
              <td align="center">{{ calcStat(stat, 'Email', 'Error') }} - {{ calcStat(stat, 'Call', 'Error') }}</td>
              <td align="center">{{ calcStat(stat, 'Email', 'Parsed') + calcStat(stat, 'Call', 'Parsed') }}
                / {{ calcStat(stat, 'Email', 'Transferred') }}
                / {{ calcStat(stat, 'total') }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-else v-for="message of messages" v-bind:key="message">
          <span>{{ message }}</span>
          <div v-if="message && message.includes && message.includes('KPI_ERROR') && problems">
            <h4>&nbsp;Les garages pour lesquels au moins un document KPI est erroné</h4>
            <p v-for="garageId of problems.garages">&nbsp;&nbsp;{{ garageId }}</p>
            <h4>&nbsp;Les utilisateurs pour lesquels au moins un document KPI est erroné</h4>
            <p v-for="userId of problems.users">&nbsp;&nbsp;{{ userId }}</p>
          </div>
        </div>

      </td>
    </tr>
    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>

<script>
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter },
    methods: {
      calcStat(stat, type, field) {
        if (field) {
          return Object.keys(stat).reduce((acc, elem) => {
            acc += (stat[elem] && stat[elem][type] && stat[elem][type][field]) || 0;
            return acc;
          }, 0);
        } else {
          return Object.keys(stat).reduce((acc, elem) => {
            acc += (stat[elem] && stat[elem][type]) || 0;
            return acc;
          }, 0);
        }
      },
    },
    computed: {
      payload() { return this.$store.getters.payload; },
      logs() {
        return this.payload.logs;
      },
      messages() {
        return this.payload.messages || this.payload.logs;
      },
      problems() {
        return this.payload.problems;
      },
      subject() {
        if (this.payload.type === "SUPERVISOR_ZOHO_SYNCHRONISATION_REPORT") {
          return `Rapport journalier de synchronisation de zoho (${this.payload.countMissingGarages} garages manquants)`;
        } else if (this.payload.type === "SUPERVISOR_LACK_OF_PHONE") {
          return `Attention: Plus que ${this.payload.stock} téléphones disponibles !`;
        } else if (this.payload.type === "SUPERVISOR_SOURCE_TYPE_MISMATCH") {
          return `Attention: Incompatibilité de type de source !`;
        } else if (this.payload.type === "SUPERVISOR_X_LEADS_STATS_REPORT") {
          return `XLeads: Rapport hebdomadaire de monitoring`;
        }
        return 'Rapport de supervision';
      }
    }
  }
</script>

<style lang="scss" scoped></style>
