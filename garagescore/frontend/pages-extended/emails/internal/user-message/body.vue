<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader title="Nouveau message" color="blue" logo-url="/images/www/alert/notepad.png"></BaseHeader>
    </tr>
    <tr>
      <td class="content">
        Cher collègue,<br/><br/>
        <p v-if="payload.context === 'contact-me'">Vous avez un message depuis le formulaire site Custeed:</p>
        <p v-else>Vous avez un message depuis Custeed:</p><br>
        <div style="padding-left: 50px">
          <p>Message: <b>{{ payload.message }}</b></p>
          <p v-if="payload.identity">Identité: <b>{{ payload.identity }}</b></p>
          <p v-if="payload.firstName">Prénom: <b>{{ payload.firstName }}</b></p>
          <p v-if="payload.lastName">Nom: <b>{{ payload.lastName }}</b></p>
          <p v-if="payload.name">Nom: <b>{{ payload.name }}</b></p>
          <p v-if="payload.email">Email: <b>{{ payload.email }}</b></p>
          <p v-if="payload.phone">Téléphone: <b>{{ payload.phone }}</b></p>
          <p v-if="payload.raisonsociale">Raison sociale: <b>{{ payload.raisonsociale }}</b></p>
          <p v-if="payload.emailConnectedUser">Email utilisateur connecté: <b>{{ payload.emailConnectedUser }}</b></p>
        </div><br><br>
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
    computed: {
      payload() { return this.$store.getters.payload; }
    }
  }
</script>

<style lang="scss" scoped></style>
