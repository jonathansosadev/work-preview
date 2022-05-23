import React, {Component} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Colors from '../../../assets/colors';
import Strings from '../../../assets/lang';
import Globals from '../../../utils/G';
import {Link} from '../../../widgets/Link';

class ItemReservation extends Component {
  onPressValidator = () => this.props.onPressValidator(this.props.item);

  render() {
    return this.props.item.user && this.props.item.schedule ? (
      <View style={styles.contentItem}>
        <View style={styles.contentImage}>
          <Image
            source={require('../../../assets/imgs/logo.png')}
            style={{width: 90, height: 90}}
          />
        </View>
        <View style={styles.contentText}>
          <View style={styles.viewPerson}>
            <View style={{flex: 1}}>
              <Text style={[styles.textPerson, {justifySelf: 'center'}]}>
                {this.props.item.user.person.name +
                  ' ' +
                  this.props.item.user.person.lastname}
              </Text>
            </View>
            <Text style={styles.id}>#{this.props.item.id}</Text>
            {this.props.item.status === 1 ? (
              <TouchableWithoutFeedback onPress={this.onPressValidator}>
                <View style={{...styles.viewAvailable}} />
              </TouchableWithoutFeedback>
            ) : (
              <View style={{...styles.viewNoAvailable}} />
            )}
          </View>
          <View style={styles.view}>
            <Text style={styles.textSize14}>{Strings.phone + ':'}</Text>
            <Link scheme="tel" rest={this.props.item.user.person.phone} />
          </View>
          <View style={styles.view}>
            <Text style={styles.textSize14}>{Strings['e-mail']}</Text>
            <Link scheme="mailto" rest={this.props.item.user.email} />
          </View>
          <View style={styles.view}>
            <Text style={styles.textSize14}>
              {Strings.dateOfRecervation + ':'}
            </Text>
            <Text style={styles.textSize12}>
              {Globals.dateFormat(this.props.item.date)}
            </Text>
          </View>
          <View style={styles.view}>
            <Text style={styles.textSize14}>
              {Strings.reservationTime + ':'}
            </Text>
            <Text style={styles.textSize12}>
              {Globals.timeFormat(this.props.item.date)}
            </Text>
          </View>
          <View style={styles.view}>
            <Text style={styles.textSize14}>{Strings.numberPeople + ':'}</Text>
            <Text style={styles.textSize12}>{this.props.item.quantity}</Text>
          </View>
        </View>
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  contentItem: {
    width: '100%',
    borderRadius: 10,
    opacity: 0.8,
    elevation: 5,
    backgroundColor: 'white',
    flexDirection: 'row',
    marginTop: 10,
    paddingVertical: 10,
  },
  contentImage: {
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    height: '100%',
    width: '75%',
    paddingHorizontal: 10,
    color: Colors.primary,
  },
  viewPerson: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textPerson: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  viewAvailable: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#40f588',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewNoAvailable: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  view: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textSize12: {
    fontSize: 12,
    color: 'gray',
  },
  textSize14: {
    fontSize: 14,
    marginEnd: 2,
  },
  id: {
    paddingHorizontal: 8,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});

export default ItemReservation;
