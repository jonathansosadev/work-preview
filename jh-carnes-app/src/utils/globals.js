import Toast from 'react-native-root-toast';
import {store} from '../store/store';
import numeral from 'numeral';

class Globals {
  sendNotification(message) {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
    });
  }

  generatePassword() {
    var length = 6,
      charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      value = '';
    for (var i = 0, n = charset.length; i < length; ++i) {
      value += charset.charAt(Math.floor(Math.random() * n));
    }
    return value;
  }

  setLoading() {
    store.dispatch({
      type: 'SET_LOADING',
    });
  }

  quitLoading() {
    store.dispatch({
      type: 'QUIT_LOADING',
    });
  }

  getPrice = value => {
    return '$ ' + numeral(value).format('0,0.00');
  };
}

export default new Globals();
