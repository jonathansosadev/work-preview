<template>
  <ModalBase class="modal-admin-tag" type="danger">
    <template slot="header-icon">
      <img ref="logo" src="/logo/logo-custeed-picto.svg" class="modal-admin-tag__header-logo" alt="custeed" />
    </template>
    <template slot="header-title" class="modal-admin-tag__header-title">
      <span>{{ title }}</span>
    </template>
    <template slot="header-subtitle" class="modal-admin-tag__header-subtitle">
      <span>{{ subTitle }}</span>
    </template>  
    <template slot="body">
      <input-material :fixedWidth="'409px'" v-model="nameInputValue" :minLength="1" :maxLength="50">
        <template slot="label">{{ $t_locale('components/global/ModalAdminTag')('name') }}</template>
      </input-material>
    </template>
    <template slot="footer">
      <div class="modal-admin-tag__footer">
        <template>
          <Button type="phantom" @click="closeModal()" thick>
            <span>{{ $t_locale('components/global/ModalAdminTag')('cancel') }}</span>
          </Button>
          &nbsp;&nbsp;
          <Button
            type="orange"
            thick
            :disabled="isValid"
            @click="saveData"
          >
            <span>{{ $t_locale('components/global/ModalAdminTag')('save') }}</span>
          </Button>
        </template>
      </div>
    </template>
  </ModalBase>
</template>
<script>
export default {
  name: 'ModalAdminTag',
  props:{
    id: {
      type: String,
      default: ''
    },
    nameTag: {
      type: String, 
      default: ''
    },
    garagesIds: {
      type: Array,
      default: () => [],
    },
    closeModal:{
      type: Function,
      default: () => console.error('ModalAdminTag.vue :: closeModal not set')
    },
    createNewTag:{
      type: Function,
      default: () => console.error('ModalAdminTag.vue :: createNewTag not set')
    },
    updateTag:{
      type: Function,
      default: () => console.error('ModalAdminTag.vue :: updateTag not set')
    }
  },
  computed:{
    isValid() {
      return !this.nameInputValue;
    },
    title(){
      return this.id ? this.$t_locale('components/global/ModalAdminTag')('titleUpdate') : this.$t_locale('components/global/ModalAdminTag')('titleCreate')
    },
    subTitle(){
      return this.id ? this.$t_locale('components/global/ModalAdminTag')('subTitleUpdate') : this.$t_locale('components/global/ModalAdminTag')('subTitleCreate')
    }
  },
  data() {
    return {
      nameInputValue: this.nameTag,
    }
  },
  methods: {
    async saveData(){
      const data = {
        garageIds: this.garagesIds
      }
      if(this.id){
        data[this.id] = this.id
        data['currentTag'] = this.nameTag
        data['newTag'] = this.nameInputValue
      }else{
        data['tag'] = this.nameInputValue
      }
      this.id ? await this.updateTag(data) : await this.createNewTag(data)
    }
  },
}
</script>
<style lang="scss" scoped>
  .modal-admin-tag{
    overflow: auto;
    width: 28.571rem;
    &__header-subtitle {
      margin-bottom: 1.5rem;
    }
    &__footer {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>