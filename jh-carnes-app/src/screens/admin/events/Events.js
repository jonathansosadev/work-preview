import moment from 'moment';
import React, {Component} from 'react';
import {
  BackHandler,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import colors from '../../../assets/colors';
import lang from '../../../assets/lang';
import {Alert, axios, ENV as Environment, Globals} from '../../../utils';
import ImageView from '../../../widgets/ImageView';

class Events extends Component {
  static navigationOptions = {title: 'Lista de Eventos'};

  state = {
    events: [],
  };

  componentDidMount() {
    this.props.navigation.addListener('didFocus', () => {
      this.load();
    });
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBack,
    );
  }

  load = () => {
    Globals.setLoading();
    axios
      .post('events/get')
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
      })
      .finally(() => {
        Globals.quitLoading();
      });
  };

  onBack = () => {
    this.props.navigation.navigate('HomeAdmin');
    return true;
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  updateEvents = events => {
    if (!events) {
      return false;
    }

    this.setState({events});
    this.props.set;
  };

  add = () => this.props.navigation.navigate('CreateEvent');

  update = event => this.props.navigation.navigate('CreateEvent', {event});

  edit = item => {
    this.props.navigation.navigate('CreateEvent', {item});
  };

  delete = item => {
    Alert.confirm('Deseas eliminar esta evento?', () => {
      Globals.setLoading();
      axios
        .post('events/delete', {id: item.id})
        .then(res => {
          if (res.data.result) {
            this.load();
            Globals.sendNotification('Evento eliminado exitosamente');
          }
        })
        .catch(err => {
          console.log(err);
          Alert.showError();
        })
        .then(() => {
          Globals.quitLoading();
        });
    });
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.head} />
        <ImageView
          onPress={this.add}
          style={styles.floatButton}
          source={require('../../../assets/icons/add.png')}
        />
        <ScrollView>
          {this.state.events.length ? (
            <React.Fragment>
              {this.state.events.map((element, i) => {
                return (
                  <View key={i} style={{...styles.contentItem}}>
                    <ImageBackground
                      source={{uri: Environment.BASE_URL + element.file}}
                      style={{width: '100%', height: 200}}>
                      <View
                        style={{
                          ...styles.viewContentText,
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <View style={styles.viewText}>
                          <Text
                            style={{fontWeight: 'bold', color: colors.white}}>
                            Fecha:{' '}
                            <Text
                              style={{
                                fontWeight: 'normal',
                                color: colors.white,
                              }}>
                              {moment(element.date).format('DD/MM/YYYY')}
                            </Text>
                          </Text>
                        </View>
                        <TouchableWithoutFeedback
                          onPress={() => this.edit(element)}>
                          <View
                            style={{
                              ...styles.ph10,
                              borderRightColor: colors.white,
                              borderLeftColor: colors.white,
                              borderRightWidth: 1,
                              borderLeftWidth: 1,
                            }}>
                            <Icon
                              name="md-create"
                              color={colors.white}
                              size={18}
                            />
                          </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                          onPress={() => this.delete(element)}>
                          <View style={styles.ph10}>
                            <Icon
                              name="md-trash"
                              color={colors.white}
                              size={18}
                            />
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    </ImageBackground>
                  </View>
                );
              })}
            </React.Fragment>
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
              }}>
              <View style={{width: 124, height: 124}}>
                <Image
                  style={{width: '100%', height: '100%'}}
                  source={require('../../../assets/icons/event_list.png')}
                  resizeMod="cover"
                  tintColor={colors.primary}
                />
              </View>

              <Text
                style={{
                  fontSize: 16,
                  marginVertical: 40,
                  color: colors.primary,
                  fontWeight: 'bold',
                }}>
                {lang.notEvents}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  head: {
    width: '100%',
    height: 40,
    backgroundColor: colors.primary,
  },
  floatButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 10,
    right: 10,
    zIndex: 1,
    borderRadius: 25,
    elevation: 5,
    backgroundColor: colors.primary,
    padding: 15,
  },
  contentItem: {
    justifyContent: 'center',
    width: '100%',
    opacity: 0.8,
    elevation: 5,
    flexDirection: 'row',
    marginTop: 5,
  },
  viewImage: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewContentText: {
    flex: 1,
    paddingVertical: 5,
    color: colors.primary,
    backgroundColor: 'rgba(0,0,0,.82)',
    maxHeight: '15%',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewText: {
    alignItems: 'center',
    width: '55%',
  },
  ph10: {
    paddingHorizontal: 10,
  },
  buttonStyle: {
    width: 30,
    height: 30,
  },
});

export default connect(state => ({
  events: state.eventsAdmin,
}))(Events);
