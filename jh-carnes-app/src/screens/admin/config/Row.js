import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import Colors from '../../../assets/colors';
import Strings from '../../../assets/lang';
import {DatePicker} from '../../../widgets/NewDatePicker';
import SelectPicker from '../../../widgets/SelectPicker';

const STATUS_VALUES = [
  {value: 0, text: Strings.close},
  {value: 1, text: Strings.open},
];

class Row extends Component {
  state = {
    showTimePickerStart: false,
    showTimePickerEnd: false,
  };

  getStatusValue = () =>
    STATUS_VALUES.find(it => it.value === this.props.item.open);

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.verticalAlignContainer}>
          <Text style={styles.label} numberOfLines={1}>
            {Strings.days[this.props.item ? this.props.item.day - 1 : 0]}
          </Text>
        </View>
        <DatePicker
          value={this.props.item.start}
          onChange={date => {
            this.props.item.start = date;

            if (this.props.onChange) {
              this.props.onChange(this.props.item);
            }
          }}
        />
        <DatePicker
          value={this.props.item.end}
          onChange={date => {
            this.props.item.end = date;

            if (this.props.onChange) {
              this.props.onChange(this.props.item);
            }
          }}
        />
        <TextInput
          style={styles.input}
          value={this.props.item ? this.props.item.quantity.toString() : '0'}
          onChangeText={quantity => {
            quantity = parseInt(quantity, 10);
            quantity = isNaN(quantity) ? 0 : quantity;
            this.props.item.quantity = quantity;

            if (this.props.onChange) {
              this.props.onChange(this.props.item);
            }
          }}
          keyboardType="numeric"
        />
        <SelectPicker
          containerStyle={styles.statusContainer}
          selectStyle={styles.statusSelect}
          data={STATUS_VALUES}
          keyText="text"
          value={this.getStatusValue()}
          onChangeValue={open => {
            this.props.item.open = open.value;

            if (this.props.onChange) {
              this.props.onChange(this.props.item);
            }
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderColor: Colors.primary,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    width: '100%',
    height: 30,
  },
  label: {
    paddingHorizontal: 5,
    fontSize: 10.5,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.gray,
    height: '100%',
    padding: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    minWidth: 50,
    borderColor: 'white',
    fontSize: 10.5,
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },
  statusContainer: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  statusSelect: {
    fontSize: 10.5,
  },
  verticalAlignContainer: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Row;
