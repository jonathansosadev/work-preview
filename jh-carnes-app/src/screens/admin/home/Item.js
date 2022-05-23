import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import Colors from '../../../assets/colors';

const ITEM_HEIGHT = 35;

const Item = props => {
  return (
    <View style={style.container}>
      <TouchableWithoutFeedback
        onPress={() => (props.onPress ? props.onPress(props.item) : null)}>
        <View style={style.content}>
          <View style={style.iconContainer}>
            <Image
              style={style.icon}
              source={props.item.src}
              resizeMode="cover"
            />
          </View>

          <Text style={style.text}>{props.item.text}</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 7,
  },
  content: {
    width: '80%',
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    width: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  text: {
    flex: 1,
    color: 'white',
    borderLeftWidth: 0.5,
    borderLeftColor: Colors.accent,
    paddingHorizontal: 7,
    alignSelf: 'center',
  },
});

export default Item;
