import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, TextInput, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Text, View } from '../components/Themed';
import SendCodeUseCase from '../helpers/uses_cases/send_code';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VerifyCodeUseCase from '../helpers/uses_cases/verify_code';
import RegisterUseCase, { RegisterUseCaseParams } from '../helpers/uses_cases/register';
import { RegisteredUserResponse } from '../helpers/interfaces/registered_user_interface';

export default function SmsCodeVefication({ navigation }: any) {

    // Hooks del formulario
    const [code, setCode] = useState("");
    const [registerUserFromLocalStorage, setRegisterUserFromLocalStorage] = useState<RegisterUseCaseParams>();

    useEffect(() => {
        AsyncStorage.getItem("registerUser").then((result) => {
            let registerUserInformation: RegisterUseCaseParams = JSON.parse(result!);
            setRegisterUserFromLocalStorage(registerUserInformation);
            let sendcode: SendCodeUseCase = new SendCodeUseCase();
            sendcode.call({ phone: registerUserInformation.phone! }).catch((error) => {
                console.log(error);
                Toast.show({
                    type: 'error',
                    text1: error.exceptionTitle,
                    text2: error.exceptionDescription
                });
            });
        });
    }, []);

    let checkCode = async () => {
        let verifyCode: VerifyCodeUseCase = new VerifyCodeUseCase();
        let registerUser: RegisterUseCase = new RegisterUseCase();

        try {
            await verifyCode.call({
                phone: registerUserFromLocalStorage?.phone!,
                code: code
            });
            try {

                let registerUserResponse: RegisteredUserResponse = await registerUser.call(registerUserFromLocalStorage!);
            } catch (error: any) {
                Toast.show({
                    type: 'error',
                    text1: error.exceptionTitle,
                    text2: error.exceptionDescription
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: error.exceptionTitle,
                text2: error.exceptionDescription
            });
        }
    }

    return (
        <ScrollView>
            <View style={{ height: 50, width: '100%' }}>
            </View>
            <View style={{ width: '100%', height: 600, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', width: '90%', height: 200, backgroundColor: '#593cfb', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <View style={{ width: '60%', height: 200, backgroundColor: '#593cfb', borderTopLeftRadius: 10 }}>
                        <Image source={require('../assets/images/register.png')} resizeMode={'contain'} style={{ width: '100%', height: '100%' }}>
                        </Image>
                    </View>
                    <View style={{ width: '40%', height: 200, backgroundColor: '#593cfb', borderTopLeftRadius: 10, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 10 }}>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: 'white' }}>Que en tus vacaciones trabaje tu auto</Text>
                    </View>
                </View>
                <View style={{ width: '90%', height: 300, backgroundColor: '#e0e0e0', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                    <View style={{ width: '100%', height: 65, paddingLeft: 20, backgroundColor: 'transparent', paddingRight: 20 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', }}>Verificación</Text>
                        <Text style={{ fontSize: 18 }}>Introduce el código que hemos enviado a tu email</Text>
                    </View>
                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 65, paddingHorizontal: 20, backgroundColor: 'transparent', marginTop: 40 }}>
                        <View style={{ width: '100%', height: 40, backgroundColor: 'white', borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <TextInput
                                style={{ height: 40, backgroundColor: 'white', borderRadius: 5, paddingLeft: 5, color: 'black', fontSize: 30, justifyContent: 'center', alignItems: 'center' }}
                                // placeholder={'Codigo SMS'}
                                selectionColor={'#593cfb'}
                                underlineColorAndroid={'transparent'}
                                keyboardType={'numeric'}
                                maxLength={4}
                                onChangeText={(data: any) => {
                                    setCode(data);
                                }}
                                maxLength={6}
                            >
                            </TextInput>
                        </View>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                        <Text
                            onPress={() => {
                                console.warn('Integracion para solicitar de nuevo la verificacion de correo')
                            }}
                            style={{ color: "#593dfb", fontSize: 16 }}
                        >Volver a enviar código</Text>
                        <Text
                            onPress={() => {
                                navigation.navigate("RegisterScreen")
                            }}
                            style={{ color: "#593dfb", fontSize: 16 }}
                        >Introducir un correo diferente </Text>
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
                                    checkCode()
                                }}
                            >
                                <Text style={{ color: 'white' }}>Verificar</Text>
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
