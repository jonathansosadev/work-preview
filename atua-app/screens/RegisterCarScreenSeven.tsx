import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, Pressable, Button, Platform } from 'react-native';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import UploadAdressUseCase from '../helpers/uses_cases/upload_address';
import CreateCarUseCase from '../helpers/uses_cases/create_car';
import { CreateCarsResponse } from '../helpers/interfaces/create_cars_response_interface';
import UploadDocumentsCarsUseCase from '../helpers/uses_cases/upload_cars_documents';
import UploadInteriorPicturesCarsUseCase from '../helpers/uses_cases/upload_interior_pictures_cars';
import UploadExteriorPicturesCarsUseCase from '../helpers/uses_cases/upload_exterior_pictures_cars';
import { format } from 'date-fns';
import PostCarUseCase from '../helpers/uses_cases/post_car';

export default function RegisterCarScreenSeven({ navigation }: any) {

    // Hooks del formulario
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [finalDate, setFinalDate] = useState("");

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
        setFinalDate(`${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`)
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    // let saveStepSeven = async () => {

    //     AsyncStorage.getItem('stepTwoCarRegister').then(async (localStorageAddress) => {

    //         try {
    //             let uploadAddress: UploadAdressUseCase = new UploadAdressUseCase();
    //             let addressInformation = JSON.parse(localStorageAddress!);
    //             let addressRep = await uploadAddress.call(
    //                 {
    //                     zip_code: addressInformation["zipCode"],
    //                     street_name: addressInformation["streetName"],
    //                     street_number: addressInformation["streetNumber"],
    //                     city_id: addressInformation["citySelected"],
    //                     description: addressInformation["description"],
    //                     default: false
    //                 }
    //             );
    //             createCar(addressRep.address_id);

    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }).catch((error) => {
    //         console.log(error)
    //     })
    // }

    // const createCar = async (addresdId: any) => {


    //     AsyncStorage.getItem('stepOneCarRegister').then(async (localStorageCar) => {
    //         try {
    //             let createCar: CreateCarUseCase = new CreateCarUseCase();
    //             let carInformation = JSON.parse(localStorageCar!);
    //             let createCarResp: CreateCarsResponse = await createCar.call({
    //                 plate: carInformation["plate"],
    //                 transmission: carInformation["transmitionSelected"],
    //                 kilometers: carInformation["kilometers"],
    //                 year: carInformation["yearSelected"],
    //                 doors: carInformation["doorsSelected"],
    //                 car_model: carInformation["modelSelected"],
    //                 fuel_type: carInformation["fuelSelected"],
    //                 address_id: addresdId,
    //             })
    //             uploadDocumentsCars(createCarResp.id);
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }).catch((error) => {
    //         console.log(error)
    //     })
    // }

    // const uploadDocumentsCars = async (carId: number) => {


    //     AsyncStorage.getItem('stepThreeCarRegister').then(async (localStorageDocumentsPicture) => {
    //         let documentInformation = JSON.parse(localStorageDocumentsPicture!);
    //         try {
    //             let uploadDocumentsCarsUseCase: UploadDocumentsCarsUseCase = new UploadDocumentsCarsUseCase();
    //             await uploadDocumentsCarsUseCase.call({
    //                 car: carId,
    //                 picture_driver_card: documentInformation["picture_driver_card"],
    //                 picture_mechanical_check: documentInformation["picture_mechanical_check"],
    //                 picture_insurance: documentInformation["picture_insurance"]
    //             });
    //             uploadExteriorPicture(carId);
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }).catch((error) => {
    //         console.log(error)
    //     })
    // }

    // const uploadExteriorPicture = (carId: number) => {


    //     AsyncStorage.getItem('stepFourCarRegister').then(async (localStorageExteriorPictureCar) => {
    //         let uploadExteriorCarsPicturesUseCase: UploadExteriorPicturesCarsUseCase = new UploadExteriorPicturesCarsUseCase();
    //         let pictureExteriorInformation = JSON.parse(localStorageExteriorPictureCar!);
    //         await uploadExteriorCarsPicturesUseCase.call(
    //             {
    //                 car: carId,
    //                 picture_back: pictureExteriorInformation["picture_back"],
    //                 picture_front: pictureExteriorInformation["picture_front"],
    //                 picture_left: pictureExteriorInformation["picture_left"],
    //                 picture_right: pictureExteriorInformation["picture_right"]
    //             }
    //         );
    //         uploadInteriorPicture(carId)
    //     }).catch((error) => {
    //         console.log(error)
    //     })
    // }

    // const uploadInteriorPicture = (carId: number) => {


    //     AsyncStorage.getItem('stepFiveCarRegister').then(async (localStorageExteriorPictureCar) => {
    //         let uploadInteriorPicture: UploadInteriorPicturesCarsUseCase = new UploadInteriorPicturesCarsUseCase();
    //         let pictureInteriorInformation = JSON.parse(localStorageExteriorPictureCar!);
    //         await uploadInteriorPicture.call(
    //             {
    //                 car: carId,
    //                 picture_dashboard: pictureInteriorInformation["picture_dashboard"],
    //                 picture_interior_back: pictureInteriorInformation["picture_interior_back"],
    //                 picture_interior_front: pictureInteriorInformation["picture_interior_front"],
    //                 picture_trunk: pictureInteriorInformation["picture_trunk"],
    //             }
    //         );

    //         postCar(carId);
    //     }).catch((error) => {
    //         console.log(error)
    //     })
    // }

    // const postCar = (carId: number) => {


    //     AsyncStorage.getItem('stepSixCarRegister').then(async (localFromDate) => {

    //         let fromDateInformation = JSON.parse(localFromDate!);

    //         let formatFormDate = fromDateInformation["startDate"].split("/").reverse().join("-").toString();
    //         let formatToDate = finalDate.split("/").reverse().join("-").toString();

    //         let postCarUseCase: PostCarUseCase = new PostCarUseCase();

    //         let postCarResponse = await postCarUseCase.call({
    //             car: carId,
    //             available_since: formatFormDate,
    //             available_until: formatToDate,
    //             cost: "5000",
    //             insurance: 1,
    //             description: "Descripción"
    //         });

    //         console.log(postCarResponse);

    //         console.log('result', localFromDate)
    //     }).catch((error) => {
    //         console.log(error)
    //     })
    // }

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
                                    <Text style={{ color: '#262d32', textAlign: 'center' }}>Fecha de fin</Text>
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
                                // saveStepSeven()
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