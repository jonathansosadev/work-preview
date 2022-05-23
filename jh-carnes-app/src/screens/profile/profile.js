import {GoogleSignin} from '@react-native-community/google-signin';
import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button as ButtonNative} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import {NavigationActions, StackActions} from 'react-navigation';
import {connect} from 'react-redux';
import User from '../../assets/imgs/userdefault.jpg';
import Header from '../../navigation/header';
import {
  Alert,
  axios,
  Colors,
  ENV as Environment,
  Globals,
  Media,
} from '../../utils';
import {Button, Input, Rotation} from '../../widgets';
import {PrivacyPolicyLink, TermsAndConditionsLink} from '../../widgets/Links';

class Profile extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    tab: 1,
    visible: false,
    image: null,
    user: {
      person: {},
    },
    form: {
      name: '',
      email: '',
      lastname: '',
      phone: '',
    },
    form_password: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  };

  logout = () =>
    Alert.confirm('¿Desea cerrar sesión?', () => {
      const doLogout = () =>
        this.props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: 'Logout'})],
          }),
        );

      if (this.props.user.google) {
        GoogleSignin.signOut()
          .then(() => {
            doLogout();
          })
          .catch(err => {
            console.log('Profile: logout:', err);
            Alert.showError();
          });
      } else {
        doLogout();
      }
    });

  componentDidMount() {
    this.load();
  }

  load = (loading = true) => {
    if (loading) {
      Globals.setLoading();
    }

    axios
      .post('user/profile/get', {id: this.props.user.id})
      .then(res => {
        if (res.data.result) {
          console.log('>>: Datos Profile ', res.data);
          if (!res.data.user.person) {
            return;
          }

          this.setState({
            user: res.data.user,
            form: {
              name: res.data.user.person.name,
              email: res.data.user.email,
              lastname: res.data.user.person.lastname,
              phone: res.data.user.person.phone,
            },
          });
        }
      })
      .catch(err => {
        console.log(err);
        Alert.showError();
      })
      .finally(() => {
        Globals.quitLoading();
      });
  };

  updateFormField = (event, name) => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: event.nativeEvent.text,
      },
    });
  };

  changePassword = (e, name) => {
    this.setState({
      form_password: {
        ...this.state.form_password,
        [name]: e.nativeEvent.text,
      },
    });
  };

  disabled = () => {
    const {name, lastname, email, phone} = this.state.form;
    return !name || !lastname || !email || !phone;
  };

  disabledPassword = () => {
    const {password_confirmation, password} = this.state.form_password;
    return !password || !password_confirmation;
  };

  submit = () => {
    Globals.setLoading();
    const {email, phone, name, lastname} = this.state.form;
    axios
      .post('user/profile/set', {
        id: this.props.user.id,
        name,
        lastname,
        phone,
        email,
      })
      .then(res => {
        if (res.data.result) {
          Globals.sendNotification('Se han guardado los cambios correctamente');
          this.props.dispatch({
            type: 'SET_USER',
            payload: res.data.user,
          });
        } else {
          Alert.alert(res.data.error);
        }
      })
      .catch(err => {
        console.log(err);
        Alert.showError();
      })
      .finally(() => {
        Globals.quitLoading();
      });
  };

  submitPassword = () => {
    Globals.setLoading();
    const {password, password_confirmation} = this.state.form_password;
    axios
      .post('user/profile/password', {
        id: this.props.user.id,
        password,
        password_confirmation,
      })
      .then(res => {
        if (res.data.result) {
          this.setState({
            form_password: {},
          });
          Globals.sendNotification(
            'Se ha cambiado la contraseña correctamente',
          );
        } else {
          Alert.alert(res.data.error);
        }
      })
      .catch(err => {
        console.log(err);
        Alert.showError();
      })
      .finally(() => {
        Globals.quitLoading();
      });
  };

  changePhoto = () => {
    Media.open()
      .then(image => {
        this.setState({
          visible: true,
          image: image,
        });
      })
      .catch(err => console.log(err));
  };

  onClose = rotation => {
    this.setState({
      visible: false,
    });

    if (rotation != null) {
      Globals.setLoading();
      let data = {
        id: this.props.user.id,
        rotation: rotation,
      };
      axios
        .upload('user/photo', this.state.image, data)
        .then(res => {
          if (res.data.result) {
            Globals.sendNotification(
              'Se ha cambiado la foto de perfil correctamente',
            );
            console.log(res);
            this.props.dispatch({
              type: 'SET_USER',
              payload: {
                ...this.props.user,
                person: {
                  ...this.props.user.person,
                  photo: res.data.photo,
                },
              },
            });
            this.load(false);
          } else {
            Alert.alert(res.data.error);
          }
        })
        .catch(err => {
          Globals.quitLoading();
          Alert.showError();
          console.log(err);
        });
    }
  };

  render() {
    return (
      <ScrollView>
        <View style={styles.container}>
          <Rotation
            source={this.state.image}
            onClose={this.onClose}
            visible={this.state.visible}
          />
          <Header
            style={{
              backgroundColor: Colors.red,
            }}
            title="Mi Perfil"
            headerLeft={
              <ButtonNative
                type="clear"
                onPress={() => this.props.navigation.goBack(null)}
                icon={
                  <Icon name="ios-arrow-back" size={30} color={Colors.white} />
                }
              />
            }
            headerRight={
              <ButtonNative
                type="clear"
                onPress={this.logout}
                icon={<Icon name="md-log-out" color={Colors.white} size={30} />}
              />
            }
          />
          <View style={styles.row}>
            <View style={styles.col}>
              <TouchableOpacity onPress={() => this.setState({tab: 1})}>
                <View
                  style={[
                    styles.tab,
                    styles.tabLeft,
                    this.state.tab == 1 ? styles.tabActive : null,
                  ]}>
                  <Text
                    style={[
                      styles.center,
                      this.state.tab == 1 ? styles.active : null,
                    ]}>
                    Mi Cuenta
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.col}>
              <TouchableOpacity onPress={() => this.setState({tab: 2})}>
                <View
                  style={[
                    styles.tab,
                    styles.tabRight,
                    this.state.tab == 2 ? styles.tabActive : null,
                  ]}>
                  <Text
                    style={[
                      styles.center,
                      this.state.tab == 2 ? styles.active : null,
                    ]}>
                    Contraseña
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {this.state.tab == 1 && (
            <React.Fragment>
              <TouchableOpacity onPress={this.changePhoto}>
                <Image
                  source={
                    this.state.user && this.state.user.person.photo
                      ? {
                          uri:
                            Environment.BASE_URL + this.state.user.person.photo,
                        }
                      : User
                  }
                  style={styles.image}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.changePhoto}>
                <Text style={styles.text}>Cambiar Foto de Perfil</Text>
              </TouchableOpacity>
              <View style={styles.card}>
                <Input
                  label="Nombre"
                  value={this.state.form.name}
                  onChange={e => this.updateFormField(e, 'name')}
                />
                <Input
                  label="Apellido"
                  value={this.state.form.lastname}
                  onChange={e => this.updateFormField(e, 'lastname')}
                />
                <Input
                  label="Correo Electrónico"
                  value={this.state.form.email}
                  onChange={e => this.updateFormField(e, 'email')}
                />
                <Input
                  keyboardType="numeric"
                  label="Teléfono"
                  value={this.state.form.phone}
                  onChange={e => this.updateFormField(e, 'phone')}
                />
                <View style={styles.buttonCenter}>
                  <Button
                    btnRed
                    disabled={this.disabled()}
                    onPress={this.submit}
                    title="Guardar"
                  />
                </View>
              </View>
            </React.Fragment>
          )}
          {this.state.tab === 2 && (
            <View style={styles.card}>
              <Input
                label="Nueva Contraseña"
                password
                value={this.state.form_password.password}
                onChange={e => this.changePassword(e, 'password')}
              />
              <Input
                label="Repetir Contraseña"
                password
                value={this.state.form_password.password_confirmation}
                onChange={e => this.changePassword(e, 'password_confirmation')}
              />
              <View style={styles.buttonCenter}>
                <Button
                  btnRed
                  disabled={this.disabledPassword()}
                  onPress={this.submitPassword}
                  title="Guardar"
                />
              </View>
            </View>
          )}
          {Platform.OS === 'android' && (
            <View style={styles.linksContainer}>
              <PrivacyPolicyLink />
              <TermsAndConditionsLink />
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
    color: Colors.white,
  },
  active: {
    color: Colors.white,
  },
  container: {
    paddingTop: 50,
  },
  col: {
    flex: 0.5,
  },
  row: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
  },
  tab: {
    backgroundColor: Colors.gray2,
    padding: 10,
  },
  tabActive: {
    backgroundColor: Colors.red,
  },
  tabLeft: {
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  tabRight: {
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  card: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonCenter: {
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignSelf: 'center',
    marginTop: 30,
  },
  text: {
    fontWeight: 'bold',
    color: Colors.red,
    textAlign: 'center',
    fontSize: 16,
    marginTop: 15,
  },
  linksContainer: {
    paddingVertical: 16,
  },
});

export default connect(state => {
  return {
    user: state.user,
  };
})(Profile);
