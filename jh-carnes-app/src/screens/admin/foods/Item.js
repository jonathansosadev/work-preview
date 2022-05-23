import React, {Component} from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback as RNTouchableWithoutFeedback,
  View,
} from 'react-native';
import {TouchableWithoutFeedback as RNGHTouchableWithoutFeedback} from 'react-native-gesture-handler';
import Colors from '../../../assets/colors';
import notAvailable from '../../../assets/icons/not_available.png';
import trash from '../../../assets/icons/trash.png';
import Environment from '../../../utils/env';
import Globals from '../../../utils/G';
import FastImage from 'react-native-fast-image';

// En Android solo funciona si el touchable viene de
// react-native-gesture-handler, y en iOS solo funciona si viene de
// react-native.
const TouchableWithoutFeedback =
  Platform.OS === 'android'
    ? RNGHTouchableWithoutFeedback
    : RNTouchableWithoutFeedback;

class Item extends Component {
  getImageSource = () => {
    try {
      if (this.props.item.images.length) {
        return {uri: Environment.BASE_URL + this.props.item.images[0].file};
      } else {
        return notAvailable;
      }
    } catch (ignored) {
      return notAvailable;
    }
  };

  onEdit = () => this.props.onEdit(this.props.item);
  onDelete = () => this.props.onDelete(this.props.item);

  render() {
    return (
      <View
        style={[
          styles.itemContainer,
          this.props.isActive ? styles.active : null,
        ]}>
        <TouchableWithoutFeedback
          onPress={this.onEdit}
          onLongPress={this.props.onReorder}>
          <FastImage style={styles.itemImage} source={this.getImageSource()} />
        </TouchableWithoutFeedback>
        <View style={{flex: 1}}>
          <TouchableWithoutFeedback
            style={{width: '100%'}}
            onPress={this.onEdit}>
            <View style={styles.itemContent}>
              <Text style={styles.title} numberOfLines={1}>
                {this.props.item.name}
              </Text>
              <Text style={styles.price} numberOfLines={1}>
                {Globals.formatMoney(this.props.item.price)}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {Platform.OS === 'android' ? (
          <TouchableWithoutFeedback
            onPress={this.onDelete}
            style={styles.deleteButtonTouchable}>
            <View style={styles.deleteButtonContainer}>
              <Image
                style={styles.deleteButton}
                source={trash}
                tintColor={'#00000088'}
              />
            </View>
          </TouchableWithoutFeedback>
        ) : (
          // TODO: UGLY HACK.
          <TouchableWithoutFeedback onPress={this.onDelete}>
            <View style={{height: '100%', justifyContent: 'center'}}>
              <Image
                style={{
                  alignSelf: 'center',
                  height: 24,
                  margin: 16,
                  tintColor: 'rgba(0, 0, 0, 0.5)',
                  width: 24,
                }}
                source={trash}
                tintColor={'#00000088'}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row',
    height: 88,
  },
  itemImage: {
    aspectRatio: 1.618,
    height: '100%',
  },
  itemContent: {
    height: '100%',
    width: '100%',
    padding: 8,
  },
  itemContentContainer: {
    height: '100%',
    width: '100%',
  },
  container: {
    marginVertical: 2,
    width: '100%',
    aspectRatio: 1.618,
  },
  titleContainer: {
    flexDirection: 'row',
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    paddingBottom: 5,
  },
  price: {
    color: Colors.primary,
    fontSize: 16,
  },
  deleteButtonTouchable: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  deleteButtonContainer: {
    height: 18,
    width: 18,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    tintColor: 'rgba(0, 0, 0, 0.54)',
  },
  active: {
    opacity: 0.5,
  },
});

export default Item;
