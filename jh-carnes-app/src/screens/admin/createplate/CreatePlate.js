import React, {Component} from 'react';
import {BackHandler, ScrollView, StyleSheet, Platform} from 'react-native';
import lang from '../../../assets/lang';
import Input from './Input';
import Button from './Button';
import Validator from '../../../utils/Validators';
import Api from '../../../utils/Api';
import Toast from '../../../utils/Toast';
import {connect} from 'react-redux';
import SelectPicker from '../../../widgets/SelectPicker';
import colors from '../../../assets/colors';
import ImagePicker from '../../../widgets/ImagePicker';
import LoadingModal from '../../../utils/LoadingModal';
import env from '../../../utils/env';
import ConfirmDialog from '../../../utils/ConfirmDialog';

class CreatePlate extends Component {
  static navigationOptions = {
    title: '',
  };

  state = {
    form: {
      name: '',
      description: '',
      price: '',
      category_id: 0,
    },
    err_name: '',
    err_category: '',
    err_description: '',
    err_price: '',
    category: null,
    photos: [],
    currentPhoto: '',
    food: null,
  };

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBack,
    );

    this.validatorActions();
    const payload = await Api.getCategories();
    if (payload) {
      this.props.dispatch({type: 'SET_CATEGORIES', payload});
    }
    const food = this.props.navigation.getParam('item');
    this.updateFood(food);
  }

  onBack = () => {
    this.props.navigation.navigate('Foods');
    return true;
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  textButton = () => (this.state.food ? lang.edit : lang.create);

  validatorActions = () => {
    Validator.name.notPass = err_name => {
      Toast.show(lang.verifyFieldsMessage);
      this.setState({err_name});
    };

    Validator.description.notPass = err_description => {
      Toast.show(lang.verifyFieldsMessage);
      this.setState({err_description});
    };

    Validator.price.notPass = err_price => {
      Toast.show(lang.verifyFieldsMessage);
      this.setState({err_price});
    };

    Validator.category.notPass = err_category => {
      Toast.show(lang.verifyFieldsMessage);
      this.setState({err_category});
    };

    Validator.photo.notPass = err_photo => Toast.show(err_photo);
  };

  submit = async () => {
    if (
      !Validator.name.validate(this.state.form.name) ||
      !Validator.category.validate(this.state.form.category_id.toString()) ||
      !Validator.description.validate(this.state.form.description) ||
      !Validator.price.validate(this.state.form.price) ||
      !Validator.photo.validate(this.state.photos.length.toString())
    )
      return false;

    LoadingModal.show();

    const result = this.state.food
      ? await Api.editFood({id: this.state.food.id, ...this.state.form})
      : await Api.createFood(this.state.form);

    if (result) {
      const images = this.state.photos.filter(
        image => image.uri.indexOf('http') < 0,
      );
      const length = images.length;
      let i = 0;
      for (i; i < length; i++) {
        const photo = images[i];
        LoadingModal.setText(lang.upload + ' ' + (i + 1) + '/' + length);
        try {
          const r = await Api.uploadPhotoFood(photo, result.id);
          if (!r) break;
        } catch (e) {
          break;
        }
      }
      this.props.navigation.navigate('HomeAdmin');
      Toast.show(
        i === length ? lang.successRegister : lang.successRegisterWithoutImg,
      );
    } else {
      Toast.show(lang.genericErrorMessage);
    }
    LoadingModal.dismiss();
  };

  clearError = () => {
    this.setState({
      err_name: '',
      err_category: '',
      err_description: '',
      err_price: '',
    });
  };

  updateFood = food => {
    if (food) {
      const form = {
        name: food.name,
        description: food.description,
        price: food.price.toString(),
        category_id: food.category_id,
      };
      const photos = food.images.map(i => ({uri: env.BASE_URL + i.file}));
      this.imagePicker.setPhotos(photos);
      this.setState({category: food.category, food, form, photos});
    }
  };

  onImageDelete = image => {
    ConfirmDialog.show({
      title: lang.deleteImage,
      message: lang.deleteImgConfirmMsg,
    })
      .onNegativeButton(lang.cancel)
      .onPositiveButton(lang.delete, async () => {
        const img = this.state.food.images.find(
          img => image.uri.indexOf(img.file) >= 0,
        );
        const food = await Api.deleteImageFood(img.id, this.state.food.id);
        if (food) {
          this.props.dispatch({type: 'UPDATE_FOODS', payload: food});
          this.updateFood(food);
        }
      });
  };

  render() {
    return (
      <ScrollView style={{paddingTop: 0}}>
        <ImagePicker
          ref={ref => (this.imagePicker = ref)}
          containerStyle={{marginBottom: 10}}
          defaultImage={require('../../../assets/icons/not_available.png')}
          iconButton={require('../../../assets/icons/screenshot.png')}
          buttonColor="gray"
          onUpdate={photos => this.setState({photos})}
          value={this.state.photos}
          onDelete={this.onImageDelete}
        />

        {/* NAME */}
        <Input
          label={lang.plateName}
          placeholder={lang.plateName}
          required
          onChangeText={text => {
            this.state.form.name = text;
            this.setState({form: this.state.form});
          }}
          error={this.state.err_name}
          onFocus={this.clearError}
          value={this.state.form.name}
        />

        {/* CATEGORY */}
        <SelectPicker
          containerStyle={{paddingHorizontal: 7}}
          labelStyle={style.labelStyle}
          selectStyle={style.input}
          errorStyle={style.error}
          data={this.props.categories}
          keyText="name"
          label={lang.selectCategory}
          error={this.state.err_category}
          default={lang.selectCategory}
          value={this.state.category}
          onPress={this.clearError}
          onChangeValue={category => {
            this.state.form.category_id = category.id;
            this.setState({category, form: this.state.form});
          }}
        />

        {/* DESCRIPTION */}
        <Input
          label={lang.description}
          placeholder={lang.description}
          multiline
          required
          onChangeText={text => {
            this.state.form.description = text;
            this.setState({form: this.state.form});
          }}
          error={this.state.err_description}
          onFocus={this.clearError}
          value={this.state.form.description}
        />

        {/* PRICE */}
        <Input
          inputStyle={{textAlign: 'right'}}
          label={lang.price}
          placeholder={lang.price}
          keyboardType="number-pad"
          required
          onChangeText={text => {
            this.state.form.price = text;
            this.setState({form: this.state.form});
          }}
          error={this.state.err_price}
          onFocus={this.clearError}
          value={this.state.form.price}
        />

        <Button onPress={this.submit} text={this.textButton()} />
      </ScrollView>
    );
  }
}

const style = StyleSheet.create({
  label: {
    paddingLeft: 5,
    paddingVertical: 2,
  },
  input: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 15,
    height: 35,
    padding: 0,
    paddingTop: Platform.OS === 'android' ? 0 : 8,
    paddingHorizontal: 10,
    elevation: 5,
    backgroundColor: colors.white,
    textAlignVertical: 'center',
  },
  error: {
    color: 'red',
    fontSize: 12,
    width: '100%',
    padding: 2,
    paddingLeft: 5,
    height: 16,
  },
});

export default connect(state => ({
  categories: state.categories,
}))(CreatePlate);
