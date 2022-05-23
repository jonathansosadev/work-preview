import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';
import {Colors, axios, Globals, Alert, ENV} from '../../utils';
import {Infinite, Button} from '../../widgets';
import {connect} from 'react-redux';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import ProfileImage from '../../assets/imgs/profilebg.jpg';
import ProfileIcon from '../../assets/imgs/profile.png';
import {Button as ButtonNative} from 'react-native-elements';

class Reservations extends React.Component {
  state = {
    reservations: [],
    page: 1,
    last_page: 1,
    loading: false,
    points: null,
    current_date: null,
    show: false,
    pointsHistory: [],
    points_page: 1,
    points_last_page: 1,
    points_loading: false,
    section: 1,
  };

  componentDidMount() {
    axios
      .post('user/profile/get', {id: this.props.user.id})
      .then(res => {
        if (res.data.result) {
          this.setState({
            points: res.data.user.person.points,
          });
        }
      })
      .catch(err => {
        console.log(err);
      });

    this.props.navigation.addListener('didFocus', async () => {
      this.setState({
        reservations: [],
        page: 1,
        last_page: 1,
        pointsHistory: [],
        points_page: 1,
        points_last_page: 1,
        loading: true,
        points_loading: true,
      });
      await this.load(false);
      await this.loadPoints(false);
    });
  }

  load = async (loading = true) => {
    axios
      .post('reservations/get?page=' + this.state.page, {
        id: this.props.user.id,
      })
      .then(res => {
        if (res.data.result) {
          const data = [
            ...this.state.reservations,
            ...res.data.reservations.data,
          ];
          this.setState({
            current_date: res.data.date,
            reservations: data,
            loading: false,
            last_page: res.data.reservations.last_page,
          });
        }
      })
      .catch(err => {
        console.log(err);
        Alert.showError();
      })
      .finally(() => {
        if (loading) {
          Globals.quitLoading();
        }
      });
  };

  loadPoints = async (loading = true) => {
    axios
      .post('reservations/points/get?page=' + this.state.points_page, {
        id: this.props.user.id,
      })
      .then(res => {
        if (res.data.result) {
          const data = [...this.state.pointsHistory, ...res.data.points.data];
          this.setState({
            pointsHistory: data,
            points_loading: false,
            points_last_page: res.data.points.last_page,
          });
        }
      })
      .catch(err => {
        console.log(err);
        Alert.showError();
      })
      .finally(() => {
        if (loading) {
          Globals.quitLoading();
        }
      });
  };

  getStatus = (item, text = true) => {
    let resp = '';
    let _status = 1;
    switch (item.status) {
      case 1:
        resp = 'Activa';
        _status = 1;
        if (moment(this.state.current_date) > moment(item.date)) {
          resp = 'Procesada';
          _status = 2;
        }
        break;
      case 0:
        resp = 'Cancelada';
        _status = 0;
        break;
    }

    if (text) {
      return resp;
    }

    return _status;
  };

  newReservation = () => {
    this.props.navigation.navigate('NewReservation');
  };

  profile = () => {
    this.props.navigation.navigate('Profile');
  };

  render() {
    return (
      <ScrollView>
        <View style={styles.container}>
          <ImageBackground source={ProfileImage} style={styles.image}>
            <View
              style={[
                styles.containerWhite,
                {
                  backgroundColor:
                    this.props.user &&
                    this.props.user.person &&
                    this.props.user.person.photo
                      ? 'transparent'
                      : Colors.white,
                },
              ]}>
              {this.props.user &&
              this.props.user.person &&
              this.props.user.person.photo ? (
                <ImageBackground
                  source={{uri: ENV.BASE_URL + this.props.user.person.photo}}
                  style={styles.profileImageUser}
                />
              ) : (
                <Image source={ProfileIcon} style={styles.profileImage} />
              )}
            </View>
            <Text style={styles.name}>
              {this.props.user.person.name +
                ' ' +
                this.props.user.person.lastname}
            </Text>
          </ImageBackground>
          <View
            style={{width: '100%', paddingHorizontal: 15, marginBottom: 20}}>
            <Button
              buttonStyle={styles.buttonRed}
              titleStyle={styles.ReservationtitleButton}
              onPress={this.newReservation}
              title="Reserva"
              btnRed
            />
          </View>
          {this.state.points != null && (
            <React.Fragment>
              <Text style={styles.labelPoints}>Puntos</Text>
              <View style={styles.points}>
                <Text style={styles.text}>Puntos acumulados:</Text>
                <Text style={[styles.text, styles.textPoints]}>
                  {this.state.points} pts
                </Text>
              </View>
            </React.Fragment>
          )}
          {!this.state.show && (
            <View style={{alignItems: 'center'}}>
              <Button
                onPress={() =>
                  this.setState({
                    show: true,
                  })
                }
                btnRed
                title="Historial"
              />
            </View>
          )}
          {this.state.show && (
            <View style={styles.rowSection}>
              <View
                style={[
                  styles.section,
                  this.state.section == 1 ? styles.sectionActive : null,
                ]}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      section: 1,
                    });
                  }}>
                  <Text style={[styles.center, styles.titleTab]}>Reservas</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.section,
                  this.state.section == 2 ? styles.sectionActive : null,
                ]}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      section: 2,
                    });
                  }}>
                  <Text style={[styles.center, styles.titleTab]}>Puntos</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {this.state.section == 1 &&
            this.state.show &&
            this.state.reservations.map((item, index) => {
              return (
                <View key={index} style={styles.itemReserva}>
                  <View
                    style={{
                      flex: 0.3,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Icon name="md-clipboard" color={Colors.red} size={40} />
                  </View>
                  <View style={{flex: this.getStatus(item, false) ? 0.5 : 0.7}}>
                    <Text>
                      <Text style={[styles.bold, styles.red]}>Fecha: </Text>
                      <Text>{moment(item.date).format('DD-MM-YYYY')}</Text>
                    </Text>
                    <Text>
                      <Text style={[styles.bold, styles.red]}>Personas: </Text>
                      <Text>{item.quantity}</Text>
                    </Text>
                    <Text>
                      <Text style={[styles.bold, styles.red]}>Estatus: </Text>
                      <Text>{this.getStatus(item)}</Text>
                    </Text>
                  </View>
                  {this.getStatus(item, false) == 1 && (
                    <View
                      style={{
                        flex: 0.2,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <ButtonNative
                        type="clear"
                        onPress={() => {
                          Alert.confirm('¿Desea cancelar la reserva?', () => {
                            Globals.setLoading();
                            axios
                              .post('reservations/cancel', {
                                id: item.id,
                              })
                              .then(res => {
                                if (res.data.result) {
                                  this.setState({
                                    page: 1,
                                    last_page: 1,
                                    reservations: [],
                                    loading: true,
                                  });
                                  this.load();
                                  Globals.sendNotification(
                                    'Se ha cancelado correctamente la reserva',
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
                          });
                        }}
                        icon={
                          <Icon size={25} color={Colors.red} name="md-trash" />
                        }
                      />
                    </View>
                  )}
                </View>
              );
            })}
          {this.state.section == 1 &&
            this.state.show &&
            (this.state.last_page > this.state.page || this.state.loading) &&
            !this.props.loading && (
              <Infinite
                loading={this.state.loading}
                containerStyle={styles.infinite}
                textStyle={styles.infiniteText}
                onPress={async () => {
                  if (this.state.last_page > this.state.page) {
                    await this.setState({
                      loading: true,
                      page: this.state.page + 1,
                    });

                    this.load();
                  }
                }}
              />
            )}
          {this.state.section == 2 &&
            this.state.show &&
            this.state.pointsHistory.length > 0 && (
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={[styles.bold, styles.textTable]}>Factura</Text>
                </View>
                <View style={styles.col}>
                  <Text style={[styles.center, styles.bold, styles.textTable]}>
                    Fecha
                  </Text>
                </View>
                <View style={styles.col}>
                  <Text style={[styles.right, styles.bold, styles.textTable]}>
                    Puntos
                  </Text>
                </View>
              </View>
            )}
          {this.state.section == 2 &&
            this.state.show &&
            this.state.pointsHistory.map((item, index) => {
              return (
                <View key={index} style={[styles.row, styles.rowRed]}>
                  <View style={styles.col}>
                    <Text style={styles.textTable}>{item.bill_number}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={[styles.center, styles.textTable]}>
                      {moment(item.created_at).format('DD-MM-YYYY')}
                    </Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={[styles.textTable, styles.right]}>
                      <Icon
                        name={
                          item.type == 1
                            ? 'ios-arrow-dropup-circle'
                            : 'ios-arrow-dropdown-circle'
                        }
                        size={15}
                        color={item.type == 1 ? Colors.green : Colors.red}
                      />
                      {' ' + item.quantity} pts
                    </Text>
                  </View>
                </View>
              );
            })}
          {this.state.section == 2 &&
            this.state.show &&
            (this.state.points_last_page > this.state.points_page ||
              this.state.points_loading) &&
            !this.props.loading && (
              <Infinite
                loading={this.state.points_loading}
                containerStyle={styles.infinite}
                textStyle={styles.infiniteText}
                onPress={() => {
                  if (this.state.points_last_page > this.state.points_page) {
                    this.setState({
                      points_loading: true,
                      points_page: this.state.points_page + 1,
                    });

                    this.loadPoints();
                  }
                }}
              />
            )}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  red: {
    color: Colors.red,
  },
  center: {
    textAlign: 'center',
  },
  container: {
    paddingBottom: 20,
  },
  points: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '90%',
    alignSelf: 'center',
    padding: 10,
    borderColor: Colors.red,
    borderWidth: 1,
    marginBottom: 10,
  },
  text: {
    color: Colors.black,
    flex: 0.8,
  },
  textTable: {
    fontSize: 12,
  },
  rowRed: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.red,
    paddingBottom: 5,
    width: '85%',
    alignSelf: 'center',
  },
  textPoints: {
    alignSelf: 'flex-end',
    flex: 0.2,
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: 'bold',
  },
  labelPoints: {
    fontSize: 14,
    color: Colors.red,
    fontWeight: 'bold',
    width: '90%',
    alignSelf: 'center',
    paddingBottom: 5,
  },
  item: {
    borderRadius: 5,
    padding: 5,
    width: '90%',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.red,
  },
  row: {
    flexDirection: 'row',
    width: '85%',
    alignSelf: 'center',
    paddingTop: 5,
  },
  col: {
    flex: 0.33,
  },
  noItems: {
    backgroundColor: Colors.white,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    padding: 10,
  },
  buttonNew: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.red,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: Dimensions.get('window').height / 2.5,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  profileImage: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
  },
  profileImageUser: {
    resizeMode: 'cover',
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
  },
  containerWhite: {
    // backgroundColor: Colors.white,
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: 'center',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 30,
    width: 70,
    paddingVertical: 1,
    alignSelf: 'center',
  },
  title: {
    fontSize: 12,
    color: Colors.white,
  },
  separator: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray2,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  titleButton: {
    fontSize: 12,
  },
  ReservationtitleButton: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  buttonRed: {
    width: 'auto',
    paddingHorizontal: 20,
  },
  infinite: {
    backgroundColor: Colors.red,
    borderRadius: 50,
  },
  infiniteText: {
    fontSize: 12,
    color: Colors.white,
  },
  section: {
    width: '50%',
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray,
  },
  rowSection: {
    width: Dimensions.get('window').width * 0.8,
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  sectionActive: {
    borderBottomColor: Colors.red,
  },
  titleTab: {
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  right: {
    textAlign: 'right',
  },
  icon: {
    marginRight: 15,
  },
  itemReserva: {
    backgroundColor: Colors.gray,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 10,
    width: '85%',
    alignSelf: 'center',
    padding: 10,
    flexDirection: 'row',
    marginBottom: 10,
  },
});

export default connect(state => {
  return {
    user: state.user,
    loading: state.loading,
  };
})(Reservations);
