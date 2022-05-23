import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../../assets/colors';

const Touchable =
  Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

const Button = ({onPress, style, text}) => (
  <Touchable onPress={onPress}>
    <View style={styles.container}>
      <Text style={[styles.text, style]}>{text}</Text>
    </View>
  </Touchable>
);

const styles = StyleSheet.create({
  text: {
    color: Colors.white,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    elevation: 5,
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    margin: 6,
    padding: 6,
  },
});

export default Button;
