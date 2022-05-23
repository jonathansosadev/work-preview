import env from './env';
import LoadingModal from './LoadingModal';
import Toast from './Toast';
import lang from '../assets/lang';

class Api {
  constructor() {}

  get(endPoint, data = null) {
    const getParams = data => {
      const params = [];
      for (let key in data) {
        const value = data[key];
        params.push(key + '=' + value);
      }
      return '?' + params;
    };
    return fetch(env.BASE_API + endPoint + (data ? getParams(data) : ''), {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }

  post(endPoint, data = {}) {
    return fetch(env.BASE_API + endPoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  }

  objectToFormData(form) {
    const localUri = uri =>
      Platform.OS === 'android' ? uri : uri.replace('file://', '');
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'uri') {
        formData.append('file', {
          uri: localUri(value),
          name: 'photo.jpg',
          type: 'image/jpg',
        });
      }
      formData.append(key, value);
    });
    return formData;
  }

  upload(endPoint, form) {
    return fetch(env.BASE_API + endPoint, {
      method: 'POST',
      body: this.objectToFormData(form),
      headers: {
        Accept: 'application/json',
        sandbox: 1,
      },
    });
  }

  async getCategories() {
    try {
      const r = await this.get('categories');
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  async createFood(food) {
    const data = {...food};
    delete data.photo;
    try {
      const r = await this.post('foods/create', data);
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  async editFood(food) {
    const data = {...food};
    delete data.photo;
    try {
      const r = await this.post('foods/edit', data);
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  async uploadPhotoFood(photo, foodId) {
    photo.food_id = foodId;
    try {
      const r = await this.upload('foods/upload', photo);
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  async getFoods(loading = false) {
    try {
      if (loading) LoadingModal.show();
      const r = await this.upload('foods/all', {all: true});
      if (r.status.toString()[0] !== '2') Toast.show(lang.genericErrorMessage);
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      if (loading) LoadingModal.dismiss();
    }
  }

  async deleteFood(id: number) {
    try {
      LoadingModal.show(lang.deleting);
      const r = await this.post('foods/delete/' + id);
      if (r.status.toString()[0] !== '2') Toast.show(lang.genericErrorMessage);
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }

  async deleteImageFood(image_id, food_id) {
    try {
      LoadingModal.show(lang.deleting);
      const r = await this.post('foods/delete/image', {image_id, food_id});
      if (r.status.toString()[0] !== '2') Toast.show(lang.genericErrorMessage);
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }

  async getReservation() {
    try {
      LoadingModal.show();
      const r = await this.post('reservations/all');
      return await r.json();
    } catch (e) {
      console.log('>>: Api > getReservation> error ', e);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }
  async getPointsUser(user_id) {
    try {
      LoadingModal.show();
      const r = await this.post('points/person', {user_id});
      if (r.status.toString()[0] !== '2') throw r.status;
      return await r.json();
    } catch (e) {
      console.log('>>: Api > getReservation> error ', e);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }

  async deleteReservation(id) {
    try {
      LoadingModal.show();
      const r = await this.post('reservations/change/verified', {id});
      return await r.json();
    } catch (e) {
      console.log('>>: Api > deleteReservation> error ', e);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }

  async cancelCatering(id) {
    try {
      const r = await this.post('catering/cancel', {id});
      return await r.json();
    } catch (e) {
      console.log('>>: Api > cancelCatering > error', e);
      return null;
    }
  }
  async rangePoints() {
    try {
      LoadingModal.show();
      const r = await this.post('points/range');
      return await r.json();
    } catch (e) {
      console.log('>>: Api > rangePoints > error', e);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }
  async changePoints(user_id, type, quantity, amount, bill_number) {
    try {
      LoadingModal.show();
      const params = {user_id, type, quantity, amount, bill_number};
      console.log('>>: Api > changePoints > params: ', params);
      const r = await this.post('points/history/person', params);
      console.log('>>: r ', r.status);
      if (r.ok) {
        return await r.json();
      } else {
        throw await r.json();
      }
    } catch (e) {
      Toast.show(e.message);
      console.log('>>: Api > changePoints > error: ', e);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }
  async getConfig(loading = false) {
    try {
      if (loading) LoadingModal.show();
      const r = await this.post('config/get');
      if (r.status.toString()[0] !== '2') {
        Toast.show(lang.genericErrorMessage);
        return null;
      }
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      if (loading) LoadingModal.dismiss();
    }
  }

  async getUsers(loading = false) {
    try {
      if (loading) LoadingModal.show();
      const r = await this.post('user/list');
      if (r.status.toString()[0] !== '2') Toast.show(lang.genericErrorMessage);
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      if (loading) LoadingModal.dismiss();
    }
  }
  async getCatering() {
    try {
      LoadingModal.show();
      const r = await this.post('catering/all');
      return await r.json();
    } catch (e) {
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }
  async getHistoryPoints(from, until) {
    try {
      LoadingModal.show();
      console.log(from, until);
      const r = await this.post('points/history', {from, until});
      console.log(r);
      if (r.ok) {
        return await r.json();
      } else {
        throw await r.json();
      }
    } catch (e) {
      console.log('>>: historial de puntos ', e);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }

  async deleteUser(id) {
    try {
      LoadingModal.show(lang.removing);
      const r = await this.post('user/delete', {id});
      if (r.status.toString()[0] !== '2') Toast.show(lang.genericErrorMessage);
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }

  async updateUser(user) {
    try {
      LoadingModal.show();
      const r = await this.post('user/update', {user});
      if (r.status.toString()[0] !== '2') Toast.show(lang.genericErrorMessage);
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }

  async updatePassword(user_id, password) {
    try {
      LoadingModal.show();
      const r = await this.post('user/update/password', {password, user_id});
      if (r.status.toString()[0] !== '2') Toast.show(lang.genericErrorMessage);
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }

  async updateConfig(schedules, rangePoints) {
    try {
      LoadingModal.show();
      const data = {schedules, rangePoints};
      const r = await this.post('config/update', data);
      if (r.status.toString()[0] !== '2') {
        Toast.show(lang.genericErrorMessage);
        return null;
      }
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      LoadingModal.dismiss();
    }
  }

  async getEvents(loading = false) {
    try {
      if (loading) LoadingModal.show(lang.deleting);
      const r = await this.post('events/get');
      if (r.status.toString()[0] !== '2') throw r.status;
      return await r.json();
    } catch (e) {
      Toast.show(lang.genericErrorMessage);
      return null;
    } finally {
      if (loading) LoadingModal.dismiss();
    }
  }

  async updateFoodOrders(orders) {
    const resp = await this.post('foods/update-orders', {orders});
    if (resp.ok) {
      return true;
    }

    throw resp.statusText;
  }
}

export default new Api();
