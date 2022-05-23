import moment from 'moment';
import React, {Component} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import catering from '../../assets/imgs/catering_sin_difuminar.jpg';
import {Alert, axios, Colors, Globals} from '../../utils';
import {Button, Input, DatePicker, Select} from '../../widgets';
import {DatePicker as NewDatePicker} from '../../widgets/NewDatePicker';

class Catering extends Component {
  constructor(props) {
    super(props);
    this.state = {
      section: 1,
      catering: [],
      foods: [],
      schedule: [],
      hours: [],
      form: {
        name: '',
        lastname: '',
        phone: '',
        email: '',
        quantity: '20',
        date: moment().format('DD/MM/YYYY'),
        address: '',
        type: '',
        hour: new Date(),
        text: '',
      },
    };
  }

  updateField = (event, name) => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: event.nativeEvent.text,
      },
    });
  };

  componentDidMount() {
    if (this.props.user) {
      this.setState({
        form: {
          ...this.state.form,
          name: this.props.user.person.name,
          lastname: this.props.user.person.lastname,
          email: this.props.user.email,
          phone: this.props.user.person.phone,
        },
      });
    }

    this.props.navigation.setParams({
      iconColor: Colors.red,
    });

    Globals.setLoading();

    this.load(false);

    axios
      .post('catering/get')
      .then(res => {
        if (res.data.result) {
          this.setState({
            catering: res.data.catering,
            foods: res.data.foods,
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
  }

  isButtonDisabled = () => {
    const {
      name,
      lastname,
      email,
      phone,
      date,
      address,
      quantity,
      type,
      hour,
    } = this.state.form;

    return (
      !name ||
      !lastname ||
      !email ||
      !phone ||
      !date ||
      !address ||
      !quantity ||
      !type ||
      !hour ||
      !this.state.schedule ||
      !this.state.schedule.length ||
      !this.state.schedule[0]
    );
  };

  submit = () => {
    if (!this.state.schedule) {
      console.error('Catering: submit: absurd state - there is no schedule');
      return;
    }

    if (!this.state.schedule.length) {
      console.error('Catering: submit: absurd state - schedule is empty');
      return;
    }

    if (!this.state.schedule[0]) {
      console.error(
        "Catering: submit: absurd state - schedule's first item is null",
      );
      return;
    }

    Globals.setLoading();
    axios
      .post('catering/set', {
        ...this.state.form,
        schedule: this.state.schedule[0].id,
        hour: moment(this.state.form.hour).format('HH:mm'),
      })
      .then(res => {
        if (res.data.result) {
          Globals.sendNotification('Se ha enviado su solicitud de catering');
          Globals.quitLoading();
          setTimeout(() => this.props.navigation.goBack(null), 500);
        } else {
          Alert.alert(res.data.error, [
            {text: 'Aceptar', onPress: () => Globals.quitLoading()},
          ]);
        }
      })
      .catch(err => {
        console.log(err);
        Alert.alert('Ha ocurrido un error', [
          {text: 'Aceptar', onPress: () => Globals.quitLoading()},
        ]);
      });
  };

  load = (loading = true) => {
    if (loading) {
      Globals.setLoading();
    }

    axios
      .post('reservations/schedule', {
        day: moment(this.state.form.date, 'DD/MM/YYYY').isoWeekday(),
      })
      .then(({data: {result, schedule}}) => {
        if (!result) {
          return;
        }

        this.setState({
          schedule: schedule
            .filter(({type}) => type == 3)
            .map(item => ({
              ...item,
              value: item.id,
              label: `${moment(item.start, 'HH:mm:ss').format(
                'HH:mm',
              )} a ${moment(item.end, 'HH:mm:ss').format('HH:mm')}`,
            })),
          form: {
            ...this.state.form,
            hour: new Date(),
          },
        });
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

  renderSection = () => (
    <>
      <Text style={styles.title}>Catering</Text>

      <View style={styles.row}>
        <View
          style={[
            styles.section,
            this.state.section == 1 ? styles.sectionActive : null,
          ]}
        />
        <View
          style={[
            styles.section,
            this.state.section == 2 ? styles.sectionActive : null,
          ]}
        />
      </View>
    </>
  );

  render() {
    return (
      <>
        <ScrollView ref={ref => (this.scrollView = ref)}>
          <View>
            {this.state.section == 1 && (
              <>
                <Image source={catering} style={styles.image} />
                {this.renderSection()}
                <View style={styles.container}>
                  {this.state.catering.map(({text, id}) => (
                    <Text key={id.toString()} style={styles.item}>
                      - {text}
                    </Text>
                  ))}
                </View>
                <View style={{alignItems: 'center', marginVertical: 10}}>
                  <Button
                    btnRed
                    onPress={() => {
                      this.setState({section: 2});
                      this.scrollView.scrollTo({y: 0});
                    }}
                    title="Siguiente"
                  />
                </View>
              </>
            )}

            {this.state.section == 2 && (
              <>
                {this.renderSection()}

                <View style={styles.containerForm}>
                  {!this.props.user && (
                    <>
                      <Input
                        label="Nombres"
                        value={this.state.form.name}
                        onChange={event => this.updateField(event, 'name')}
                      />
                      <Input
                        label="Apellidos"
                        value={this.state.form.lastname}
                        onChange={event => this.updateField(event, 'lastname')}
                      />
                      <Input
                        keyboardType="numeric"
                        label="Teléfono"
                        value={this.state.form.phone}
                        onChange={event => this.updateField(event, 'phone')}
                      />
                      <Input
                        label="Email"
                        value={this.state.form.email}
                        onChange={event => this.updateField(event, 'email')}
                      />
                      <View style={styles.separator} />
                    </>
                  )}

                  <Select
                    label="Tipo de Servicio"
                    items={this.state.foods.map(item => {
                      return {
                        value: item.id,
                        label: item.name,
                      };
                    })}
                    onChange={text => this.updateField(text, 'type')}
                    value={this.state.form.type}
                  />
                  <Input
                    keyboardType="numeric"
                    label="Cantidad de personas"
                    value={this.state.form.quantity}
                    onChange={event => this.updateField(event, 'quantity')}
                  />
                  <DatePicker
                    minDate={moment().format('DD/MM/YYYY')}
                    label="Fecha de Reserva"
                    maxDate={moment()
                      .add(30, 'days')
                      .format('DD/MM/YYYY')}
                    onChange={text => {
                      this.updateField(text, 'date');
                      this.load();
                    }}
                    value={this.state.form.date}
                  />
                  <View>
                    <Text style={styles.timePickerLabel}>Hora</Text>
                    <View style={{flexDirection: 'row', width: '100%'}}>
                      <NewDatePicker
                        onChange={this.updateHour}
                        style={styles.timePicker}
                        dateTextStyle={{alignSelf:'flex-start',fontSize:14}}
                        value={this.state.form.hour}
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <FlatList
                      data={this.state.hours}
                      renderItem={({item}) => (
                        <View style={{width: '33.33%'}}>
                          <TouchableWithoutFeedback
                            onPress={() =>
                              this.updateField(
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
                      keyExtractor={item => item}
                    />
                  </View>
                  <Input
                    multiline={true}
                    label="Ubicación"
                    numberOfLines={4}
                    inputStyle={Platform.OS == 'ios' ? {minHeight: 70} : null}
                    value={this.state.form.address}
                    onChange={event => this.updateField(event, 'address')}
                  />
                  <Input
                    multiline={true}
                    label="Comentario (Opcional)"
                    numberOfLines={4}
                    inputStyle={Platform.OS == 'ios' ? {minHeight: 70} : null}
                    value={this.state.form.comment}
                    onChange={event => this.updateField(event, 'comment')}
                  />
                  <View style={{alignItems: 'center', marginVertical: 10}}>
                    <Button
                      btnRed
                      disabled={this.isButtonDisabled()}
                      onPress={this.submit}
                      title="Enviar"
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </>
    );
  }

  updateHour = (_event, date) => {
    if (!date) {
      return;
    }

    this.setState(({form}) => ({
      form: {
        ...form,
        hour: date,
      },
    }));
  };
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: Dimensions.get('window').height / 2,
  },
  section: {
    width: '50%',
    height: 2,
    backgroundColor: Colors.gray,
    marginHorizontal: 2.5,
  },
  row: {
    width: Dimensions.get('window').width * 0.8,
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 20,
  },
  sectionActive: {
    backgroundColor: Colors.red,
  },
  title: {
    fontSize: 24,
    color: Colors.red,
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
  },
  item: {
    marginVertical: 10,
  },
  container: {
    width: '90%',
    alignSelf: 'center',
    paddingTop: 12,
  },
  containerForm: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  separator: {
    width: '95%',
    height: 2,
    backgroundColor: Colors.gray2,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
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
  timePicker: {
    flex: 1,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.gray2,
    backgroundColor: Colors.gray,
    height: 29.3,
  },
  timePickerText: {
    color: 'black',
  },
  timePickerLabel: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
    textAlign: 'left',
    width: '100%',
    marginHorizontal: 10,
    marginVertical: 5,
  },
});

export default connect(state => {
  return {
    user: state.user,
  };
})(Catering);
