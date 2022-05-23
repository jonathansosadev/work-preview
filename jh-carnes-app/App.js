import {GoogleSignin} from '@react-native-community/google-signin';
import React, {Component} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SplashScreen from 'react-native-splash-screen';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Navigation from './src/navigation/main';
import {persistor, store} from './src/store/store';
import {ENV as Environment} from './src/utils';
import ConfirmDialog from './src/utils/ConfirmDialog';
import LoadingModal from './src/utils/LoadingModal';
import Confirm from './src/widgets/ConfirmDialog';
import Loading from './src/widgets/LoadingModal';

const styles = StyleSheet.create({
  full: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
});

GoogleSignin.configure({
  iosClientId: Environment._google.client_id,
  forceConsentPrompt: true,
});

class App extends Component {
  componentDidMount() {
    SplashScreen.hide();
    StatusBar.setHidden(true);
    console.disableYellowBox = true;
    // eslint-disable-next-line no-undef
    GLOBAL.XMLHttpRequest =
      // eslint-disable-next-line no-undef
      GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaView style={styles.full}>
            {Platform.OS == 'ios' ? (
              <KeyboardAvoidingView
                style={styles.full}
                behavior="padding"
                enabled>
                <Navigation />
              </KeyboardAvoidingView>
            ) : (
              <KeyboardAwareScrollView
                contentContainerStyle={styles.full}
                enableOnAndroid={true}>
                <Navigation />
              </KeyboardAwareScrollView>
            )}
          </SafeAreaView>
          <Loading ref={modal => (LoadingModal.loading = modal)} />
          <Confirm ref={confirm => (ConfirmDialog.confirmDialog = confirm)} />
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
