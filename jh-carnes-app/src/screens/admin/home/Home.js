import React, {Component} from 'react';
import {
  FlatList,
  ImageBackground,
  Dimensions,
  Image,
  BackHandler,
  ScrollView,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import Item from './Item';
import lang from '../../../assets/lang';

const width = Dimensions.get('window').width;

const Items = [
  {
    src: require('../../../assets/icons/clients_list.png'),
    text: lang.clientsMenu,
    to: 'Clients',
  },
  {
    src: require('../../../assets/icons/plate.png'),
    text: lang.createFoodMenu,
    to: 'Foods',
  },
  {
    src: require('../../../assets/icons/config.png'),
    text: lang.config,
    to: 'Config',
  },
  {
    src: require('../../../assets/icons/report.png'),
    text: lang.reportMenu,
    to: 'AuditPointReport',
  },
  {
    src: require('../../../assets/icons/reservations.png'),
    text: lang.reservations,
    to: 'Reservation',
  },
  {
    src: require('../../../assets/icons/event_list.png'),
    text: lang.cateringList,
    to: 'Events',
  },
  {
    src: require('../../../assets/icons/events.png'),
    text: lang.eventList,
    to: 'EventsAdmin',
  },
  {
    src: require('../../../assets/icons/cange.png'),
    text: lang.pointsExchange,
    to: 'Billing',
  },
  {
    src: require('../../../assets/icons/logout.png'),
    text: lang.logout,
    to: 'Logout',
  },
];

class Home extends Component {
  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  onPressItem = item => this.props.navigation.navigate(item.to);

  toProfile = () => this.props.navigation.navigate('Profile');

  render() {
    return (
      <ScrollView>
        <ImageBackground
          style={{
            width,
            height: width,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
          source={require('../../../assets/imgs/fondo.png')}>
          <TouchableWithoutFeedback onPress={this.toProfile}>
            <View
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 30,
                height: 30,
                elevation: 1,
                padding: 5,
              }}>
              <Image
                style={{width: '100%', height: '100%', tintColor: 'white'}}
                source={require('../../../assets/icons/user.png')}
                tintColor={'white'}
              />
            </View>
          </TouchableWithoutFeedback>

          <Image
            style={{width: 200, height: 200}}
            source={require('../../../assets/imgs/logo.png')}
            resizeMode="cover"
          />
        </ImageBackground>

        <FlatList
          data={Items}
          keyExtractor={(item, i) => i.toString()}
          renderItem={({item}) => (
            <Item item={item} onPress={this.onPressItem} />
          )}
        />
      </ScrollView>
    );
  }
}

export default Home;
