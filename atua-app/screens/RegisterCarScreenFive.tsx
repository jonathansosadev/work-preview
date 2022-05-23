import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, Pressable, Modal, ActivityIndicator } from 'react-native';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import UploadAdressUseCase from '../helpers/uses_cases/upload_address';
import CreateCarUseCase from '../helpers/uses_cases/create_car';
import { CreateCarsResponse } from '../helpers/interfaces/create_cars_response_interface';
import UploadDocumentsCarsUseCase from '../helpers/uses_cases/upload_cars_documents';
import UploadExteriorPicturesCarsUseCase from '../helpers/uses_cases/upload_exterior_pictures_cars';
import UploadInteriorPicturesCarsUseCase from '../helpers/uses_cases/upload_interior_pictures_cars';

export default function RegisterCarScreenFive({ navigation }: any) {

    // Hooks del formulario
    const [imageInteriorSelectedOne, setImageInteriorSelectedOne] = useState(null);
    const [imageInteriorSelectedTwo, setImageInteriorSelectedTwo] = useState(null);
    const [imageInteriorSelectedThree, setImageInteriorSelectedThree] = useState(null);
    const [imageInteriorSelectedFour, setImageInteriorSelectedFour] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);

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
                    setImageInteriorSelectedOne(resultOne.uri);
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
                    setImageInteriorSelectedTwo(resultTwo.uri);
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
                    setImageInteriorSelectedThree(resultThree.uri);
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
                    setImageInteriorSelectedFour(resultFour.uri);
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
                    setImageInteriorSelectedOne(resultOne.uri);
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
                    setImageInteriorSelectedTwo(resultTwo.uri);
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
                    setImageInteriorSelectedThree(resultThree.uri);
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
                    setImageInteriorSelectedFour(resultFour.uri);
                    console.log(resultFour.uri);
                }
                break;

            default:
                break;
        }
    }

    let saveStepFive = async () => {

        setModalVisible(true);

        AsyncStorage.getItem('stepTwoCarRegister').then(async (localStorageAddress) => {

            try {
                let uploadAddress: UploadAdressUseCase = new UploadAdressUseCase();
                let addressInformation = JSON.parse(localStorageAddress!);
                let addressRep = await uploadAddress.call(
                    {
                        zip_code: addressInformation["zipCode"],
                        street_name: addressInformation["streetName"],
                        street_number: addressInformation["streetNumber"],
                        city_id: addressInformation["citySelected"],
                        description: addressInformation["description"],
                        default: false
                    }
                );
                createCar(addressRep.address_id).then( () => {
                    navigation.navigate('Buscar');
                });

            } catch (error) {
                console.log(error);
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const createCar = async (addresdId: any) => {


        AsyncStorage.getItem('stepOneCarRegister').then(async (localStorageCar) => {
            try {
                let createCar: CreateCarUseCase = new CreateCarUseCase();
                let carInformation = JSON.parse(localStorageCar!);
                let createCarResp: CreateCarsResponse = await createCar.call({
                    plate: carInformation["plate"],
                    transmission: carInformation["transmitionSelected"],
                    kilometers: carInformation["kilometers"],
                    year: carInformation["yearSelected"],
                    doors: carInformation["doorsSelected"],
                    car_model: carInformation["modelSelected"],
                    fuel_type: carInformation["fuelSelected"],
                    address_id: addresdId,
                })
                uploadDocumentsCars(createCarResp.id);
            } catch (error) {
                console.log(error);
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const uploadDocumentsCars = async (carId: number) => {


        AsyncStorage.getItem('stepThreeCarRegister').then(async (localStorageDocumentsPicture) => {
            let documentInformation = JSON.parse(localStorageDocumentsPicture!);
            try {
                let uploadDocumentsCarsUseCase: UploadDocumentsCarsUseCase = new UploadDocumentsCarsUseCase();
                await uploadDocumentsCarsUseCase.call({
                    car: carId,
                    picture_driver_card: documentInformation["picture_driver_card"],
                    picture_mechanical_check: documentInformation["picture_mechanical_check"],
                    picture_insurance: documentInformation["picture_insurance"]
                });
                uploadExteriorPicture(carId);
            } catch (error) {
                console.log(error);
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const uploadExteriorPicture = (carId: number) => {


        AsyncStorage.getItem('stepFourCarRegister').then(async (localStorageExteriorPictureCar) => {
            let uploadExteriorCarsPicturesUseCase: UploadExteriorPicturesCarsUseCase = new UploadExteriorPicturesCarsUseCase();
            let pictureExteriorInformation = JSON.parse(localStorageExteriorPictureCar!);
            await uploadExteriorCarsPicturesUseCase.call(
                {
                    car: carId,
                    picture_back: pictureExteriorInformation["picture_back"],
                    picture_front: pictureExteriorInformation["picture_front"],
                    picture_left: pictureExteriorInformation["picture_left"],
                    picture_right: pictureExteriorInformation["picture_right"]
                }
            );
            uploadInteriorPicture(carId)
        }).catch((error) => {
            console.log(error)
        })
    }

    const uploadInteriorPicture = async (carId: number) => {

        try {
            let uploadInteriorPicture: UploadInteriorPicturesCarsUseCase = new UploadInteriorPicturesCarsUseCase();
            await uploadInteriorPicture.call(
                {
                    car: carId,
                    picture_dashboard: imageInteriorSelectedOne!,
                    picture_interior_back: imageInteriorSelectedTwo!,
                    picture_interior_front: imageInteriorSelectedThree!,
                    picture_trunk: imageInteriorSelectedFour!,
                }
            );
            setModalVisible(false);
        } catch (error) {
            console.log(error)
        }
    }



    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }}>
                <Text style={{ textAlign: 'center', fontSize: 30, fontWeight: 'bold', marginVertical: 20 }}>Suma tu coche a ATUA</Text>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <View style={{ width: '90%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginBottom: 20 }}>
                        <Text style={{ textAlign: 'center', fontSize: 24, marginVertical: 20, color: '#969696' }}>Fotos del interior del auto</Text>
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
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Fotografía tablero</Text>
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
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Imagen tablero</Text>
                                </Pressable>
                            </View>
                            {imageInteriorSelectedOne
                                ? <Image source={{ uri: imageInteriorSelectedOne }} style={{ height: 150, width: 200, borderRadius: 10, marginBottom: 10 }} />
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
                                        pickImage(2)
                                    }}

                                >
                                    <Ionicons name="image" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Imagen frontal</Text>
                                </Pressable>
                            </View>
                            {imageInteriorSelectedTwo
                                ? <Image source={{ uri: imageInteriorSelectedTwo }} style={{ height: 150, width: 200, borderRadius: 10, marginBottom: 10 }} />
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
                                        pickImage(3)
                                    }}

                                >
                                    <Ionicons name="image" size={40} color="#9965d6" />
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Imagen trasera</Text>
                                </Pressable>
                            </View>
                            {imageInteriorSelectedThree
                                ? <Image source={{ uri: imageInteriorSelectedThree }} style={{ height: 150, width: 200, borderRadius: 10, marginBottom: 10 }} />
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
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Fotografía baul</Text>
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
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Imagen baul</Text>
                                </Pressable>
                            </View>
                            {imageInteriorSelectedFour
                                ? <Image source={{ uri: imageInteriorSelectedFour }} style={{ height: 150, width: 200, borderRadius: 10, marginBottom: 10 }} />
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
                                saveStepFive()
                            }}
                        >
                            <Text style={{ color: 'white' }}>Siguiente</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#593dfb" />
                    <Text>Procesando el registro del vehículo</Text>
                    <Text>Por favor espere…</Text>
                </View>
            </Modal>
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