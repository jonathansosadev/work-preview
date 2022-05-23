import MerryPhotoView from '@merryjs/photo-viewer';
import React, {Component} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import add from '../../assets/icons/add-one-to-dish.png';
import remove from '../../assets/icons/remove-one-from-dish.png';
import trash from '../../assets/icons/delete-dish.png';
import Header from '../../navigation/header';
import {Colors, ENV as Environment, Globals} from '../../utils';
import {Button as AppButton} from '../../widgets';

const QuantityButton = ({onPress, source}) => (
  <TouchableOpacity onPress={onPress}>
    <Image style={styles.quantityButtonIcon} source={source} />
  </TouchableOpacity>
);

class OrderComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photoViewerVisible: false,
      photos: null,
    };
  }

  attemptContinue = () => {
    const {user, navigation} = this.props;

    if (!user) {
      navigation.navigate('Login', {
        callback: () => {
          this.continue();
        },
      });

      return;
    }

    this.continue();
  };

  continue = () => {
    const {navigation} = this.props;

    navigation.navigate('OrderConfirmation');
  };

  render() {
    const {navigation, orderAmount, dishes, totalDishes} = this.props;
    const {photoViewerVisible, photos} = this.state;

    return (
      <View>
        {photoViewerVisible && (
          <MerryPhotoView
            visible={photoViewerVisible}
            data={photos}
            initial={0}
            hideShareButton={true}
            hideStatusBar={true}
            onDismiss={() =>
              this.setState({photoViewerVisible: false, photos: null})
            }
          />
        )}
        <Header
          style={styles.header}
          title="Mi orden"
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
              alignItems: 'center',
              padding: 16,
              borderBottomColor: '#e0e0e0',
              borderBottomWidth: 1,
            }}>
            <Text style={{fontSize: 18}}>
              Total:{' '}
              <Text style={{color: Colors.red}}>
                {Globals.getPrice(orderAmount)}
              </Text>
            </Text>
            <View style={{height: 16}} />
            <AppButton
              btnRed
              disabled={totalDishes < 1}
              onPress={this.attemptContinue}
              title={`Continuar (${totalDishes})`}
            />
          </View>
          <FlatList
            keyExtractor={this.extractItemKey}
            renderItem={this.renderItem}
            data={dishes}
          />
        </View>
      </View>
    );
  }

  renderItem = ({item: {dish, quantity}, index}) => {
    const {dispatch} = this.props;

    return (
      <View
        style={[
          index % 2 !== 0
            ? {
                backgroundColor: Colors.gray,
              }
            : null,
        ]}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                photos: dish.images.map(({file}) => ({
                  source: {
                    uri: Environment.BASE_URL + file,
                  },
                })),
                photoViewerVisible: true,
              });
            }}>
            <FastImage
              style={styles.dishImage}
              source={{
                uri: Environment.BASE_URL + dish.images[0].file,
              }}
            />
          </TouchableOpacity>
          <View style={styles.dishContent}>
            <Text style={styles.dishTitle}>{dish.name}</Text>
            <Text>
              <Text style={styles.dishText}>
                Precio: {Globals.getPrice(dish.price)}
              </Text>
            </Text>
            <Text style={styles.dishText} numberOfLines={1}>
              Subtotal: {Globals.getPrice(dish.price * quantity)}
            </Text>
          </View>
          <View style={styles.quantity}>
            <QuantityButton
              onPress={() =>
                requestAnimationFrame(() =>
                  dispatch({
                    type: 'Order/REMOVE_ONE_FROM_DISH',
                    dishId: dish.id,
                  }),
                )
              }
              source={remove}
            />
            <Text style={styles.quantityText}>{quantity}</Text>
            <QuantityButton
              onPress={() =>
                requestAnimationFrame(() =>
                  dispatch({type: 'Order/ADD_ONE_TO_DISH', dishId: dish.id}),
                )
              }
              source={add}
            />
            <QuantityButton
              onPress={() =>
                dispatch({type: 'Order/REMOVE_DISH', dishId: dish.id})
              }
              source={trash}
            />
          </View>
        </View>
      </View>
    );
  };

  extractItemKey = ({dish: {id}}) => id.toString();
}

export const Order = connect(({order, dishes, user}) => ({
  orderAmount: Object.entries(order).reduce(
    (soFar, [dishId, quantity]) =>
      soFar +
      (dishes.find(({id}) => id === parseInt(dishId, 10))?.price ?? 0) *
        quantity,
    0,
  ),
  dishes: dishes.reduce(
    (soFar, dish) =>
      Object.keys(order).some(it => parseInt(it, 10) === dish.id)
        ? [...soFar, {dish, quantity: order[dish.id]}]
        : soFar,
    [],
  ),
  totalDishes: Object.values(order).reduce(
    (soFar, quantity) => soFar + quantity,
    0,
  ),
  user,
}))(OrderComponent);

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.red,
    width: '100%',
  },
  container: {
    height: '100%',
    paddingTop: 40,
  },
  row: {
    flexDirection: 'row',
  },
  dishContent: {
    paddingLeft: 15,
    flex: 1,
    paddingVertical: 10,
  },
  dishImage: {
    width: 80,
    height: 100,
    margin: 1.5,
    overflow: 'hidden',
    resizeMode: 'cover',
  },
  dishTitle: {
    color: Colors.red,
    fontWeight: 'bold',
  },
  dishText: {
    fontWeight: 'bold',
  },
  quantity: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  quantityButtonIcon: {
    height: 18,
    margin: 12,
    width: 18,
  },
  quantityText: {
    fontSize: 16,
  },
});
