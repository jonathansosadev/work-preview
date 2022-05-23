import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';
import {Platform} from 'react-native';
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from 'react-native-fbsdk';
import Environment from './env';

const FacebookLogin = () => {
  return new Promise(async (resolve, reject) => {
    LoginManager.setLoginBehavior(
      Platform.OS === 'ios' ? 'browser' : 'WEB_ONLY',
    );
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);
    if (result.isCancelled) {
      reject('Login cancelled');
    } else {
      const {accessToken} = await AccessToken.getCurrentAccessToken();
      const responseInfoCallback = (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      };
      const infoRequest = new GraphRequest(
        '/me',
        {
          accessToken,
          parameters: {
            fields: {
              string: 'email,first_name,last_name',
            },
          },
        },
        responseInfoCallback,
      );
      new GraphRequestManager().addRequest(infoRequest).start();
    }
  });
};

const FacebookLogout = async () => {
  try {
    await LoginManager.logOut();
  } catch (e) {
    console.log(e);
  }
};

const GoogleLogin = () => {
  return new Promise(async (resolve, reject) => {
    try {
      GoogleSignin.configure({
        iosClientId: Environment._google.client_id,
        forceConsentPrompt: true,
      });
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      resolve(userInfo);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Operation (e.g. sign in) is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.log('Some other error happened');
      }
      reject(error);
    }
  });
};

const GoogleLogout = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (e) {
    console.log(e);
  }
};

export default {
  Google: {
    Login: GoogleLogin,
    Logout: GoogleLogout,
  },
  Facebook: {
    Login: FacebookLogin,
    Logout: FacebookLogout,
  },
};
