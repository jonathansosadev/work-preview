import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import FacebookIcon from '../../assets/imgs/facebook.png';
import GoogleIcon from '../../assets/imgs/gmail.png';
import {Alert, axios, Colors, Globals, Social} from '../../utils';
import {Button, Input, LogoContainer, Modal} from '../../widgets';
import ModalPhone from './modal-phone';
import {PrivacyPolicyLink, TermsAndConditionsLink} from '../../widgets/Links';
import {GoogleSignin} from '@react-native-community/google-signin';

const SOCIAL_TYPES = {
  FACEBOOK: 1,
  GOOGLE: 2,
};

class Login extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    phone: null,
    visible: false,
    data: null,
    form: {
      email: '',
      password: '',
    },
  };

  constructor(props) {
    super(props);
    if (this.props.user) {
      this.props.navigation.goBack(null);
    }
  }

  reset = () => {
    this.props.navigation.navigate('Reset');
  };

  change = (e, name) => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: e.nativeEvent.text,
      },
    });
  };

  submit = () => {
    Globals.setLoading();
    axios
      .post('user/login', this.state.form)
      .then(async res => {
        if (res.data.result) {
          await this.props.dispatch({
            type: 'SET_USER',
            payload: res.data.user,
          });
          if (res.data.user.level === 1 || res.data.user.level === 1) {
            this.props.navigation.replace('HomeAdmin');
          } else {
            this.props.navigation.goBack(null);
          }
          const callback = this.props.navigation.getParam('callback');
          if (callback) {
            callback();
          }
        } else {
          setTimeout(() => {
            Alert.alert(res.data.error);
          }, 500);
        }
      })
      .catch(err => {
        console.log(err);
        Globals.showError();
      })
      .finally(() => {
        Globals.quitLoading();
      });
  };

  disabled = () => {
    const {email, password} = this.state.form;
    return !email || !password;
  };

  register = () => {
    this.props.navigation.navigate('Register');
  };

  social = num => {
    switch (num) {
      case 1:
        Social.Facebook.Login()
          .then(data => {
            this.loginSocial(
              {
                email: data.email,
                name: data.first_name,
                lastname: data.last_name,
                facebook_id: data.id,
              },
              SOCIAL_TYPES.FACEBOOK,
            );
          })
          .catch(err => {
            console.log(err);
          });
        break;

      case 2:
        Social.Google.Login()
          .then(data => {
            console.log(data);
            this.loginSocial(
              {
                email: data.user.email,
                name: data.user.givenName,
                lastname: data.user.familyName,
                google_id: data.user.id,
              },
              SOCIAL_TYPES.GOOGLE,
            );
          })
          .catch(err => {
            console.log(err);
          });
        break;
    }
  };

  loginSocial = (data, type) => {
    Globals.setLoading();
    const url =
      type === SOCIAL_TYPES.FACEBOOK
        ? 'user/login/facebook'
        : 'user/login/google';
    axios
      .post(url, data)
      .then(async res => {
        if (res.data.result) {
          this.props.dispatch({
            type: 'SET_USER',
            payload: res.data.user,
          });
          if (res.data.user.level === 1 || res.data.user.level === 1) {
            this.props.navigation.replace('HomeAdmin');
          } else {
            this.props.navigation.goBack(null);
          }
          const callback = this.props.navigation.getParam('callback');
          if (callback) {
            callback();
          }
        } else {
          if (res.data.register) {
            this.setState({
              visible: true,
              data,
            });
          } else {
            setTimeout(() => {
              Alert.alert(res.data.error);
            }, 500);
          }
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        Globals.quitLoading();
      });
  };

  onClose = async phone => {
    const data = this.state.data;
    this.setState(
      {
        visible: false,
        data: null,
        phone,
      },
      () => {
        setTimeout(() => {
          if (phone) {
            Globals.setLoading();
            axios
              .post('user/register/social', {
                ...data,
                phone,
              })
              .then(async res => {
                if (res.data.result) {
                  await this.props.dispatch({
                    type: 'SET_USER',
                    payload: res.data.user,
                  });
                  if (res.data.user.level === 1 || res.data.user.level === 1) {
                    this.props.navigation.replace('HomeAdmin');
                  } else {
                    this.props.navigation.goBack(null);
                  }
                  const callback = this.props.navigation.getParam('callback');
                  if (callback) {
                    callback();
                  }
                } else {
                  setTimeout(() => {
                    Globals.sendNotification(res.data.error);
                    this.setState({
                      visible: true,
                    });
                  }, 500);
                }
              })
              .catch(err => {
                console.log(err);
              })
              .finally(() => {
                setTimeout(() => {
                  Globals.quitLoading();
                }, 600);
              });
          }
        }, 600);
      },
    );
  };

  render() {
    return (
      <React.Fragment>
        {this.state.visible && (
          <ModalPhone
            visible={this.state.visible}
            phone={this.state.phone}
            onSuccess={this.onClose}
            onCancel={this.logout}
          />
        )}
        <LogoContainer navigation={this.props.navigation}>
          <Input
            label="Correo Electrónico"
            value={this.state.form.email}
            onChange={e => this.change(e, 'email')}
          />
          <Input
            label="Contraseña"
            password
            value={this.state.form.password}
            onChange={e => this.change(e, 'password')}
          />
          <TouchableOpacity onPress={this.reset}>
            <Text style={styles.passwordReset}>¿Recuperar contraseña?</Text>
          </TouchableOpacity>
          <View style={styles.center}>
            <Button
              btnRed
              onPress={this.submit}
              disabled={this.disabled()}
              title="Entrar"
            />
            <Button
              titleStyle={styles.titleRed}
              buttonStyle={styles.buttonWhite}
              onPress={this.register}
              title="Crear Cuenta"
            />
          </View>
          <Text style={{textAlign: 'center'}}>Entrar con</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <TouchableOpacity onPress={() => this.social(1)}>
                <Image source={FacebookIcon} style={styles.icon} />
              </TouchableOpacity>
            </View>
            <View style={styles.col}>
              <TouchableOpacity onPress={() => this.social(2)}>
                <Image source={GoogleIcon} style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>
          {Platform.OS === 'android' && (
            <>
              <PrivacyPolicyLink />
              <TermsAndConditionsLink />
            </>
          )}
          <View style={styles.extraBottomPadding} />
        </LogoContainer>
      </React.Fragment>
    );
  }

  logout = () => {
    GoogleSignin.signOut().catch(err => console.log('Login: logout:', err));
    this.setState({visible: false});
  };
}

const styles = StyleSheet.create({
  titleRed: {
    color: Colors.red,
  },
  center: {
    alignItems: 'center',
  },
  passwordReset: {
    marginVertical: 10,
    textAlign: 'center',
  },
  buttonWhite: {
    backgroundColor: Colors.white,
  },
  icon: {
    width: 30,
    height: 30,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.gray,
    borderRadius: 30,
    width: 125,
    alignSelf: 'center',
    marginVertical: 10,
    padding: 5,
    marginBottom: 25,
  },
  col: {
    flex: 0.5,
  },
  extraBottomPadding: {
    height: 16,
  },
});

export default connect(state => ({
  user: state.user,
}))(Login);
