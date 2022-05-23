import moment from 'moment';
import React, {Component} from 'react';
import {
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ScrollView
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Colors from '../../../assets/colors';
import Strings from '../../../assets/lang';
import {Alert, axios, ENV as Environment, Globals} from '../../../utils';
import Permission from '../../../utils/permissions';
import Toast from '../../../utils/Toast';
import {DatePicker} from '../../../widgets';
import ImageView from '../../../widgets/ImageView';
import Input from '../../../widgets/input';

const IMAGE_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT = IMAGE_WIDTH / 1.618;

class CreateEvent extends Component {
  state = {
    event: {},
    isEdit: false,
    image: {},
    form: {
      date: moment().format('DD/MM/YYYY'),
      persons: '',
      note: '',
      price: ''
    },
    showTimePickerStart: false,
  };

  constructor(props) {
    super(props);
    const event = this.props.navigation.getParam('item');
    if (event) {
      this.state = {
        ...this.state,
        event,
        isEdit: true,
        form: {
          id: event.id,
          file: Environment.BASE_URL + event.file,
          date: moment(event.date, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          price: event.details?.price.toString(),
          persons: event.details?.persons.toString(),
          note: event.details?.note
        },
      };
    }
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBack,
    );
  }

  onBack = () => {
    this.props.navigation.navigate('EventsAdmin');
    return true;
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  getImage = () =>
    this.state.event && this.state.event.file
      ? this.state.image.uri
        ? {uri: this.state.image.uri}
        : {uri: Environment.BASE_URL + this.state.event.file}
      : require('../../../assets/icons/not_available.png');

  takeImage = async () => {
    const granted = await Permission.register(['camera', 'photo']);
    if (!granted) {
      return false;
    }

    const options = {
      title: 'Seleccione',
      cancelButtonTitle: 'Cancelar',
      takePhotoButtonTitle: 'Usar la Cámara',
      chooseFromLibraryButtonTitle: 'Usar la Galería',
      quality: 0.5,
      noData: true,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 1000,
      maxHeight: 1000,
    };

    ImagePicker.showImagePicker(options, async r => {
      if (r && r.fileSize > 0) {
        try {
          const image = {
            path: r.path,
            uri: r.uri,
            size: r.fileSize,
            name: r.fileName,
          };
          // const image = await ImageResizer.createResizedImage(
          //   r.uri,
          //   1000,
          //   1000,
          //   'JPEG',
          //   80,
          // );
          image.rotation = 0;
          const file =
            Platform.OS === 'android'
              ? image.uri.replace('file://', '')
              : image.uri;
          this.state.event.file = file;
          this.setState({
            image: image,
            form: {
              ...this.state.form,
              file: file,
              rotation: image.rotation,
            },
          });
        } catch (e) {
          Toast.show(Strings.genericErrorMessage);
        }
      } else if (r.error) {
        Toast.show(Strings.genericErrorMessage);
      }
    });
  };

  showButtonsControl = () =>
    (this.state.event && this.state.event.file) || this.state.image.uri;

  positiveRotation = () => this.rotate(90);

  negativeRotation = () => this.rotate(-90);

  rotate = degree => {
    const image = {...this.state.image};
    if (!image.rotation) {
      image.rotation = degree;
    } else {
      image.rotation += degree;
    }
    this.setState({
      image,
      form: {
        ...this.state.form,
        rotation: image.rotation,
      },
    });
  };

  getWidth = () => {
    if (!this.state.image || !this.state.image.rotation) {
      return IMAGE_WIDTH;
    }
    const rot = this.state.image.rotation;
    return (rot / 90) % 2 === 0 ? IMAGE_WIDTH : IMAGE_HEIGHT;
  };

  getHeight = () => {
    if (!this.state.image || !this.state.image.rotation) {
      return IMAGE_HEIGHT;
    }
    const rot = this.state.image.rotation;
    return (rot / 90) % 2 === 0 ? IMAGE_HEIGHT : IMAGE_WIDTH;
  };

  submit = async () => {
    if (!this.state.form.file) {
      Globals.sendNotification('El campo Imagen es requerido');
      return false;
    } else if (!this.state.form.date) {
      Globals.sendNotification('El campo Fecha es Requerido');
      return false;
    } else if (!this.state.form.price) {
      Globals.sendNotification('El campo Precio es Requerido');
      return false;
    } else if (!this.state.form.persons) {
      Globals.sendNotification('El campo Cupos Disponibles es Requerido');
      return false;
    }
    Globals.setLoading();
    const params = {
      ...this.state.form,
      date: moment(this.state.form.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    };
    let post = false;
    if (this.state.isEdit && !this.state.image?.uri) {
      const condition = /^https?:\/\//.test(params.file);
      if (condition) {
        post = true;
      }
    }

    if (this.state.isEdit && post) {
      axios
        .post('events/edit', params)
        .then(res => {
          if (res.data.result) {
            this.props.navigation.goBack(null);
            Globals.sendNotification('Se ha editado el evento exitosamente');
          }
        })
        .catch(err => {
          console.log(err);
          Alert.showError();
        })
        .finally(() => {
          Globals.quitLoading();
        });
    } else {
      if (this.state.isEdit) {
        delete params.file;
      }
      axios
        .upload(
          this.state.isEdit ? 'events/edit' : 'events/create',
          this.state.form.file,
          params,
        )
        .then(res => {
          if (res.data.result) {
            this.props.navigation.goBack(null);
            Globals.sendNotification(
              this.state.isEdit
                ? 'Se ha editado el evento exitosamente'
                : 'Se ha creado el evento exitosamente',
            );
          }
        })
        .catch(err => {
          console.log(err);
          Alert.showError();
        })
        .finally(() => {
          Globals.quitLoading();
        });
    }
  };

  updateFormField = (event, name) => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: event.nativeEvent.text,
      },
    });
  };

  change = (event, name) => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: event,
      },
    });
  };

  render() {
    return (
      <ScrollView style={ { flex: 1 } }>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {this.showButtonsControl() && (
            <View style={styles.buttonsContainer}>
              <View style={styles.buttonsSpacer} />
              <ImageView
                tintColor="white"
                style={{
                  ...styles.buttonContainerController,
                  ...this.props.buttonControllerStyle,
                }}
                source={require('../../../assets/icons/right_rotation.png')}
                onPress={this.positiveRotation}
              />
              <ImageView
                tintColor="white"
                style={{
                  ...styles.buttonContainerController,
                  ...this.props.buttonControllerStyle,
                }}
                source={require('../../../assets/icons/left_rotation.png')}
                onPress={this.negativeRotation}
              />
            </View>
          )}
          <ImageView
            onPress={this.takeImage}
            style={styles.image}
            width={this.getWidth()}
            height={this.getHeight()}
            rotate={this.state.image.rotation || 0}
            source={this.getImage()}
          />
        </View>
        <DatePicker
          minDate={moment().format('DD/MM/YYYY')}
          label="Fecha del Evento"
          onChange={text => {
            this.updateFormField(text, 'date');
          }}
          value={this.state.form.date}
        />
        <Input
          label="Cupos disponibles"
          style={styles.textInput}
          keyboardType={'numeric'}
          onChangeText={text => {
           this.change(text, 'persons');
          }}
          value={this.state.form.persons}
        />
        <Input
          label="Precio"
          style={styles.textInput}
          keyboardType={'numeric'}
          onChangeText={text => {
           this.change(text, 'price');
          }}
          value={this.state.form.price}
        />
        <Input
          multiline={ true }
          numberOfLines={ 5 }
          label="Nota (Opcional)"
          style={styles.textInput}
          onChangeText={text => {
           this.change(text, 'note');
          }}
          value={this.state.form.note}
        />
        <TouchableWithoutFeedback onPress={this.submit}>
          <View style={styles.submit}>
            <Text style={styles.textSubmit}>{Strings.saveData}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    paddingBottom: 60
  },
  head: {
    width: '100%',
    height: 40,
    backgroundColor: Colors.primary,
  },
  imageContainer: {
    position: 'relative',
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  buttonsContainer: {
    zIndex: 5,
    position: 'absolute',
    height: IMAGE_HEIGHT,
    top: 0,
    right: 0,
    padding: 4,
  },
  buttonsSpacer: {
    flex: 1,
  },
  buttonContainerController: {
    elevation: 4,
    width: 30,
    height: 30,
    padding: 7,
    backgroundColor: 'gray',
    borderRadius: 15,
    marginTop: 8,
    tintColor: 'white',
  },
  image: {
    justifyContent: 'center',
    alignItems: 'center',
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  inputContainer: {
    flexDirection: 'row',
  },
  submit: {
    marginTop: 20,
    height: 30,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    width: '33%',
  },
  textSubmit: {
    color: 'white',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

export default CreateEvent;
