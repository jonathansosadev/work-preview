import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function UploadUserDocument({ navigation }: any) {

    // Hooks del formulario
    const [imageSelectedOne, setImageSelectedOne] = useState(null);

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
        const resultOne = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.4,
        });

        if (!resultOne.cancelled) {
            setImageSelectedOne(resultOne.uri);
            console.log(resultOne.uri);
        }
    };

    const takeImage = async (index: any) => {
        const resultOne = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.4,
        });

        if (!resultOne.cancelled) {
            setImageSelectedOne(resultOne.uri);
            console.log(resultOne.uri);
        }
    }

    let uploadUserDocument = () => {
        // Subida de documento
    }

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }}>
                <Text style={{ textAlign: 'center', fontSize: 26, fontWeight: 'bold', marginVertical: 20 }}>Registra tu documento de identidad</Text>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <View style={{ width: '90%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginBottom: 20 }}>
                        <Text style={{ textAlign: 'center', fontSize: 24, marginVertical: 20, color: '#969696' }}>Documentación</Text>
                        <Image source={require('../assets/images/paso3.png')} style={{ height: 200, width: 300 }} resizeMode={'contain'} >
                        </Image>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 400, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
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
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Fotografía de documento</Text>
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
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Imagen de documento</Text>
                                </Pressable>
                            </View>
                            {imageSelectedOne
                                ? <Image source={{ uri: imageSelectedOne }} style={{ height: 150, width: 200, borderRadius: 10, marginBottom: 10 }} />
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
                                uploadUserDocument()
                            }}
                        >
                            <Text style={{ color: 'white' }}>Subir documento</Text>
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