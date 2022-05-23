import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, TextInput, Pressable } from 'react-native';
import { Text, View } from '../components/Themed';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GetCitiesUseCase from '../helpers/uses_cases/get_cities';
import { Cities, City } from '../helpers/interfaces/cities_interface';

export default function RegisterCarScreenTwo({ navigation }: any) {

    // Hooks del formulario
    const [zipCode, setZipCode] = useState("");
    const [streetName, setStreetName] = useState("");
    const [streetNumber, setStreetNumber] = useState("");
    const [cities, setCities] = useState<City[]>([]);
    const [citySelected, setCitySelected] = useState<number>();
    const [description, setDescription] = useState("");


    useEffect(() => {
        console.log('DEV_LOG - Se ejecuta el useEffect');

        let getCities = async () => {
            let getCitiesUseCase: GetCitiesUseCase = new GetCitiesUseCase();
            try {

                let cities: Cities = await getCitiesUseCase.call();
                setCities(cities.data);

            } catch (e) {
                console.log('DEV_LOG - Error');
                console.log(e);
                console.warn(e);
            }
        }

        getCities();
    }, []);




    let saveStepTwo = () => {

        let stepTwo = {
            zipCode: zipCode,
            streetName: streetName,
            streetNumber: streetNumber,
            citySelected: citySelected,
            description: description,
        }

        AsyncStorage.setItem('stepTwoCarRegister', JSON.stringify(stepTwo)).then( () => {
            navigation.navigate('RegisterCarScreenThree');

            // Prueba de lectura de lo guardado
            // AsyncStorage.getItem('stepTwoCarRegister').then( (result) => {
            //     console.log(result)
            // }).catch( (error) => {
            //     console.log(error)
            // })

        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }}>
                <Text style={{ textAlign: 'center', fontSize: 30, fontWeight: 'bold', marginVertical: 20 }}>Suma tu coche a ATUA</Text>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <View style={{ width: '90%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginBottom: 20 }}>
                        <Text style={{ textAlign: 'center', fontSize: 24, marginVertical: 20, color: '#969696' }}>¿Dónde se encuentra tu coche?</Text>
                        <Image source={require('../assets/images/paso2.png')} style={{ height: 200, width: 300 }} resizeMode={'contain'} >
                        </Image>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <TextInput
                                style={{ width: '100%', height: 40, backgroundColor: '#e2e2e2', borderRadius: 5, paddingLeft: 5, color: 'black' }}
                                placeholder={'Código postal'}
                                selectionColor={'#593cfb'}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(data: any) => {
                                    setZipCode(data);
                                }}
                                keyboardType={'phone-pad'}
                                maxLength={12}
                            >
                            </TextInput>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <TextInput
                                style={{ width: '100%', height: 40, backgroundColor: '#e2e2e2', borderRadius: 5, paddingLeft: 5, color: 'black' }}
                                placeholder={'Nombre de calle'}
                                selectionColor={'#593cfb'}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(data: any) => {
                                    setStreetName(data);
                                }}
                                maxLength={12}
                            >
                            </TextInput>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <TextInput
                                style={{ width: '100%', height: 40, backgroundColor: '#e2e2e2', borderRadius: 5, paddingLeft: 5, color: 'black' }}
                                placeholder={'Numero de calle'}
                                selectionColor={'#593cfb'}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(data: any) => {
                                    setStreetNumber(data);
                                }}
                                keyboardType={'phone-pad'}
                                maxLength={6}
                            >
                            </TextInput>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <View style={{ width: '100%', height: 40, backgroundColor: '#e2e2e2', borderRadius: 5 }}>
                                <Picker
                                    style={{ marginTop: 7 }}
                                    selectedValue={0}
                                    onValueChange={(itemValue, itemIndex) =>
                                        setCitySelected(itemValue)
                                    }>
                                    <Picker.Item label="Seleccione su ciudad" value={0} />
                                    {cities.map((element) =>
                                        <Picker.Item label={element.name} value={element.id} key={element.id} />
                                    )}
                                </Picker>
                            </View>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <TextInput
                                style={{ width: '100%', height: 40, backgroundColor: '#e2e2e2', borderRadius: 5, paddingLeft: 5, color: 'black' }}
                                placeholder={'Descripción'}
                                selectionColor={'#593cfb'}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(data: any) => {
                                    setDescription(data);
                                }}
                                maxLength={240}
                            >
                            </TextInput>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                {
                                    height: 40, width: '90%', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20,
                                    backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : '#593cfb'
                                }
                            ]}
                            onPress={() => {
                                saveStepTwo()
                            }}
                        >
                            <Text style={{ color: 'white' }}>Siguiente</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
