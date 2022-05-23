import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, TextInput, Pressable } from 'react-native';
import { Text, View } from '../components/Themed';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BrandCarsUseCase from '../helpers/uses_cases/brand_cars';
import ModelsCarsUseCase from '../helpers/uses_cases/models_cars';
import { Brand } from '../helpers/interfaces/brand_cars_interfaces';
import { Cars } from '../helpers/interfaces/models_cars';
import CreateCarUseCase from '../helpers/uses_cases/create_car';

export default function RegisterCarScreenOne({ navigation }: any) {

    // Hooks del formulario
    const [brandSelected, setBrandSelected] = useState<number>();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [modelSelected, setModelSelected] = useState<number>();
    const [models, setModels] = useState<Cars[]>([]);
    const [yearSelected, setYearSelected] = useState<number>();
    const [years, setYears] = useState<number[]>([]);
    const [fuelSelected, setFuelSelected] = useState<number>();
    const [doorsSelected, setDoorsSelected] = useState<number>();
    const [transmitionSelected, setTransmitionSelected] = useState<number>();
    const [kilometers, setKilometers] = useState<number>();
    const [plate, setPlate] = useState<string>();


    useEffect(() => {
        console.log('DEV_LOG - Se ejecuta el useEffect');

        let getBrands = async () => {

            let brandCarsUseCase: BrandCarsUseCase = new BrandCarsUseCase();

            try {
                let brandCarsList = await brandCarsUseCase.call();

                setBrands(brandCarsList);

            } catch (e) {
                console.log('DEV_LOG - Error');
                console.log(e);
                console.warn(e);
            }
        }
        getBrands();
    }, []);


    const getModels = async (brand_id: number) => {
        let modelCarsUseCase: ModelsCarsUseCase = new ModelsCarsUseCase();

        try {

            let modelCarsList: Cars[] = await modelCarsUseCase.call({
                brand_id: brand_id
            });
            setModels(modelCarsList);
        } catch (e) {
            console.log('DEV_LOG - Error');
            console.log(e);
            console.warn(e);
        }
    }

    const setYearsList = (model_id: number) => {
        let yearList: number[] = [];
        if (models.length > 0) {
            const model = models.find((model) => model.id === model_id)
            if (!model!.price_from || !model!.price_to) return;
            for (let year = model!.price_from === model!.price_to ? parseInt(model!.price_from) - 1 : parseInt(model!.price_from); year <= parseInt(model!.price_to); year++) {
                yearList.push(year)
            }
        }
        setYears(yearList);
    }

    let saveStepOne = () => {

        let stepOne = {
            brandSelected: brandSelected,
            modelSelected: modelSelected,
            yearSelected: yearSelected,
            fuelSelected: fuelSelected,
            doorsSelected: doorsSelected,
            transmitionSelected: transmitionSelected,
            kilometers: kilometers,
            plate: plate
        }

        AsyncStorage.setItem('stepOneCarRegister', JSON.stringify(stepOne)).then(() => {
            navigation.navigate('RegisterCarScreenTwo');

            // Prueba de lectura de lo guardado
            // AsyncStorage.getItem('stepOneCarRegister').then( (result) => {
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
                        <Text style={{ textAlign: 'center', fontSize: 24, marginVertical: 20, color: '#969696' }}>Auto</Text>
                        <Image source={require('../assets/images/paso1.png')} style={{ height: 200, width: 300 }} resizeMode={'contain'} >
                        </Image>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <View style={{ width: '100%', height: 40, backgroundColor: '#e2e2e2', borderRadius: 5 }}>
                                <Picker
                                    style={{ marginTop: 7 }}
                                    selectedValue={0}
                                    onValueChange={(itemValue, _) => {
                                        setBrandSelected(itemValue);
                                        getModels(itemValue);
                                    }
                                    }>
                                    <Picker.Item label="Seleccione la marca del vehículo" value={0} />
                                    {
                                        brands.map((element) => <Picker.Item label={element.name} value={element.id} key={element.id} />)
                                    }
                                </Picker>
                            </View>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <View style={{ width: '100%', height: 40, borderRadius: 5, backgroundColor: '#e2e2e2' }}>
                                <Picker
                                    style={{ marginTop: 7 }}
                                    selectedValue={0}
                                    onValueChange={(itemValue, _) => {
                                        setModelSelected(itemValue)
                                        setYearsList(itemValue)

                                    }
                                    }>
                                    <Picker.Item label="Seleccione el modelo del vehículo" value={0} />
                                    {
                                        models.map((element) => <Picker.Item label={element.description} value={element.id} key={element.id} />)
                                    }
                                </Picker>
                            </View>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <View style={{ width: '100%', height: 40, borderRadius: 5, backgroundColor: '#e2e2e2' }}>
                                <Picker
                                    style={{ marginTop: 7 }}
                                    selectedValue={0}
                                    onValueChange={(itemValue, _) =>
                                        setYearSelected(itemValue)
                                    }>
                                    <Picker.Item label="Seleccione el año del vehículo" value={0} />
                                    {
                                        years.map((element) => <Picker.Item label={element.toString()} value={element} key={element} />)
                                    }
                                </Picker>
                            </View>
                        </View>
                        <View style={{
                            marginVertical: 10,
                            height: 1,
                            width: '95%',
                        }} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <View style={{ width: '100%', height: 40, borderRadius: 5, backgroundColor: '#e2e2e2' }}>
                                <Picker
                                    style={{ marginTop: 7 }}
                                    selectedValue={0}
                                    onValueChange={(itemValue, _) =>
                                        setFuelSelected(itemValue)
                                    }>
                                    <Picker.Item label="Seleccione el tipo de combustible" value={0} />
                                    <Picker.Item label="Nafta" value={1} />
                                    <Picker.Item label="Diesel" value={2} />
                                    <Picker.Item label="Híbrido" value={3} />
                                    <Picker.Item label="Eléctrico" value={4} />
                                    <Picker.Item label="Otro" value={5} />
                                </Picker>
                            </View>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <View style={{ width: '100%', height: 40, borderRadius: 5, backgroundColor: '#e2e2e2' }}>
                                <Picker
                                    style={{ marginTop: 7 }}
                                    selectedValue={0}
                                    onValueChange={(itemValue, _) =>
                                        setDoorsSelected(itemValue)
                                    }>
                                    <Picker.Item label="Seleccione la cantidad de puertas" value={0} />
                                    <Picker.Item label="1" value={1} />
                                    <Picker.Item label="2" value={2} />
                                    <Picker.Item label="3" value={3} />
                                    <Picker.Item label="4" value={4} />
                                    <Picker.Item label="5" value={5} />
                                </Picker>
                            </View>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <View style={{ width: '100%', height: 40, borderRadius: 5, backgroundColor: '#e2e2e2' }}>
                                <Picker
                                    style={{ marginTop: 7 }}
                                    selectedValue={0}
                                    onValueChange={(itemValue, _) =>
                                        setTransmitionSelected(itemValue - 1)
                                    }>
                                    <Picker.Item label="Seleccione el tipo de transmisión" value={0} />
                                    <Picker.Item label="Otra" value={1} />
                                    <Picker.Item label="Manual" value={2} />
                                    <Picker.Item label="Automática" value={3} />
                                </Picker>
                            </View>
                        </View>
                        <View style={{
                            marginVertical: 10,
                            height: 1,
                            width: '95%',
                        }} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <TextInput
                                style={{ width: '100%', height: 40, backgroundColor: '#e2e2e2', borderRadius: 5, paddingLeft: 5, color: 'black' }}
                                placeholder={'Kilometraje'}
                                selectionColor={'#593cfb'}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(data: any) => {
                                    setKilometers(data);
                                }}
                                keyboardType={'phone-pad'}
                                maxLength={12}
                            >
                            </TextInput>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: 55, paddingHorizontal: 20, backgroundColor: 'transparent' }}>
                            <TextInput
                                style={{ width: '100%', height: 40, backgroundColor: '#e2e2e2', borderRadius: 5, paddingLeft: 5, color: 'black' }}
                                placeholder={'Placa'}
                                selectionColor={'#593cfb'}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(data: any) => {
                                    setPlate(data);
                                }}
                                maxLength={12}
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
                                saveStepOne()
                            }}
                        >
                            <Text style={{ color: 'white' }}>Ingresar</Text>
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
