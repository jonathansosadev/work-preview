import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  FlatList,
  ScrollView,
} from 'react-native';
import {Input, Button, DatePicker, Select} from '../../widgets';
import {connect} from 'react-redux';
import {axios, Globals, Alert, Colors} from '../../utils';
import moment from 'moment';

class NewReservation extends React.Component {
  static navigationOptions = {
    title: 'Nueva Reserva',
  };

  constructor(props) {
    super(props);
    this.state = {
      schedule: [],
      hours: [],
      form: {
        shedule: null,
        quantity: '2',
        date: moment().format('DD/MM/YYYY'),
        hour: null,
      },
    };
  }

  disabled = () => {
    const {schedule, quantity, date, hour} = this.state.form;
    console.log(hour);
    return schedule == null || hour == null || date == null || quantity == null;
  };

  change = async (e, name) => {
    await this.setState({
      form: {
        ...this.state.form,
        [name]: e.nativeEvent.text,
      },
    });
  };

  async componentDidMount() {
    this.load();

    this.props.navigation.setParams({
      iconColor: Colors.red,
    });
  }

  load = async () => {
    await this.setState({
      form: {
        ...this.state.form,
        schedule: null,
      },
    });
    Globals.setLoading();
    axios
      .post('reservations/schedule', {
        day: moment(this.state.form.date, 'DD/MM/YYYY').isoWeekday(),
      })
      .then(res => {
        if (res.data.result) {
          this.setState({
            schedule: res.data.schedule
              .filter(({type}) => type != 3)
              .map(i => {
                return {
                  ...i,
                  value: i.id,
                  label: `${moment(i.start, 'HH:mm:ss').format(
                    'HH:mm',
                  )} a ${moment(i.end, 'HH:mm:ss').format('HH:mm')}`,
                };
              }),
            form: {
              ...this.state.form,
              hour: null,
            },
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

  range = (start, end, interval) => {
    var s = start.split(':').map(e => +e);
    var e = end.split(':').map(e => +e);
    var res = [];
    var t = [];
    while (!(s[0] == e[0] && s[1] > e[1])) {
      t.push(s[0] + ':' + (s[1] < 10 ? '0' + s[1] : s[1]));
      s[1] += interval;
      if (s[1] > 59) {
        s[0] += 1;
        s[1] %= 60;
      }
    }
    res.push(moment(start, 'HH:mm:ss').format('HH:mm'));
    for (var i = 0; i < t.length - 1; i++) {
      res.push(t[i + 1]);
    }
    return res;
  };

  submit = () => {
    Globals.setLoading();
    axios
      .post('reservations/set', {
        id: this.props.user.id,
        ...this.state.form,
      })
      .then(res => {
        if (res.data.result) {
          this.props.navigation.goBack(null);
          Globals.sendNotification(
            'Su reservación se ha realizado correctamente',
          );
          Globals.quitLoading();
        } else {
          if (res.data.error && !res.data.event) {
            Alert.alert(res.data.error, [
              {
                text: 'Aceptar',
                onPress() {
                  Globals.quitLoading();
                },
              },
            ]);
          }
          else {
            Alert.alert(res.data.error, [
              {
                text: 'Ir al Evento',
                onPress: () => {
                  Globals.quitLoading();
                  this.props.navigation.navigate('EventsClient',{
                    event_id: res.data.event.id
                  });
                },
              },
              {
                text: 'Cancelar',
                onPress() {
                  Globals.quitLoading();
                },
              }
            ]);
          }          
        }
      })
      .catch(err => {
        console.log(err);
        Alert.alert('Se ha producido un error', [
          {
            text: 'Aceptar',
            onPress() {
              Globals.quitLoading();
            },
          },
        ]);
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View>
            <Text style={styles.title}>Reserva</Text>
            <Text style={styles.subtitle}>
              Reserva tu mesa para los DOMINGOS LLANEROS. Sólo complete el
              formulario de reserva aquí debajo.
            </Text>
            <View style={styles.card}>
              <Input
                keyboardType="numeric"
                label="Cantidad de Personas"
                value={this.state.form.quantity}
                onChange={e => this.change(e, 'quantity')}
              />
              <DatePicker
                minDate={moment().format('DD/MM/YYYY')}
                label="Fecha"
                maxDate={moment()
                  .add(30, 'days')
                  .format('DD/MM/YYYY')}
                onChange={async text => {
                  await this.change(text, 'date');
                  await this.change(text, 'hour');
                  await this.setState({
                    hours: []
                  });
                  this.load();
                }}
                value={this.state.form.date}
              />
              <Select
                label="Horario"
                items={this.state.schedule}
                onChange={async text => {
                  await this.change(text, 'schedule');
                  const schedule = this.state.schedule.find(
                    i => this.state.form.schedule == i.id,
                  );
                  this.setState({
                    hour: null,
                    hours: this.range(schedule.start, schedule.end, 15),
                  });
                }}
                value={this.state.form.schedule}
              />
              <View style={styles.row}>
                <FlatList
                  data={this.state.hours}
                  renderItem={({item}) => (
                    <View style={{width: '33.33%'}}>
                      <TouchableWithoutFeedback
                        onPress={() =>
                          this.change(
                            {
                              nativeEvent: {
                                text: item,
                              },
                            },
                            'hour',
                          )
                        }>
                        <View
                          style={[
                            styles.hour,
                            this.state.form.hour == item
                              ? {
                                  backgroundColor: Colors.red,
                                }
                              : null,
                          ]}>
                          <Text
                            style={[
                              styles.hourText,
                              this.state.form.hour == item
                                ? {
                                    color: Colors.white,
                                  }
                                : null,
                            ]}>
                            {item}
                          </Text>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  )}
                  numColumns={3}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
              <View style={styles.center}>
                <Button
                  btnRed
                  onPress={this.submit}
                  disabled={this.disabled()}
                  title="Guardar"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    marginBottom: 20,
  },
  center: {
    alignItems: 'center',
    marginTop: 20,
  },
  row: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  hour: {
    backgroundColor: Colors.gray2,
    width: '90%',
    borderRadius: 5,
    marginVertical: 10,
    padding: 5,
  },
  hourText: {
    textAlign: 'center',
    color: Colors.white,
  },
  separator: {
    width: '100%',
    borderBottomColor: Colors.black,
    borderBottomWidth: 2,
    marginBottom: 10,
  },
  textSeparator: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 10,
  },
  title: {
    color: Colors.red,
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 10,
  },
  card: {
    width: '90%',
    alignSelf: 'center',
  },
  subtitle: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 12,
  },
});

export default connect(state => {
  return {
    user: state.user,
  };
})(NewReservation);
