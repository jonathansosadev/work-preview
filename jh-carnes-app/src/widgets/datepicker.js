import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import RNDatePicker from 'react-native-datepicker';
import Colors from '../utils/colors';

const DatePicker = props => {
  return (
    <View style={[styles.container, props.style]}>
      {props.label && (
        <Text style={[styles.label, props.labelStyle]}>{props.label}</Text>
      )}
      <View
        style={[
          styles.viewContainer,
          props.noBorder ? null : styles.border,
          props.containerStyle,
          props.borderColor
            ? {
                borderColor: props.borderColor,
              }
            : styles.borderColor,
        ]}>
        {props.placeholder && !props.value && (
          <Text numberOfLines={1} style={styles.placeholderCustom}>
            {props.placeholder}
          </Text>
        )}
        <RNDatePicker
          androidMode="spinner"
          locale="es"
          disabled={props.disable}
          placeholder={props.placeholder ? props.placeholder : null}
          format={props.format ? props.format : 'DD/MM/YYYY'}
          date={props.value ? props.value : null}
          onDateChange={e => {
            props.onChange({
              nativeEvent: {
                text: e,
              },
            });
          }}
          confirmBtnText="Aceptar"
          cancelBtnText="Cancelar"
          showIcon={false}
          minDate={props.minDate}
          maxDate={props.maxDate}
          customStyles={{
            dateInput: styles.input,
            placeholderText: styles.placeholder,
            dateText: styles.text,
            dateTouchBody: styles.touchBody,
            disabled: styles.disabled,
          }}
          iconComponent={props.iconComponent}
          style={styles.inputContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
  },
  input: {
    alignItems: 'flex-start',
    paddingHorizontal: 5,
    borderColor: Colors.gray2,
    backgroundColor: Colors.gray,
    height: 29.3,
  },
  text: {
    fontSize: 14,
  },
  placeholder: {
    fontSize: 14,
    color: Colors.black,
    opacity: 0,
  },
  inputContainer: {
    width: '100%',
    height: 29.3,
  },
  viewContainer: {
    backgroundColor: '#fff',
    width: '100%',
    height: 29.3,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
    textAlign: 'left',
    width: '100%',
    marginTop: 5,
  },
  placeholderCustom: {
    fontSize: 14,
    color: Colors.black,
    width: '100%',
  },
  disabled: {
    backgroundColor: '#fff',
  },
});

export default DatePicker;
