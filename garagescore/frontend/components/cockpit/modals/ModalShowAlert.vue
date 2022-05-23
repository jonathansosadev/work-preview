<template>
  <ModalBase class="modal-show-alert">
    <template slot="header-icon">
    </template>
    <template slot="header-title">
      <span>{{message}}</span>
    </template>

    <template slot="footer">
      <div class="modal-show-alert__footer">
        <Button @click="close()" type="success">Ok</Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
  export default {
    data() { return {loading: false} },
    props: {
      message: {
        type: String,
        required: false,
      }
    },
    mounted: function () {},
    methods: {
      close: function(){
        this.$store.dispatch('closeModal');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .modal-show-alert {

    &__footer {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
