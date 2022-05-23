import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterCarScreenFour({ navigation }: any) {

    // Hooks del formulario
    const [imageExteriorSelectedOne, setImageExteriorSelectedOne] = useState(null);
    const [imageExteriorSelectedTwo, setImageExteriorSelectedTwo] = useState(null);
    const [imageExteriorSelectedThree, setImageExteriorSelectedThree] = useState(null);
    const [imageExteriorSelectedFour, setImageExteriorSelectedFour] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted' && permissionResult.granted === true) {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        })();
    }, []);

    const pickImage = async (index: any) => {
        switch (index) {
            case 1:
                const resultOne = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.4,
                });

                if (!resultOne.cancelled) {
                    setImageExteriorSelectedOne(resultOne.uri);
                    console.log(resultOne.uri);
                }
                break;

            case 2:
                const resultTwo = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.4,
                });

                if (!resultTwo.cancelled) {
                    setImageExteriorSelectedTwo(resultTwo.uri);
                    console.log(resultTwo.uri);
                }
                break;

            case 3:
                const resultThree = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.4,
                });

                if (!resultThree.cancelled) {
                    setImageExteriorSelectedThree(resultThree.uri);
                    console.log(resultThree.uri);
                }
                break;
            case 4:
                const resultFour = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.4,
                });

                if (!resultFour.cancelled) {
                    setImageExteriorSelectedFour(resultFour.uri);
                    console.log(resultFour.uri);
                }
                break;

            default:
                break;
        }
    };

    const takeImage = async (index: any) => {
        switch (index) {
            case 1:
                const resultOne = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.4,
                });

                if (!resultOne.cancelled) {
                    setImageExteriorSelectedOne(resultOne.uri);
                    console.log(resultOne.uri);
                }
                break;

            case 2:
                const resultTwo = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.4,
                });

                if (!resultTwo.cancelled) {
                    setImageExteriorSelectedTwo(resultTwo.uri);
                    console.log(resultTwo.uri);
                }
                break;

            case 3:
                const resultThree = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.4,
                });

                if (!resultThree.cancelled) {
                    setImageExteriorSelectedThree(resultThree.uri);
                    console.log(resultThree.uri);
                }
                break;
            case 4:
                const resultFour = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.4,
                });

                if (!resultFour.cancelled) {
                    setImageExteriorSelectedFour(resultFour.uri);
                    console.log(resultFour.uri);
                }
                break;

            default:
                break;
        }
    }

    let saveStepFour = () => {

        let stepFour = {
            picture_front: imageExteriorSelectedOne,
            picture_back: imageExteriorSelectedTwo,
            picture_right: imageExteriorSelectedThree,
            picture_left: imageExteriorSelectedFour
        }

        console.log(stepFour)

        AsyncStorage.setItem('stepFourCarRegister', JSON.stringify(stepFour)).then(() => {
            navigation.navigate('RegisterCarScreenFive');

            // Prueba de lectura de lo guardado
            AsyncStorage.getItem('stepFourCarRegister').then((result) => {
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
                        <Text style={{ textAlign: 'center', fontSize: 24, marginVertical: 20, color: '#969696' }}>Fotos del exterior del auto</Text>
                        <Image source={require('../assets/images/paso4.png')} style={{ height: 200, width: 300 }} resizeMode={'contain'} >
                        </Image>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 1400, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Pressable
                                    style={({ pressed }) => [
                                        {
                                            height: 150, width: 140, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                            backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : 'white'
                                        }
                                    ]}
                                    onPress={() => {
                                        takeImage(1)
                                    }}
                                >
                                    <Ionicons name="camera" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Fotografía frontal</Text>
                                </Pressable>
                                <View style={{ height: 10, width: 10 }}></View>
                                <Pressable
                                    style={({ pressed }) => [
                                        {
                                            height: 150, width: 140, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                            backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : 'white'
                                        }
                                    ]}
                                    onPress={() => {
                                        pickImage(1)
                                    }}

                                >
                                    <Ionicons name="image" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Imagen frontal</Text>
                                </Pressable>
                            </View>
                            {imageExteriorSelectedOne
                                ? <Image source={{ uri: imageExteriorSelectedOne }} style={{ height: 150, width: 200, borderRadius: 10, marginBottom: 10 }} />
                                : (<View style={{ height: 150, width: 200, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderRadius: 10, borderColor: '#9965d6', marginBottom: 10 }}><Ionicons name="image" size={40} color="#9965d6" /></View>)
                            }
                            <View style={{ flexDirection: 'row' }}>
                                <Pressable
                                    style={({ pressed }) => [
                                        {
                                            height: 150, width: 140, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                            backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : 'white'
                                        }
                                    ]}
                                    onPress={() => {
                                        takeImage(2)
                                    }}
                                >
                                    <Ionicons name="camera" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Fotografía trasera</Text>
                                </Pressable>
                                <View style={{ height: 10, width: 10 }}></View>
                                <Pressable
                                    style={({ pressed }) => [
                                        {
                                            height: 150, width: 140, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                            backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : 'white'
                                        }
                                    ]}
                                    onPress={() => {
                                        pickImage(2)
                                    }}

                                >
                                    <Ionicons name="image" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Imagen trasera</Text>
                                </Pressable>
                            </View>
                            {imageExteriorSelectedTwo
                                ? <Image source={{ uri: imageExteriorSelectedTwo }} style={{ height: 150, width: 200, borderRadius: 10, marginBottom: 10 }} />
                                : (<View style={{ height: 150, width: 200, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderRadius: 10, borderColor: '#9965d6', marginBottom: 10 }}><Ionicons name="image" size={40} color="#9965d6" /></View>)
                            }
                            <View style={{ flexDirection: 'row' }}>
                                <Pressable
                                    style={({ pressed }) => [
                                        {
                                            height: 150, width: 140, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                            backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : 'white'
                                        }
                                    ]}
                                    onPress={() => {
                                        takeImage(3)
                                    }}
                                >
                                    <Ionicons name="camera" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Fotografía derecha</Text>
                                </Pressable>
                                <View style={{ height: 10, width: 10 }}></View>
                                <Pressable
                                    style={({ pressed }) => [
                                        {
                                            height: 150, width: 140, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                            backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : 'white'
                                        }
                                    ]}
                                    onPress={() => {
                                        pickImage(3)
                                    }}

                                >
                                    <Ionicons name="image" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Imagen derecha</Text>
                                </Pressable>
                            </View>
                            {imageExteriorSelectedThree
                                ? <Image source={{ uri: imageExteriorSelectedThree }} style={{ height: 150, width: 200, borderRadius: 10, marginBottom: 10 }} />
                                : (<View style={{ height: 150, width: 200, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderRadius: 10, borderColor: '#9965d6', marginBottom: 10 }}><Ionicons name="image" size={40} color="#9965d6" /></View>)
                            }
                            <View style={{ flexDirection: 'row' }}>
                                <Pressable
                                    style={({ pressed }) => [
                                        {
                                            height: 150, width: 140, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                            backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : 'white'
                                        }
                                    ]}
                                    onPress={() => {
                                        takeImage(4)
                                    }}
                                >
                                    <Ionicons name="camera" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Fotografía izquierda</Text>
                                </Pressable>
                                <View style={{ height: 10, width: 10 }}></View>
                                <Pressable
                                    style={({ pressed }) => [
                                        {
                                            height: 150, width: 140, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                            backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : 'white'
                                        }
                                    ]}
                                    onPress={() => {
                                        pickImage(4)
                                    }}

                                >
                                    <Ionicons name="image" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Imagen izquierda</Text>
                                </Pressable>
                            </View>
                            {imageExteriorSelectedFour
                                ? <Image source={{ uri: imageExteriorSelectedFour }} style={{ height: 150, width: 200, borderRadius: 10, marginBottom: 10 }} />
                                : (<View style={{ height: 150, width: 200, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderRadius: 10, borderColor: '#9965d6', marginBottom: 10 }}><Ionicons name="image" size={40} color="#9965d6" /></View>)
                            }
                        </View>
                        <Pressable
                            style={({ pressed }) => [
                                {
                                    height: 40, width: '90%', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10, marginBottom: 20,
                                    backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : '#593cfb'
                                }
                            ]}
                            onPress={() => {
                                saveStepFour()
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