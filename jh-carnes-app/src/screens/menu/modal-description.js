import React, {useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import add from '../../assets/icons/add-one-to-dish.png';
import remove from '../../assets/icons/remove-one-from-dish.png';
import {Colors} from '../../utils';
import {Button as AppButton} from '../../widgets';

const QuantityButton = ({onPress, source}) => (
  <TouchableOpacity onPress={onPress}>
    <Image style={styles.quantityButtonIcon} source={source} />
  </TouchableOpacity>
);

const ModalDescription = ({onClose, onPressAdd, item: {name, description}}) => {
  const [quantity, setQuantity] = useState(0);

  return (
    <View style={[styles.container, styles.shadow]}>
      <View style={[styles.containerWhite, styles.shadow]}>
        <View style={styles.row}>
          <Button
            onPress={onClose}
            type="clear"
            icon={<Icon name="md-close" color={Colors.red} size={25} />}
          />
        </View>
        <Text style={styles.title}>{name}</Text>
        <ScrollView>
          <View>
            <Text style={styles.description}>{description}</Text>
          </View>
        </ScrollView>
        <View style={styles.quantity}>
          <QuantityButton
            onPress={() =>
              setQuantity(prevQuantity => Math.max(0, prevQuantity - 1))
            }
            source={remove}
          />
          <Text style={styles.quantityText}>{quantity}</Text>
          <QuantityButton
            onPress={() => setQuantity(prevQuantity => prevQuantity + 1)}
            source={add}
          />
        </View>
        <AppButton
          btnRed
          disabled={quantity < 1}
          onPress={() => {
            onPressAdd(quantity);
          }}
          title="Agregar"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  containerWhite: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
    padding: 20,
    paddingTop: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  title: {
    color: Colors.red,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
  },
  quantity: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  quantityButtonIcon: {
    height: 18,
    margin: 12,
    marginHorizontal: 24,
    width: 18,
  },
  quantityText: {
    fontSize: 16,
  },
});

export default ModalDescription;
