<template>
  <ModalBase class="modal-config-time-answer" type="danger">
    <template slot="header-icon">
      <i class="icon-gs-time-setting modal-config-time-answer__icon" />
    </template>
    <template slot="header-title" class="header-title">
      <span>{{ $t_locale('components/cockpit/admin/ModalConfigTimeAnswer')('Title') }}</span>
    </template>

    <template slot="header-subtitle" class="header-subtitle">
      <span>{{ $t_locale('components/cockpit/admin/ModalConfigTimeAnswer')('SubTitle') }}</span>
    </template>
    <template slot="body">
      <div>
        <TableConfigTimeAnswer
          :garagesConfigDelay="dataGaragesDelay"
          :reponseTime="reponseTime"
          :saveDelay="saveDelay"
          :hasMoreDataDelay="hasMoreDataDelay"
          :appendResponsesDelay="appendResponses"
          :loadingMore="loadingMore"
        />
      </div>
    </template>
    <template slot="footer">
      <div class="modal-config-time-answer__footer">
        <div class="modal-config-time-answer__footer__annular">
          <Button type="secondary-text" thick @click="closeModal()">
            <span>{{ $t_locale('components/cockpit/admin/ModalConfigTimeAnswer')('Annular') }}</span>
          </Button>
        </div>
        <div class="modal-config-time-answer__footer__save">
          <Button type="orange" thick @click="saveGarages" :disabled="!enableButton">
            <span>{{ $t_locale('components/cockpit/admin/ModalConfigTimeAnswer')('Save') }}</span>
          </Button>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
<script>
import TableConfigTimeAnswer from './TableConfigTimeAnswer.vue';
export default {
  name: 'ModalConfigTimeAnswer',
  components: {
    TableConfigTimeAnswer,
  },
  props: {
    reponseTime: {
      type: Array,
      default: () => [],
    },
    saveGarageDelay: {
      type: Function,
      default: () => ()=>({}),
    },
    closeModal: {
      type: Function,
      default: () => ({}),
    },
    getHasMoreDataDelay:{
      type: Function,
      default: () => ({}),
    },
    appendResponsesDelay: {
      type: Function,
      default: () => ({})
    },
    getGaragesDelay: {
      type: Function,
      default: () => ({})
    }
  },
  computed:{
    getDataGaragesDelay(){
      return this.getGaragesDelay().map((data) => {
        return {
          ...data,
          automaticReviewResponseDelayTemp: data.automaticReviewResponseDelay,
        };
      });
    }
  },
  mounted() {
    this.dataGaragesDelay = this.getDataGaragesDelay
    this.hasMoreDataDelay = this.getHasMoreDataDelay()
  },
  data() {
    return {
      dataGaragesDelay: [],
      enableButton: false,
      loadingMore: false,
      hasMoreDataDelay: false
    };
  },
  methods: {
    saveDelay(item) {
      this.dataGaragesDelay.map((data) => {
        if (data.id === item.id) {
          data.automaticReviewResponseDelay = item.automaticReviewResponseDelay;
          data.update = item.automaticReviewResponseDelay !== data.automaticReviewResponseDelayTemp;
        }
      });
      this.enableButton = this.dataGaragesDelay.filter((data) => data.update).length > 0;
    },
    async saveGarages() {
      const temp = this.dataGaragesDelay
        .filter((item) => item.update)
        .map(({ id, automaticReviewResponseDelay }) => {
          return { id, automaticReviewResponseDelay };
        });
      await this.saveGarageDelay(temp);
    },
    async appendResponses(){
      this.loadingMore = true
      await this.appendResponsesDelay()
      this.dataGaragesDelay = this.updateAutomaticReviewResponseDelay()
      this.hasMoreDataDelay = this.getHasMoreDataDelay()
      this.loadingMore = false
    },
    updateAutomaticReviewResponseDelay(){
      const garagesUpdated = this.dataGaragesDelay.filter(item=>item.update)
      return this.getDataGaragesDelay.map(currentDelay=>{
        const updatedDelay = garagesUpdated.find(({id})=>id === currentDelay.id)
        return updatedDelay || currentDelay
      })
    }
  },
};
</script>
<style lang="scss" scoped>
.modal-config-time-answer {
  overflow: auto;
  height: 100%;
  width: 48.571rem;
  &__icon {
    color: $orange;
  }
  &__footer {
    display: flex;
    justify-content: flex-end;
    &__annular {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 5px;
      margin-right: 0.8rem;
    }
    &__save {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 37px;
    }
  }
}
@media (max-width: $breakpoint-min-md) {
  .modal-config-time-answer {
    .header-title {
      font-size: 1.143rem;
    }
    .header-subtitle {
      font-size: 0.929rem;
    }
  }
}
@media (max-width: $breakpoint-min-sm) {
  .modal-config-time-answer {
    width: 100%;
    .header-title {
      font-size: 1rem;
    }
    .header-subtitle {
      font-size: 0.786rem;
    }
  }
}
</style>
