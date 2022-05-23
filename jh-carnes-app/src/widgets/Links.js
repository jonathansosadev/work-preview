import React, {useCallback} from 'react';
import {Alert, Linking, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Colors from '../assets/colors';
import Strings from '../assets/lang';
import {ENV as Environment} from '../utils';

export const PrivacyPolicyLink = createLink(
  'privacy_policy',
  Strings.openPrivacyPolicy,
);

export const TermsAndConditionsLink = createLink(
  'terms_and_conditions',
  Strings.openTermsAndConditions,
);

function createLink(name, text) {
  return ({style, ...rest}) => {
    const doOpenLink = useCallback(() => openLink(name), []);

    return (
      <TouchableOpacity onPress={doOpenLink}>
        <Text style={[styles.text, style]} {...rest}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  };
}

const openLink = name => {
  getLink(name)
    .then(url => Linking.openURL(url))
    .catch(err => {
      console.log('PrivacyPolicyLink: openLink:', err);
      Alert.alert('Alerta', 'Ha ocurrido un error');
    });
};

const getLink = name =>
  new Promise((resolve, reject) => {
    fetch(`${Environment.BASE_API}links?name=${name}`)
      .then(resp => {
        if (!resp.ok) {
          reject(resp.statusText);
        }

        return resp.text();
      })
      .then(resolve)
      .catch(reject);
  });

const styles = StyleSheet.create({
  text: {
    color: Colors.primary,
    padding: 8,
    textAlign: 'center',
  },
});
