<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader title="Rapport de supervision des imports" color="blue" logo-url="/images/www/alert/notepad.png"></BaseHeader>
    </tr>
    <tr>
      <td class="content">
        Cher collègue,<br/><br/>
        <table class="stat-table">
          <tr>
            <td class="black-strong-text padded" colspan="2">-- STATISTIQUES GENERALES --</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countGarages }}</td>
            <td class="grey-text">Garages au total</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countAutomatedGarages }}</td>
            <td class="grey-text">Branchés en automatique ({{ percentCalculator(report.countGarages, report.countAutomatedGarages) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countManualGarages }}</td>
            <td class="grey-text">Manuels ({{ percentCalculator(report.countGarages, report.countManualGarages) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countERepOnly }}</td>
            <td class="grey-text">Custeed E-Réputation only ({{ percentCalculator(report.countGarages, report.countERepOnly) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countGarages - (report.countAutomatedGarages + report.countManualGarages + report.countERepOnly) }}</td>
            <td class="grey-text">Inactifs ({{ percentCalculator(report.countGarages, report.countGarages - (report.countAutomatedGarages + report.countManualGarages + report.countERepOnly)) }}%)</td>
          </tr>

          <tr>
            <td class="black-strong-text padded" colspan="2">-- STATISTIQUES APV --</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countAutomatedAPVGarages }}</td>
            <td class="grey-text">Garages branchés en auto avec abo APV ({{ percentCalculator(report.countGarages, report.countAutomatedAPVGarages) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countAutomatedGaragesImportedAPVLastWeek }}</td>
            <td class="grey-text">Garages branchés en auto avec abo APV, ayant un import les 7 derniers jours ({{ percentCalculator(report.countAutomatedAPVGarages, report.countAutomatedGaragesImportedAPVLastWeek) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.automatedGaragesNotImportedAPVLastWeek.length }}</td>
            <td class="grey-text">
              Garages branchés en auto avec abo APV sans aucun fichier les 7 derniers jours :
              ({{ percentCalculator(report.countAutomatedAPVGarages, report.automatedGaragesNotImportedAPVLastWeek.length) }}%)<br>
              <ul>
                <li v-for="garage of report.automatedGaragesNotImportedAPVLastWeek">{{ garage.publicDisplayName }}</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.automatedGaragesWithNoRespondingAPVLastWeek.length }}</td>
            <td class="grey-text">
              Garages branchés en auto avec abo APV sans avis atelier les 7 derniers jours
              ({{ percentCalculator(report.countAutomatedAPVGarages, report.automatedGaragesWithNoRespondingAPVLastWeek.length) }}%)<br>
              <ul>
                <li v-for="garage of report.automatedGaragesWithNoRespondingAPVLastWeek">{{ garage.publicDisplayName }}</li>
              </ul>
            </td>
          </tr>
          <!-- MANUAL APV -->
          <tr>
            <td class="black-strong-text text-right">{{ report.countManualAPVGarages }}</td>
            <td class="grey-text">Garages manuels avec abo APV ({{ percentCalculator(report.countGarages, report.countManualAPVGarages) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countManualGaragesImportedAPVLastWeek }}</td>
            <td class="grey-text">Garages manuels avec abo APV, ayant un import les 7 derniers jours ({{ percentCalculator(report.countManualAPVGarages, report.countManualGaragesImportedAPVLastWeek) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.manualGaragesNotImportedAPVLastWeek.length }}</td>
            <td class="grey-text">
              Garages manuels avec abo APV sans aucun fichier les 7 derniers jours :
              ({{ percentCalculator(report.countManualAPVGarages, report.manualGaragesNotImportedAPVLastWeek.length) }}%)<br>
              <ul>
                <li v-for="garage of report.manualGaragesNotImportedAPVLastWeek">{{ garage.publicDisplayName }}</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.manualGaragesWithNoRespondingAPVLastWeek.length }}</td>
            <td class="grey-text">
              Garages manuels avec abo APV sans avis atelier les 7 derniers jours
              ({{ percentCalculator(report.countManualAPVGarages, report.manualGaragesWithNoRespondingAPVLastWeek.length) }}%)<br>
              <ul>
                <li v-for="garage of report.manualGaragesWithNoRespondingAPVLastWeek">{{ garage.publicDisplayName }}</li>
              </ul>
            </td>
          </tr>

          <tr>
            <td class="black-strong-text padded" colspan="2">Statistiques VN - VO</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countAutomatedVnVoGarages }}</td>
            <td class="grey-text">Garages branchés en auto avec abo VnVo ({{ percentCalculator(report.countGarages, report.countAutomatedVnVoGarages) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countAutomatedGaragesImportedVnVoLastWeek }}</td>
            <td class="grey-text">Garages branchés en auto avec abo VnVo, ayant un import les 15 derniers jours ({{ percentCalculator(report.countAutomatedVnVoGarages, report.countAutomatedGaragesImportedVnVoLastWeek) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.automatedGaragesNotImportedVnVoLastTwoWeek.length }}</td>
            <td class="grey-text">
              Garages branchés en auto avec abo VnVo sans aucun fichier les 15 derniers jours :
              ({{ percentCalculator(report.countAutomatedAPVGarages, report.automatedGaragesNotImportedVnVoLastTwoWeek.length) }}%)<br>
              <ul>
                <li v-for="garage of report.automatedGaragesNotImportedVnVoLastTwoWeek">{{ garage.publicDisplayName }}</li>
              </ul>
            </td>
          </tr>
          <!-- MANUAL VNVO -->
          <tr>
            <td class="black-strong-text text-right">{{ report.countAutomatedVnVoGarages }}</td>
            <td class="grey-text">Garages manuels avec abo VnVo ({{ percentCalculator(report.countGarages, report.countAutomatedVnVoGarages) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.countAutomatedGaragesImportedVnVoLastWeek }}</td>
            <td class="grey-text">Garages manuels avec abo VnVo, ayant un import les 15 derniers jours ({{ percentCalculator(report.countAutomatedVnVoGarages, report.countAutomatedGaragesImportedVnVoLastWeek) }}%)</td>
          </tr>
          <tr>
            <td class="black-strong-text text-right">{{ report.automatedGaragesNotImportedVnVoLastTwoWeek.length }}</td>
            <td class="grey-text">
              Garages manuels avec abo VnVo sans aucun fichier les 15 derniers jours :
              ({{ percentCalculator(report.countAutomatedAPVGarages, report.automatedGaragesNotImportedVnVoLastTwoWeek.length) }}%)<br>
              <ul>
                <li v-for="garage of report.automatedGaragesNotImportedVnVoLastTwoWeek">{{ garage.publicDisplayName }}</li>
              </ul>
            </td>
          </tr>

          <tr>
            <td class="black-strong-text text-right">{{ report.garagesLessThe20PercentRespondingLastQuarter.length }}</td>
            <td class="grey-text">
              Garages avec taux de réponse < 20% depuis 90 jrs
              ({{ percentCalculator(report.countAutomatedGarages, report.garagesLessThe20PercentRespondingLastQuarter.length) }}%)<br>
              <ul>
                <li v-for="garage of report.garagesLessThe20PercentRespondingLastQuarter">
                  {{ garage.publicDisplayName }}
                  <span v-if="garage.countLastQuarterShouldReceiveSurveys">({{ garage.countLastQuarterResponsePercent }}%{{ garage.countLastQuarterSurveysResponded }} répondants / {{ garage.countLastQuarterShouldReceiveSurveys }} sondés ).</span>
                </li>
              </ul>
            </td>
          </tr>

        </table>
      </td>
    </tr>
    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>

<script>
  import BaseHeader from '../../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../../components/emails/notifications/BaseFooter';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter },

    methods: {
      percentCalculator(divider, factor) {
        if (isNaN(divider) || isNaN(factor)) {
          return '-';
        }
        if (divider === 0) return 0;
        const result = parseInt((factor / divider) * 1000, 10) / 10;
        return result.toString().replace('.', ',');
      }
    },

    computed: {
      payload() {
        return this.$store.getters.payload;
      },
      report() {
        return this.payload.report || {};
      }
    }
  }
</script>

<style lang="scss" scoped></style>
