import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, Pressable, Button } from 'react-native';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterCarScreenSix({ navigation }: any) {

    // Hooks del formulario
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [startDate, setStartDate] = useState("");

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
        setStartDate(`${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`)
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    let saveStepSix = () => {

        let stepSix = {
            startDate: startDate,
        }

        AsyncStorage.setItem('stepSixCarRegister', JSON.stringify(stepSix)).then(() => {
            navigation.navigate('RegisterCarScreenSeven');

            // Prueba de lectura de lo guardado
            AsyncStorage.getItem('stepSixCarRegister').then((result) => {
                console.log('result', result)
            }).catch((error) => {
                console.log(error)
            })

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
                        <Text style={{ textAlign: 'center', fontSize: 24, marginVertical: 20, color: '#969696', paddingHorizontal: 5 }}>Indique el tiempo en que el vehículo esta disponible para ser rentado</Text>
                        <Image source={require('../assets/images/paso6.png')} style={{ height: 200, width: 300 }} resizeMode={'contain'} >
                        </Image>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 240, paddingHorizontal: 20, backgroundColor: 'transparent' }}>


                            <View style={{ flexDirection: 'row' }}>
                                <Pressable
                                    style={({ pressed }) => [
                                        {
                                            height: 150, width: 140, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                            backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : 'white'
                                        }
                                    ]}
                                    onPress={() => {
                                        showDatepicker()
                                    }}
                                >
                                    <Ionicons name="calendar-outline" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Fecha de inicio</Text>
                                </Pressable>
                                <View style={{ height: 10, width: 10 }}></View>
                            </View>
                            {show && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={date}
                                    mode={mode}
                                    is24Hour={true}
                                    display="default"
                                    onChange={onChange}
                                />
                            )}
                        </View>
                        <Pressable
                            style={({ pressed }) => [
                                {
                                    height: 40, width: '90%', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20,
                                    backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : '#593cfb'
                                }
                            ]}
                            onPress={() => {
                                saveStepSix()
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