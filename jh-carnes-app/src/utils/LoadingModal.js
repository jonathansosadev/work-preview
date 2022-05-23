import lang from '../assets/lang';

class LoadingModal {
  loading;

  show(text = lang.loading) {
    this.loading.show(text);
  }

  dismiss() {
    this.loading.dismiss();
  }

  setText(text) {
    this.loading.setText(text);
  }
}

export default new LoadingModal();
