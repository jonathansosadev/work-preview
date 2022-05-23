<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">

    <!-- HEADER -->
    <tr>
      <BaseHeader
        :title="title"
        :subTitle="subTitle"
        color="red"
        logo-url="/images/www/alert/notepad.png"
      ></BaseHeader>
    </tr>

    <!-- CONTENT -->
    <tr>
      <td class="content">
        Cher collègue,<br/>
        Vous trouverez ci dessous la liste des établissements dont l'abonnement Custeed E-Réputation est activé et qui sont actuellement en erreur sur un ou plusieurs de nos services partenaires.<br>
        Nous vous invitons à vous rendre sur la page de monitoring dédiée afin d'obtenir plus de détails.<br><br>

        <div style="width: 180px;">
          <h4>Légende</h4>
          <div>
            <img :src="payload.baseUrl + '/e-reputation/plug-green.png'" alt="Source connectée"> : Source connectée
          </div>
          <div style="border-bottom: 1px solid #bbb;padding: 0 0 4px 0;margin: 0 0 4px 0;">
            <img :src="payload.baseUrl + '/e-reputation/plug-orange.png'" alt="Source non connectée"> : Source non connectée
          </div>
          <div>
            <img :src="payload.baseUrl + '/e-reputation/check-green.png'" alt="Aucune erreur"> : Aucune erreur
          </div>
          <div>
            <img :src="payload.baseUrl + '/e-reputation/triangle-red.png'" alt="Erreur détectée"> : Erreur détectée
          </div>
        </div>

        <br><br>

        <table style="width: 100%;">
          <thead>
          <tr>
            <th>Établissement</th>
            <th class="tete-source">Google</th>
            <th class="tete-source">Facebook</th>
            <th class="tete-source">PagesJaunes</th>
          </tr>
          </thead>

          <tbody v-for="garage in garages" :key="garage.id">
          <tr class="ligne">
            <td class="cellule-garage">{{ garage.name }}</td>
            <!-- Google -->
            <td class="cellule-source" style="text-align: center;">
              <img v-if="garage.google.connected" :src="payload.baseUrl + '/e-reputation/plug-green.png'" alt="Source connectée">
              <img v-else :src="payload.baseUrl + '/e-reputation/plug-orange.png'" alt="Source non connectée">
              <img v-if="!garage.google.error" :src="payload.baseUrl + '/e-reputation/check-green.png'" alt="Aucune erreur">
              <img v-else :src="payload.baseUrl + '/e-reputation/triangle-red.png'" alt="Erreur détectée">
            </td>
            <!-- Facebook -->
            <td class="cellule-source" style="text-align: center;">
              <img v-if="garage.facebook.connected" :src="payload.baseUrl + '/e-reputation/plug-green.png'" alt="Source connectée">
              <img v-else :src="payload.baseUrl + '/e-reputation/plug-orange.png'" alt="Source non connectée">
              <img v-if="!garage.facebook.error" :src="payload.baseUrl + '/e-reputation/check-green.png'" alt="Aucune erreur">
              <img v-else :src="payload.baseUrl + '/e-reputation/triangle-red.png'" alt="Erreur détectée">
            </td>
            <!-- PagesJaunes -->
            <td class="cellule-source" style="text-align: center;">
              <img v-if="garage.pagesJaunes.connected" :src="payload.baseUrl + '/e-reputation/plug-green.png'" alt="Source connectée">
              <img v-else :src="payload.baseUrl + '/e-reputation/plug-orange.png'" alt="Source non connectée">
              <img v-if="!garage.pagesJaunes.error" :src="payload.baseUrl + '/e-reputation/check-green.png'" alt="Aucune erreur">
              <img v-else :src="payload.baseUrl + '/e-reputation/triangle-red.png'" alt="Erreur détectée">
            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>

    <!-- BUTTON -->
    <tr>
      <CentralButton
        :text="'Page Monitoring'"
        :url="payload.baseUrl + payload.gsClient.url.getShortUrl('ADMIN_REPUTYSCORE_MONITORING')">
      </CentralButton>
    </tr>

    <!-- FOOTER -->
    <tr>
      <BaseFooter></BaseFooter>
    </tr>
  </table>
</template>

<script>
  import BaseHeader from '../../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../../components/emails/notifications/BaseFooter';
  import CentralButton from '../../../../../components/emails/general/CentralButton';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter, CentralButton },
    computed: {
      payload() { return this.$store.getters.payload; },
      garages() {
        return this.payload.garages;
      },
      title() {
        return 'Rapport quotidien de monitoring Custeed E-Réputation';
      },
      subTitle() {
        return `Il y a ${this.garages.length} établissements en erreur`;
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
