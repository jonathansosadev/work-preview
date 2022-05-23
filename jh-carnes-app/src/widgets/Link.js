import React, {useCallback} from 'react';
import {Linking, StyleSheet, Text} from 'react-native';
import Colors from '../assets/colors';

export const Link = ({scheme, rest}) => {
  const openLink = useCallback(() => {
    Linking.openURL(`${scheme}:${rest}`);
  }, [scheme, rest]);

  return (
    <Text style={styles.link} onPress={openLink}>
      {rest}
    </Text>
  );
};

const styles = StyleSheet.create({
  link: {
    color: Colors.primary,
    fontSize: 12,
  },
});
