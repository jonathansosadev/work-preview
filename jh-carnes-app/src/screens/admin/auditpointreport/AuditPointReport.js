import React, {Component} from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';
import Api from '../../../utils/Api';
import colors from '../../../assets/colors';
import {connect} from 'react-redux';
import ItemAuditPointHistory from './itemAuditPointHistory';
import DatePicker from '../../../widgets/datepicker';
import moment from 'moment';

class AuditPointReport extends Component {
  state = {
    history: [],
    from: moment().format('DD/MM/YYYY'),
    until: moment().format('DD/MM/YYYY'),
    maxDate: moment().format('DD/MM/YYYY'),
    untilB: false,
  };

  async componentDidMount() {
    console.log('>>: desde ', this.state);
    this.load();

    console.log(
      '>>: history ',
      this.props.auditPoints,
      'this.props.auditPoints.length',
      this.props.auditPoints.length,
    );
  }

  load = async () => {
    const from = moment(this.state.from, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const until = moment(this.state.until, 'DD/MM/YYYY').format('YYYY-MM-DD');

    const historyPoints = await Api.getHistoryPoints(from, until);
    this.setHistoryPoints(historyPoints.request);
  };

  setHistoryPoints = async historyPoints => {
    console.log('>>: setHistoryPoints');
    if (historyPoints) {
      await this.props.dispatch({type: 'SET_AUDIT', payload: historyPoints});
      this.setState({history: historyPoints});
    }
  };

  render() {
    return (
      <View style={{...styles.view}}>
        <View style={{...styles.container}} />

        <Text style={{...styles.textTitle}}>
          {'Reporte de Auditoría de puntos'}
        </Text>
        <View style={{...styles.viewDataPickers}}>
          <View style={{...styles.dataPicker}}>
            <DatePicker
              label="Desde"
              maxDate={
                this.state.until
                  ? this.state.until
                  : moment().format('DD/MM/YYYY')
              }
              onChange={async text => {
                this.setState(
                  {from: text.nativeEvent.text, maxDate: text.nativeEvent.text},
                  this.load,
                );
              }}
              value={this.state.from}
            />
          </View>

          <View style={{...styles.dataPicker}}>
            <DatePicker
              label="Hasta"
              minDate={this.state.maxDate}
              maxDate={moment().format('DD/MM/YYYY')}
              onChange={async text => {
                this.setState({until: text.nativeEvent.text}, this.load);
              }}
              value={this.state.until}
            />
          </View>
        </View>

        <View style={{...StyleSheet.viewColumn}}>
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

        {this.props.auditPoints.length > 0 ? (
          <FlatList
            style={{width: '100%'}}
            contentContainerStyle={{paddingVertical: 20}}
            data={this.props.auditPoints}
            keyExtractor={(item, i) => i.toString()}
            renderItem={({item}) => <ItemAuditPointHistory item={item} />}
          />
        ) : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  col: {
    flex: 0.33,
  },
  bold: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
  textTable: {
    fontSize: 12,
  },
  container: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginVertical: 30,
  },
  view: {
    flex: 1,
  },
  viewDataPickers: {
    flexDirection: 'row',
  },
  dataPicker: {
    flex: 0.5,
  },
  viewColumn: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    marginTop: 30,
  },
});
export default connect(status => ({
  auditPoints: status.auditPoints,
}))(AuditPointReport);
