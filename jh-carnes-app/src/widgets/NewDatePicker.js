import React from 'react';
import {StyleSheet} from 'react-native';
import RNDatePicker from 'react-native-datepicker';
import Strings from '../assets/lang';

export const DatePicker = ({
  value,
  onChange,
  style,
  dateInputStyle = {},
  dateTextStyle = {},
}) => (
  <RNDatePicker
    style={[styles.container, style]}
    date={value}
    mode="time"
    showIcon={false}
    is24Hour
    format="HH:mm"
    confirmBtnText={Strings.accept}
    cancelBtnText={Strings.cancel}
    onDateChange={onChange}
    customStyles={{
      dateInput: {
        borderWidth: 0,
        height: undefined,
        ...dateInputStyle,
      },
      dateText: {
        color: 'black',
        fontSize: 11,
        alignSelf: 'center',
        ...dateTextStyle,
      },
      dateTouchBody: {
        flex: 1,
      },
    }}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
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
});
