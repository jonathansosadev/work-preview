<template>
  <div class="card-user-job-place">
    <div class="card-user-job-place__header">
      <Title icon="icon-gs-garage">{{$t_locale('components/cockpit/admin/CardUserJobPlace')("WorkPlace")}}</Title>
    </div>
    <div class="card-user-job-place__body">
      <div class="card-user-job-place__part">
        <div class="card-user-job-place__field">
          <InputMaterial v-model="form.businessName" :is-valid="validate.businessName">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserJobPlace')("BusinessName")}}</template>
          </InputMaterial>
        </div>
        <div class="card-user-job-place__field">
          <InputMaterial v-model="form.address" :is-valid="validate.address">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserJobPlace')("Address")}}</template>
          </InputMaterial>
        </div>
      </div>
      <div class="card-user-job-place__part">
        <div class="card-user-job-place__field">
          <InputMaterial v-model="form.postCode" :is-valid="validate.postCode">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserJobPlace')("PostCode")}}</template>
          </InputMaterial>
        </div>
        <div class="card-user-job-place__field">
          <InputMaterial v-model="form.city" :is-valid="validate.city">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserJobPlace')("City")}}</template>
          </InputMaterial>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import fieldsValidation from '~/util/fieldsValidation';

export default {
  props: {
    businessName: String,
    address: String,
    postCode: String,
    city: String,

    isValid: Boolean,
  },

  data() {
    return {
      form: {
        businessName: this.businessName,
        address: this.address,
        postCode: this.postCode,
        city: this.city,
      }
    }
  },

  watch: {
    'form': {
      deep: true,
      handler(value, oldvalue) {
        Object.keys(value).forEach(e => {
          if(value[e] !== this[e]) {
            this.$emit(`update:${e}`, value[e])
          }
        });
      }
    },

    'validate': {
      immediate: true,
      handler (value) {
        this.$emit('update:isValid', Object.keys(value).every(e => value[e] === 'Valid'));
      }
    }
  },

  computed: {
    validate() {
      return {
        businessName: fieldsValidation(this.businessName, 'text').status,
        address: fieldsValidation(this.address, 'text').status,
        postCode: fieldsValidation(this.postCode, 'postCode').status,
        city: fieldsValidation(this.city, 'text').status,
      }
    }
  }
}
</script>

<style lang="scss">
.card-user-job-place {
  &__header {
    width: calc(100% - 2.5rem);
    padding-bottom: 0.7rem;
    margin-left: 1.5rem;
    padding-left: 1rem;
    border-bottom: 1px solid rgba($grey, .7);
  }

  &__body {
    margin-top: 4rem;
    display: flex;
    flex-flow: column;
    padding-left: 2.5rem;
    padding-right: 1rem;
  }

  &__radio {
    & + & {
      margin-left: 1rem;
    }
  }

  &__field {
    flex: 1;

    &:first-child {
      margin-right: 0.5rem;
    }

    &:last-child {
      margin-left: 0.5rem;
    }
  }

  &__part {
    display: flex;
    flex-flow: row;

    & + & {
      margin-top: 1.5rem;
    }
  }
}
@media (max-width: $breakpoint-min-md) {
  .card-user-job-place{
    &__header {
      width: 100%;
      margin-left: 0;
      padding-left: 0;
    }
    &__body {
      margin-top: 1rem;
      padding-left: 0;
      padding-right: 0;
    }
  }
}
</style>

