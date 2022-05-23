import React, {Component} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import Api from '../../../utils/Api';
import colors from '../../../assets/colors';
import {connect} from 'react-redux';
import lang from '../../../assets/lang';
import TabsContainer from '../../../widgets/TabsContainer';
import Schedules from './Schedules';
import Toast from '../../../utils/Toast';

class Config extends Component {
  state = {
    schedules: [],
    rangePoints: [],
    currentSchedules: [],
    shifts: [],
    tab: 0,
  };

  async componentDidMount() {
    const schedules = this.getSchedules(
      this.props.schedules,
      this.props.shifts,
    );
    this.setState({
      schedules,
      currentSchedules: schedules[0],
      tab: 0,
      shifts: this.props.shifts,
      rangePoints: this.props.rangePoints,
    });
    const response = await Api.getConfig(this.props.schedules.length === 0);
    this.updateState(response);
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBack,
    );
  }

  onBack = () => {
    this.props.navigation.navigate('HomeAdmin');
    return true;
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  getSchedules = (input, shifts) => {
    const schedules = [];
    shifts.forEach(shift => {
      const schedule = input.filter(item => item.type === shift.id);
      schedules.push(schedule);
    });

    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];

      for (let j = 1; j <= 7; j++) {
        const day = schedule.find(item => item.day === j);
        if (!day) {
          schedule.push({
            type: this.props.shifts[i].id,
            quantity: 0,
            day: j,
          });
        }
      }
      schedule.sort((a, b) => a > b);
    }
    return schedules;
  };

  updateState = input => {
    if (!input) {
      return false;
    }

    const schedules = this.getSchedules(input.schedules, input.shifts);
    this.setState({
      schedules,
      currentSchedules: schedules[0],
      tab: 0,
      shifts: input.shifts,
      rangePoints: input.rangePoints,
    });
    this.props.dispatch({type: 'SET_SCHEDULES', payload: input.schedules});
    this.props.dispatch({type: 'SET_SHIFTS', payload: input.shifts});
    this.props.dispatch({type: 'SET_RANGE_POINTS', payload: input.rangePoints});
  };

  getRate1value = () => {
    if (this.state.rangePoints.length === 0) {
      return '0';
    }

    return this.state.rangePoints
      .find(item => item.type === 0)
      .amount.toString();
  };

  getRate2value = () => {
    if (this.state.rangePoints.length === 0) {
      return '0';
    }

    return this.state.rangePoints
      .find(item => item.type === 1)
      .amount.toString();
  };

  setRate1 = rate => {
    rate = parseInt(rate, 10);
    if (isNaN(rate)) {
      return false;
    }

    const amount = rate;
    const index = this.state.rangePoints.findIndex(item => item.type === 0);
    this.state.rangePoints[index].amount = amount;
    this.setState({rangePoints: this.state.rangePoints});
  };

  setRate2 = rate => {
    rate = parseInt(rate, 10);
    if (isNaN(rate)) {
      return false;
    }

    const amount = rate;
    const index = this.state.rangePoints.findIndex(item => item.type === 1);
    this.state.rangePoints[index].amount = amount;
    this.setState({rangePoints: this.state.rangePoints});
  };

  submit = async () => {
    const schedules = [];
    this.state.schedules.forEach(shift =>
      shift.forEach(schedule => schedules.push(schedule)),
    );
    const resp = await Api.updateConfig(schedules, this.state.rangePoints);
    if (resp) {
      Toast.show(lang.configurationSuccess);
    }
    this.updateState(resp);
  };

  render() {
    return (
      <>
        <View style={style.head} />
        <ScrollView>
          <View style={style.container}>
            <Text style={style.title}>{lang.config}</Text>
            <View style={style.content}>
              <Text style={style.subTitle}>{lang.subTitleConfig1}</Text>
              <View style={style.hbox}>
                <Text>$</Text>
                <TextInput
                  style={style.input}
                  value={this.getRate1value()}
                  keyboardType="number-pad"
                  onChangeText={this.setRate1}
                />
                <Text style={style.textBoxEquals}> = </Text>
                <Text style={style.textBox}> 1pt </Text>
              </View>
            </View>
            <View style={style.content}>
              <Text style={style.subTitle}>{lang.subTitleConfig2}</Text>
              <View style={style.hbox}>
                <Text style={style.textBox}> 1pt </Text>
                <Text style={style.textBoxEquals}> = </Text>
                <Text>$</Text>
                <TextInput
                  style={style.input}
                  value={this.getRate2value()}
                  keyboardType="number-pad"
                  onChangeText={this.setRate2}
                />
              </View>
            </View>
            <View
              style={{...style.content, borderBottomWidth: 0, marginTop: 20}}>
              <Text style={style.subTitle}>{lang.subTitleConfig3}</Text>
            </View>
            <TabsContainer
              tabs={this.state.shifts.map(item => item.name)}
              onChangeTab={tab =>
                this.setState({
                  tab,
                  currentSchedules: this.state.schedules[tab],
                })
              }
              tabSelected={this.state.tab}
            />
            <Schedules
              data={this.state.currentSchedules}
              onChange={schedules => {
                this.setState(state => {
                  let newSchedules = [...state.schedules];
                  newSchedules[state.tab] = schedules;

                  return {
                    currentSchedules: schedules,
                    schedules: newSchedules,
                  };
                });
              }}
            />
            <TouchableWithoutFeedback onPress={this.submit}>
              <View style={style.submit}>
                <Text style={style.textSubmit}>{lang.saveData}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </ScrollView>
      </>
    );
  }
}

const style = StyleSheet.create({
  head: {
    backgroundColor: colors.primary,
    height: 40,
    width: '100%',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    width: '100%',
    textAlignVertical: 'center',
    padding: 5,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 25,
  },
  subTitle: {
    paddingTop: 10,
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  content: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  hbox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  textBox: {
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingTop: 2,
    color: 'white',
    backgroundColor: colors.primary,
    height: 25,
    width: 75,
  },
  textBoxEquals: {
    height: 25,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  input: {
    backgroundColor: colors.gray,
    borderColor: colors.primary,
    borderWidth: 0.5,
    height: 25,
    padding: 0,
    width: 75,
    paddingHorizontal: 5,
    textAlign: 'right',
    marginLeft: 5,
  },
  submit: {
    marginTop: 20,
    height: 30,
    backgroundColor: colors.primary,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '33%',
  },
  textSubmit: {
    color: 'white',
    width: '100%',
    textAlign: 'center',
  },
});

export default connect(state => ({
  schedules: state.schedules,
  shifts: state.shifts,
  rangePoints: state.rangePoints,
}))(Config);
