import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, TextInput, Pressable, CheckBox, Modal, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, View } from '../components/Themed';
import RegisterUseCase from '../helpers/uses_cases/register';
import { Picker } from '@react-native-picker/picker';
import GetCountriesUseCase from '../helpers/uses_cases/get_countries';
import { Countries, Country } from '../helpers/interfaces/countries_interface';
import Checkbox from 'expo-checkbox';

export default function RegisterScreen({ navigation }: any) {

  const [modalVisible, setModalVisible] = useState(false);

  // Hooks del formulario

  const [email, setEmail] = useState("");
  const [reEmail, setReEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<number>();
  const [isChecked, setChecked] = useState(false);

  // Hook para listar las ciudades
  const [countries, setCountries] = useState<Country[]>([]);



  useEffect(() => {
    console.log('DEV_LOG - Se ejecuta el useEffect');

    let documentTypeLoad = async () => {
      let getCountriesUseCase: GetCountriesUseCase = new GetCountriesUseCase();
      try {
        let countries: Countries = await getCountriesUseCase.call();
        setCountries(countries.data);

      } catch (e) {
        console.log('DEV_LOG - Error');
        console.log(e);
        console.warn(e);
      }
    }

    documentTypeLoad();
  }, []);


  const countryID = () => {
    const listItems = countries.map((element) =>
      <Picker.Item label={element.name} value={element.id} key={element.id} />
    );
    return (
      <View style={{ width: '100%', height: 40, backgroundColor: 'white', borderRadius: 5 }}>
        <Picker
          style={{ marginTop: 7 }}
          selectedValue={selectedCountry}
          onValueChange={(itemValue, itemIndex) =>
            setSelectedCountry(itemValue)
          }>
          <Picker.Item label="Seleccione su pais" value={countries.length + 1} />
          {listItems}
        </Picker>
      </View>
    );
  }

  let register = async () => {


    if (email.length != 0) {
      if (reEmail.length != 0) {
        if (email == reEmail) {
          if (password.length == 4) {
            if (selectedCountry! >= countries.length) {
              if (isChecked) {
                setModalVisible(true);
                // navigation.navigate("SMSScreen")
                let registerUseCase: RegisterUseCase = new RegisterUseCase();
                registerUseCase.call({
                  email: email,
                  pin: password,
                  is_terms_accepted: isChecked,
                  country: selectedCountry
                }).then((response) => {
                  setModalVisible(false);
                  navigation.navigate('LoginScreen');
                }).catch((error) => {
                  setModalVisible(false);
                  Toast.show({
                    type: 'error',
                    text1: error.exceptionTitle,
                    text2: error.exceptionDescription
                  });
                });
              }
              else {
                Toast.show({
                  type: 'error',
                  text1: 'Terminos y Condiciones',
                  text2: 'Debe aceptar los terminos y condiciones'
                });
              }

            } else {
              Toast.show({
                type: 'error',
                text1: 'Seleccione un país',
                text2: 'Seleccione un país de la lista'
              });
            }
          } else {
            Toast.show({
              type: 'error',
              text1: 'PIN invalido',
              text2: 'El PIN debe contener 4 digitos'
            });
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Emails diferentes',
            text2: 'Los dos correos escritos no coinciden'
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Repetir email vacío',
          text2: 'Por favor rescriba el correo'
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Email vacío',
        text2: 'El correo no puede estar en blanco'
      });
    }
  }

  return (

    <View>
      <ScrollView>
        <View style={{ height: 10, width: '100%' }}>
        </View>
        <View style={{ width: '100%', height: 640, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', width: '90%', height: 180, backgroundColor: '#593cfb', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <View style={{ width: '60%', height: 180, backgroundColor: '#593cfb', borderTopLeftRadius: 10 }}>
              <Image source={require('../assets/images/register.png')} resizeMode={'contain'} style={{ width: '100%', height: '100%' }}>
              </Image>
            </View>
            <View style={{ width: '40%', height: 180, backgroundColor: '#593cfb', borderTopLeftRadius: 10, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 10 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: 'white' }}>Que en tus vacaciones trabaje tu auto</Text>
            </View>
          </View>
          <View style={{ width: '90%', height: 440, backgroundColor: '#e0e0e0', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
            <View style={{ width: '100%', height: 65, paddingLeft: 20, backgroundColor: 'transparent' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', }}>Registrarse</Text>
              <Text style={{ fontSize: 18 }}>Complete todos los campos</Text>
            </View>
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 65, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
              <TextInput
                style={{ width: '100%', height: 40, backgroundColor: 'white', borderRadius: 5, paddingLeft: 5, color: 'black' }}
                placeholder={'Email'}
                selectionColor={'#593cfb'}
                underlineColorAndroid={'transparent'}
                onChangeText={(data: any) => {
                  setEmail(data);
                }}
                maxLength={50}
              >
              </TextInput>
            </View>
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 65, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
              <TextInput
                style={{ width: '100%', height: 40, backgroundColor: 'white', borderRadius: 5, paddingLeft: 5, color: 'black' }}
                placeholder={'Repetir email'}
                selectionColor={'#593cfb'}
                underlineColorAndroid={'transparent'}
                onChangeText={(data: any) => {
                  setReEmail(data);
                }}
                maxLength={50}
              >
              </TextInput>
            </View>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 65, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
              <TextInput
                style={{ width: '100%', height: 40, backgroundColor: 'white', borderRadius: 5, paddingLeft: 5, color: 'black' }}
                placeholder={'PIN'}
                selectionColor={'#593cfb'}
                underlineColorAndroid={'transparent'}
                onChangeText={(data: any) => {
                  setPassword(data);
                }}
                secureTextEntry={true}
                autoCapitalize={'none'}
                keyboardType='numeric'
                maxLength={4}
              >
              </TextInput>
            </View>
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 65, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
              {countryID()}
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: 'transparent', paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' }}>
              <Checkbox
                // style={styles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? '#593cfb' : undefined}
              />
              <Text style={{ color: "#593dfb", fontSize: 16 }}>Aceptar contrato</Text>
            </View>
            <View style={{ flexDirection: 'row', width: '100%', height: 60, marginTop: 10, backgroundColor: 'transparent' }}>
              <View style={{ width: '100%', height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                <Pressable
                  style={({ pressed }) => [
                    {
                      height: 40, width: '80%', justifyContent: 'center', alignItems: 'center',
                      backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : '#593cfb'
                    }
                  ]}
                  onPress={() => {
                    register()
                  }}
                >
                  <Text style={{ color: 'white' }}>Ingresar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        <View style={{ height: 50, width: '100%' }}>
        </View>
        <Toast
          ref={(ref) => Toast.setRef(ref)}
          position={'bottom'}
        />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => { }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#593dfb" />
          <Text>Registrado Usuario</Text>
          <Text>Por favor espere…</Text>
        </View>
      </Modal>
    </View>
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
