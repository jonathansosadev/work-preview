import PhotoView from '@merryjs/photo-viewer';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback as RNTouchableWithoutFeedback,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Strings from '../../assets/lang';
import noEvents from '../../assets/icons/event_list.png';
import {Alert, axios, Colors, ENV as Environment} from '../../utils';
import {LazyImage, Button, Modal} from '../../widgets';
import ModalReservationEvent from './modal-reservation-event';
import { store } from '../../store/store';
import {TouchableWithoutFeedback as RNGHTouchableWithoutFeedback} from 'react-native-gesture-handler';

const Touchable =
  Platform.OS === 'ios'
    ? RNGHTouchableWithoutFeedback
    : RNTouchableWithoutFeedback;

class Events extends React.Component {
  state = {
    visible: false,
    events: [],
    visible_modal: false,
    event: null
  };

  componentDidMount() {
    this.props.navigation.setParams({
      iconColor: Colors.red,
    });

    this.props.navigation.addListener("didFocus", () => {
      this.load();
    });

    this.load();
  }

  load = () => {
    axios
      .post('events/get',{
        event_id: this.props.navigation.getParam('event_id')
      })
      .then(res => {
        if (res.data.result) {
          this.setState({
            events: res.data.events,
          });
        }
      })
      .catch(err => {
        console.log(err);
        Alert.showError();
      });
  }

  select = event => {
    if (store.getState().user) {
      if (Platform.OS == 'android') {
        this.setState({
          visible_modal: true,
          event
        });
      }
      else {
        this.props.navigation.navigate('ModalReservationEvent',{
          event
        });
      }
    }
    else {
      this.props.navigation.navigate('Login',{
        callback: () => {
          this.select(event);
        }
      });
    }    
  }

  onCloseModal = () => {
    this.setState({
      visible_modal: false
    },() => this.load());
  }

  render() {
    return (
      <React.Fragment>
        <PhotoView
          visible={this.state.visible}
          data={this.state.events.map(item => {
            return {
              source: {uri: Environment.BASE_URL + item.file},
            };
          })}
          hideShareButton={true}
          hideStatusBar={Platform.OS !== 'ios'}
          onDismiss={() => {
            this.setState({visible: false});
          }}
        />
        <Modal visible={this.state.visible_modal} transparent={true}>
          <KeyboardAvoidingView behavior="padding">
            <ModalReservationEvent event={ this.state.event } onClose={ this.onCloseModal } />
          </KeyboardAvoidingView>
        </Modal>
        {this.state.events.length ? (
          <ScrollView>
            <View>
              {this.state.events.map((item, index) => (
                  <View>
                    <Touchable
                      onPress={() => {
                        this.setState({
                          visible: true,
                        });
                      }}>
                        <LazyImage
                          key={index}
                          style={styles.image}
                          source={{uri: Environment.BASE_URL + item.file}}
                        />
                      </Touchable>
                      <View style={ styles.button }>
                        {
                          item.details && (
                            <Button
                              onPress={ () => this.select(item) }
                              btnRed
                              disabled={ item.available <= 0 }
                              title={ item.available > 0 ? `Inscribirme (${ item.available } Cupos)` : "Cupos Agotados" }
                            />
                          )
                        }
                      </View>
                  </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.noEventsContainer}>
            <View style={styles.noEventsImageContainer}>
              <Image
                style={styles.noEventsImage}
                source={noEvents}
                resizeMod="cover"
                tintColor={Colors.primary}
              />
            </View>
            <Text style={styles.noEventsText}>{Strings.notEvents}</Text>
          </View>
        )}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    zIndex: 9999,
    alignSelf: 'center'
  },
  noEventsContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  noEventsImageContainer: {
    width: 124,
    height: 124,
  },
  noEventsImage: {
    width: '100%',
    height: '100%',
  },
  noEventsText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 40,
  },
});

export default Events;
