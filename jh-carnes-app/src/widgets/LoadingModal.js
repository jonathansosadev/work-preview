import React, {Component} from 'react';
import {Modal, View, Text, ActivityIndicator, StyleSheet} from 'react-native';

class LoadingModal extends Component {
  state = {
    visible: false,
    text: '',
  };

  show = text => this.setState({visible: true, text});
  dismiss = () => setTimeout(() => this.setState({visible: false}), 600);
  setText = text => this.setState({text});

  render() {
    if (!this.state.visible) {
      return null;
    }

    return (
      <Modal
        animationType="fade"
        transparent
        visible={this.state.visible}
        hideModalContentWhileAnimating
        useNativeDriver>
        <View style={style.container}>
          <View style={style.card}>
            <View style={{flex: 1}} />
            <ActivityIndicator />
            <View style={{flex: 1}} />
            <Text>{this.state.text}</Text>
            <View style={{flex: 1}} />
          </View>
        </View>
      </Modal>
    );
  }
}

const style = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.17)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    width: 100,
    height: 100,
    borderRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
});

export default LoadingModal;
