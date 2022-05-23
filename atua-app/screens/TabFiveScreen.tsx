import * as React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Text, View } from '../components/Themed';

export default function TabFiveScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          navigation.navigate('RegisterScreen');
        }}
      >
        <Text style={{color:'#bbc4d2'}}>
          Registro
        </Text>
      </Pressable>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Pressable
        onPress={() => {
          navigation.navigate('LoginScreen');
        }}
      >
        <Text style={{color:'#bbc4d2'}}>
          Inicio de sesión
        </Text>
      </Pressable>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Pressable
        onPress={() => {
          navigation.navigate('SMSScreen');
        }}
      >
        <Text style={{color:'#bbc4d2'}}>
          Verificacion SMS
        </Text>
      </Pressable>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Pressable
        onPress={() => {
          navigation.navigate('UploadUserDocument');
        }}
      >
        <Text style={{color:'#bbc4d2'}}>
        Subir documento de identidad
        </Text>
        
      </Pressable>
      {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Pressable
        onPress={() => {
          navigation.navigate('SMSScreen');
        }}
      >
        <Text style={{color:'#bbc4d2'}}>
        Agregar dirección
        </Text>
        
      </Pressable> */}
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Pressable
        onPress={() => {
          navigation.navigate('RegisterCarScreenOne');
        }}
      >
        <Text style={{color:'#bbc4d2'}}>
        Registrar auto
        </Text>
        
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171a1e'
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
