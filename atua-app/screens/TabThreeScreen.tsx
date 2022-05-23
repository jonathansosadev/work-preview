import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, Image, Pressable, ScrollView, Modal, FlatList, SafeAreaView } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Text, View } from '../components/Themed';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
const axios = require('axios');
import * as Location from 'expo-location';

export default function TabThreeScreen() {
  const [searchParam, setSearchParam] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [firstUse, setFirstUse] = useState(false);
  const [sliders, setSliders] = useState([
    {
      title: "Bariloche",
      src: "../assets/images/Bariloche.png",
    },
    {
      title: "Brazilia",
      src: "../assets/images/Brazilia.png",
    },
    {
      title: "Ezeiza",
      src: "../assets/images/Ezeiza.png",
    },
    {
      title: "Mendoza",
      src: "../assets/images/Mendoza.png",
    },
    {
      title: "Palermo",
      src: "../assets/images/Palermo.png",
    },
    {
      title: "Salta",
      src: "../assets/images/Salta.png",
    },
    {
      title: "Tucuman",
      src: "../assets/images/Tucuman.png",
    }
  ])

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    console.log('DEV_LOG - Se ejecuta el useEffect');

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log(location);
    })();


  }, []);

  // Elemento del carrusel
  let _renderItem = ({ item, index }: any) => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', borderWidth: 1, padding: 30, borderRadius: 10, borderColor: '#BBC4D2' }}>
        <Image source={require('../assets/images/Tucuman.png')} style={{ width: 100, height: 100 }}>
        </Image>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.title}</Text>
      </View>
    );
  }

  // Vista HOME
  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <ImageBackground source={require('../assets/images/fondo.jpg')} style={{ height: 240, width: '100%', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {
            console.warn(`Latitud:${location.coords.latitude} Longitud:${location.coords.altitude}`);
          }}
          style={({ pressed }) => [
            {
              height: 30, width: '30%', justifyContent: 'center', alignItems: 'center', borderRadius: 5, alignSelf: 'flex-end', marginRight: 10,
              backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : '#593cfb',
            }
          ]}
        >
          <Text style={{ color: 'white' }}>Mi ubicación</Text>
        </Pressable>
        <SearchBar
          placeholder="Buscar ATUA"
          onChangeText={(newText) => {}}
          value={searchParam}
          inputContainerStyle={{ backgroundColor: 'white' }}
          containerStyle={{ backgroundColor: 'transparent', borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
        />
      </ImageBackground>
      <View style={{ width: '100%', height: 60, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          El auto perfecto merece el
        </Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          ATUA perfecto
        </Text>
      </View>
      <View style={{ width: '100%', height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
        <Image source={require('../assets/images/separador.png')} resizeMode={'contain'} style={{ height: 20, margin: 0 }}>
        </Image>
      </View>
      <View style={{ height: 300, flexDirection: 'row', alignItems: 'flex-start', width: "100%" }}>
        <View style={{ width: '30%', height: 300, backgroundColor: 'black' }}>
          <Image source={require('../assets/images/decorado.png')} resizeMode={'stretch'} style={{ width: '100%', height: '100%' }}>
          </Image>
        </View>
        <View style={{ width: '70%', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Encuentra el auto perfecto</Text>
          <Text>Ingrese una ubicación y fecha para explorar miles de autos compartidos por anfitriones locales.</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Conecta con el anfitrión</Text>
          <Text>Coordina un lugar y hora con el anfitrión, la reservación es rápida, fácil y segura.</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Tú ATUA te está esperando</Text>
          <Text>Tú próxima aventura está a un clic de distancia.</Text>
        </View>
      </View>
      <ImageBackground source={require('../assets/images/decoradoLanding2.png')} resizeMode={'stretch'} style={{ width: '100%', height: 300 }}>
        <Text style={{ marginLeft: 30, marginTop: 30, fontSize: 20, fontWeight: 'bold', color: '#6d3efe' }}>
          Fácil, rápido y seguro
        </Text>
      </ImageBackground>
      <View style={{ flexDirection: 'row', width: '100%', paddingLeft: 20 }}>
        <View style={{ width: '60%', backgroundColor: 'black', padding: 5 }}>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
            Viaja con ATUA
          </Text>
          <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
            Se parte de la comunidad de viajeros y anfitriones más espectacular del mundo
          </Text>
          <Text style={{ color: 'white', fontSize: 12 }}>
            Encuentra el auto que se ajuste con tus necesidades y coordina con sus dueños.
          </Text>
          <Text style={{ alignSelf: 'flex-end', color: 'white', fontSize: 12, fontWeight: 'bold', textDecorationLine: 'underline', marginTop: 10 }}>Buscar ATUAS</Text>
        </View>
        <View style={{ width: '40%' }}>
          <Image source={require('../assets/images/estrellas.png')} style={{ height: 20, width: 80 }}>
          </Image>
        </View>
      </View>
      <View style={{ width: '100%', backgroundColor: '#fafafa', marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('../assets/images/logoSura.png')} resizeMode={'contain'} style={{ width: 200 }}>
        </Image>
        <Text style={{ color: '#979797', fontSize: 14 }}>
          Tu seguridad nos importa, cada viaje está
        </Text>
        <Text style={{ color: '#979797', fontSize: 14 }}>
          asegurado por SURA, <Text style={{ color: '#979797', fontSize: 14, textDecorationLine: 'underline' }}>Leer mas</Text>.
        </Text>
      </View>
      <View style={{ width: '100%', height: 100, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Alquilar desde puntos ATUA</Text>
        <Text style={{ fontSize: 14, color: '#BBC4D2', textAlign: 'center', marginTop: 5 }}>Disponemos de localizaciones fijas donde puedes alquilar tus autos</Text>
      </View>
      <View style={{ width: '100%', marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Carousel
          data={sliders}
          renderItem={_renderItem}
          sliderWidth={200}
          itemWidth={200}
          onSnapToItem={(index) => setSlideIndex(index)}
        />
        <Pagination
          dotsLength={sliders.length}
          activeDotIndex={slideIndex}
          dotColor={'#6d3efe'}
          inactiveDotColor={'#6d3efe'}
        ></Pagination>
      </View>
      <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 14, color: '#BBC4D2', textDecorationLine: 'underline' }}>Ver puntos ATUA</Text>
      </View>

      {/* <Modal
        animationType="slide"
        visible={firstUse}
      // transparent={true}
      >
        <View style={styles.centeredView}>
          <View style={{ width: '80%', margin: 20, backgroundColor: 'white', borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
            <Pressable
              style={({ pressed }) => [
                {
                  width: 70, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 5, alignSelf: 'flex-end',
                  backgroundColor: pressed ? 'rgba(89,60,251,0.5)' : '#593cfb'
                }
              ]}
              onPress={() => {
                setFirstUse(!firstUse);
              }}>
              <Text style={{ fontSize: 14, color: 'white', fontWeight: 'bold' }}>Cancelar</Text>
            </Pressable>
            <Text style={{ fontSize: 16, textAlign: 'center', fontWeight: 'bold', marginTop: 20 }}>Por favor selecciona tu ubicacion para conseguir tu ATUA ideal</Text>
            <View style={{ width: '100%', marginTop: 10 }}>
              <SearchBar
                style={{ fontSize: 16 }}
                placeholder="Buscar ATUA"
                onChangeText={(newText) => {
                  search(newText);
                }}
                value={searchParam}
                inputContainerStyle={{ backgroundColor: '#fafafa', borderColor: '#cdcdcd', borderWidth: 1 }}
                containerStyle={{ backgroundColor: 'transparent', borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
              />
            </View>
            <View style={{ width: '95%', height: 300, backgroundColor: '#fafafa', marginTop: -11, borderWidth: 1, borderColor: '#cdcdcd', marginBottom: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
              {provincesResult.length == 0 ?
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '95%', height: 298, backgroundColor: '#fafafa', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                  <Ionicons name="ios-information-circle" size={28} color="#593cfb" />
                  <Text style={{ textAlign: 'center', fontSize: 16 }}>No se encontraron provincias para su búsqueda</Text>
                </View>
                :
                <SafeAreaView style={{ justifyContent: 'flex-start', alignItems: 'center', width: '100%', height: 298, backgroundColor: '#fafafa', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                  <FlatList data={provincesResult} renderItem={renderItemList} keyExtractor={(item: number) => item.id.toString()} />
                </SafeAreaView>
              }
            </View>
          </View>
        </View>
      </Modal> */}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '80%',
    height: '80%',
    // margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    // padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
