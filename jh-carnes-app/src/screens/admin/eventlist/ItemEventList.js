import React, {Component, useState, useCallback} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Colors from '../../../assets/colors';
import Strings from '../../../assets/lang';
import Globals from '../../../utils/G';
import {Link} from '../../../widgets/Link';
import {TouchableOpacity} from 'react-native-gesture-handler';
import dropDown from '../../../assets/icons/drop-down.png';
import dropUp from '../../../assets/icons/drop-up.png';

class ItemEventList extends Component {
  onPressCancel = () => this.props.onPressCancel(this.props.item);

  render() {
    return this.props.item.schedule && this.props.item.food ? (
      <View style={styles.card}>
        <View style={styles.contentItem}>
          <View style={styles.viewImage}>
            <Image
              source={require('../../../assets/imgs/logo.png')}
              style={{width: 80, height: 80}}
            />
          </View>
          <View style={{...styles.viewContentText}}>
            <View style={{...styles.viewText}}>
              <View style={{width: '80%'}}>
                <Text
                  style={{
                    color: Colors.primary,
                    justifySelf: 'center',
                    fontWeight: 'bold',
                  }}>
                  {this.props.item.name + ' ' + this.props.item.lastname}
                </Text>
              </View>
            </View>
            <View style={{...styles.viewText}}>
              <Text style={{...styles.textSize14}}>{'Tipo de servicio:'}</Text>
              <Text style={{...styles.textSize12}}>
                {this.props.item.food.name}
              </Text>
            </View>
            <View style={{...styles.viewText}}>
              <Text style={{...styles.textSize14}}>{Strings.date + ':'}</Text>
              <Text style={{...styles.textSize12}}>
                {Globals.dateFormat(this.props.item.date)}
              </Text>
            </View>
            <View style={{...styles.viewText}}>
              <Text style={{...styles.textSize14}}>{'Hora:'}</Text>
              <Text style={{...styles.textSize12}}>
                {Globals.timeFormat(this.props.item.date)}
              </Text>
            </View>
            <View style={{...styles.viewText}}>
              <Text style={{...styles.textSize14}}>
                {Strings.numberPeople + ':'}
              </Text>
              <Text style={{...styles.textSize12}}>
                {this.props.item.quantity}
              </Text>
            </View>
            <View style={{...styles.viewText}}>
              <Text style={{...styles.textSize14}}>
                {Strings.address + ':'}
              </Text>
              <Text style={{...styles.textSize12}}>
                {this.props.item.address}
              </Text>
            </View>
            <View style={{...styles.viewText}}>
              <Text style={{...styles.textSize14}}>{Strings.phone + ':'}</Text>
              <Link scheme="tel" rest={this.props.item.phone} />
            </View>
            <View style={{...styles.viewText}}>
              <Text style={{...styles.textSize14}}>
                {Strings['e-mail'] + ':'}
              </Text>
              <Link scheme="mailto" rest={this.props.item.email} />
            </View>
            {this.props.item.status !== 0 ? (
              <View
                style={{
                  alignItems: 'flex-end',
                  width: '100%',
                  padding: 8,
                  paddingBottom: 0,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.primary,
                    fontWeight: 'bold',
                  }}
                  onPress={this.onPressCancel}>
                  {Strings.cancel}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  alignItems: 'flex-end',
                  width: '100%',
                  padding: 8,
                  paddingBottom: 0,
                }}>
                <Text style={{fontSize: 14, color: 'gray', fontWeight: 'bold'}}>
                  Cancelado
                </Text>
              </View>
            )}
          </View>
        </View>
        <Comment content={this.props.item.comment} />
      </View>
    ) : null;
  }
}

const Comment = ({content}) => {
  const [isOpen, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen]);

  if (!content) {
    return null;
  }

  return (
    <>
      <TouchableOpacity onPress={toggle}>
        <View style={styles.toggleComment}>
          <Text style={styles.toggleCommentText}>
            {isOpen ? 'Ocultar comentario' : 'Mostrar comentario'}
          </Text>
          <Image
            style={styles.toggleCommentIcon}
            source={isOpen ? dropUp : dropDown}
          />
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.comment}>
          <Text>{content}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 10,
    opacity: 0.8,
    elevation: 5,
    backgroundColor: 'white',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  contentItem: {
    flexDirection: 'row',
  },
  viewImage: {
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewContentText: {
    height: '100%',
    flex: 1,
    paddingVertical: 5,
    color: Colors.primary,
  },
  viewText: {
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
  toggleComment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  toggleCommentText: {
    color: Colors.primary,
    flex: 1,
  },
  toggleCommentIcon: {
    tintColor: Colors.primary,
    width: 24,
    height: 24,
  },
  comment: {
    padding: 8,
    paddingTop: 0,
  },
});

export default ItemEventList;
