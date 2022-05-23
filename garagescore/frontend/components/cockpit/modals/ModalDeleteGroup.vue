<template>
  <ModalBase class="modal-delete-group">
    <template slot="header-icon">
      <i class="modal-delete-group__icon icon-gs-trash"></i>
    </template>
    <template slot="header-title">
        <span>Suppression du widget</span>
    </template>
    <template slot="header-subtitle">
      <AppText tag="span" type="danger">Confirmez-vous la suppression du widget ?</AppText>
    </template>

    <template slot="body">
      <div class="modal-delete-group__part">
        <AppText tag="p">
          <b>Attention, Tous les widgets créés sous ce groupe ne fonctionneront plus.</b>
        </AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-delete-group__footer">
        <Button type="cancel" @click="closeModal">Annuler</Button>
        <Button type="orange" @click="deleteWidget" :loading="loading">Valider</Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
  import * as gsTools from '../../../util/gsTools'

  export default {
    data() { return {loading: false} },
    props: {
      group: {
        type: Object,
        required: true,
      }
    },
    mounted: function () {},
    methods: {
      closeModal() {
        this.$store.dispatch('closeModal');
      },
      deleteWidget() {
        var self = this;
        var url = '/api/v1/users/currentUser/widgetGroups/';

        url += this.group.id;
        self.$set(self, 'loading', true);
        gsTools.deleteRequest(url, function (err, result) {
          if (err) {
            console.log(err);
            return;
          }
          self.$store.commit('cockpit/setUserGroups', result);
          self.$store.dispatch('closeModal');
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
.modal-delete-group {
  &__icon {
    color: $red;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    & Button:first-child {
      margin-right: 0.7rem;
    }
  }
}
</style>
