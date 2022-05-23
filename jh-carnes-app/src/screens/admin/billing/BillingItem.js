import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Colors from '../../../assets/colors';
import Lang from '../../../assets/lang';
import SelectPicker from '../../../widgets/SelectPicker';
import Validators from '../../../utils/Validators';
import Toast from '../../../utils/Toast';
import API from '../../../utils/Api';

const ITEM_WIDTH = 110;
const ITEM_HEIGHT = 20;
const BUTTON_HEIGHT = 35;

class BillingItem extends Component {
  state = {
    clients: this.props.clients.map(client => ({
      ...client,
      nick: client.person.phone + ' | ' + client.person.name,
    })),
    form: {
      name: '',
      id: 0,
    },
    client: null,
    billNumber: 0,
    rode: 0,
    points: null,
    redemption: 0,
    pointsChange: 0,
    rangePoints: this.props.rangePoints.points,
    amount: this.props.rangePoints.amount,
    usd: null,
    pointUser: null,
    point: '',
    difference: null,
  };

  componentDidMount() {
    this.setValidatorCallbacks();
  }

  onPressValidatorChange = () => this.props.onPressValidatorChange(false);

  setValidatorCallbacks = () => {
    Validators.bill.notPass = () => {
      Toast.show(Lang.verifyFieldsMessage);
    };

    Validators.rode.notPass = () => {
      Toast.show(Lang.verifyFieldsMessage);
    };

    Validators.pointsChange.notPass = () => {
      Toast.show(Lang.verifyFieldsMessage);
    };

    Validators.client.notPass = () => {
      Toast.show(Lang.verifyFieldsMessage);
    };
  };

  validateFormTypeOne = () => {
    return (
      !Validators.client.validate(this.state.client) ||
      !Validators.pointsChange.validate(this.state.pointsChange) ||
      !Validators.bill.validate(this.state.billNumber) ||
      !Validators.rode.validate(this.state.rode)
    );
  };
  validateFormTypeZero = () => {
    return (
      !Validators.client.validate(this.state.client) ||
      !Validators.bill.validate(this.state.billNumber) ||
      !Validators.rode.validate(this.state.rode)
    );
  };

  submit = async () => {
    if (this.props.rangePoints.type === 0) {
      if (this.validateFormTypeZero()) {
        return false;
      }

      const changePoints = await API.changePoints(
        this.state.client.id,
        1,
        this.state.points,
        this.state.amount,
        this.state.billNumber,
      );
      console.log('>> change points ', changePoints);
      if (changePoints) {
        this.clearState();
        Toast.show(Lang.successfulOperation);
      }
    } else {
      if (this.validateFormTypeOne()) {
        return false;
      }

      if (this.state.pointsChange > this.state.pointUser) {
        return Toast.show('No posee suficientes puntos');
      }

      if (this.state.difference < 0) {
        return Toast.show('El canje es Mayor al monto de la Factura');
      }

      if (
        this.state.pointsChange <= this.state.pointUser &&
        this.state.difference >= 0
      ) {
        const changePoints = await API.changePoints(
          this.state.client.id,
          0,
          this.state.pointsChange,
          this.state.amount,
          this.state.billNumber,
        );
        console.log('>> change points ', changePoints);
        if (changePoints) {
          this.clearState();
          Toast.show(Lang.successfulOperation);
        }
      } else {
        Toast.show('Verifique los datos');
      }
    }
  };

  clearState = () =>
    this.setState({
      pointUser: null,
      client: null,
      rode: 0,
      points: null,
      redemption: 0,
      pointsChange: 0,
      billNumber: 0,
      usd: null,
    });

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.onPressValidatorChange}
          style={styles.toggleButtonTouchable}>
          <View style={styles.toggleButtonContainer}>
            <Text style={styles.toggleButtonText}>
              {this.props.labelButton}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{flexDirection: 'row'}}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'flex-end',
              width: '50%',
            }}>
            {this.props.items.map(item => {
              return (
                <Text key={item} style={styles.text}>
                  {item}
                </Text>
              );
            })}
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '50%',
            }}>
            <SelectPicker
              data={this.state.clients}
              default={'Clientes'}
              keyText="nick"
              selectStyle={styles.input}
              value={this.state.client}
              onChangeValue={async client => {
                this.state.form.id = client.id;
                this.setState({client, form: this.state.form});
                if (this.props.rangePoints.type === 1) {
                  const response = await API.getPointsUser(client.id);
                  if (response) {
                    this.setState({pointUser: response.points});
                  }
                }
              }}
            />
            {this.props.rangePoints.type !== 0 && (
              <TextInput
                style={styles.textInput}
                keyboardType={'numeric'}
                onChangeText={text => {
                  this.setState({billNumber: text});
                }}
                value={this.state.billNumber + ''}
              />
            )}
            <TextInput
              style={styles.textInput}
              keyboardType={'numeric'}
              onChangeText={text => {
                this.props.rangePoints.type === 0
                  ? this.setState({billNumber: text})
                  : this.setState({
                      rode: text,
                      difference: parseFloat(
                        text -
                          Math.floor(
                            parseFloat(
                              this.state.pointsChange * this.state.amount,
                            ),
                          ),
                      ).toFixed(2),
                    });
              }}
              value={
                this.props.rangePoints.type === 0
                  ? this.state.billNumber + ''
                  : this.state.rode + ''
              }
            />
            {this.props.rangePoints.type === 0 ? null : (
              <Text style={{...styles.textInput, paddingHorizontal: 5}}>
                {this.state.pointUser ? this.state.pointUser + ' Pts.' : null}
              </Text>
            )}
            <TextInput
              style={styles.textInput}
              keyboardType={'numeric'}
              value={
                this.props.rangePoints.type === 0
                  ? this.state.rode + ''
                  : this.state.pointsChange + ''
              }
              onChangeText={text => {
                text = text.replace(',', '.');
                this.props.rangePoints.type === 0
                  ? this.setState({
                      rode: text,
                      points: Math.floor(
                        parseFloat(
                          (this.state.rangePoints / this.state.amount) * text,
                        ).toFixed(1),
                      ),
                    })
                  : this.setState({
                      pointsChange: text,
                      usd: Math.floor(parseFloat(text * this.state.amount)),
                      difference: parseFloat(
                        this.state.rode -
                          Math.floor(parseFloat(text * this.state.amount)),
                      ).toFixed(2),
                    });
              }}
            />
            <Text style={{...styles.textInput, paddingHorizontal: 5}}>
              {this.props.rangePoints.type === 0
                ? this.state.points
                : this.state.usd
                ? this.state.usd + '$'
                : null}
            </Text>
            {this.props.rangePoints.type === 0 ? null : (
              <Text style={{...styles.textInput, paddingHorizontal: 5}}>
                {Math.sign(this.state.difference) !== -1 &&
                this.state.pointsChange &&
                this.state.usd &&
                this.state.rode
                  ? this.state.difference + '$'
                  : null}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={this.submit}>
          <View style={styles.submitButtonContainer}>
            <Text style={styles.submitButtonText}>{Lang.load}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: ITEM_HEIGHT,
    paddingHorizontal: 5,
    elevation: 5,
    backgroundColor: Colors.white,
    textAlignVertical: 'center',
    width: 150,
  },
  container: {
    width: '100%',
    backgroundColor: '#c2c2c2',
    alignItems: 'center',
    paddingVertical: 10,
  },
  text: {
    marginEnd: 5,
    height: ITEM_HEIGHT,
    textAlignVertical: 'center',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  textInput: {
    marginTop: 5,
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: 'white',
    fontSize: 12,
    paddingVertical: -5,
  },
  textButton: {
    textAlign: 'center',
    height: BUTTON_HEIGHT,
    paddingHorizontal: 7,
    textAlignVertical: 'center',
    width: '80%',
    borderRadius: 20,
    fontWeight: 'bold',
    borderWidth: 0.2,
    elevation: 10,
  },
  submitText: {
    textAlign: 'center',
    height: BUTTON_HEIGHT,
    paddingHorizontal: 7,
    textAlignVertical: 'center',
    width: '30%',
    borderRadius: 20,
    borderWidth: 0.2,
    elevation: 10,
    backgroundColor: Colors.primary,
    color: 'white',
    marginTop: 10,
  },
  buttonContainer: {
    borderWidth: 0.2,
    elevation: 10,
    marginTop: 10,
    backgroundColor: '#c2c2c2',
    borderRadius: 20,
    width: '80%',
    flexDirection: 'row',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  toggleButtonTouchable: {
    width: '100%',
  },
  toggleButtonContainer: {
    borderWidth: 0.2,
    elevation: 10,
    marginBottom: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    marginHorizontal: '10%',
    flexDirection: 'row',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  toggleButtonText: {
    textAlign: 'center',
    paddingHorizontal: 7,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: 'white',
    overflow: 'hidden',
  },
  submitButtonContainer: {
    backgroundColor: Colors.primary,
    height: BUTTON_HEIGHT,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 0.2,
    elevation: 10,
    flexDirection: 'row',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    alignSelf: 'center',
  },
});

export default BillingItem;
