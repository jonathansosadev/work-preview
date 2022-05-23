<template>
  <div class="layout-error">
    <header class="layout-error__header">
      <img class="layout-error__header__img" src="/error/GS-Logo-long-blanc.png" title="Logo GarageScore" alt="Logo GarageScore">
    </header>

    <div class="layout-error__body">
      <h1>MAINTENANCE</h1><br>
      <h2>18/12 17:00 -> 19/12 10:00 (UTC+2)</h2>
      <h3 class="layout-error__body__text">
        Cockpit est en cours de maintenance<br/><br/>
        Cockpit is under maintenance<br/><br/>
        Cockpit está en mantenimiento<br/><br/>
      </h3>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['error'],
    layout: null
  }
</script>

<style lang="scss" scoped>
  .layout-error {
    background: url("/error/bg-body.jpg") no-repeat;
    height: 100vh;
    width: 100%;
    background-size: cover;
    &__header {
      padding: 1rem;
      &__img {
        height: 9vh;
      }
    }
    &__body {
      border-radius: 10px;
      text-align: center;
      margin-top: 25vh;
      background-color: #219AB5;
      margin-left: 20%;
      margin-right: 20%;
      padding: 3rem;
      color: white;
      &__text {

      }
    }
  }
</style>
