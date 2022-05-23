import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Input, Button, Modal} from '../../widgets';
import {Colors} from '../../utils';
import {Button as ButtonNative} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';

class ModalPhone extends React.Component {
  state = {
    form: {
      phone: this.props.phone || '',
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

  disabled = () => {
    return !this.state.form.phone;
  };

  render() {
    return (
      <Modal
        transparent={true}
        visible={this.props.visible}
        onRequestClose={this.props.onCancel}>
        <View style={[styles.container, styles.shadow]}>
          <View style={[styles.containerWhite, styles.shadow]}>
            <View style={styles.row}>
              <ButtonNative
                onPress={this.props.onCancel}
                type="clear"
                icon={<Icon name="md-close" color={Colors.red} size={25} />}
              />
            </View>
            <Text style={styles.text}>
              Para continuar con el inicio de sesión, por favor indique su
              número de teléfono
            </Text>
            <Input
              keyboardType="numeric"
              label="Teléfono"
              value={this.state.form.phone}
              onChange={e => this.change(e, 'phone')}
            />
            <View style={styles.buttonContainer}>
              <Button
                btnRed
                titleStyle={styles.titleRed}
                onPress={() => this.props.onSuccess(this.state.form.phone)}
                disabled={this.disabled()}
                title="Continuar"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  containerWhite: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
    padding: 20,
    paddingTop: 0,
  },
  buttonContainer: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  text: {
    marginTop: 15,
    fontSize: 15,
    marginBottom: 15,
  },
});

export default ModalPhone;
