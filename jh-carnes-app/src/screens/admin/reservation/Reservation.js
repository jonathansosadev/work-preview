import React, {Component} from 'react';
import {FlatList, Linking, StyleSheet, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {connect} from 'react-redux';
import Colors from '../../../assets/colors';
import Strings from '../../../assets/lang';
import API from '../../../utils/Api';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import Environment from '../../../utils/env';
import Item from './ItemReservation';

class Reservation extends Component {
  state = {
    reservations: [],
    reservationCount: this.calculateReservationCount(this.props.reservations),
  };

  componentDidMount() {
    API.getReservation().then(this.setReservations);
  }

  setReservations = reservations => {
    if (reservations) {
      this.props.dispatch({
        type: 'SET_RESERVATIONS',
        payload: reservations,
      });
    }

    this.setState({reservations});
  };

  deleteReservation = item =>
    ConfirmDialog.show({
      title: Strings.reservations,
      message: Strings.youWantToDeleteThisReservation,
    })
      .onNegativeButton(Strings.cancel)
      .onPositiveButton(Strings.delete, () => {
        API.deleteReservation(item.id)
          .then(() => {
            API.getReservation().then(this.setReservations);
          })
          .catch(error =>
            console.log('Reservations: deleteReservation:', error),
          );
      });

  render() {
    return (
      <View style={styles.listContainer}>
        <View style={styles.header}>
          <Text style={styles.textHeader}>{Strings.reservations}</Text>
        </View>
        {this.props.reservations.length > 0 ? (
          <FlatList
            style={styles.flatList}
            contentContainerStyle={styles.listContentContainer}
            data={this.props.reservations}
            keyExtractor={({id}) => id.toString()}
            renderItem={({item}) => (
              <Item item={item} onPressValidator={this.deleteReservation} />
            )}
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <TouchableOpacity onPress={this.export}>
                  <View style={styles.exportButton}>
                    <Text style={styles.exportButtonTitle}>Exportar</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.headerSeparator} />
                <View style={styles.reservationCountContainer}>
                  <Text>
                    Total de reservaciones: {this.state.reservationCount}
                  </Text>
                </View>
              </View>
            }
          />
        ) : (
          <Text style={styles.text}>{Strings.thereIsNoReservation}</Text>
        )}
      </View>
    );
  }

  export = () => Linking.openURL(`${Environment.BASE_API}reservations/export`);

  componentDidUpdate(prevProps) {
    if (this.props.reservations === prevProps.reservations) {
      return;
    }

    // eslint-disable-next-line react/no-did-update-set-state
    this.setState({
      reservationCount: this.calculateReservationCount(this.props.reservations),
    });
  }

  calculateReservationCount(reservations) {
    return (
      reservations?.reduce((soFar, {quantity}) => soFar + quantity, 0) ?? 0
    );
  }
}

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: '#E8DCDC',
    flex: 1,
  },
  listContentContainer: {
    padding: 10,
  },
  header: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flatList: {
    width: '100%',
  },
  text: {
    textAlignVertical: 'center',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    fontSize: 18,
  },
  exportButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 10,
  },
  exportButtonTitle: {
    color: 'white',
  },
  headerContainer: {
    alignItems: 'flex-end',
  },
  headerSeparator: {
    height: 8,
  },
  reservationCountContainer: {
    padding: 8,
    backgroundColor: 'white',
    opacity: 0.8,
    borderRadius: 10,

    // iOS shadows.
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Android shadows.
    elevation: 5,
  },
});

export default connect(state => ({
  reservations: state.reservations,
}))(Reservation);
