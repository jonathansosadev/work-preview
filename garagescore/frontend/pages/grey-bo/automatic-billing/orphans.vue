<template>
  <section id="automatic-billing-orphans-wrapper">
    <div class="orphans-details">
      <button class="btn btn-xs btn-primary" @click.prevent="goHome()">
        <i class="icon-gs-arrow-left"></i>&nbsp;Retour Accueil
      </button>
      <h3>Liste des établissements récemment créés qui ne sont liés à aucun compte de facturation</h3>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Nom</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(orphanGarage, index) in orphanGarages" :key="index">
            <td>{{ orphanGarage.id }}</td>
            <td class="publicDisplayName">{{ orphanGarage.publicDisplayName }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    orphanGarages: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    goHome() {
      this.$router.push({ name: 'grey-bo-automatic-billing' });
    },
  },
};
</script>

<style lang="scss">
#automatic-billing-orphans-wrapper {
  max-width: 1200px;
  margin: auto;
  .orphans-details {
    background: #ffffff;
    padding: 15px 20px;
    width: 100%;
    height: 100%;
    border-radius: 2px;
    box-shadow: 0 0 3px #888;
    h3 {
      margin-top: 20px;
      margin-bottom: 30px;
      text-align: center;
      color: #333333;
    }
    table {
      width: 100%;
      margin-top: 15px;
      thead {
        border-bottom: 1px solid #cccccc;
      }
      th {
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        text-align: center;
      }
      td {
        font-size: 11px;
        color: #333333;
        padding-top: 2px;
        text-align: center;
        border: 1px dotted #ddd;
        .elem-clickable {
          display: inline-block;
          height: 100%;
          width: 100%;
          &:hover {
            text-decoration: underline;
            cursor: pointer;
          }
        }
      }
    }
    .publicDisplayName {
      text-align: left;
    }
  }
}
</style>
