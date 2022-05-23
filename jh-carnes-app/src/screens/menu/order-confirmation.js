import React, {Component} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import Header from '../../navigation/header';
import {Colors, Globals, axios} from '../../utils';
import {Button as AppButton} from '../../widgets';
import confirmOrder from '../../assets/icons/confirm-order.png';
import Toast from 'react-native-root-toast';
import colors from '../../utils/colors';

class OrderConfirmationComponent extends Component {
  constructor(props) {
    super(props);
  }

  confirm = () => {
    const {dispatch, user, order, navigation} = this.props;

    Globals.setLoading();
    axios
      .post('order/send', {
        user_id: user.id,
        order,
      })
      .then(() => {
        Toast.show('¡Orden enviada! Revise su correo.');
        dispatch({type: 'Order/CLEAR'});
        navigation.navigate('Home');
      })
      .catch(err => {
        console.log('OrderConfirmation: confirm: ', err);
      })
      .finally(() => {
        Globals.quitLoading();
      });
  };

  render() {
    const {navigation, orderAmount, user} = this.props;

    return (
      <View>
        <Header
          style={styles.header}
          title=" "
          headerLeft={
            <Button
              type="clear"
              onPress={() => navigation.goBack()}
              icon={
                <Icon name="ios-arrow-back" size={30} color={Colors.white} />
              }
            />
          }
        />
        <View style={styles.container}>
          <View
            style={{
              paddingVertical: 24,
              paddingHorizontal: 56,
              backgroundColor: '#e0e0e0',
            }}>
            <Text>
              <Text style={{fontWeight: 'bold', lineHeight: 24}}>Nombre: </Text>
              {user.person.name} {user.person.lastname}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold', lineHeight: 24}}>
                Teléfono:{' '}
              </Text>
              {user.person.phone}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold', lineHeight: 24}}>Email: </Text>
              {user.email}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.red,
              marginHorizontal: 24,
            }}>
            <Image
              source={confirmOrder}
              style={{width: 18, height: 18, marginEnd: 4}}
            />
            <Text style={{fontWeight: 'bold'}}>Total a pagar</Text>
          </View>
          <View style={{padding: 16}}>
            <Text style={{fontSize: 28, textAlign: 'center'}}>
              <Text style={{color: Colors.red, fontWeight: 'bold'}}>
                {Globals.getPrice(orderAmount)}
              </Text>
            </Text>
          </View>
          <View style={{flex: 1}} />
          <View
            style={{
              alignItems: 'center',
              paddingBottom: 12,
              paddingTop: 20,
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
            }}>
            <AppButton
              btnRed
              onPress={this.confirm}
              title="Confirmar mi orden"
            />
          </View>
        </View>
      </View>
    );
  }
}

export const OrderConfirmation = connect(({order, dishes, user}) => ({
  orderAmount: Object.entries(order).reduce(
    (soFar, [dishId, quantity]) =>
      soFar +
      (dishes.find(({id}) => id === parseInt(dishId, 10))?.price ?? 0) *
        quantity,
    0,
  ),
  order,
  user,
}))(OrderConfirmationComponent);

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.red,
    width: '100%',
  },
  container: {
    height: '100%',
    paddingTop: 40,
  },
});
