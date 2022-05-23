import React, {Component} from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import Colors from '../../../assets/colors';
import Strings from '../../../assets/lang';
import API from '../../../utils/Api';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import Environment from '../../../utils/env';
import Item from './ItemEventList';

class Events extends Component {
  state = {
    data: [],
    numberOfPeople: this.calculateNumberOfPeople(this.props.events),
  };

  async componentDidMount() {
    const catering = await API.getCatering();
    this.setCatering(catering);
  }

  setCatering = async Catering => {
    if (Catering) {
      this.props.dispatch({type: 'SET_EVENTS', payload: Catering});
    }

    this.setState({data: Catering});
  };

  onPressCancel = item => {
    ConfirmDialog.show({
      title: Strings.events,
      message: Strings.youWantToCancelThisEvent,
    })
      .onNegativeButton(Strings.cancel)
      .onPositiveButton(Strings.accept, async () => {
        await API.cancelCatering(item.id)
          .then(async () => {
            const catering = await API.getCatering();
            this.setCatering(catering);
          })
          .catch(error => console.log('Events: onPressCancel:', error));
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarText}>{Strings.cateringList}</Text>
        </View>
        {this.props.events.length > 0 ? (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={this.props.events}
            keyExtractor={({id}) => id.toString()}
            renderItem={({item}) => (
              <Item item={item} onPressCancel={this.onPressCancel} />
            )}
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <TouchableOpacity onPress={this.export}>
                  <View style={styles.exportButton}>
                    <Text style={styles.exportButtonTitle}>Exportar</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.headerSeparator} />
                <View style={styles.numberOfPeopleContainer}>
                  <Text>Total de personas: {this.state.numberOfPeople}</Text>
                </View>
              </View>
            }
          />
        ) : (
          <Text style={styles.emptyText}>{Strings.noEvents}</Text>
        )}
      </View>
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.events === prevProps.events) {
      return;
    }

    // eslint-disable-next-line react/no-did-update-set-state
    this.setState({
      numberOfPeople: this.calculateNumberOfPeople(this.props.events),
    });
  }

  calculateNumberOfPeople(caterings) {
    console.log(caterings);
    return caterings?.reduce((soFar, {quantity}) => soFar + quantity, 0) ?? 0;
  }

  export = () => Linking.openURL(`${Environment.BASE_API}catering/export`);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    width: '100%',
    backgroundColor: '#E8DCDC',
  },
  listContent: {
    padding: 10,
  },
  emptyText: {
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
  numberOfPeopleContainer: {
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

export default connect(status => ({
  events: status.events,
}))(Events);
