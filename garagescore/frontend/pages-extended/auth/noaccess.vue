<template>
  <div>
      Accés refusé <br />
      ...redirection
  </div>
</template>

<script>
export default {
    mounted () {
        this.$store.dispatch('login/SET_ERROR', { error: "Votre compte ne vous permet pas d'accéder à l'interface. Merci de contacter votre administrateur fr.automotive.marketing@sgs.com.", errorType: 'danger' });
        this.$router.push('/auth/signin')
    }
}
</script>

<style>

</style>