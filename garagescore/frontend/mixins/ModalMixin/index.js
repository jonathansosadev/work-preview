export default {
  data() {
    return {
      modal: {
        adaptive: false,
        component: null,
        fullScreen: false,
        props: {},
      },
    };
  },
  computed: {
    getModalComponent() {
      return this.modal.component;
    },
    getModalIsAdaptive() {
      return this.modal.adaptive;
    },
    getModalIsFullScreen() {
      return this.modal.fullScreen;
    },
    getModalProps() {
      return this.modal.props;
    },
    modalMixin() {
      return {
        adaptive: this.modal.adaptive,
        closeModal: this.closeModal,
        component: this.modal.component,
        fullScreen: this.modal.fullScreen,
        openModal: this.openModal,
        props: this.modal.props,
      };
    }
  },
  methods: {
    closeModal() {
      this.setModal(null);
      this.setModalIsAdaptive(false);
      this.setModalIsFullScreen(false);
      this.setModalProps({});
    },
    openModal({
      adaptive = false,
      fullScreen = false,
      component,
      props = {},
    }) {
      this.setModal(component);
      this.setModalIsAdaptive(adaptive);
      this.setModalIsFullScreen(fullScreen);
      this.setModalProps(props);
    },
    setModal(component) {
      this.modal.component = component;
    },
    setModalIsAdaptive(value) {
      this.modal.adaptive = value;
    },
    setModalIsFullScreen(value) {
      this.modal.fullScreen = value;
    },
    setModalProps(props) {
      this.modal.props = props;
    },
    updateModalProp({ name, value }) {
      this.$set(this.modal.props, name, value);
    },
  },
};