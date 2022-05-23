import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import Strings from '../../assets/lang';
import {Alert, axios, Globals} from '../../utils';
import {Button, Input, LogoContainer} from '../../widgets';
import {PrivacyPolicyLink, TermsAndConditionsLink} from '../../widgets/Links';

class Register extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    form: {
      name: '',
      lastname: '',
      phone: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  };

  change = (e, name) => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: e.nativeEvent.text,
      },
    });
  };

  isButtonDisabled = () => {
    const {
      name,
      lastname,
      email,
      password,
      phone,
      password_confirmation,
    } = this.state.form;

    return (
      !name ||
      !lastname ||
      !email ||
      !password ||
      !phone ||
      !password_confirmation
    );
  };

  submit = () => {
    Globals.setLoading();
    axios
      .post('user/register', this.state.form)
      .then(res => {
        if (res.data.result) {
          this.props.navigation.goBack(null);
          Globals.sendNotification('Se ha registrado correctamente');
        } else {
          Alert.alert(res.data.error);
        }
      })
      .catch(err => {
        console.log('>>: Register > error: ', err);
        Alert.showError();
      })
      .finally(() => {
        Globals.quitLoading();
      });
  };

  render() {
    return (
      <LogoContainer navigation={this.props.navigation}>
        <View style={styles.container}>
          <Input
            label="Nombre"
            value={this.state.form.name}
            onChange={e => this.change(e, 'name')}
          />
          <Input
            label="Apellido"
            value={this.state.form.lastname}
            onChange={e => this.change(e, 'lastname')}
          />
          <Input
            label="Correo Electrónico"
            value={this.state.form.email}
            onChange={e => this.change(e, 'email')}
          />
          <Input
            keyboardType="numeric"
            label="Teléfono"
            value={this.state.form.phone}
            onChange={e => this.change(e, 'phone')}
          />
          <Input
            password
            label="Contraseña"
            value={this.state.form.password}
            onChange={e => this.change(e, 'password')}
          />
          <Input
            password
            label="Repetir Contraseña"
            value={this.state.form.password_confirmation}
            onChange={e => this.change(e, 'password_confirmation')}
          />
          <View style={styles.buttonContainer}>
            <Button
              btnRed
              onPress={this.submit}
              disabled={this.isButtonDisabled()}
              title="Guardar"
            />
          </View>
          {Platform.OS === 'android' && (
            <>
              <View style={styles.termsAndConditionsMessageContainer}>
                <Text style={styles.termsAndConditionsMessage}>
                  {Strings.termsAndConditionsMessage}
                </Text>
              </View>
              <PrivacyPolicyLink />
              <TermsAndConditionsLink />
            </>
          )}
        </View>
      </LogoContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    width: '90%',
    alignSelf: 'center',
    padding: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  termsAndConditionsMessageContainer: {
    padding: 20,
  },
  termsAndConditionsMessage: {
    textAlign: 'center',
  },
});

export default Register;
