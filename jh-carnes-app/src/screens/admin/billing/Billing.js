import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import Colors from '../../../assets/colors';
import Lang from '../../../assets/lang';
import API from '../../../utils/Api';
import BillingItem from './BillingItem';

class Billing extends Component {
  state = {
    couponPurchase: false,
    voucherCoupon: false,
    clients: this.props.clients,
    rangePoints: this.props.rangePoints,
  };

  async componentDidMount() {
    const clients = await API.getUsers(this.props.clients.length === 0);
    this.updateClients(clients);
    const rangePoints = await API.rangePoints();
    this.updateRangePoints(rangePoints);
    console.log('>>: Billing > Range Point ', rangePoints);
  }

  updateClients = clients => {
    if (!clients) {
      return false;
    }

    this.setState({clients});
    this.props.dispatch({type: 'SET_CLIENTS', payload: clients});
  };

  updateRangePoints = points => {
    if (!points) {
      return false;
    }

    this.setState({rangePoints: points});
    this.props.dispatch({type: 'SET_RANGE_POINTS', payload: points});
  };

  couponPurchase = () =>
    this.setState({couponPurchase: true, voucherCoupon: false});

  voucherCoupon = () =>
    this.setState({voucherCoupon: true, couponPurchase: false});

  render() {
    return (
      <>
        <View style={styles.header} />
        <Text style={styles.textTitle}>Cambio de Puntos</Text>
        <ScrollView contentContainerStyle={{paddingVertical: 10}}>
          <View style={styles.view}>
            {!this.state.couponPurchase ? (
              <TouchableOpacity
                style={styles.textTouchable}
                onPress={this.couponPurchase}>
                <View style={styles.textContainer}>
                  <Text style={styles.text}>
                    {Lang.couponsForPurchaseAmount}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <BillingItem
                labelButton={Lang.couponsForPurchaseAmount}
                clients={this.state.clients}
                items={[
                  'Seleccionar cliente',
                  'Número de factura',
                  'Monto',
                  'Puntos a Recibir',
                ]}
                onPressValidatorChange={response =>
                  this.setState({couponPurchase: response})
                }
                rangePoints={this.state.rangePoints[0]}
              />
            )}

            {!this.state.voucherCoupon ? (
              <TouchableOpacity
                onPress={this.voucherCoupon}
                style={styles.textTouchable}>
                <View style={styles.textContainer}>
                  <Text style={styles.text}>
                    {Lang.redemptionOfCouponsForPurchases}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={{marginTop: 10, width: '100%'}}>
                <BillingItem
                  labelButton={Lang.redemptionOfCouponsForPurchases}
                  clients={this.state.clients}
                  items={[
                    'Seleccionar cliente',
                    'Número de factura',
                    'Monto de factura',
                    'Puntos de Usuario',
                    'Puntos a Cambiar',
                    'Canjeo a USD',
                    'Diferencia',
                  ]}
                  onPressValidatorChange={response =>
                    this.setState({voucherCoupon: response})
                  }
                  rangePoints={this.state.rangePoints[1]}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTouchable: {
    width: '100%',
  },
  textContainer: {
    borderWidth: 0.2,
    elevation: 10,
    marginTop: 10,
    backgroundColor: '#c2c2c2',
    borderRadius: 20,
    marginHorizontal: '10%',
    flexDirection: 'row',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  text: {
    textAlign: 'center',
    paddingHorizontal: 7,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: 'black',
    overflow: 'hidden',
  },
  textTitle: {
    fontSize: 20,
    color: Colors.primary,
    height: 40,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  view: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
});

export default connect(state => ({
  clients: state.clients,
  rangePoints: state.rangePoints,
}))(Billing);
