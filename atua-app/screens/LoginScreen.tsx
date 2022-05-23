import React, { useState } from 'react';
import { StyleSheet, Image, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '../components/Themed';
import Toast from 'react-native-toast-message';
import LoginUseCase from '../helpers/uses_cases/login';
import { AuthSession } from '../helpers/utils/auth_session';

export default function LoginScreen({ navigation }: any) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  let login = async (email: any, password: any) => {

    let authSession: AuthSession = AuthSession.getInstance();
    let loginUseCase: LoginUseCase = new LoginUseCase();

    try {
      await loginUseCase.call({ username: email, password: password });
      Toast.show({
        type: 'success',
        text1: 'Inicio de sesión exitoso',
        text2: `Disfruta de la experiencia ATUA`,
        visibilityTime: 2000
      });

      setTimeout(function () { navigation.navigate('TabThreeScreen'); }, 2100);

    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: e.exceptionTitle,
        text2: e.exceptionDescription
      });
    }
  }

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <View style={{ width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
        <View style={{ height: 50 }}>
        </View>
        <View style={{ flexDirection: 'row', width: '90%', height: 200, backgroundColor: '#593cfb', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <View style={{ width: '60%', height: 200, backgroundColor: '#593cfb', borderTopLeftRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../assets/images/login.png')} resizeMode={'contain'} style={{ width: '110%', height: '130%' }}>
            </Image>
          </View>
          <View style={{ width: '40%', height: 200, backgroundColor: '#593cfb', borderTopLeftRadius: 10, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 10 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: 'white', }}>Que en tus vacaciones trabaje tu auto</Text>
          </View>
        </View>
        <View style={{ width: '90%', height: 330, backgroundColor: '#e0e0e0', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
          <View style={{ width: '100%', height: 65, paddingLeft: 20, backgroundColor: 'transparent' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', }}>Ingresar</Text>
            <Text style={{ fontSize: 18 }}>Complete todos los campos</Text>
          </View>
          <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 65, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
            <TextInput
              style={{ width: '100%', height: 40, backgroundColor: 'white', borderRadius: 5, paddingLeft: 5, color: 'black' }}
              placeholder={'Correo electrónico'}
              selectionColor={'#593cfb'}
              underlineColorAndroid={'transparent'}
              onChangeText={(data: any) => {
                setEmail(data);
              }}
            >
            </TextInput>
          </View>
          <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 65, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
            <TextInput
              style={{ width: '100%', height: 40, backgroundColor: 'white', borderRadius: 5, paddingLeft: 5, color: 'black' }}
              placeholder={'PIN'}
              selectionColor={'#593cfb'}
              secureTextEntry={true}
              underlineColorAndroid={'transparent'}
              onChangeText={(data: any) => {
                setPassword(data);
              }}
            >
            </TextInput>
          </View>
          <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 65, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
            <Text style={{ color: '#593CFB' }}>
              status      No tengo usuario
            </Text>
            <View style={{ height: 10 }}></View>
            <Text style={{ color: '#707070' }}>
              Olvide mi contraseña
            </Text>
          </View>
          <View style={{ flexDirection: 'row', width: '100%', height: 60, marginTop: 10, backgroundColor: 'transparent' }}>
            <View style={{ flexDirection: 'row', width: '50%', height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
              <Ionicons name="ios-logo-google" size={24} color="#593cfb" />
              <Ionicons name="ios-logo-facebook" size={24} color="#593cfb" style={{ marginLeft: 10 }} />
              <Ionicons name="ios-logo-apple" size={24} color="#593cfb" style={{ marginLeft: 10 }} />
            </View>
            <View style={{ width: '50%', height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
              <Pressable
                style={({ pressed }) => [
                  {
                    height: 40, width: '80%', justifyContent: 'center', alignItems: 'center',
                    backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : '#593cfb'
                  }
                ]}
                onPress={() => {
                  login(email, password)
                }}
              >
                <Text style={{ color: 'white' }}>Ingresar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      <View style={{ height: 100 }}>
      </View>
      <Toast
        ref={(ref) => Toast.setRef(ref)}
        position={'bottom'}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
